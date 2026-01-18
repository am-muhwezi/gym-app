import React from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const BlockedAccountPage: React.FC = () => {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/#/login';
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
                <div className="text-center space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-red-500"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="4.93" x2="19.07" y1="4.93" y2="19.07" />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Account Blocked</h1>
                        <p className="text-gray-400 text-lg">
                            Your account has been temporarily blocked
                        </p>
                    </div>

                    {/* Message */}
                    <Card className="bg-dark-800 border border-red-500/20">
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-red-400 mt-1 flex-shrink-0"
                                >
                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                    <path d="M12 9v4" />
                                    <path d="M12 17h.01" />
                                </svg>
                                <div className="text-left">
                                    <p className="text-red-300 font-semibold">Access Restricted</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Your account access has been blocked by the administrator. This could be due to:
                                    </p>
                                    <ul className="text-gray-400 text-sm mt-2 space-y-1 list-disc list-inside">
                                        <li>Subscription payment issues</li>
                                        <li>Terms of service violations</li>
                                        <li>Account verification pending</li>
                                        <li>Administrative review</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Support Information */}
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
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <path d="M12 17h.01" />
                            </svg>
                            <div className="text-left">
                                <p className="text-blue-300 font-semibold">Need Help?</p>
                                <p className="text-blue-200 text-sm mt-1">
                                    If you believe this is an error or need assistance, please contact our support team:
                                </p>
                                <div className="mt-3 space-y-2 text-sm">
                                    <p className="text-blue-200">
                                        <span className="font-semibold">Email:</span> trainer@trainrup.fit
                                    </p>
                                    <p className="text-blue-200">
                                        <span className="font-semibold">Phone:</span> +254 (0) 799 632 165
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                        >
                            Return to Login
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="text-gray-500 text-sm">
                        Once your account is unblocked by an administrator, you will be able to access your account again.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default BlockedAccountPage;
