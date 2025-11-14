import React, { useState, useEffect } from 'react';
import { Client, Goal, Payment, ClientProgress, Log } from '../../types';
import { Card, StatCard, Badge, ProgressBar, Button } from '../ui';
import { goalService, paymentService, progressService } from '../../services';

interface EnhancedOverviewProps {
  client: Client;
  goals: Goal[];
  payments: Payment[];
  logs: Log[];
  progress: ClientProgress[];
}

const EnhancedOverview: React.FC<EnhancedOverviewProps> = ({
  client,
  goals,
  payments,
  logs,
  progress,
}) => {
  const [paymentStats, setPaymentStats] = useState<any>(null);

  useEffect(() => {
    loadPaymentStats();
  }, [client.id, payments]);

  const loadPaymentStats = async () => {
    try {
      const stats = await paymentService.getClientPaymentStatus(client.id);
      setPaymentStats(stats);
    } catch (error) {
      console.error('Error loading payment stats:', error);
    }
  };

  // Calculate stats
  const activeGoals = goals.filter((g) => !g.achieved);
  const completedGoals = goals.filter((g) => g.achieved);
  const latestProgress = progress.sort(
    (a, b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()
  )[0];
  const recentLogs = logs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const pendingPayments = payments.filter((p) => (p.payment_status || p.status) === 'pending');
  const completedPayments = payments.filter(
    (p) => (p.payment_status || p.status) === 'completed'
  );

  const totalPaid = completedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const getGenderDisplay = (gender?: string) => {
    if (!gender) return 'Not specified';
    const genderMap: Record<string, string> = {
      M: 'Male',
      F: 'Female',
      O: 'Other',
    };
    return genderMap[gender] || gender;
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Goals"
          value={activeGoals.length.toString()}
          subtitle={`${completedGoals.length} completed`}
          icon="🎯"
        />
        <StatCard
          title="Total Paid"
          value={`KES ${totalPaid.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtitle={completedPayments.length + ' payments'}
          icon="✅"
        />
        <StatCard
          title="Pending Payments"
          value={`KES ${totalPending.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtitle={pendingPayments.length + ' invoices'}
          icon="⏳"
        />
        <StatCard
          title="Activity Logs"
          value={logs.length.toString()}
          subtitle="Total entries"
          icon="📝"
        />
      </div>

      {/* Profile & Bio Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span>👤</span> Profile Information
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="font-semibold text-white">
                  {client.first_name} {client.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <Badge
                  variant={
                    client.status === 'active'
                      ? 'success'
                      : client.status === 'inactive'
                      ? 'default'
                      : 'danger'
                  }
                >
                  {client.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="border-t border-dark-700 pt-3"></div>

            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="font-semibold text-white">{client.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Phone</p>
              <p className="font-semibold text-white">{client.phone}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Gender</p>
                <p className="font-semibold text-white">{getGenderDisplay(client.gender)}</p>
              </div>
              {client.dob && (
                <div>
                  <p className="text-sm text-gray-400">Age</p>
                  <p className="font-semibold text-white">{calculateAge(client.dob)} years</p>
                </div>
              )}
            </div>

            <div className="border-t border-dark-700 pt-3"></div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Member Since</p>
                <p className="font-semibold text-white">
                  {new Date(client.created_at).toLocaleDateString()}
                </p>
              </div>
              {client.membership_end_date && (
                <div>
                  <p className="text-sm text-gray-400">Membership Until</p>
                  <p className="font-semibold text-white">
                    {new Date(client.membership_end_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {client.notes && (
              <>
                <div className="border-t border-dark-700 pt-3"></div>
                <div>
                  <p className="text-sm text-gray-400">Notes</p>
                  <p className="text-white text-sm">{client.notes}</p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Latest Measurements */}
        <Card>
          <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span>📊</span> Latest Measurements
          </h3>
          {latestProgress ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-400 mb-4">
                Recorded: {new Date(latestProgress.recorded_date).toLocaleDateString()}
              </p>

              {latestProgress.weight && (
                <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                  <span className="text-gray-400">Weight</span>
                  <span className="font-bold text-white text-lg">{latestProgress.weight} kg</span>
                </div>
              )}

              {latestProgress.body_fat_percentage && (
                <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                  <span className="text-gray-400">Body Fat</span>
                  <span className="font-bold text-white text-lg">
                    {latestProgress.body_fat_percentage}%
                  </span>
                </div>
              )}

              {latestProgress.muscle_mass && (
                <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                  <span className="text-gray-400">Muscle Mass</span>
                  <span className="font-bold text-white text-lg">
                    {latestProgress.muscle_mass} kg
                  </span>
                </div>
              )}

              {latestProgress.chest && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                    <span className="text-gray-400 text-sm">Chest</span>
                    <span className="font-semibold text-white">{latestProgress.chest} cm</span>
                  </div>
                  {latestProgress.waist && (
                    <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                      <span className="text-gray-400 text-sm">Waist</span>
                      <span className="font-semibold text-white">{latestProgress.waist} cm</span>
                    </div>
                  )}
                </div>
              )}

              {latestProgress.notes && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">{latestProgress.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No progress data recorded yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Go to Bio & Progress tab to add measurements
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Active Goals with Progress */}
      <Card>
        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <span>🎯</span> Active Goals & Progress
        </h3>
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              // Calculate progress based on goal type
              let progress = 0;
              let current = parseFloat(goal.current_value || '0');
              let target = parseFloat(goal.target_value || '0');
              let displayProgress = '';

              if (current && target) {
                // For weight loss goals, calculate inversely (going DOWN is progress)
                if (goal.goal_type === 'weight_loss') {
                  // When target < current (e.g., target=70, current=100)
                  // This means they need to LOSE weight
                  if (target >= current) {
                    // Already at or below target
                    progress = 100;
                    displayProgress = `${(current - target).toFixed(1)}kg below target!`;
                  } else {
                    // Still working towards target
                    // Distance to go: current - target (e.g., 100 - 70 = 30kg to lose)
                    const remaining = current - target;
                    displayProgress = `${remaining.toFixed(1)}kg to lose`;
                    progress = 0; // Just started or haven't made progress yet
                  }
                } else {
                  // For gain goals (muscle_gain, strength, endurance, etc.), higher is better
                  if (current >= target) {
                    progress = 100;
                    displayProgress = 'Target achieved!';
                  } else {
                    progress = (current / target) * 100;
                    const remaining = target - current;
                    displayProgress = `${remaining.toFixed(1)} to go`;
                  }
                }
              }

              return (
                <div key={goal.id} className="p-4 bg-dark-800 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white">{goal.title || goal.description}</h4>
                      <Badge variant="info" size="sm" className="mt-1">
                        {goal.goal_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    {goal.target_date && (
                      <span className="text-xs text-gray-500">
                        {new Date(goal.target_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-400">{goal.description}</p>

                  {goal.target_value && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">
                          Current: {goal.current_value || '0'}
                        </span>
                        <span className="text-gray-400">Target: {goal.target_value}</span>
                      </div>
                      <ProgressBar
                        current={progress}
                        target={100}
                        color={progress >= 100 ? 'success' : progress >= 50 ? 'warning' : 'primary'}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-500">{displayProgress}</span>
                        <span className="text-gray-500">{Math.min(progress, 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No active goals set</p>
            <p className="text-sm text-gray-500 mt-2">Go to Goals tab to create a new goal</p>
          </div>
        )}
      </Card>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span>💳</span> Payment Summary
          </h3>
          <div className="space-y-4">
            {/* Payment Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-400">Total Paid</p>
                <p className="text-2xl font-bold text-white">KES {totalPaid.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-gray-500 mt-1">{completedPayments.length} payments</p>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">Pending</p>
                <p className="text-2xl font-bold text-white">
                  KES {totalPending.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">{pendingPayments.length} invoices</p>
              </div>
            </div>

            {/* Pending Payments */}
            {pendingPayments.length > 0 ? (
              <div>
                <h4 className="font-semibold text-white mb-2">Pending Invoices</h4>
                <div className="space-y-2">
                  {pendingPayments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="p-3 bg-dark-800 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-mono text-gray-400">
                            {payment.invoice_number || `#${payment.id.slice(0, 8)}`}
                          </p>
                          <p className="text-sm text-gray-500">{payment.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">KES {payment.amount.toLocaleString()}</p>
                          {payment.due_date && (
                            <p className="text-xs text-gray-500">
                              Due: {new Date(payment.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                <p className="text-green-400 font-semibold">✅ All payments up to date!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity Logs */}
        <Card>
          <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span>📝</span> Recent Activity
          </h3>
          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-3 bg-dark-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-400">{new Date(log.date).toLocaleDateString()}</p>
                    {log.performance_rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < log.performance_rating! ? 'text-yellow-400' : 'text-gray-600'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-white text-sm">{log.notes}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No activity logs yet</p>
              <p className="text-sm text-gray-500 mt-2">Go to Daily Logs tab to add entries</p>
            </div>
          )}
        </Card>
      </div>

      {/* Workout Routine Section - Placeholder for now */}
      <Card>
        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <span>💪</span> Current Workout Routine
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-400">No workout routine assigned yet</p>
          <p className="text-sm text-gray-500 mt-2">Go to Workouts tab to create a routine</p>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedOverview;
