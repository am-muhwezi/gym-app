import React from 'react';
import { NavLink } from 'react-router-dom';

const LogoIcon = () => (
    <img src="/icons/icon.svg" alt="TrainrUp" className="h-10 w-10" />
);
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>);
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const CreditCardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>);
const BarChartIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>);


const navLinks = [
    { to: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { to: '/clients', icon: <UsersIcon />, label: 'Clients' },
    { to: '/bookings', icon: <CalendarIcon />, label: 'Bookings' },
    { to: '/payments', icon: <CreditCardIcon />, label: 'Payments' },
    { to: '/analytics', icon: <BarChartIcon />, label: 'Analytics' },
];

const Sidebar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-brand-primary rounded-lg text-white"
                aria-label="Toggle menu"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:relative
                    w-64 h-full
                    bg-dark-900 border-r border-dark-700
                    flex flex-col
                    transition-transform duration-300 ease-in-out
                    z-40
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="h-16 flex items-center justify-center px-4 border-b border-dark-700">
                    <LogoIcon />
                    <h1 className="text-xl font-bold ml-2 text-white">TrainrUp</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navLinks.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-dark-700 hover:text-white ${
                                    isActive ? 'bg-brand-primary text-white shadow-lg' : ''
                                }`
                            }
                        >
                            <span className="w-6 h-6 flex-shrink-0">{icon}</span>
                            <span className="ml-4 font-medium">{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-dark-700">
                    <p className="text-xs text-gray-500">&copy; 2025 TrainrUp</p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;