import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { AdminAnalytics } from '../types';
import { trainerService } from '../services';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
    const { showError } = useToast();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const data = await trainerService.getAdminAnalytics();
            setAnalytics(data);
        } catch (err: any) {
            showError(err.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">Loading platform analytics...</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Platform Overview</h1>
                <p className="text-gray-400 mt-1">Monitor your SaaS platform health and trainer ecosystem</p>
            </div>

            {/* Trainer Metrics */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Trainer Accounts</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card
                        className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => navigate('/admin/trainers')}
                    >
                        <h3 className="text-gray-400 text-sm">Total Trainers</h3>
                        <p className="text-3xl font-bold text-white mt-2">{analytics.trainers.total}</p>
                        <p className="text-gray-500 text-xs mt-1">All registered accounts</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5">
                        <h3 className="text-gray-400 text-sm">Active</h3>
                        <p className="text-3xl font-bold text-white mt-2">{analytics.trainers.active}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            {((analytics.trainers.active / analytics.trainers.total) * 100).toFixed(1)}% of total
                        </p>
                    </Card>
                    <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5">
                        <h3 className="text-gray-400 text-sm">New This Month</h3>
                        <p className="text-3xl font-bold text-white mt-2">{analytics.trainers.new_this_month}</p>
                        <p className="text-gray-500 text-xs mt-1">Last 30 days</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                        <h3 className="text-gray-400 text-sm">Active Last 7 Days</h3>
                        <p className="text-3xl font-bold text-white mt-2">{analytics.trainers.active_last_7_days}</p>
                        <p className="text-gray-500 text-xs mt-1">Recently logged in</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-500/20 to-red-500/5">
                        <h3 className="text-gray-400 text-sm">Suspended</h3>
                        <p className="text-3xl font-bold text-white mt-2">{analytics.trainers.suspended}</p>
                        <p className="text-gray-500 text-xs mt-1">Inactive accounts</p>
                    </Card>
                </div>
            </div>

            {/* Platform Ecosystem */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Platform Ecosystem</h2>
                <Card>
                    <p className="text-gray-400 text-sm mb-4">Total activity across all trainers on your platform</p>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="text-center p-6 bg-dark-800 rounded-lg">
                            <div className="text-4xl mb-2">👥</div>
                            <p className="text-3xl font-bold text-white">{analytics.platform.total_clients}</p>
                            <p className="text-gray-400 text-sm mt-1">Total Clients</p>
                            <p className="text-gray-500 text-xs mt-1">
                                Avg {(analytics.platform.total_clients / Math.max(analytics.trainers.active, 1)).toFixed(1)} per
                                trainer
                            </p>
                        </div>
                        <div className="text-center p-6 bg-dark-800 rounded-lg">
                            <div className="text-4xl mb-2">📅</div>
                            <p className="text-3xl font-bold text-white">{analytics.platform.total_bookings}</p>
                            <p className="text-gray-400 text-sm mt-1">Total Bookings</p>
                            <p className="text-gray-500 text-xs mt-1">Sessions scheduled</p>
                        </div>
                        <div className="text-center p-6 bg-dark-800 rounded-lg">
                            <div className="text-4xl mb-2">💳</div>
                            <p className="text-3xl font-bold text-white">{analytics.platform.total_completed_payments}</p>
                            <p className="text-gray-400 text-sm mt-1">Completed Payments</p>
                            <p className="text-gray-500 text-xs mt-1">Successful transactions</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card
                        className="cursor-pointer hover:bg-dark-700 transition-colors"
                        onClick={() => navigate('/admin/trainers')}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-brand-primary"
                                >
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Manage Trainers</h3>
                                <p className="text-gray-400 text-sm">View and manage trainer accounts</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="cursor-pointer hover:bg-dark-700 transition-colors" onClick={loadAnalytics}>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-blue-500"
                                >
                                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                    <path d="M21 3v5h-5" />
                                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                    <path d="M8 16H3v5" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Refresh Data</h3>
                                <p className="text-gray-400 text-sm">Update platform metrics</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-purple-500"
                                >
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Revenue (Coming Soon)</h3>
                                <p className="text-gray-400 text-sm">Track subscription revenue</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Platform Health */}
            <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Platform Health</h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-dark-800 rounded">
                        <div className="flex items-center space-x-3">
                            <div
                                className={`w-3 h-3 rounded-full ${
                                    analytics.trainers.active > 0 ? 'bg-green-500' : 'bg-red-500'
                                }`}
                            ></div>
                            <span className="text-gray-300">Active Trainers</span>
                        </div>
                        <span className="text-white font-semibold">
                            {analytics.trainers.active > 0 ? 'Healthy' : 'No Active Trainers'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-dark-800 rounded">
                        <div className="flex items-center space-x-3">
                            <div
                                className={`w-3 h-3 rounded-full ${
                                    analytics.trainers.new_this_month > 0 ? 'bg-green-500' : 'bg-yellow-500'
                                }`}
                            ></div>
                            <span className="text-gray-300">Growth</span>
                        </div>
                        <span className="text-white font-semibold">
                            {analytics.trainers.new_this_month > 0
                                ? `+${analytics.trainers.new_this_month} this month`
                                : 'No new signups'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-dark-800 rounded">
                        <div className="flex items-center space-x-3">
                            <div
                                className={`w-3 h-3 rounded-full ${
                                    analytics.trainers.active_last_7_days / Math.max(analytics.trainers.active, 1) > 0.5
                                        ? 'bg-green-500'
                                        : 'bg-yellow-500'
                                }`}
                            ></div>
                            <span className="text-gray-300">Engagement (7 days)</span>
                        </div>
                        <span className="text-white font-semibold">
                            {(
                                (analytics.trainers.active_last_7_days / Math.max(analytics.trainers.active, 1)) *
                                100
                            ).toFixed(0)}
                            % active
                        </span>
                    </div>
                </div>
            </Card>

            {/* Note */}
            <Card className="bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start space-x-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-blue-400 mt-1 flex-shrink-0"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="16" y2="12" />
                        <line x1="12" x2="12.01" y1="8" y2="8" />
                    </svg>
                    <div>
                        <p className="text-blue-300 text-sm font-semibold">About This Dashboard</p>
                        <p className="text-blue-200 text-sm mt-1">{analytics.note}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboardPage;
