import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exerciseLibraryService } from '../../services/exerciseLibraryService';
import type { ExerciseLibrary, ExerciseModality, MuscleGroup, ExerciseCategory } from '../../types';

const ExercisesLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [exercises, setExercises] = useState<ExerciseLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Tab management
  const currentTab = location.pathname.includes('/workouts') ? 'workouts'
    : location.pathname.includes('/programs') ? 'programs'
    : 'exercises';

  useEffect(() => {
    fetchExercises();
  }, [selectedModality, selectedMuscleGroup, selectedCategory, searchTerm]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedModality) params.modality = selectedModality;
      if (selectedMuscleGroup) params.muscle_group = selectedMuscleGroup;
      if (selectedCategory) params.category = selectedCategory;

      const response = await exerciseLibraryService.getExercises(params);
      setExercises(response.results);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'workouts') navigate('/library/workouts');
    else if (tab === 'programs') navigate('/library/programs');
    else navigate('/library');
  };

  const modalityOptions: ExerciseModality[] = [
    'warmup', 'cooldown', 'cardio', 'conditioning',
    'mobility', 'strength', 'power', 'yoga', 'weightlifting'
  ];

  const muscleGroupOptions: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'abs', 'lower_back', 'glutes', 'quads', 'hamstrings',
    'adductors', 'abductors', 'calves', 'shins'
  ];

  const categoryOptions: ExerciseCategory[] = ['strength', 'bodyweight', 'timed'];

  const getMuscleGroupBadgeColor = (group: string) => {
    const colors: Record<string, string> = {
      chest: 'bg-red-100 text-red-800',
      back: 'bg-blue-100 text-blue-800',
      shoulders: 'bg-purple-100 text-purple-800',
      biceps: 'bg-pink-100 text-pink-800',
      triceps: 'bg-orange-100 text-orange-800',
      abs: 'bg-yellow-100 text-yellow-800',
      quads: 'bg-green-100 text-green-800',
      hamstrings: 'bg-teal-100 text-teal-800',
      glutes: 'bg-indigo-100 text-indigo-800',
      calves: 'bg-cyan-100 text-cyan-800',
    };
    return colors[group] || 'bg-gray-100 text-gray-800';
  };

  const getModalityIcon = (modality: string) => {
    const icons: Record<string, string> = {
      strength: '💪',
      cardio: '🏃',
      yoga: '🧘',
      weightlifting: '🏋️',
      power: '⚡',
      mobility: '🤸',
      warmup: '🔥',
      cooldown: '❄️',
      conditioning: '🔄',
    };
    return icons[modality] || '🏋️';
  };

  return (
    <div className="p-6 bg-dark-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Library</h1>
        <p className="text-gray-400 mt-2">
          Manage exercises, workouts, and programs
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-dark-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('exercises')}
            className={`${
              currentTab === 'exercises'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-400 hover:text-white hover:border-dark-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Exercises
          </button>
          <button
            onClick={() => handleTabChange('workouts')}
            className={`${
              currentTab === 'workouts'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-400 hover:text-white hover:border-dark-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Workouts
          </button>
          <button
            onClick={() => handleTabChange('programs')}
            className={`${
              currentTab === 'programs'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-400 hover:text-white hover:border-dark-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Programs
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 bg-dark-800 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent placeholder-gray-500"
        />

        <select
          value={selectedModality}
          onChange={(e) => setSelectedModality(e.target.value)}
          className="px-4 py-2 bg-dark-800 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          <option value="">All Modalities</option>
          {modalityOptions.map((mod) => (
            <option key={mod} value={mod}>
              {mod.charAt(0).toUpperCase() + mod.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={selectedMuscleGroup}
          onChange={(e) => setSelectedMuscleGroup(e.target.value)}
          className="px-4 py-2 bg-dark-800 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          <option value="">All Muscle Groups</option>
          {muscleGroupOptions.map((muscle) => (
            <option key={muscle} value={muscle}>
              {muscle.charAt(0).toUpperCase() + muscle.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-dark-800 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors"
        >
          + Add Custom Exercise
        </button>
      </div>

      {/* Exercise Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          <p className="text-gray-400 mt-2">Loading exercises...</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-gray-400">No exercises found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-dark-800 border border-dark-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getModalityIcon(exercise.modality)}</span>
                  <div>
                    <h3 className="font-semibold text-white">{exercise.name}</h3>
                    <p className="text-xs text-gray-400">{exercise.modality_display}</p>
                  </div>
                </div>

                {/* Global/Custom Badge */}
                {exercise.is_global ? (
                  <span className="px-2 py-1 bg-green-900/20 text-green-400 text-xs font-medium rounded">
                    Global
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-purple-900/20 text-purple-300 text-xs font-medium rounded">
                    Custom
                  </span>
                )}
              </div>

              {/* Description */}
              {exercise.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {exercise.description}
                </p>
              )}

              {/* Category Badge */}
              <div className="mb-3">
                <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded">
                  {exercise.category_display}
                </span>
              </div>

              {/* Muscle Groups */}
              {exercise.muscle_groups.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {exercise.muscle_groups.slice(0, 3).map((group) => (
                    <span
                      key={group}
                      className={`px-2 py-1 text-xs font-medium rounded ${getMuscleGroupBadgeColor(group)}`}
                    >
                      {group.replace('_', ' ')}
                    </span>
                  ))}
                  {exercise.muscle_groups.length > 3 && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-dark-700 text-gray-400">
                      +{exercise.muscle_groups.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Actions (only for custom exercises) */}
              {!exercise.is_global && (
                <div className="mt-3 pt-3 border-t border-dark-700 flex gap-2">
                  <button className="text-sm text-brand-primary hover:text-white">
                    Edit
                  </button>
                  <button className="text-sm text-red-400 hover:text-red-600">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Exercise Modal - TODO: Implement */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create Custom Exercise</h2>
            <p className="text-gray-600 mb-4">
              This modal will be implemented with a form to create custom exercises.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExercisesLibraryPage;
