import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { analyticsService } from '../services';
import type { DashboardAnalytics, RevenueTrend, PerformanceMetrics } from '../types';

const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [trends, setTrends] = useState<RevenueTrend[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [analyticsData, trendsData, performanceData] = await Promise.all([
          analyticsService.getDashboardAnalytics(period),
          analyticsService.getRevenueTrends('monthly', 6),
          analyticsService.getPerformanceMetrics(),
        ]);

        setAnalytics(analyticsData);
        setTrends(trendsData.trends);
        setPerformance(performanceData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [period]);

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics</h1>
        <Card className="text-center py-12">
          <p className="text-gray-400">Loading analytics...</p>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics</h1>
        <Card className="text-center py-12">
          <p className="text-gray-400">Failed to load analytics</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics</h1>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-brand-primary text-white'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Growth Metrics */}
      {performance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-400">Revenue This Month</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(performance.this_month.revenue)}
            </p>
            <p
              className={`text-sm mt-2 ${
                performance.growth.revenue_growth_percentage >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {formatPercentage(performance.growth.revenue_growth_percentage)} vs last month
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-400">New Clients This Month</p>
            <p className="text-2xl font-bold text-white">{performance.this_month.new_clients}</p>
            <p
              className={`text-sm mt-2 ${
                performance.growth.client_growth_percentage >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {formatPercentage(performance.growth.client_growth_percentage)} vs last month
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-400">Last Month Revenue</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(performance.last_month.revenue)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {performance.last_month.new_clients} new clients
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-400">Total Clients</p>
            <p className="text-2xl font-bold text-white">{analytics.clients.total_clients}</p>
            <p className="text-xs text-gray-500 mt-2">
              {analytics.clients.active_clients} active
            </p>
          </Card>
        </div>
      )}

      {/* Client Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Client Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Clients"
            value={analytics.clients.total_clients}
            subtitle={`${analytics.clients.active_clients} active`}
            color="blue"
          />
          <StatCard
            title="New Clients"
            value={analytics.clients.new_clients_this_period}
            subtitle={`This ${period}`}
            color="green"
          />
          <StatCard
            title="Active Clients"
            value={analytics.clients.active_clients}
            subtitle={`${analytics.clients.inactive_clients} inactive`}
            color="purple"
          />
          <StatCard
            title="Retention Rate"
            value={
              analytics.clients.total_clients > 0
                ? Math.round(
                    (analytics.clients.active_clients / analytics.clients.total_clients) * 100
                  )
                : 0
            }
            suffix="%"
            subtitle="Client retention"
            color="yellow"
          />
        </div>
      </div>

      {/* Revenue Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Revenue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={analytics.revenue.total_revenue}
            prefix="KES "
            subtitle={`${analytics.revenue.completed_payments} payments`}
            color="green"
          />
          <StatCard
            title="Pending Amount"
            value={analytics.revenue.pending_amount}
            prefix="KES "
            subtitle={`${analytics.revenue.pending_payments} pending`}
            color="yellow"
          />
          <StatCard
            title="Overdue Amount"
            value={analytics.revenue.overdue_amount}
            prefix="KES "
            subtitle={`${analytics.revenue.overdue_payments} overdue`}
            color="red"
          />
          <StatCard
            title="Average per Client"
            value={
              analytics.clients.active_clients > 0
                ? Math.round(analytics.revenue.total_revenue / analytics.clients.active_clients)
                : 0
            }
            prefix="KES "
            subtitle="Per active client"
            color="purple"
          />
        </div>
      </div>

      {/* Booking/Session Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Sessions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Sessions"
            value={analytics.bookings.total_sessions}
            subtitle={`This ${period}`}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={analytics.bookings.completed_sessions}
            subtitle={`${
              analytics.bookings.total_sessions > 0
                ? Math.round(
                    (analytics.bookings.completed_sessions / analytics.bookings.total_sessions) *
                      100
                  )
                : 0
            }% completion rate`}
            color="green"
          />
          <StatCard
            title="Upcoming"
            value={analytics.bookings.upcoming_sessions}
            subtitle="Scheduled sessions"
            color="yellow"
          />
          <StatCard
            title="Avg Rating"
            value={analytics.bookings.average_rating.toFixed(1)}
            suffix="/5"
            subtitle="Client satisfaction"
            color="purple"
          />
        </div>
      </div>

      {/* Goals Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Goals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Goals"
            value={analytics.goals.total_goals}
            subtitle="All time"
            color="blue"
          />
          <StatCard
            title="Active Goals"
            value={analytics.goals.active_goals}
            subtitle="Currently in progress"
            color="yellow"
          />
          <StatCard
            title="Completed"
            value={analytics.goals.completed_goals}
            subtitle={`This ${period}`}
            color="green"
          />
          <StatCard
            title="Completion Rate"
            value={analytics.goals.completion_rate.toFixed(1)}
            suffix="%"
            subtitle="Success rate"
            color="purple"
          />
        </div>
      </div>

      {/* Revenue Trends Chart */}
      {trends.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Revenue Trends (Last 6 Months)</h2>
          <div className="space-y-4">
            {trends.map((trend, index) => {
              const maxRevenue = Math.max(...trends.map((t) => t.revenue));
              const percentage = maxRevenue > 0 ? (trend.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{trend.period}</span>
                    <span className="text-white font-medium">
                      {formatCurrency(trend.revenue)}
                      <span className="text-gray-500 ml-2">({trend.count} payments)</span>
                    </span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Insights</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <span className="text-gray-400">Avg Revenue per Payment</span>
              <span className="text-white font-semibold">
                {formatCurrency(
                  analytics.revenue.completed_payments > 0
                    ? analytics.revenue.total_revenue / analytics.revenue.completed_payments
                    : 0
                )}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <span className="text-gray-400">Sessions per Client</span>
              <span className="text-white font-semibold">
                {analytics.clients.active_clients > 0
                  ? (analytics.bookings.total_sessions / analytics.clients.active_clients).toFixed(
                      1
                    )
                  : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <span className="text-gray-400">Goals per Client</span>
              <span className="text-white font-semibold">
                {analytics.clients.total_clients > 0
                  ? (analytics.goals.total_goals / analytics.clients.total_clients).toFixed(1)
                  : 0}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Status Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-3"></div>
                <span className="text-gray-400">Active Clients</span>
              </div>
              <span className="text-white font-semibold">{analytics.clients.active_clients}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-3"></div>
                <span className="text-gray-400">Pending Payments</span>
              </div>
              <span className="text-white font-semibold">
                {analytics.revenue.pending_payments}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400 mr-3"></div>
                <span className="text-gray-400">Upcoming Sessions</span>
              </div>
              <span className="text-white font-semibold">
                {analytics.bookings.upcoming_sessions}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
