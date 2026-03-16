import React, { useState, useEffect } from 'react';
import { workoutTemplateService } from '../../services/workoutTemplateService';
import { clientAssignmentService } from '../../services/clientAssignmentService';
import type { WorkoutTemplate } from '../../types';

interface WorkoutAssignmentModalProps {
  clientId: string;
  clientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const WorkoutAssignmentModal: React.FC<WorkoutAssignmentModalProps> = ({
  clientId,
  clientName,
  onClose,
  onSuccess,
}) => {
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [assignedDate, setAssignedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const response = await workoutTemplateService.getWorkouts();
      setWorkouts(response.results);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedWorkoutId) {
      alert('Please select a workout');
      return;
    }

    if (!assignedDate) {
      alert('Please select a date');
      return;
    }

    try {
      setSaving(true);
      await clientAssignmentService.createWorkoutAssignment({
        client: clientId,
        workout_template: selectedWorkoutId,
        assigned_date: assignedDate,
        notes,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error assigning workout:', error);
      alert(error.response?.data?.error || 'Failed to assign workout');
    } finally {
      setSaving(false);
    }
  };

  const selectedWorkout = workouts.find((w) => w.id === selectedWorkoutId);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Assign Workout</h2>
              <p className="text-gray-400 mt-1">Assign a workout template to {clientName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Workout Date *
            </label>
            <input
              type="date"
              value={assignedDate}
              onChange={(e) => setAssignedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 bg-dark-900 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Workout Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Workout Template *
            </label>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-gray-400 mt-2 text-sm">Loading workouts...</p>
              </div>
            ) : workouts.length === 0 ? (
              <div className="text-center py-8 bg-dark-900 rounded-lg border border-dark-700">
                <p className="text-gray-400 mb-2">No workout templates available</p>
                <p className="text-sm text-gray-500">Create workout templates in the Library section first</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {workouts.map((workout) => (
                  <div
                    key={workout.id}
                    onClick={() => setSelectedWorkoutId(workout.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedWorkoutId === workout.id
                        ? 'bg-blue-900/30 border-blue-600'
                        : 'bg-dark-900 border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{workout.name}</h3>
                        {workout.description && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {workout.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {workout.duration_minutes && (
                            <span>⏱️ {workout.duration_minutes} min</span>
                          )}
                          <span>📋 {workout.exercise_count} exercises</span>
                          <span className="capitalize">{workout.difficulty_level}</span>
                        </div>
                      </div>
                      {selectedWorkoutId === workout.id && (
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workout Preview */}
          {selectedWorkout && (
            <div className="bg-dark-900 border border-dark-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Workout Preview</h4>
              <div className="space-y-2">
                {selectedWorkout.workout_exercises.slice(0, 5).map((we, index) => (
                  <div key={we.id} className="text-sm text-gray-400">
                    {index + 1}. {we.exercise.name}
                    {we.sets && we.reps && (
                      <span className="text-gray-500 ml-2">
                        • {we.sets}×{we.reps}
                        {we.weight && ` @ ${we.weight}kg`}
                      </span>
                    )}
                  </div>
                ))}
                {selectedWorkout.workout_exercises.length > 5 && (
                  <p className="text-xs text-gray-500">
                    +{selectedWorkout.workout_exercises.length - 5} more exercises
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-dark-900 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any specific instructions for this workout..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-dark-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedWorkoutId || saving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Assigning...' : 'Assign Workout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutAssignmentModal;
