import React, { useState, useEffect } from 'react';
import { programService } from '../../services/programService';
import { clientAssignmentService } from '../../services/clientAssignmentService';
import type { Program } from '../../types';

interface ProgramAssignmentModalProps {
  clientId: string;
  clientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ProgramAssignmentModal: React.FC<ProgramAssignmentModalProps> = ({
  clientId,
  clientName,
  onClose,
  onSuccess,
}) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const response = await programService.getPrograms();
      setPrograms(response.results);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedProgramId) {
      alert('Please select a program');
      return;
    }

    if (!startDate) {
      alert('Please select a start date');
      return;
    }

    try {
      setSaving(true);
      await clientAssignmentService.createProgramAssignment({
        client: clientId,
        program: selectedProgramId,
        start_date: startDate,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error assigning program:', error);
      alert(error.response?.data?.error || 'Failed to assign program');
    } finally {
      setSaving(false);
    }
  };

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  const calculateEndDate = (program: Program) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const weeks = program.total_weeks;
    const end = new Date(start);
    end.setDate(end.getDate() + weeks * 7);
    return end.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Assign Program</h2>
              <p className="text-gray-400 mt-1">Assign a training program to {clientName}</p>
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
          {/* Start Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 bg-dark-900 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {selectedProgram && startDate && (
              <p className="text-sm text-gray-400 mt-2">
                Program will end on: <span className="text-white">{calculateEndDate(selectedProgram)}</span>
              </p>
            )}
          </div>

          {/* Program Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Program *
            </label>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <p className="text-gray-400 mt-2 text-sm">Loading programs...</p>
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-8 bg-dark-900 rounded-lg border border-dark-700">
                <p className="text-gray-400 mb-2">No programs available</p>
                <p className="text-sm text-gray-500">Create programs in the Library section first</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {programs.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => setSelectedProgramId(program.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProgramId === program.id
                        ? 'bg-purple-900/30 border-purple-600'
                        : 'bg-dark-900 border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{program.name}</h3>
                          <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs rounded">
                            {program.experience_level_display}
                          </span>
                        </div>
                        {program.description && (
                          <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                            {program.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="text-gray-400">
                            📅 {program.duration_display}
                          </span>
                          <span className="text-gray-400">
                            💪 {program.modality_display}
                          </span>
                          {program.weeks && program.weeks.length > 0 && (
                            <span className="text-gray-400">
                              ✓ {program.weeks.length}/{program.total_weeks} weeks configured
                            </span>
                          )}
                        </div>
                        {program.goals && (
                          <div className="mt-3 p-3 bg-dark-800 rounded">
                            <p className="text-xs font-medium text-gray-400 mb-1">GOALS:</p>
                            <p className="text-sm text-gray-300">{program.goals}</p>
                          </div>
                        )}
                      </div>
                      {selectedProgramId === program.id && (
                        <svg className="w-6 h-6 text-purple-500 ml-4" fill="currentColor" viewBox="0 0 20 20">
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

          {/* Program Preview */}
          {selectedProgram && (
            <div className="bg-dark-900 border border-dark-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Program Structure</h4>

              {selectedProgram.weeks && selectedProgram.weeks.length > 0 ? (
                <div className="space-y-3">
                  {selectedProgram.weeks.slice(0, 3).map((week) => (
                    <div key={week.id} className="border-l-2 border-purple-600 pl-3">
                      <p className="text-sm font-medium text-white">
                        Week {week.week_number}
                        {week.title && `: ${week.title}`}
                      </p>
                      {week.days && week.days.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {week.days.map((day) => (
                            <span
                              key={day.id}
                              className={`px-2 py-1 text-xs rounded ${
                                day.is_rest_day
                                  ? 'bg-gray-700 text-gray-400'
                                  : 'bg-purple-900/40 text-purple-300'
                              }`}
                            >
                              {day.day_of_week_display.substring(0, 3)}
                              {day.is_rest_day ? ' 💤' : ' 💪'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {selectedProgram.weeks.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{selectedProgram.weeks.length - 3} more weeks
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">
                    This program structure is not fully configured yet.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Workouts will need to be assigned to specific days after assignment.
                  </p>
                </div>
              )}

              {selectedProgram.requirements && (
                <div className="mt-4 pt-4 border-t border-dark-700">
                  <p className="text-xs font-medium text-gray-400 mb-1">REQUIREMENTS:</p>
                  <p className="text-sm text-gray-300">{selectedProgram.requirements}</p>
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">Note:</p>
                <p>Only one active program can be assigned to a client at a time. Any existing active program will need to be completed or cancelled first.</p>
              </div>
            </div>
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
            disabled={!selectedProgramId || saving}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Assigning...' : 'Assign Program'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramAssignmentModal;
