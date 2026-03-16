import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workoutTemplateService } from '../../services/workoutTemplateService';
import { exerciseLibraryService } from '../../services/exerciseLibraryService';
import type { WorkoutTemplate, ExerciseLibrary, WorkoutExerciseCreatePayload, DifficultyLevel } from '../../types';

const WorkoutBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('intermediate');
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExerciseCreatePayload[]>([]);

  const [availableExercises, setAvailableExercises] = useState<ExerciseLibrary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExercises();
    if (isEditing) {
      fetchWorkout();
    }
  }, [id]);

  const fetchExercises = async () => {
    try {
      const response = await exerciseLibraryService.getExercises();
      setAvailableExercises(response.results);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const fetchWorkout = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const workout = await workoutTemplateService.getWorkout(id);
      setName(workout.name);
      setDescription(workout.description);
      setDurationMinutes(workout.duration_minutes || '');
      setDifficultyLevel(workout.difficulty_level);

      // Convert existing exercises to create payload format
      setSelectedExercises(
        workout.workout_exercises.map((we) => ({
          exercise: we.exercise.id,
          order: we.order,
          sets: we.sets || undefined,
          reps: we.reps || undefined,
          weight: we.weight || undefined,
          duration_seconds: we.duration_seconds || undefined,
          rest_period_seconds: we.rest_period_seconds,
          notes: we.notes || undefined,
        }))
      );
    } catch (error) {
      console.error('Error fetching workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExercise = (exercise: ExerciseLibrary) => {
    setSelectedExercises([
      ...selectedExercises,
      {
        exercise: exercise.id,
        order: selectedExercises.length,
        sets: 3,
        reps: 10,
        rest_period_seconds: 60,
      },
    ]);
  };

  const removeExercise = (index: number) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    // Reorder
    setSelectedExercises(updated.map((ex, i) => ({ ...ex, order: i })));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === selectedExercises.length - 1)
    ) {
      return;
    }

    const updated = [...selectedExercises];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Update order
    updated[index].order = index;
    updated[newIndex].order = newIndex;

    setSelectedExercises(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a workout name');
      return;
    }

    if (selectedExercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name,
        description,
        duration_minutes: durationMinutes || undefined,
        difficulty_level: difficultyLevel,
        exercises: selectedExercises,
      };

      if (isEditing && id) {
        await workoutTemplateService.updateWorkout(id, payload);
      } else {
        await workoutTemplateService.createWorkout(payload);
      }

      navigate('/library/workouts');
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  const getExerciseName = (exerciseId: string) => {
    const exercise = availableExercises.find((e) => e.id === exerciseId);
    return exercise?.name || 'Unknown Exercise';
  };

  const filteredExercises = availableExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Loading workout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Workout' : 'Create Workout'}
          </h1>
          <p className="text-gray-600 mt-2">Build a workout template from exercises</p>
        </div>
        <button
          onClick={() => navigate('/library/workouts')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Workout Details & Selected Exercises */}
        <div>
          {/* Workout Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Workout Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workout Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Upper Body Strength"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the workout..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="45"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value as DifficultyLevel)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Exercises */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Workout Plan ({selectedExercises.length} exercises)
            </h2>

            {selectedExercises.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No exercises added yet. Select exercises from the right panel.
              </p>
            ) : (
              <div className="space-y-4">
                {selectedExercises.map((ex, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {index + 1}. {getExerciseName(ex.exercise)}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveExercise(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveExercise(index, 'down')}
                          disabled={index === selectedExercises.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeExercise(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Sets</label>
                        <input
                          type="number"
                          value={ex.sets || ''}
                          onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || null)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Reps</label>
                        <input
                          type="number"
                          value={ex.reps || ''}
                          onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || null)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          value={ex.weight || ''}
                          onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || null)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Rest (sec)</label>
                        <input
                          type="number"
                          value={ex.rest_period_seconds}
                          onChange={(e) => updateExercise(index, 'rest_period_seconds', parseInt(e.target.value) || 60)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : (isEditing ? 'Update Workout' : 'Create Workout')}
          </button>
        </div>

        {/* Right: Exercise Library */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Exercise Library</h2>

          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                  <p className="text-xs text-gray-500">{exercise.modality_display}</p>
                </div>
                <button
                  onClick={() => addExercise(exercise)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutBuilderPage;
