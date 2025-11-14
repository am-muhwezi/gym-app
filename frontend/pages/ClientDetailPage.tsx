import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClients } from '../context/ClientContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Client, Goal, Payment, Log, ClientProgress, WorkoutRoutine } from '../types';
import { clientService, goalService, paymentService, logService, progressService, workoutService, exportService } from '../services';
import type { WorkoutPlan as WorkoutPlanType, Exercise as ExerciseType } from '../services/workoutService';
import EnhancedOverview from '../components/client/EnhancedOverview';
import GoalsManager from '../components/client/GoalsManager';
import PaymentManager from '../components/client/PaymentManager';

const BackArrowIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>);

const ClientDetailPage: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const { getClientById } = useClients();
    const [activeTab, setActiveTab] = useState('overview');
    const [client, setClient] = useState<Client | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [progress, setProgress] = useState<ClientProgress[]>([]);
    const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlanType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Load client data
    useEffect(() => {
        const loadClientData = async () => {
            if (!clientId) return;

            setLoading(true);
            try {
                // Try to get from context first
                const contextClient = getClientById(clientId);
                if (contextClient) {
                    setClient(contextClient);
                } else {
                    // Fallback to API
                    const fetchedClient = await clientService.getClient(clientId);
                    setClient(fetchedClient);
                }

                // Load related data
                const [goalsData, paymentsData, logsData, progressData, workoutsData] = await Promise.all([
                    goalService.getClientGoals(clientId).catch(() => []),
                    paymentService.getClientPayments(clientId).catch(() => []),
                    logService.getClientLogs(clientId).catch(() => []),
                    progressService.getClientProgress(clientId).catch(() => []),
                    workoutService.getClientWorkouts(clientId).catch(() => []),
                ]);

                setGoals(goalsData);
                setPayments(paymentsData);
                setLogs(logsData);
                setProgress(progressData);
                setWorkoutPlans(workoutsData);
            } catch (error) {
                console.error('Error loading client data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadClientData();
    }, [clientId, getClientById]);

    const refreshGoals = async () => {
        if (!clientId) return;
        const data = await goalService.getClientGoals(clientId);
        setGoals(data);
    };

    const refreshPayments = async () => {
        if (!clientId) return;
        const data = await paymentService.getClientPayments(clientId);
        setPayments(data);
    };

    const refreshLogs = async () => {
        if (!clientId) return;
        const data = await logService.getClientLogs(clientId);
        setLogs(data);
    };

    const refreshProgress = async () => {
        if (!clientId) return;
        const data = await progressService.getClientProgress(clientId);
        setProgress(data);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-400">Loading client details...</p>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold">Client not found</h2>
                <Link to="/clients" className="text-brand-primary hover:underline mt-4 inline-block">Go back to clients list</Link>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'bio', label: 'Bio & Progress' },
        { id: 'goals', label: 'Goals' },
        { id: 'workouts', label: 'Workouts' },
        { id: 'logs', label: 'Daily Logs' },
        { id: 'payments', label: 'Payments' },
    ];

    return (
        <div className="space-y-6">
            <Link to="/clients" className="flex items-center space-x-2 text-brand-primary hover:text-brand-secondary">
                <BackArrowIcon />
                <span>All Clients</span>
            </Link>

            {/* Client Header */}
            <Card>
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary text-3xl sm:text-4xl font-bold">
                        {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">
                            {client.full_name || `${client.first_name} ${client.last_name}`}
                        </h1>
                        <div className="mt-2 space-y-1">
                            <p className="text-gray-400">{client.email}</p>
                            <p className="text-gray-400">{client.phone}</p>
                            <p className="text-sm text-gray-500">
                                Member since: {new Date(client.created_at).toLocaleDateString()}
                            </p>
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                client.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                client.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                                {client.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    {/* Export Menu */}
                    <div className="relative">
                        <Button onClick={() => setShowExportMenu(!showExportMenu)}>
                            Export Data
                        </Button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-50">
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            exportService.exportProfile(client, 'json');
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-dark-700 text-white text-sm"
                                    >
                                        Profile (JSON)
                                    </button>
                                    <button
                                        onClick={() => {
                                            exportService.exportGoals(client, goals, 'json');
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-dark-700 text-white text-sm"
                                    >
                                        Goals (JSON)
                                    </button>
                                    <button
                                        onClick={() => {
                                            exportService.exportGoals(client, goals, 'csv');
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-dark-700 text-white text-sm"
                                    >
                                        Goals (CSV)
                                    </button>
                                    <button
                                        onClick={() => {
                                            exportService.exportPayments(client, payments, 'json');
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-dark-700 text-white text-sm"
                                    >
                                        Payments (JSON)
                                    </button>
                                    <button
                                        onClick={() => {
                                            exportService.exportPayments(client, payments, 'csv');
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-dark-700 text-white text-sm"
                                    >
                                        Payments (CSV)
                                    </button>
                                    <button
                                        onClick={() => {
                                            exportService.exportWorkouts(client, workoutPlans, 'json');
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-dark-700 text-white text-sm"
                                    >
                                        Workouts (JSON)
                                    </button>
                                    <button
                                        onClick={() => {
                                            exportService.exportWorkouts(client, workoutPlans, 'csv');
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-dark-700 text-white text-sm"
                                    >
                                        Workouts (CSV)
                                    </button>
                                    <button
                                        onClick={() => {
                                            exportService.exportProgress(client, progress, 'json');
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-dark-700 text-white text-sm"
                                    >
                                        Progress (JSON)
                                    </button>
                                    <button
                                        onClick={() => {
                                            exportService.exportLogs(client, logs, 'json');
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-dark-700 text-white text-sm"
                                    >
                                        Daily Logs (JSON)
                                    </button>
                                    <div className="border-t border-dark-700 my-1"></div>
                                    <button
                                        onClick={() => {
                                            exportService.exportAll(client, goals, payments, progress, workoutPlans, logs);
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-dark-700 text-brand-primary font-semibold text-sm"
                                    >
                                        Export All Data (JSON)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Tabs */}
            <div className="border-b border-dark-700 overflow-x-auto">
                <nav className="flex space-x-4 sm:space-x-8 min-w-max">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-1 whitespace-nowrap capitalize font-medium transition-colors duration-200 ${
                                activeTab === tab.id ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && (
                    <EnhancedOverview
                        client={client}
                        goals={goals}
                        payments={payments}
                        logs={logs}
                        progress={progress}
                    />
                )}
                {activeTab === 'bio' && (
                    <BioProgressTab
                        client={client}
                        progress={progress}
                        onRefresh={refreshProgress}
                    />
                )}
                {activeTab === 'goals' && (
                    <GoalsManager clientId={client.id} />
                )}
                {activeTab === 'workouts' && (
                    <WorkoutsTab clientId={client.id} />
                )}
                {activeTab === 'logs' && (
                    <LogsTab
                        clientId={client.id}
                        logs={logs}
                        onRefresh={refreshLogs}
                    />
                )}
                {activeTab === 'payments' && (
                    <PaymentManager clientId={client.id} />
                )}
            </div>
        </div>
    );
};

// ============ OVERVIEW TAB ============
const OverviewTab: React.FC<{
    client: Client;
    goals: Goal[];
    payments: Payment[];
    logs: Log[];
    progress: ClientProgress[];
}> = ({ client, goals, payments, logs, progress }) => {
    const activeGoals = goals.filter(g => g.status === 'active');
    const recentLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const latestProgress = progress.sort((a, b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime())[0];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Active Goals */}
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-white">Active Goals</h3>
                {activeGoals.length > 0 ? (
                    <ul className="space-y-3">
                        {activeGoals.map(goal => (
                            <li key={goal.id} className="p-3 bg-dark-800 rounded-lg">
                                <p className="font-semibold text-white">{goal.title}</p>
                                <p className="text-sm text-gray-400">{goal.description}</p>
                                {goal.target_date && (
                                    <p className="text-xs text-brand-primary mt-1">
                                        Due: {new Date(goal.target_date).toLocaleDateString()}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No active goals set.</p>
                )}
            </Card>

            {/* Payment Status */}
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-white">Payment Status</h3>
                {pendingPayments.length > 0 ? (
                    <div className="space-y-3">
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-yellow-400 font-semibold">{pendingPayments.length} Pending Payment(s)</p>
                            <p className="text-2xl font-bold text-white mt-2">
                                KES {pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                            </p>
                        </div>
                        {pendingPayments.slice(0, 2).map(payment => (
                            <div key={payment.id} className="p-3 bg-dark-800 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-400">{payment.description || 'Payment'}</p>
                                        <p className="font-bold text-white">KES {payment.amount.toLocaleString()}</p>
                                    </div>
                                    {payment.due_date && (
                                        <p className="text-xs text-gray-500">
                                            Due: {new Date(payment.due_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                        <p className="text-green-400 font-semibold">All payments up to date!</p>
                    </div>
                )}
            </Card>

            {/* Latest Progress */}
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-white">Latest Measurements</h3>
                {latestProgress ? (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-400">
                            Recorded: {new Date(latestProgress.recorded_date).toLocaleDateString()}
                        </p>
                        {latestProgress.weight && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Weight</span>
                                <span className="font-bold text-white">{latestProgress.weight} kg</span>
                            </div>
                        )}
                        {latestProgress.body_fat_percentage && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Body Fat</span>
                                <span className="font-bold text-white">{latestProgress.body_fat_percentage}%</span>
                            </div>
                        )}
                        {latestProgress.muscle_mass && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Muscle Mass</span>
                                <span className="font-bold text-white">{latestProgress.muscle_mass} kg</span>
                            </div>
                        )}
                        {(latestProgress.weight && latestProgress.weight > 0) && (
                            <div className="mt-4 p-3 bg-dark-800 rounded-lg">
                                <p className="text-sm text-gray-400 mb-1">BMI (estimated)</p>
                                <p className="text-2xl font-bold text-brand-primary">
                                    {client.dob && latestProgress.weight ?
                                        (latestProgress.weight / Math.pow(1.75, 2)).toFixed(1) :
                                        'N/A'}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-400">No progress recorded yet.</p>
                )}
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2 xl:col-span-3">
                <h3 className="text-xl font-semibold mb-4 text-white">Recent Activity Logs</h3>
                {recentLogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recentLogs.map(log => (
                            <div key={log.id} className="p-4 bg-dark-800 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-semibold text-brand-primary">
                                        {new Date(log.date).toLocaleDateString()}
                                    </p>
                                    {log.performance_rating && (
                                        <div className="flex items-center space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < log.performance_rating! ? 'text-yellow-400' : 'text-gray-600'}>
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-300">{log.notes}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No activity logs yet.</p>
                )}
            </Card>
        </div>
    );
};

// ============ BIO & PROGRESS TAB ============
const BioProgressTab: React.FC<{
    client: Client;
    progress: ClientProgress[];
    onRefresh: () => void;
}> = ({ client, progress, onRefresh }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        recorded_date: new Date().toISOString().split('T')[0],
        weight: '',
        body_fat_percentage: '',
        muscle_mass: '',
        chest: '',
        waist: '',
        hips: '',
        arms: '',
        thighs: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const sortedProgress = [...progress].sort((a, b) =>
        new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()
    );

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await progressService.createProgress(client.id, {
                recorded_date: formData.recorded_date,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : undefined,
                muscle_mass: formData.muscle_mass ? parseFloat(formData.muscle_mass) : undefined,
                chest: formData.chest ? parseFloat(formData.chest) : undefined,
                waist: formData.waist ? parseFloat(formData.waist) : undefined,
                hips: formData.hips ? parseFloat(formData.hips) : undefined,
                arms: formData.arms ? parseFloat(formData.arms) : undefined,
                thighs: formData.thighs ? parseFloat(formData.thighs) : undefined,
                notes: formData.notes || undefined,
            });
            await onRefresh();
            setShowAddModal(false);
            setFormData({
                recorded_date: new Date().toISOString().split('T')[0],
                weight: '', body_fat_percentage: '', muscle_mass: '',
                chest: '', waist: '', hips: '', arms: '', thighs: '', notes: '',
            });
        } catch (error: any) {
            alert(`Failed to add progress: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Bio & Progress Tracking</h2>
                <Button onClick={() => setShowAddModal(true)}>Add Measurement</Button>
            </div>

            {/* Client Bio */}
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-white">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {client.dob && (
                        <div>
                            <p className="text-sm text-gray-400">Date of Birth</p>
                            <p className="font-semibold text-white">{new Date(client.dob).toLocaleDateString()}</p>
                        </div>
                    )}
                    {client.gender && (
                        <div>
                            <p className="text-sm text-gray-400">Gender</p>
                            <p className="font-semibold text-white">
                                {client.gender === 'M' ? 'Male' : client.gender === 'F' ? 'Female' : 'Other'}
                            </p>
                        </div>
                    )}
                    {client.membership_start_date && (
                        <div>
                            <p className="text-sm text-gray-400">Membership Start</p>
                            <p className="font-semibold text-white">
                                {new Date(client.membership_start_date).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
                {client.notes && (
                    <div className="mt-4 p-3 bg-dark-800 rounded-lg">
                        <p className="text-sm text-gray-400">Notes</p>
                        <p className="text-white mt-1">{client.notes}</p>
                    </div>
                )}
            </Card>

            {/* Progress History */}
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-white">Progress History</h3>
                {sortedProgress.length > 0 ? (
                    <div className="space-y-4">
                        {sortedProgress.map((entry) => (
                            <div key={entry.id} className="p-4 bg-dark-800 rounded-lg">
                                <p className="font-semibold text-brand-primary mb-3">
                                    {new Date(entry.recorded_date).toLocaleDateString()}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {entry.weight && (
                                        <div>
                                            <p className="text-xs text-gray-400">Weight</p>
                                            <p className="font-semibold text-white">{entry.weight} kg</p>
                                        </div>
                                    )}
                                    {entry.body_fat_percentage && (
                                        <div>
                                            <p className="text-xs text-gray-400">Body Fat</p>
                                            <p className="font-semibold text-white">{entry.body_fat_percentage}%</p>
                                        </div>
                                    )}
                                    {entry.muscle_mass && (
                                        <div>
                                            <p className="text-xs text-gray-400">Muscle Mass</p>
                                            <p className="font-semibold text-white">{entry.muscle_mass} kg</p>
                                        </div>
                                    )}
                                    {entry.chest && (
                                        <div>
                                            <p className="text-xs text-gray-400">Chest</p>
                                            <p className="font-semibold text-white">{entry.chest} cm</p>
                                        </div>
                                    )}
                                    {entry.waist && (
                                        <div>
                                            <p className="text-xs text-gray-400">Waist</p>
                                            <p className="font-semibold text-white">{entry.waist} cm</p>
                                        </div>
                                    )}
                                    {entry.hips && (
                                        <div>
                                            <p className="text-xs text-gray-400">Hips</p>
                                            <p className="font-semibold text-white">{entry.hips} cm</p>
                                        </div>
                                    )}
                                    {entry.arms && (
                                        <div>
                                            <p className="text-xs text-gray-400">Arms</p>
                                            <p className="font-semibold text-white">{entry.arms} cm</p>
                                        </div>
                                    )}
                                    {entry.thighs && (
                                        <div>
                                            <p className="text-xs text-gray-400">Thighs</p>
                                            <p className="font-semibold text-white">{entry.thighs} cm</p>
                                        </div>
                                    )}
                                </div>
                                {entry.notes && (
                                    <p className="mt-3 text-sm text-gray-300 italic">{entry.notes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No progress measurements recorded yet.</p>
                )}
            </Card>

            {/* Add Progress Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 text-white">Add Progress Measurement</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={formData.recorded_date}
                                    onChange={(e) => setFormData({...formData, recorded_date: e.target.value})}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                />
                            </div>

                            <h4 className="font-semibold text-white mt-4">Body Composition</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                                        className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Body Fat (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.body_fat_percentage}
                                        onChange={(e) => setFormData({...formData, body_fat_percentage: e.target.value})}
                                        className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Muscle Mass (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.muscle_mass}
                                        onChange={(e) => setFormData({...formData, muscle_mass: e.target.value})}
                                        className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    />
                                </div>
                            </div>

                            <h4 className="font-semibold text-white mt-4">Measurements (cm)</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Chest</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.chest}
                                        onChange={(e) => setFormData({...formData, chest: e.target.value})}
                                        className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Waist</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.waist}
                                        onChange={(e) => setFormData({...formData, waist: e.target.value})}
                                        className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Hips</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.hips}
                                        onChange={(e) => setFormData({...formData, hips: e.target.value})}
                                        className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Arms</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.arms}
                                        onChange={(e) => setFormData({...formData, arms: e.target.value})}
                                        className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Thighs</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.thighs}
                                        onChange={(e) => setFormData({...formData, thighs: e.target.value})}
                                        className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Adding...' : 'Add Measurement'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};


// ============ WORKOUTS TAB ============
const WorkoutsTab: React.FC<{ clientId: string }> = ({ clientId }) => {
    const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlanType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddPlanModal, setShowAddPlanModal] = useState(false);
    const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [newPlan, setNewPlan] = useState({ name: '', description: '' });
    const [newExercise, setNewExercise] = useState({
        name: '',
        description: '',
        sets: 3,
        reps: 10,
        rest_period_seconds: 60,
    });

    useEffect(() => {
        loadWorkoutPlans();
    }, [clientId]);

    const loadWorkoutPlans = async () => {
        try {
            setLoading(true);
            const plans = await workoutService.getClientWorkouts(clientId);
            setWorkoutPlans(plans);
        } catch (error) {
            console.error('Error loading workout plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlan = async () => {
        if (!newPlan.name.trim()) {
            alert('Please enter a workout plan name');
            return;
        }

        try {
            await workoutService.createWorkoutPlan(clientId, newPlan);
            setNewPlan({ name: '', description: '' });
            setShowAddPlanModal(false);
            await loadWorkoutPlans();
        } catch (error: any) {
            alert(`Failed to create workout plan: ${error.message}`);
        }
    };

    const handleAddExercise = async () => {
        if (!selectedPlanId || !newExercise.name.trim()) {
            alert('Please enter exercise name');
            return;
        }

        try {
            await workoutService.addExercise(clientId, selectedPlanId, newExercise);
            setNewExercise({ name: '', description: '', sets: 3, reps: 10, rest_period_seconds: 60 });
            setShowAddExerciseModal(false);
            setSelectedPlanId(null);
            await loadWorkoutPlans();
        } catch (error: any) {
            alert(`Failed to add exercise: ${error.message}`);
        }
    };

    const handleRemoveExercise = async (planId: string, exerciseId: string) => {
        if (!confirm('Are you sure you want to remove this exercise?')) return;

        try {
            await workoutService.deleteExercise(clientId, planId, exerciseId);
            await loadWorkoutPlans();
        } catch (error: any) {
            alert(`Failed to delete exercise: ${error.message}`);
        }
    };

    const handleRemovePlan = async (planId: string) => {
        if (!confirm('Are you sure you want to delete this workout plan?')) return;

        try {
            await workoutService.deleteWorkoutPlan(clientId, planId);
            await loadWorkoutPlans();
        } catch (error: any) {
            alert(`Failed to delete workout plan: ${error.message}`);
        }
    };

    if (loading) {
        return <p className="text-gray-400">Loading workout plans...</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Workout Program</h2>
                <Button onClick={() => setShowAddPlanModal(true)}>Add Workout Plan</Button>
            </div>

            {workoutPlans.length > 0 ? (
                <div className="space-y-4">
                    {workoutPlans.map(plan => (
                        <Card key={plan.id}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                                    {plan.description && (
                                        <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setSelectedPlanId(plan.id);
                                            setShowAddExerciseModal(true);
                                        }}
                                    >
                                        Add Exercise
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleRemovePlan(plan.id)}
                                    >
                                        Remove Plan
                                    </Button>
                                </div>
                            </div>

                            {plan.exercises.length > 0 ? (
                                <div className="space-y-2">
                                    {plan.exercises.map((exercise, index) => (
                                        <div key={exercise.id} className="p-3 bg-dark-800 rounded-lg flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <span className="text-brand-primary font-bold w-6">{index + 1}.</span>
                                                <div>
                                                    <p className="font-semibold text-white">{exercise.name}</p>
                                                    <p className="text-sm text-gray-400">
                                                        {exercise.sets} sets × {exercise.reps} reps • Rest: {exercise.rest_period_seconds}s
                                                    </p>
                                                    {exercise.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{exercise.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveExercise(plan.id, exercise.id)}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-4">No exercises added yet</p>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <p className="text-gray-400 mb-4">No workout plans created yet</p>
                    <Button onClick={() => setShowAddPlanModal(true)}>Create First Workout Plan</Button>
                </Card>
            )}

            {/* Add Plan Modal */}
            {showAddPlanModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-white">Add Workout Plan</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Plan Name *</label>
                                <input
                                    type="text"
                                    value={newPlan.name}
                                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    placeholder="e.g., Monday - Chest & Triceps"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={newPlan.description}
                                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    placeholder="Focus on compound movements..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Button variant="secondary" onClick={() => setShowAddPlanModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddPlan}>Add Plan</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Add Exercise Modal */}
            {showAddExerciseModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-white">Add Exercise</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Exercise Name *</label>
                                <input
                                    type="text"
                                    value={newExercise.name}
                                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    placeholder="e.g., Bench Press"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={newExercise.description}
                                    onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    placeholder="Barbell flat bench press..."
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Sets</label>
                                    <input
                                        type="number"
                                        value={newExercise.sets}
                                        onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 0 })}
                                        className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Reps</label>
                                    <input
                                        type="number"
                                        value={newExercise.reps}
                                        onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || 0 })}
                                        className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                        placeholder="10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Rest (s)</label>
                                    <input
                                        type="number"
                                        value={newExercise.rest_period_seconds}
                                        onChange={(e) => setNewExercise({ ...newExercise, rest_period_seconds: parseInt(e.target.value) || 0 })}
                                        className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                        placeholder="60"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Button variant="secondary" onClick={() => {
                                setShowAddExerciseModal(false);
                                setSelectedPlanId(null);
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddExercise}>Add Exercise</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

// ============ LOGS TAB ============
const LogsTab: React.FC<{
    clientId: string;
    logs: Log[];
    onRefresh: () => void;
}> = ({ clientId, logs, onRefresh }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        notes: '',
        performance_rating: 3,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!formData.notes) {
            alert('Please add some notes');
            return;
        }

        setSubmitting(true);
        try {
            await logService.createLog(clientId, formData);
            await onRefresh();
            setShowAddModal(false);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                notes: '',
                performance_rating: 3,
            });
        } catch (error: any) {
            alert(`Failed to create log: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const sortedLogs = [...logs].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Daily Activity Logs</h2>
                <Button onClick={() => setShowAddModal(true)}>Add Log</Button>
            </div>

            <Card>
                {sortedLogs.length > 0 ? (
                    <div className="space-y-4">
                        {sortedLogs.map(log => (
                            <div key={log.id} className="p-4 bg-dark-800 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-semibold text-brand-primary">
                                        {new Date(log.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    {log.performance_rating && (
                                        <div className="flex items-center space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-xl ${i < log.performance_rating! ? 'text-yellow-400' : 'text-gray-600'}`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-300">{log.notes}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Logged on {new Date(log.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No activity logs yet. Start tracking daily sessions!</p>
                )}
            </Card>

            {/* Add Log Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-4 text-white">Add Activity Log</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Performance Rating</label>
                                <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setFormData({...formData, performance_rating: rating})}
                                            className={`text-3xl ${rating <= formData.performance_rating ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-400 transition-colors`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                    <span className="ml-2 text-white">{formData.performance_rating}/5</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Notes *</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    rows={5}
                                    placeholder="What did you work on today? How did the client perform? Any observations..."
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Adding...' : 'Add Log'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

// ============ PAYMENTS TAB ============
const PaymentsTab: React.FC<{
    clientId: string;
    payments: Payment[];
    onRefresh: () => void;
}> = ({ clientId, payments, onRefresh }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        method: 'cash' as any,
        description: 'Monthly Membership',
        due_date: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleCreatePayment = async () => {
        if (!formData.amount) {
            alert('Please enter an amount');
            return;
        }

        setSubmitting(true);
        try {
            await paymentService.createPayment({
                client: clientId,
                amount: parseFloat(formData.amount),
                method: formData.method,
                description: formData.description || undefined,
                due_date: formData.due_date || undefined,
            });
            await onRefresh();
            setShowAddModal(false);
            setFormData({ amount: '', method: 'cash', description: 'Monthly Membership', due_date: '' });
        } catch (error: any) {
            alert(`Failed to create payment: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkPaid = async (paymentId: string, method: 'cash' | 'mpesa') => {
        try {
            await paymentService.updatePayment(paymentId, {
                status: 'completed',
                method: method,
                payment_date: new Date().toISOString()
            });
            await onRefresh();
        } catch (error: any) {
            alert(`Failed to update payment: ${error.message}`);
        }
    };

    const pendingPayments = payments.filter(p => p.status === 'pending');
    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Membership Payments</h2>
                <Button onClick={() => setShowAddModal(true)}>Add Payment</Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-yellow-500/10 border border-yellow-500/20">
                    <h3 className="text-sm text-yellow-400 mb-1">Pending Payments</h3>
                    <p className="text-3xl font-bold text-white">KES {totalPending.toLocaleString()}</p>
                    <p className="text-sm text-gray-400 mt-1">{pendingPayments.length} payment(s)</p>
                </Card>
                <Card className="bg-green-500/10 border border-green-500/20">
                    <h3 className="text-sm text-green-400 mb-1">Total Paid</h3>
                    <p className="text-3xl font-bold text-white">KES {totalPaid.toLocaleString()}</p>
                    <p className="text-sm text-gray-400 mt-1">{completedPayments.length} payment(s)</p>
                </Card>
            </div>

            {/* Pending Payments */}
            {pendingPayments.length > 0 && (
                <Card>
                    <h3 className="text-xl font-semibold mb-4 text-white">Pending Payments</h3>
                    <div className="space-y-3">
                        {pendingPayments.map(payment => (
                            <div key={payment.id} className="p-4 bg-dark-800 rounded-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-white text-xl">KES {payment.amount.toLocaleString()}</p>
                                        {payment.description && (
                                            <p className="text-gray-400 text-sm">{payment.description}</p>
                                        )}
                                        {payment.due_date && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Due: {new Date(payment.due_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400">
                                        PENDING
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleMarkPaid(payment.id, 'cash')}>
                                        Mark Paid (Cash)
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => handleMarkPaid(payment.id, 'mpesa')}>
                                        Mark Paid (M-Pesa)
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Payment History */}
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-white">Payment History</h3>
                {completedPayments.length > 0 ? (
                    <div className="space-y-3">
                        {completedPayments.map(payment => (
                            <div key={payment.id} className="p-4 bg-dark-800 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-white">KES {payment.amount.toLocaleString()}</p>
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
                                                PAID
                                            </span>
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400">
                                                {payment.method.toUpperCase()}
                                            </span>
                                        </div>
                                        {payment.description && (
                                            <p className="text-gray-400 text-sm mt-1">{payment.description}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Paid on: {new Date(payment.payment_date).toLocaleDateString()}
                                        </p>
                                        {payment.transaction_id && (
                                            <p className="text-xs text-gray-500">
                                                Transaction ID: {payment.transaction_id}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No payment history yet.</p>
                )}
            </Card>

            {/* Add Payment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-4 text-white">Add Membership Payment</h2>

                        {/* Quick Select for Common Payments */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Quick Select</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setFormData({...formData, amount: '5000', description: 'Monthly Membership'})}
                                    className="p-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg border border-dark-700 text-sm"
                                >
                                    Monthly (KES 5,000)
                                </button>
                                <button
                                    onClick={() => setFormData({...formData, amount: '3000', description: 'Per Session'})}
                                    className="p-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg border border-dark-700 text-sm"
                                >
                                    Per Session (KES 3,000)
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Amount (KES) *</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    placeholder="5000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Payment Method</label>
                                <select
                                    value={formData.method}
                                    onChange={(e) => setFormData({...formData, method: e.target.value as any})}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="mpesa">M-Pesa</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="debit_card">Debit Card</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                    placeholder="Monthly membership, Personal training session, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Due Date (optional)</label>
                                <input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreatePayment} disabled={submitting}>
                                {submitting ? 'Adding...' : 'Add Payment'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ClientDetailPage;
