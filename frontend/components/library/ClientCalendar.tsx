import React, { useState, useEffect } from 'react';
import { clientAssignmentService } from '../../services/clientAssignmentService';
import type { ClientWorkoutAssignment, ClientProgramAssignment } from '../../types';

interface ClientCalendarProps {
  clientId: string;
  onAssignWorkout: () => void;
  onAssignProgram: () => void;
}

const ClientCalendar: React.FC<ClientCalendarProps> = ({
  clientId,
  onAssignWorkout,
  onAssignProgram,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutAssignments, setWorkoutAssignments] = useState<ClientWorkoutAssignment[]>([]);
  const [programAssignments, setProgramAssignments] = useState<ClientProgramAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, [clientId, currentDate]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Get first and last day of month
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

      // Load workout assignments for this month
      const workoutsResponse = await clientAssignmentService.getWorkoutAssignments({
        client: clientId,
        date_from: firstDay,
        date_to: lastDay,
      });

      // Load program assignments
      const programsResponse = await clientAssignmentService.getProgramAssignments({
        client: clientId,
        status: 'active',
      });

      setWorkoutAssignments(workoutsResponse.results);
      setProgramAssignments(programsResponse.results);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (assignmentId: string) => {
    try {
      await clientAssignmentService.markWorkoutComplete(assignmentId);
      await loadAssignments();
    } catch (error) {
      console.error('Error marking workout complete:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days: (Date | null)[] = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getAssignmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return workoutAssignments.filter((a) => a.assigned_date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const days = getDaysInMonth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Workout Calendar</h2>
        <div className="flex gap-2">
          <button
            onClick={onAssignWorkout}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Assign Workout
          </button>
          <button
            onClick={onAssignProgram}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Assign Program
          </button>
        </div>
      </div>

      {/* Active Program Banner */}
      {programAssignments.length > 0 && (
        <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">
                Active Program: {programAssignments[0].program.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Week {programAssignments[0].current_week} • Day {programAssignments[0].current_day}
                {' • '}
                <span className="text-purple-400">
                  {programAssignments[0].progress_percentage}% Complete
                </span>
              </p>
            </div>
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600"
                style={{ width: `${programAssignments[0].progress_percentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-dark-800 border border-dark-700 rounded-lg p-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-dark-700 rounded transition-colors text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-white">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-dark-700 rounded transition-colors text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-400 mt-2">Loading calendar...</p>
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-dark-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-semibold text-gray-400 border-r border-dark-700 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-24 border-r border-b border-dark-700" />;
              }

              const assignments = getAssignmentsForDate(day);
              const today = isToday(day);
              const past = isPast(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`h-24 border-r border-b border-dark-700 p-2 overflow-y-auto ${
                    today ? 'bg-blue-900/20' : ''
                  } ${past ? 'opacity-60' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${today ? 'text-blue-400' : 'text-gray-300'}`}>
                    {day.getDate()}
                  </div>

                  {assignments.length > 0 && (
                    <div className="space-y-1">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className={`text-xs p-1 rounded cursor-pointer ${
                            assignment.status === 'completed'
                              ? 'bg-green-900/40 text-green-300 line-through'
                              : assignment.status === 'in_progress'
                              ? 'bg-yellow-900/40 text-yellow-300'
                              : 'bg-blue-900/40 text-blue-300'
                          }`}
                          onClick={() => {
                            if (assignment.status !== 'completed') {
                              if (confirm('Mark this workout as complete?')) {
                                handleMarkComplete(assignment.id);
                              }
                            }
                          }}
                          title={assignment.workout_template.name}
                        >
                          {assignment.completed ? '✓ ' : '📋 '}
                          {assignment.workout_template.name.length > 15
                            ? assignment.workout_template.name.substring(0, 15) + '...'
                            : assignment.workout_template.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-900/40 border border-blue-700 rounded"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-900/40 border border-yellow-700 rounded"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-900/40 border border-green-700 rounded"></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default ClientCalendar;
