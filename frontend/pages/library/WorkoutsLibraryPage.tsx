import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutTemplateService } from '../../services/workoutTemplateService';
import type { WorkoutTemplate } from '../../types';

const WorkoutsLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await workoutTemplateService.getWorkouts();
      setWorkouts(response.results);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    try {
      await workoutTemplateService.deleteWorkout(id);
      setWorkouts(workouts.filter((w) => w.id !== id));
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout');
    }
  };

  const filteredWorkouts = workouts.filter((workout) =>
    workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Tab management for consistency
  const currentTab = 'workouts';

  const handleTabChange = (tab: string) => {
    if (tab === 'workouts') navigate('/library/workouts');
    else if (tab === 'programs') navigate('/library/programs');
    else navigate('/library');
  };

  return (
    <div className="p-6 bg-dark-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Library</h1>
        <p className="text-gray-400 mt-2">Manage exercises, workouts, and programs</p>
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

      {/* Search and Create */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search workouts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-dark-800 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent placeholder-gray-500"
        />
        <button
          onClick={() => navigate('/library/workouts/builder')}
          className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors"
        >
          + Create Workout
        </button>
      </div>

      {/* Workouts List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          <p className="text-gray-400 mt-2">Loading workouts...</p>
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-gray-400 mb-4">
            {searchTerm ? 'No workouts found matching your search.' : 'No workouts created yet.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/library/workouts/builder')}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors"
            >
              Create Your First Workout
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* Workout Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(workout.difficulty_level)}`}>
                    {workout.difficulty_level_display}
                  </span>
                </div>
                {workout.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{workout.description}</p>
                )}
              </div>

              {/* Workout Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                {workout.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{workout.duration_minutes} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{workout.exercise_count} exercises</span>
                </div>
              </div>

              {/* Exercise Preview */}
              {workout.workout_exercises && workout.workout_exercises.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">EXERCISES:</p>
                  <div className="space-y-1">
                    {workout.workout_exercises.slice(0, 3).map((we) => (
                      <div key={we.id} className="text-sm text-gray-300 truncate">
                        • {we.exercise.name}
                        {we.sets && we.reps && (
                          <span className="text-gray-500 ml-1">
                            ({we.sets}×{we.reps})
                          </span>
                        )}
                      </div>
                    ))}
                    {workout.workout_exercises.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{workout.workout_exercises.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-dark-700">
                <button
                  onClick={() => navigate(`/library/workouts/builder/${workout.id}`)}
                  className="flex-1 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded hover:bg-brand-primary/20 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteWorkout(workout.id)}
                  className="px-4 py-2 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutsLibraryPage;
