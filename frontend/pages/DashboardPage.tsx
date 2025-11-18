import React, { useState, useEffect } from 'react';
import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services';
import { Booking } from '../types';

const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const UserPlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>);
const CalendarPlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>);
const DollarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>);
const TargetIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>);

const DashboardPage: React.FC = () => {
    const { clients } = useClients();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [todaysBookings, setTodaysBookings] = useState<Booking[]>([]);
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const [todayResponse, upcomingResponse] = await Promise.all([
                    bookingService.getTodayBookings(1),
                    bookingService.getUpcomingBookings(1)
                ]);

                setTodaysBookings(todayResponse.results);
                setUpcomingBookings(upcomingResponse.results.slice(0, 5));
            } catch (error) {
                console.error('Error loading bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, []);

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
            case 'confirmed':
                return 'bg-blue-500/20 text-blue-400';
            case 'in_progress':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'completed':
                return 'bg-green-500/20 text-green-400';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        Welcome, {user?.username || 'Trainer'}!
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4">
                    <div className="bg-dark-800 px-4 py-2 rounded-lg border border-dark-700">
                        <p className="text-xs text-gray-400">Total Clients</p>
                        <p className="text-2xl font-bold text-white">{totalClients}</p>
                    </div>
                    <div className="bg-dark-800 px-4 py-2 rounded-lg border border-dark-700">
                        <p className="text-xs text-gray-400">Active</p>
                        <p className="text-2xl font-bold text-green-400">{activeClients}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                    onClick={() => navigate('/clients')}
                    className="flex items-center justify-center gap-2 p-4 bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors font-semibold text-white"
                >
                    <UserPlusIcon />
                    <span className="hidden sm:inline">Register Member</span>
                    <span className="sm:hidden">Register</span>
                </button>
                <button
                    onClick={() => navigate('/bookings')}
                    className="flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold text-white"
                >
                    <CalendarPlusIcon />
                    <span className="hidden sm:inline">Schedule Session</span>
                    <span className="sm:hidden">Schedule</span>
                </button>
                <button
                    onClick={() => navigate('/payments')}
                    className="flex items-center justify-center gap-2 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold text-white"
                >
                    <DollarIcon />
                    <span className="hidden sm:inline">Record Payment</span>
                    <span className="sm:hidden">Payment</span>
                </button>
                <button
                    onClick={() => navigate('/clients')}
                    className="flex items-center justify-center gap-2 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold text-white"
                >
                    <TargetIcon />
                    <span className="hidden sm:inline">Track Progress</span>
                    <span className="sm:hidden">Progress</span>
                </button>
            </div>

            {/* Today's Schedule */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <CalendarIcon />
                        <h2 className="text-xl font-semibold text-white">Today's Schedule</h2>
                    </div>
                    <button
                        onClick={() => navigate('/bookings')}
                        className="text-brand-primary hover:text-brand-secondary text-sm font-medium"
                    >
                        View All →
                    </button>
                </div>
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400">Loading schedule...</p>
                    </div>
                ) : todaysBookings.length > 0 ? (
                    <div className="space-y-3">
                        {todaysBookings.map(booking => (
                            <div
                                key={booking.id}
                                className="flex items-center justify-between p-4 bg-dark-800 rounded-lg hover:bg-dark-700 cursor-pointer transition-colors border border-dark-700"
                                onClick={() => navigate(`/bookings/${booking.id}`)}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex items-center gap-2 text-brand-primary min-w-[100px]">
                                        <ClockIcon />
                                        <span className="font-semibold">
                                            {formatTime(booking.start_time)}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-white">{booking.title}</p>
                                        <p className="text-sm text-gray-400">{booking.client_name}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                        {booking.status_display || booking.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <CalendarIcon />
                        <p className="text-gray-400 mt-4 mb-4">No sessions scheduled for today</p>
                        <button
                            onClick={() => navigate('/bookings')}
                            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
                        >
                            Schedule a Session
                        </button>
                    </div>
                )}
            </Card>

            {/* Upcoming Sessions */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
                    <button
                        onClick={() => navigate('/bookings')}
                        className="text-brand-primary hover:text-brand-secondary text-sm font-medium"
                    >
                        View All →
                    </button>
                </div>
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400">Loading sessions...</p>
                    </div>
                ) : upcomingBookings.length > 0 ? (
                    <div className="space-y-2">
                        {upcomingBookings.map(booking => (
                            <div
                                key={booking.id}
                                className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 cursor-pointer transition-colors"
                                onClick={() => navigate(`/bookings/${booking.id}`)}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="text-center min-w-[60px]">
                                        <p className="text-2xl font-bold text-brand-primary">
                                            {new Date(booking.session_date).getDate()}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(booking.session_date).toLocaleDateString('en-US', { month: 'short' })}
                                        </p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-white">{booking.title}</p>
                                        <p className="text-sm text-gray-400">
                                            {booking.client_name} • {formatTime(booking.start_time)}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                        {booking.status_display || booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-400">No upcoming sessions</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DashboardPage;
