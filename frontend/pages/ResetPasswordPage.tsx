import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            setError('Invalid or missing reset token. Please request a new password reset link.');
        } else {
            setToken(tokenParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!token) {
            setError('Invalid reset token');
            return;
        }

        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authService.confirmPasswordReset(token, newPassword);
            setSuccess(true);

            // Redirect to login page after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.token?.[0] ||
                err.response?.data?.new_password?.[0] ||
                'Failed to reset password. The link may have expired.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img src="/icons/icon.svg" alt="TrainrUp Logo" className="w-20 h-20" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">TrainrUp</h1>
                    <p className="text-gray-400">Personal Training Management</p>
                </div>

                {/* Reset Password Card */}
                <Card>
                    <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Enter your new password below.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-green-400 text-sm">
                                Password reset successfully! Redirecting to login...
                            </p>
                        </div>
                    )}

                    {!success && token && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    placeholder="Enter new password"
                                    disabled={loading}
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    placeholder="Confirm new password"
                                    disabled={loading}
                                    minLength={6}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Remember your password?{' '}
                            <Link to="/login" className="text-brand-primary hover:text-brand-secondary font-medium">
                                Login
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
