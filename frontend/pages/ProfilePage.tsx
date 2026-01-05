import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { authService } from '../services';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface ProfileData {
    id: number;
    username: string;
    email: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    user_type: string;
    subscription_status: string;
    plan_type: string;
    trial_start_date: string | null;
    trial_end_date: string | null;
    is_trial_active: boolean;
    days_until_trial_end: number | null;
    client_limit: number;
    date_joined: string;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const { logout } = useAuth();

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleting, setDeleting] = useState(false);

    // Upgrade plan state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('starter');
    const [upgrading, setUpgrading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await authService.getProfile();
            setProfile(data);
            setFirstName(data.first_name || '');
            setLastName(data.last_name || '');
        } catch (error: any) {
            showError(error.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setSaving(true);
            await authService.updateProfile({
                first_name: firstName,
                last_name: lastName,
            });
            showSuccess('Profile updated successfully');
            setIsEditing(false);
            await loadProfile();
        } catch (error: any) {
            showError(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            showError('Please enter your password to confirm account deletion');
            return;
        }

        try {
            setDeleting(true);
            await authService.deleteAccount(deletePassword);
            showSuccess('Account deleted successfully');
            logout();
            navigate('/login');
        } catch (error: any) {
            showError(error.message || 'Failed to delete account');
        } finally {
            setDeleting(false);
        }
    };

    const handleUpgradePlan = async () => {
        try {
            setUpgrading(true);
            await authService.upgradeSubscription(selectedPlan);
            showSuccess(`Successfully upgraded to ${selectedPlan} plan`);
            setShowUpgradeModal(false);
            await loadProfile();
        } catch (error: any) {
            showError(error.message || 'Failed to upgrade subscription');
        } finally {
            setUpgrading(false);
        }
    };

    const getPlanPrice = (plan: string) => {
        const prices: Record<string, string> = {
            starter: 'KES 1,000/month',
            professional: 'KES 3,000/month',
            enterprise: 'KES 5,000/month',
        };
        return prices[plan] || 'Contact us';
    };

    const getPlanClientLimit = (plan: string) => {
        const limits: Record<string, string> = {
            starter: '10 clients',
            professional: '50 clients',
            enterprise: 'Unlimited clients',
        };
        return limits[plan] || 'Unknown';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-400">Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-400">Failed to load profile</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">My Profile</h1>

            {/* Personal Information */}
            <Card className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Personal Information</h2>
                    {!isEditing && (
                        <Button
                            variant="secondary"
                            onClick={() => setIsEditing(true)}
                            className="text-sm"
                        >
                            Edit Profile
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Username</label>
                        <p className="text-white">{profile.username}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">First Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full p-2 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    placeholder="Enter first name"
                                />
                            ) : (
                                <p className="text-white">{profile.first_name || 'Not set'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full p-2 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    placeholder="Enter last name"
                                />
                            ) : (
                                <p className="text-white">{profile.last_name || 'Not set'}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <p className="text-white">{profile.email}</p>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                        <p className="text-white">{profile.phone_number}</p>
                    </div>

                    {isEditing && (
                        <div className="flex gap-3 pt-4">
                            <Button onClick={handleUpdateProfile} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFirstName(profile.first_name || '');
                                    setLastName(profile.last_name || '');
                                }}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Subscription Information */}
            <Card className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Subscription</h2>
                    {profile.plan_type !== 'enterprise' && (
                        <Button onClick={() => setShowUpgradeModal(true)} className="text-sm">
                            Upgrade Plan
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Current Plan</label>
                            <p className="text-white font-semibold capitalize">{profile.plan_type}</p>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Status</label>
                            <p className="text-white capitalize">
                                <span className={`px-2 py-1 rounded text-sm ${
                                    profile.subscription_status === 'active'
                                        ? 'bg-green-500/20 text-green-400'
                                        : profile.subscription_status === 'trial'
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/20 text-red-400'
                                }`}>
                                    {profile.subscription_status}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Client Limit</label>
                        <p className="text-white">
                            {profile.client_limit === -1 ? 'Unlimited' : `Up to ${profile.client_limit} clients`}
                        </p>
                    </div>

                    {profile.is_trial_active && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Trial Period</label>
                            <p className="text-white">
                                {profile.days_until_trial_end !== null
                                    ? `${profile.days_until_trial_end} days remaining`
                                    : 'Expires on ' + new Date(profile.trial_end_date!).toLocaleDateString()}
                            </p>
                        </div>
                    )}

                    {profile.subscription_status === 'trial' && profile.trial_end_date && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Next Payment Due</label>
                            <p className="text-white">{new Date(profile.trial_end_date).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-500/20">
                <h2 className="text-xl font-bold text-white mb-4">Danger Zone</h2>

                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <h3 className="text-lg font-semibold text-white mb-2">Delete Account</h3>
                    <p className="text-gray-400 mb-4">
                        Once you delete your account, there is no going back. All your data including clients, bookings,
                        and payments will be permanently deleted.
                    </p>
                    <Button
                        variant="danger"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        Delete My Account
                    </Button>
                </div>
            </Card>

            {/* Upgrade Plan Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">Upgrade Your Plan</h2>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-400 mb-4">
                                To upgrade your subscription plan, please contact our sales team. They will assist you with the upgrade process and answer any questions you may have.
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-4 bg-dark-900 rounded-lg">
                                    <svg className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Email</div>
                                        <a href="mailto:sales@trainrup.com" className="text-white hover:text-brand-primary transition-colors">
                                            sales@trainrup.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-dark-900 rounded-lg">
                                    <svg className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Phone</div>
                                        <a href="tel:+254700000000" className="text-white hover:text-brand-primary transition-colors">
                                            +254 700 000 000
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-dark-900 rounded-lg">
                                    <svg className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Available</div>
                                        <div className="text-white">Mon-Fri, 9AM-5PM EAT</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-300">
                                    <strong>Current Plan:</strong> {profile.plan_type} - {getPlanClientLimit(profile.plan_type)}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowUpgradeModal(false)}
                                variant="secondary"
                            >
                                Close
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md border-red-500/20">
                        <h2 className="text-2xl font-bold text-white mb-4">Delete Account</h2>

                        <div className="mb-6">
                            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 mb-4">
                                <p className="text-white font-semibold mb-2">Warning: This action cannot be undone</p>
                                <p className="text-gray-400 text-sm">
                                    All your data will be permanently deleted including:
                                </p>
                                <ul className="text-gray-400 text-sm list-disc list-inside mt-2">
                                    <li>All clients and their information</li>
                                    <li>All bookings and sessions</li>
                                    <li>All payment records</li>
                                    <li>All workout plans and progress</li>
                                </ul>
                            </div>

                            <label className="block text-sm text-gray-400 mb-2">
                                Enter your password to confirm:
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="danger"
                                onClick={handleDeleteAccount}
                                disabled={deleting || !deletePassword}
                            >
                                {deleting ? 'Deleting...' : 'Delete My Account'}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword('');
                                }}
                                disabled={deleting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
