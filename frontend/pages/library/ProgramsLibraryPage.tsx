import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { programService } from '../../services/programService';
import type { Program } from '../../types';

const ProgramsLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await programService.getPrograms();
      setPrograms(response.results);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      await programService.deleteProgram(id);
      setPrograms(programs.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('Failed to delete program');
    }
  };

  const filteredPrograms = programs.filter((program) =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExperienceColor = (level: string) => {
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
            onClick={() => navigate('/library')}
            className={`$${
              false ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-white hover:border-dark-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Exercises
          </button>
          <button
            onClick={() => navigate('/library/workouts')}
            className={`$${
              false ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-white hover:border-dark-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Workouts
          </button>
          <button
            className="border-brand-primary text-brand-primary whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Programs
          </button>
        </nav>
      </div>

      {/* Search and Create */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search programs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-dark-800 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent placeholder-gray-500"
        />
        <button
          onClick={() => navigate('/library/programs/builder')}
          className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors"
        >
          + Create Program
        </button>
      </div>

      {/* Programs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          <p className="text-gray-400 mt-2">Loading programs...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-gray-400 mb-4">
            {searchTerm ? 'No programs found matching your search.' : 'No programs created yet.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/library/programs/builder')}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors"
            >
              Create Your First Program
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* Program Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{program.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getExperienceColor(program.experience_level)}`}>
                    {program.experience_level_display}
                  </span>
                </div>
                {program.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{program.description}</p>
                )}
              </div>

              {/* Program Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="text-sm font-medium text-white">{program.duration_display}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Modality</p>
                  <p className="text-sm font-medium text-white">{program.modality_display}</p>
                </div>
              </div>

              {/* Goals */}
              {program.goals && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">GOALS:</p>
                  <p className="text-sm text-gray-300 line-clamp-2">{program.goals}</p>
                </div>
              )}

              {/* Weeks Preview */}
              {program.weeks && program.weeks.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    {program.weeks.length} of {program.total_weeks} weeks configured
                  </p>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-primary"
                      style={{ width: `${(program.weeks.length / program.total_weeks) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-dark-700">
                <button
                  onClick={() => navigate(`/library/programs/builder/${program.id}`)}
                  className="flex-1 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded hover:bg-brand-primary/20 transition-colors text-sm font-medium"
                >
                  {program.weeks && program.weeks.length > 0 ? 'Edit' : 'Configure'}
                </button>
                <button
                  onClick={() => handleDeleteProgram(program.id)}
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

export default ProgramsLibraryPage;
