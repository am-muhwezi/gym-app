import React, { useState, useEffect } from 'react';
import { useClients } from '../context/ClientContext';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { goalService, paymentService } from '../services';
import { Goal, Payment } from '../types';

const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const TargetIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>);
const DollarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>);

const DashboardPage: React.FC = () => {
    const { clients } = useClients();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalGoals: 0,
        activeGoals: 0,
        pendingPayments: 0,
        totalPending: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Aggregate data from clients (goals are already included in client data)
                let totalGoalsCount = 0;
                let activeGoalsCount = 0;
                const allPayments: Payment[] = [];

                // Fetch payments for each client
                for (const client of clients) {
                    try {
                        // Count goals from client data (already fetched)
                        if ((client as any).goals) {
                            const clientGoals = (client as any).goals as Goal[];
                            totalGoalsCount += clientGoals.length;
                            activeGoalsCount += clientGoals.filter((g: Goal) =>
                                g.status === 'active' || (!g.achieved && !g.status)
                            ).length;
                        }

                        // Fetch payments
                        const payments = await paymentService.getClientPayments(client.id).catch(() => []);
                        allPayments.push(...payments);
                    } catch (error) {
                        console.error(`Error fetching data for client ${client.id}:`, error);
                    }
                }

                const pendingPayments = allPayments.filter(p => p.status === 'pending');
                const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

                setStats({
                    totalGoals: totalGoalsCount,
                    activeGoals: activeGoalsCount,
                    pendingPayments: pendingPayments.length,
                    totalPending,
                });
            } catch (error) {
                console.error('Error loading dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (clients.length > 0) {
            loadStats();
        } else {
            setLoading(false);
        }
    }, [clients]);

    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;

    const recentClients = [...clients]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, Trainer!</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400">Total Clients</p>
                        <p className="text-3xl sm:text-4xl font-bold text-white">{totalClients}</p>
                        <p className="text-xs text-gray-500 mt-1">{activeClients} active</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><UsersIcon /></div>
                </Card>

                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400">Active Goals</p>
                        <p className="text-3xl sm:text-4xl font-bold text-white">
                            {loading ? '...' : stats.activeGoals}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {loading ? '' : `${stats.totalGoals} total`}
                        </p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-400"><TargetIcon /></div>
                </Card>

                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400">Pending Payments</p>
                        <p className="text-3xl sm:text-4xl font-bold text-white">
                            {loading ? '...' : stats.pendingPayments}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {loading ? '' : `KES ${stats.totalPending.toLocaleString()}`}
                        </p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg text-green-400"><DollarIcon /></div>
                </Card>

                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400">This Month</p>
                        <p className="text-3xl sm:text-4xl font-bold text-white">
                            {clients.filter(c => {
                                const created = new Date(c.created_at);
                                const now = new Date();
                                return created.getMonth() === now.getMonth() &&
                                       created.getFullYear() === now.getFullYear();
                            }).length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">new clients</p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400"><UsersIcon /></div>
                </Card>
            </div>

            {/* Recent Clients */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Recent Clients</h2>
                    <button
                        onClick={() => navigate('/clients')}
                        className="text-brand-primary hover:text-brand-secondary text-sm font-medium"
                    >
                        View All →
                    </button>
                </div>
                {recentClients.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                        {recentClients.map(client => (
                            <div
                                key={client.id}
                                className="flex items-center justify-between p-3 sm:p-4 bg-dark-800 rounded-lg hover:bg-dark-700 cursor-pointer transition-colors"
                                onClick={() => navigate(`/clients/${client.id}`)}
                            >
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary font-bold">
                                        {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">
                                            {client.full_name || `${client.first_name} ${client.last_name}`}
                                        </p>
                                        <p className="text-sm text-gray-400">{client.phone}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                        client.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                        client.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                        {client.status.toUpperCase()}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                                        Joined {new Date(client.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-400 mb-4">No clients yet</p>
                        <button
                            onClick={() => navigate('/clients')}
                            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
                        >
                            Add Your First Client
                        </button>
                    </div>
                )}
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card
                    className="cursor-pointer hover:border-brand-primary transition-colors border-2 border-transparent"
                    onClick={() => navigate('/clients')}
                >
                    <h3 className="text-lg font-semibold mb-2 text-white">Manage Clients</h3>
                    <p className="text-sm text-gray-400">View and manage your client list</p>
                </Card>
                <Card
                    className="cursor-pointer hover:border-brand-primary transition-colors border-2 border-transparent"
                    onClick={() => navigate('/payments')}
                >
                    <h3 className="text-lg font-semibold mb-2 text-white">Track Payments</h3>
                    <p className="text-sm text-gray-400">Monitor pending and completed payments</p>
                </Card>
                <Card
                    className="cursor-pointer hover:border-brand-primary transition-colors border-2 border-transparent"
                    onClick={() => navigate('/analytics')}
                >
                    <h3 className="text-lg font-semibold mb-2 text-white">View Analytics</h3>
                    <p className="text-sm text-gray-400">Track your training business metrics</p>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
