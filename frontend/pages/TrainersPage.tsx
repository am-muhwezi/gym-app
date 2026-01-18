import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Trainer, TrainerCreatePayload, TrainerUpdatePayload, AdminAnalytics } from '../types';
import { trainerService } from '../services';
import { useToast } from '../context/ToastContext';

const TrainersPage: React.FC = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

    // Form states
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [trainersResponse, analyticsData] = await Promise.all([
                trainerService.getTrainers(),
                trainerService.getAdminAnalytics(),
            ]);

            // Handle paginated response - extract results array
            let trainersData: Trainer[] = [];
            if (Array.isArray(trainersResponse)) {
                trainersData = trainersResponse;
            } else if (trainersResponse && typeof trainersResponse === 'object' && 'results' in trainersResponse) {
                // Paginated response
                trainersData = (trainersResponse as any).results || [];
            } else {
                console.error('Unexpected trainers data format:', trainersResponse);
                showError('Invalid data format received from server');
            }

            setTrainers(trainersData);
            setAnalytics(analyticsData);
        } catch (err: any) {
            console.error('Error loading trainer data:', err);
            setTrainers([]); // Ensure trainers is always an array
            showError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTrainer = async () => {
        setError('');

        if (!username || !email || !phoneNumber) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const payload: TrainerCreatePayload = {
                username,
                email,
                phone_number: phoneNumber,
                password: password || undefined,
            };

            await trainerService.createTrainer(payload);
            showSuccess('Trainer account created successfully');
            setShowAddModal(false);
            resetForm();
            loadData();
        } catch (err: any) {
            const errorMsg = err.detail || err.message || 'Failed to create trainer';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditTrainer = async () => {
        if (!selectedTrainer) return;

        setError('');

        if (!username || !email || !phoneNumber) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const payload: TrainerUpdatePayload = {
                username,
                email,
                phone_number: phoneNumber,
            };

            await trainerService.updateTrainer(selectedTrainer.id, payload);
            showSuccess('Trainer updated successfully');
            setShowEditModal(false);
            resetForm();
            loadData();
        } catch (err: any) {
            const errorMsg = err.detail || err.message || 'Failed to update trainer';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (trainer: Trainer) => {
        try {
            const result = await trainerService.toggleActiveStatus(trainer.id);
            showSuccess(result.message);
            loadData();
        } catch (err: any) {
            showError(err.message || 'Failed to toggle trainer status');
        }
    };

    const handleResetPassword = async () => {
        if (!selectedTrainer) return;

        setError('');

        if (!newPassword) {
            setError('Please enter a new password');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setSubmitting(true);
            const result = await trainerService.resetPassword(selectedTrainer.id, { new_password: newPassword });
            showSuccess(result.message);
            setShowResetPasswordModal(false);
            resetForm();
        } catch (err: any) {
            const errorMsg = err.error || err.message || 'Failed to reset password';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTrainer = async () => {
        if (!selectedTrainer) return;

        try {
            setSubmitting(true);
            await trainerService.deleteTrainer(selectedTrainer.id);
            showSuccess('Trainer account deleted successfully');
            setShowDeleteModal(false);
            setSelectedTrainer(null);
            loadData();
        } catch (err: any) {
            showError(err.message || 'Failed to delete trainer');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        setUsername(trainer.username);
        setEmail(trainer.email);
        setPhoneNumber(trainer.phone_number);
        setShowEditModal(true);
    };

    const openResetPasswordModal = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        setShowResetPasswordModal(true);
    };

    const openDeleteModal = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        setShowDeleteModal(true);
    };

    const resetForm = () => {
        setUsername('');
        setEmail('');
        setPhoneNumber('');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSelectedTrainer(null);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        resetForm();
    };

    const closeResetPasswordModal = () => {
        setShowResetPasswordModal(false);
        resetForm();
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedTrainer(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Trainer Management</h1>
                    <p className="text-gray-400 mt-1">Manage trainer accounts on your platform</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>Add Trainer</Button>
            </div>

            {/* Platform Analytics */}
            {analytics && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/5">
                        <h3 className="text-gray-400 text-sm">Total Trainers</h3>
                        <p className="text-3xl font-bold text-white mt-2">{analytics.trainers.total}</p>
                        <p className="text-gray-500 text-xs mt-1">Registered accounts</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5">
                        <h3 className="text-gray-400 text-sm">Active</h3>
                        <p className="text-3xl font-bold text-white mt-2">{analytics.trainers.active}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            {analytics.trainers.total > 0
                                ? `${Math.round((analytics.trainers.active / analytics.trainers.total) * 100)}% of total`
                                : 'N/A'}
                        </p>
                    </Card>
                    <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5">
                        <h3 className="text-gray-400 text-sm">New This Month</h3>
                        <p className="text-3xl font-bold text-white mt-2">{analytics.trainers.new_this_month}</p>
                        <p className="text-gray-500 text-xs mt-1">Last 30 days</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                        <h3 className="text-gray-400 text-sm">Active (7 days)</h3>
                        <p className="text-3xl font-bold text-white mt-2">{analytics.trainers.active_last_7_days}</p>
                        <p className="text-gray-500 text-xs mt-1">Recent activity</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-500/20 to-red-500/5">
                        <h3 className="text-gray-400 text-sm">Suspended</h3>
                        <p className="text-3xl font-bold text-white mt-2">{analytics.trainers.suspended}</p>
                        <p className="text-gray-500 text-xs mt-1">Inactive accounts</p>
                    </Card>
                </div>
            )}

            {/* Platform Ecosystem Stats */}
            {analytics && (
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4">Platform Ecosystem</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm">Total Clients</p>
                            <p className="text-2xl font-bold text-white">{analytics.platform.total_clients}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Bookings</p>
                            <p className="text-2xl font-bold text-white">{analytics.platform.total_bookings}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Completed Payments</p>
                            <p className="text-2xl font-bold text-white">{analytics.platform.total_completed_payments}</p>
                        </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-4">{analytics.note}</p>
                </Card>
            )}

            {!Array.isArray(trainers) || trainers.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <p className="text-gray-400">No trainers found</p>
                        <Button onClick={() => setShowAddModal(true)} className="mt-4">
                            Add First Trainer
                        </Button>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-700">
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Trainer</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Contact</th>
                                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Subscription</th>
                                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">On Platform</th>
                                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Last Seen</th>
                                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainers.map((trainer) => {
                                    const initials = trainer.username.substring(0, 2).toUpperCase();
                                    const daysSinceJoined = Math.floor(
                                        (new Date().getTime() - new Date(trainer.date_joined).getTime()) / (1000 * 60 * 60 * 24)
                                    );

                                    const getLastLoginStatus = () => {
                                        if (!trainer.last_login) {
                                            return { text: 'Never logged in', color: 'text-red-400', isOnline: false };
                                        }

                                        const lastLoginDate = new Date(trainer.last_login);
                                        const now = new Date();
                                        const diffMs = now.getTime() - lastLoginDate.getTime();
                                        const diffMins = Math.floor(diffMs / 60000);
                                        const diffHours = Math.floor(diffMs / 3600000);
                                        const diffDays = Math.floor(diffMs / 86400000);

                                        if (diffMins < 15) {
                                            return { text: 'Online now', color: 'text-green-400', isOnline: true };
                                        } else if (diffMins < 60) {
                                            return { text: `${diffMins} mins ago`, color: 'text-green-400', isOnline: false };
                                        } else if (diffHours < 24) {
                                            return { text: `${diffHours}h ago`, color: 'text-yellow-400', isOnline: false };
                                        } else if (diffDays < 7) {
                                            return { text: `${diffDays}d ago`, color: 'text-orange-400', isOnline: false };
                                        } else {
                                            return { text: lastLoginDate.toLocaleDateString(), color: 'text-gray-400', isOnline: false };
                                        }
                                    };

                                    const lastLoginStatus = getLastLoginStatus();

                                    return (
                                        <tr key={trainer.id} className="border-b border-dark-700 hover:bg-dark-700/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative">
                                                        <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary font-bold">
                                                            {initials}
                                                        </div>
                                                        {lastLoginStatus.isOnline && (
                                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-800"></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-white">{trainer.username}</p>
                                                            {trainer.is_staff && (
                                                                <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">Staff</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500">Joined {new Date(trainer.date_joined).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-300">{trainer.email}</p>
                                                    <p className="text-gray-500">{trainer.phone_number}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex justify-center">
                                                    <Badge variant={trainer.is_active ? 'success' : 'danger'}>
                                                        {trainer.is_active ? 'Active' : 'Suspended'}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-center">
                                                    {trainer.subscription_status && (
                                                        <>
                                                            <Badge variant={
                                                                trainer.subscription_status === 'trial' ? 'warning' :
                                                                trainer.subscription_status === 'active' ? 'success' : 'danger'
                                                            }>
                                                                {trainer.plan_type || trainer.subscription_status}
                                                            </Badge>
                                                            {trainer.is_trial_active && trainer.days_until_trial_end !== null && (
                                                                <p className="text-xs text-yellow-400 mt-1">
                                                                    {trainer.days_until_trial_end} days left
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                    {!trainer.subscription_status && (
                                                        <p className="text-gray-500 text-sm">-</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-center">
                                                    <p className="font-semibold text-white">{daysSinceJoined}</p>
                                                    <p className="text-xs text-gray-500">days</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-center">
                                                    <div className={`flex items-center justify-center gap-1 ${lastLoginStatus.color}`}>
                                                        <span className={`w-2 h-2 rounded-full ${lastLoginStatus.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></span>
                                                        <span className="text-sm font-medium">{lastLoginStatus.text}</span>
                                                    </div>
                                                    {trainer.last_login && (
                                                        <p className="text-xs text-gray-500 mt-1">{new Date(trainer.last_login).toLocaleTimeString()}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button onClick={() => navigate(`/admin/trainers/${trainer.id}`)} variant="primary" size="sm">
                                                        View
                                                    </Button>
                                                    <Button onClick={() => openEditModal(trainer)} variant="secondary" size="sm">
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleToggleStatus(trainer)}
                                                        variant={trainer.is_active ? 'warning' : 'success'}
                                                        size="sm"
                                                    >
                                                        {trainer.is_active ? 'Suspend' : 'Activate'}
                                                    </Button>
                                                    <Button onClick={() => openResetPasswordModal(trainer)} variant="secondary" size="sm">
                                                        Reset
                                                    </Button>
                                                    <Button onClick={() => openDeleteModal(trainer)} variant="danger" size="sm">
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Add Trainer Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={closeAddModal}
                title="Add New Trainer Account"
                maxWidth="md"
            >
                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+254712345678"
                        required
                    />

                    <Input
                        label="Password (Optional)"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave empty for auto-generated"
                    />

                    <div className="flex space-x-3 pt-4">
                        <Button
                            onClick={handleAddTrainer}
                            disabled={submitting}
                            className="flex-1"
                        >
                            {submitting ? 'Creating...' : 'Create Trainer'}
                        </Button>
                        <Button onClick={closeAddModal} variant="secondary" disabled={submitting}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Trainer Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={closeEditModal}
                title="Edit Trainer Account"
                maxWidth="md"
            >
                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />

                    <div className="flex space-x-3 pt-4">
                        <Button
                            onClick={handleEditTrainer}
                            disabled={submitting}
                            className="flex-1"
                        >
                            {submitting ? 'Updating...' : 'Update Trainer'}
                        </Button>
                        <Button onClick={closeEditModal} variant="secondary" disabled={submitting}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                isOpen={showResetPasswordModal}
                onClose={closeResetPasswordModal}
                title="Reset Trainer Password"
                maxWidth="sm"
            >
                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <p className="text-gray-300">
                        Reset password for{' '}
                        <span className="font-bold text-white">{selectedTrainer?.username}</span>
                    </p>

                    <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                    />

                    <div className="flex space-x-3 pt-4">
                        <Button
                            onClick={handleResetPassword}
                            variant="warning"
                            disabled={submitting}
                            className="flex-1"
                        >
                            {submitting ? 'Resetting...' : 'Reset Password'}
                        </Button>
                        <Button onClick={closeResetPasswordModal} variant="secondary" disabled={submitting}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={closeDeleteModal}
                title="Delete Trainer Account"
                maxWidth="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        Are you sure you want to delete trainer{' '}
                        <span className="font-bold text-white">{selectedTrainer?.username}</span>?
                        This action cannot be undone and will delete all their data including clients, bookings, and payments.
                    </p>

                    <div className="flex space-x-3 pt-4">
                        <Button
                            onClick={handleDeleteTrainer}
                            variant="danger"
                            disabled={submitting}
                            className="flex-1"
                        >
                            {submitting ? 'Deleting...' : 'Delete'}
                        </Button>
                        <Button onClick={closeDeleteModal} variant="secondary" disabled={submitting}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TrainersPage;
