import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { TrainerDetailResponse, TrainerSubscriptionUpdatePayload } from '../types';
import { trainerService } from '../services';
import { useToast } from '../context/ToastContext';

const TrainerDetailPage: React.FC = () => {
    const { trainerId } = useParams<{ trainerId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [data, setData] = useState<TrainerDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Subscription form state
    const [subscriptionStatus, setSubscriptionStatus] = useState('');
    const [planType, setPlanType] = useState('');
    const [clientLimit, setClientLimit] = useState('');
    const [extendTrialDays, setExtendTrialDays] = useState('');

    // Block form state
    const [blockReason, setBlockReason] = useState('');

    useEffect(() => {
        loadData();
    }, [trainerId]);

    const loadData = async () => {
        if (!trainerId) return;

        try {
            setLoading(true);
            const response = await trainerService.getTrainerDetails(trainerId);
            setData(response);
        } catch (err: any) {
            console.error('Error loading trainer details:', err);
            showError(err.message || 'Failed to load trainer details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubscription = async () => {
        if (!trainerId) return;

        try {
            setSubmitting(true);
            const payload: TrainerSubscriptionUpdatePayload = {};

            if (subscriptionStatus) payload.subscription_status = subscriptionStatus as any;
            if (planType) payload.plan_type = planType as any;
            if (clientLimit) payload.client_limit = parseInt(clientLimit);
            if (extendTrialDays) payload.extend_trial_days = parseInt(extendTrialDays);

            const result = await trainerService.updateSubscription(trainerId, payload);

            // Show appropriate success message
            let message = result.message;
            if (result.blocking && !result.blocking.account_blocked && data?.blocking.account_blocked) {
                message += ' Account has been automatically unblocked.';
            }

            showSuccess(message);
            setShowSubscriptionModal(false);
            resetSubscriptionForm();

            // Reload full trainer details to get updated blocking status
            await loadData();
        } catch (err: any) {
            showError(err.message || 'Failed to update subscription');
        } finally {
            setSubmitting(false);
        }
    };

    const resetSubscriptionForm = () => {
        setSubscriptionStatus('');
        setPlanType('');
        setClientLimit('');
        setExtendTrialDays('');
    };

    const openSubscriptionModal = () => {
        if (data?.subscription) {
            setSubscriptionStatus(data.subscription.status);
            setPlanType(data.subscription.plan_type);
            setClientLimit(data.subscription.client_limit.toString());
        }
        setShowSubscriptionModal(true);
    };

    const handleBlockTrainer = async () => {
        if (!trainerId) return;

        try {
            setSubmitting(true);
            const result = await trainerService.blockTrainer(trainerId, blockReason || undefined);
            showSuccess(result.message);
            setShowBlockModal(false);
            setBlockReason('');
            loadData();
        } catch (err: any) {
            showError(err.message || 'Failed to block trainer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnblockTrainer = async () => {
        if (!trainerId) return;

        try {
            setSubmitting(true);
            const result = await trainerService.unblockTrainer(trainerId);
            showSuccess(result.message);
            loadData();
        } catch (err: any) {
            showError(err.message || 'Failed to unblock trainer');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">Loading trainer details...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-400 mb-4">Trainer not found</p>
                <Button onClick={() => navigate('/admin/trainers')}>Back to Trainers</Button>
            </div>
        );
    }

    const { trainer, statistics, subscription, blocking, recent_activity } = data;

    const getSubscriptionStatusColor = (status: string) => {
        switch (status) {
            case 'trial':
                return 'warning';
            case 'active':
                return 'success';
            case 'expired':
            case 'cancelled':
                return 'danger';
            default:
                return 'default';
        }
    };

    const getPlanTypeBadge = (plan: string) => {
        const colors: any = {
            trial: 'bg-yellow-500/20 text-yellow-400',
            starter: 'bg-blue-500/20 text-blue-400',
            professional: 'bg-purple-500/20 text-purple-400',
            enterprise: 'bg-green-500/20 text-green-400',
        };
        return colors[plan] || 'bg-gray-500/20 text-gray-400';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Button onClick={() => navigate('/admin/trainers')} variant="secondary" size="sm" className="mb-2">
                        ← Back to Trainers
                    </Button>
                    <h1 className="text-3xl font-bold text-white">{trainer.username}</h1>
                    <p className="text-gray-400 mt-1">{trainer.email}</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant={trainer.is_active ? 'success' : 'danger'}>
                        {trainer.is_active ? 'Active' : 'Suspended'}
                    </Badge>
                </div>
            </div>

            {/* Account Blocking Status */}
            {blocking.account_blocked && (
                <Card className="bg-red-500/10 border border-red-500/20">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-red-400 mt-1 flex-shrink-0"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="4.93" x2="19.07" y1="4.93" y2="19.07" />
                            </svg>
                            <div>
                                <p className="text-red-300 font-semibold text-lg">Account Blocked</p>
                                <p className="text-red-200 text-sm mt-1">
                                    This trainer's account has been blocked and they cannot access the platform.
                                </p>
                                {blocking.block_reason && (
                                    <div className="mt-3 p-3 bg-dark-800 rounded">
                                        <p className="text-gray-400 text-xs">Reason:</p>
                                        <p className="text-white text-sm mt-1">{blocking.block_reason}</p>
                                    </div>
                                )}
                                {blocking.blocked_at && (
                                    <p className="text-red-300 text-xs mt-2">
                                        Blocked on {new Date(blocking.blocked_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={handleUnblockTrainer}
                            disabled={submitting}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 ml-4"
                        >
                            {submitting ? 'Unblocking...' : 'Unblock Account'}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Subscription Info */}
            <Card>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white">Subscription Details</h3>
                    <div className="flex gap-2">
                        <Button onClick={openSubscriptionModal} size="sm">
                            Manage Subscription
                        </Button>
                        {!blocking.account_blocked && (
                            <Button
                                onClick={() => setShowBlockModal(true)}
                                size="sm"
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Block Account
                            </Button>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-gray-400 text-sm">Status</p>
                        <Badge variant={getSubscriptionStatusColor(subscription.status)} className="mt-1">
                            {subscription.status}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Plan Type</p>
                        <span className={`inline-block px-2 py-1 rounded text-sm mt-1 ${getPlanTypeBadge(subscription.plan_type)}`}>
                            {subscription.plan_type}
                        </span>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Client Limit</p>
                        <p className="text-white font-semibold mt-1">
                            {subscription.client_limit === -1 ? 'Unlimited' : subscription.client_limit}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Trial Status</p>
                        <p className="text-white font-semibold mt-1">
                            {subscription.is_trial_active
                                ? `${subscription.days_until_trial_end} days left`
                                : 'Not in trial'}
                        </p>
                    </div>
                </div>
                {subscription.trial_end_date && (
                    <div className="mt-4 pt-4 border-t border-dark-700">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-400 text-sm">Trial Started</p>
                                <p className="text-white">{new Date(subscription.trial_start_date!).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Trial Ends</p>
                                <p className="text-white">{new Date(subscription.trial_end_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                    <h3 className="text-gray-400 text-sm">Clients</h3>
                    <p className="text-3xl font-bold text-white mt-2">{statistics.clients.total}</p>
                    <p className="text-gray-500 text-xs mt-1">
                        {statistics.clients.removed > 0 && `${statistics.clients.removed} removed`}
                    </p>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5">
                    <h3 className="text-gray-400 text-sm">Bookings</h3>
                    <p className="text-3xl font-bold text-white mt-2">{statistics.bookings.total}</p>
                    <p className="text-gray-500 text-xs mt-1">
                        {statistics.bookings.completed} completed, {statistics.bookings.upcoming} upcoming
                    </p>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5">
                    <h3 className="text-gray-400 text-sm">Revenue</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                        KES {statistics.payments.total_revenue.toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                        {statistics.payments.completed} completed payments
                    </p>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Clients */}
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4">Recent Clients</h3>
                    {recent_activity.clients.length === 0 ? (
                        <p className="text-gray-400 text-sm">No clients yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recent_activity.clients.map((client) => (
                                <div key={client.id} className="flex justify-between items-center p-3 bg-dark-700/50 rounded">
                                    <div>
                                        <p className="text-white font-semibold">
                                            {client.first_name} {client.last_name}
                                        </p>
                                        <p className="text-gray-400 text-sm">{client.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={client.status === 'active' ? 'success' : 'default'}>
                                            {client.status}
                                        </Badge>
                                        <p className="text-gray-500 text-xs mt-1">
                                            {new Date(client.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Recent Bookings */}
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4">Recent Bookings</h3>
                    {recent_activity.bookings.length === 0 ? (
                        <p className="text-gray-400 text-sm">No bookings yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recent_activity.bookings.map((booking) => (
                                <div key={booking.id} className="flex justify-between items-center p-3 bg-dark-700/50 rounded">
                                    <div>
                                        <p className="text-white font-semibold">{booking.title}</p>
                                        <p className="text-gray-400 text-sm">
                                            {new Date(booking.session_date).toLocaleDateString()} at {booking.start_time}
                                        </p>
                                    </div>
                                    <Badge variant={booking.status === 'completed' ? 'success' : 'warning'}>
                                        {booking.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Subscription Management Modal */}
            <Modal
                isOpen={showSubscriptionModal}
                onClose={() => {
                    setShowSubscriptionModal(false);
                    resetSubscriptionForm();
                }}
                title="Manage Subscription"
                maxWidth="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Subscription Status
                        </label>
                        <select
                            className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-white"
                            value={subscriptionStatus}
                            onChange={(e) => setSubscriptionStatus(e.target.value)}
                        >
                            <option value="">Keep current</option>
                            <option value="trial">Trial</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Plan Type
                        </label>
                        <select
                            className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-white"
                            value={planType}
                            onChange={(e) => setPlanType(e.target.value)}
                        >
                            <option value="">Keep current</option>
                            <option value="trial">Trial</option>
                            <option value="starter">Starter</option>
                            <option value="professional">Professional</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>

                    <Input
                        label="Client Limit (-1 for unlimited)"
                        type="number"
                        value={clientLimit}
                        onChange={(e) => setClientLimit(e.target.value)}
                        placeholder="e.g., 10"
                    />

                    <Input
                        label="Extend Trial (days)"
                        type="number"
                        value={extendTrialDays}
                        onChange={(e) => setExtendTrialDays(e.target.value)}
                        placeholder="e.g., 7"
                    />

                    <div className="flex space-x-3 pt-4">
                        <Button
                            onClick={handleUpdateSubscription}
                            disabled={submitting}
                            className="flex-1"
                        >
                            {submitting ? 'Updating...' : 'Update Subscription'}
                        </Button>
                        <Button
                            onClick={() => {
                                setShowSubscriptionModal(false);
                                resetSubscriptionForm();
                            }}
                            variant="secondary"
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Block Account Modal */}
            <Modal
                isOpen={showBlockModal}
                onClose={() => {
                    setShowBlockModal(false);
                    setBlockReason('');
                }}
                title="Block Trainer Account"
                maxWidth="md"
            >
                <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded">
                        <p className="text-red-300 text-sm">
                            This will immediately block <strong>{trainer.username}</strong>'s access to the platform. They will not be able to log in or use any features.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Reason for Blocking (Optional)
                        </label>
                        <textarea
                            className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-white min-h-[100px]"
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            placeholder="Enter the reason for blocking this account..."
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button
                            onClick={handleBlockTrainer}
                            disabled={submitting}
                            className="flex-1 bg-red-500 hover:bg-red-600"
                        >
                            {submitting ? 'Blocking...' : 'Block Account'}
                        </Button>
                        <Button
                            onClick={() => {
                                setShowBlockModal(false);
                                setBlockReason('');
                            }}
                            variant="secondary"
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TrainerDetailPage;
