import React, { useEffect, useState } from 'react';
import { Client, ClientProgress, Payment, Goal } from '../../types';
import { Card, StatCard, Badge, ProgressBar } from '../ui';
import { progressService, paymentService, goalService } from '../../services';

interface ClientOverviewProps {
  client: Client;
}

const ClientOverview: React.FC<ClientOverviewProps> = ({ client }) => {
  const [latestProgress, setLatestProgress] = useState<ClientProgress | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<{
    nextPayment: Payment | null;
    overduePayments: Payment[];
    totalOverdue: number;
  } | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, [client.id]);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      const [progress, payment, clientGoals] = await Promise.all([
        progressService.getLatestProgress(client.id),
        paymentService.getClientPaymentStatus(client.id),
        goalService.getClientGoals(client.id),
      ]);
      setLatestProgress(progress);
      setPaymentStatus(payment);
      setGoals(clientGoals);
    } catch (error) {
      console.error('Error loading overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    if (latestProgress?.weight && latestProgress?.weight) {
      // Assuming height is stored in client or progress
      return progressService.calculateBMI(latestProgress.weight, 170); // Default height for now
    }
    return null;
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">Loading overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Goals"
          value={activeGoals.length}
          subtitle={`${completedGoals.length} completed`}
          icon="🎯"
        />
        <StatCard
          title="Current Weight"
          value={latestProgress?.weight ? `${latestProgress.weight}kg` : 'N/A'}
          subtitle={latestProgress ? `BMI: ${calculateBMI() || 'N/A'}` : ''}
          icon="⚖️"
        />
        <StatCard
          title="Membership"
          value={client.status === 'active' ? 'Active' : 'Inactive'}
          subtitle={
            client.membership_end_date
              ? `Until ${new Date(client.membership_end_date).toLocaleDateString()}`
              : ''
          }
          icon="📅"
        />
        <StatCard
          title="Payment Status"
          value={paymentStatus?.overduePayments.length ? 'Overdue' : 'Current'}
          subtitle={
            paymentStatus?.totalOverdue
              ? `$${paymentStatus.totalOverdue} overdue`
              : 'All paid'
          }
          icon="💳"
        />
      </div>

      {/* Active Goals Section */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Active Goals</h3>
          <Badge variant={activeGoals.length > 0 ? 'success' : 'default'}>
            {activeGoals.length} Active
          </Badge>
        </div>
        {activeGoals.length > 0 ? (
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const progress = goal.current_value && goal.target_value ?
                (parseFloat(goal.current_value) / parseFloat(goal.target_value)) * 100 : 0;

              return (
                <div key={goal.id} className="p-4 bg-dark-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-white">{goal.title}</h4>
                      <p className="text-sm text-gray-400">{goal.description}</p>
                    </div>
                    <Badge variant="info" size="sm">
                      {goal.goal_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  {goal.target_value && (
                    <ProgressBar
                      current={parseFloat(goal.current_value || '0')}
                      target={parseFloat(goal.target_value)}
                      color={progress >= 100 ? 'success' : 'primary'}
                      className="mt-3"
                    />
                  )}
                  {goal.target_date && (
                    <p className="text-xs text-gray-500 mt-2">
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">No active goals set.</p>
        )}
      </Card>

      {/* Payment Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-semibold mb-4">Payment Status</h3>
          {paymentStatus?.nextPayment ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Next Payment</span>
                <Badge
                  variant={paymentStatus.overduePayments.length > 0 ? 'danger' : 'warning'}
                >
                  ${paymentStatus.nextPayment.amount}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Due Date</span>
                <span className="text-white">
                  {paymentStatus.nextPayment.due_date
                    ? new Date(paymentStatus.nextPayment.due_date).toLocaleDateString()
                    : 'Not set'}
                </span>
              </div>
              {paymentStatus.totalOverdue > 0 && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm font-medium">
                    {paymentStatus.overduePayments.length} overdue payment(s) - Total: $
                    {paymentStatus.totalOverdue}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">No pending payments</p>
          )}
        </Card>

        {/* Body Metrics */}
        <Card>
          <h3 className="text-xl font-semibold mb-4">Current Metrics</h3>
          {latestProgress ? (
            <div className="space-y-3">
              {latestProgress.weight && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Weight</span>
                  <span className="text-white font-semibold">{latestProgress.weight}kg</span>
                </div>
              )}
              {latestProgress.body_fat_percentage && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Body Fat</span>
                  <span className="text-white font-semibold">
                    {latestProgress.body_fat_percentage}%
                  </span>
                </div>
              )}
              {latestProgress.muscle_mass && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Muscle Mass</span>
                  <span className="text-white font-semibold">{latestProgress.muscle_mass}kg</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-4">
                Last updated: {new Date(latestProgress.recorded_date).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-400">No progress data yet</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ClientOverview;
