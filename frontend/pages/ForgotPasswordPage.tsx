import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetUrl, setResetUrl] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setResetUrl(null);

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.requestPasswordReset(email);
            setSuccess(true);

            // For development - show the reset URL if available
            if (response.reset_url) {
                setResetUrl(response.reset_url);
            }
        } catch (err: any) {
            setError(err.response?.data?.email?.[0] || 'Failed to send password reset email. Please try again.');
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

                {/* Forgot Password Card */}
                <Card>
                    <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-green-400 text-sm">
                                Password reset instructions have been sent to your email address.
                            </p>
                            {resetUrl && (
                                <div className="mt-2">
                                    <p className="text-yellow-400 text-xs">Development Mode - Reset Link:</p>
                                    <a
                                        href={resetUrl}
                                        className="text-brand-primary text-xs break-all hover:underline"
                                    >
                                        {resetUrl}
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                placeholder="Enter your email"
                                disabled={loading || success}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || success}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-gray-400 text-sm">
                            Remember your password?{' '}
                            <Link to="/login" className="text-brand-primary hover:text-brand-secondary font-medium">
                                Login
                            </Link>
                        </p>
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-brand-primary hover:text-brand-secondary font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
