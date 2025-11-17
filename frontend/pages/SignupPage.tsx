import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const DumbbellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary">
        <path d="M14.4 14.4 9.6 9.6"/>
        <path d="M18 11l-4-4-4 4"/>
        <path d="m18 6-4 4"/>
        <path d="m6 18-4-4"/>
        <path d="m12 12 5 5"/>
        <path d="M22 12h-5"/>
        <path d="M9 12H4"/>
        <path d="M12 22v-5"/>
        <path d="M12 9V4"/>
    </svg>
);

const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone_number: '',
        password: '',
        confirmPassword: '',
    });
    const [countryCode, setCountryCode] = useState('+254'); // Default to Kenya
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.username || !formData.email || !formData.phone_number || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // Combine country code with phone number if not already included
            if (!formData.phone_number.startsWith('+')) {
                formData.phone_number = `${countryCode}${formData.phone_number}`;
            }

            await signup({
                username: formData.username,
                email: formData.email,
                phone_number: formData.phone_number,
                password: formData.password,
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create account. Please try again.');
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
                        <DumbbellIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">TrainrUp</h1>
                    <p className="text-gray-400">Create Your Trainer Account</p>
                </div>

                {/* Signup Card */}
                <Card>
                    <h2 className="text-2xl font-bold text-white mb-6">Sign Up</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Username *</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                placeholder="Choose a username"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                placeholder="your.email@example.com"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Phone Number *</label>
                            <div className="flex gap-2">
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    disabled={loading}
                                >
                                    <option value="+254">🇰🇪 +254</option>
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+44">🇬🇧 +44</option>
                                    <option value="+91">🇮🇳 +91</option>
                                    <option value="+234">🇳🇬 +234</option>
                                    <option value="+27">🇿🇦 +27</option>
                                    <option value="+255">🇹🇿 +255</option>
                                    <option value="+256">🇺🇬 +256</option>
                                </select>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="flex-1 p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    placeholder="712345678"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                placeholder="At least 6 characters"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                placeholder="Re-enter your password"
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{' '}
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

export default SignupPage;
