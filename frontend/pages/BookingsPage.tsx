import React, { useState, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadMore from '../components/ui/LoadMore';
import Modal from '../components/ui/Modal';
import { Booking, PaginatedResponse, BookingCreatePayload } from '../types';
import { bookingService } from '../services';
import { usePagination } from '../hooks/usePagination';
import { useClients } from '../context/ClientContext';

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

// Calendar View Component
const CalendarView: React.FC<{
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
}> = ({ bookings, onBookingClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.session_date === dateStr);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="px-3 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 pb-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Calendar days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const dateStr = date.toISOString().split('T')[0];
          const dayBookings = getBookingsForDate(date);
          const isToday = dateStr === today;

          return (
            <div
              key={day}
              className={`aspect-square border border-dark-700 rounded-lg p-2 ${
                isToday ? 'bg-brand-primary/10 border-brand-primary' : 'bg-dark-800'
              }`}
            >
              <div className="text-sm font-medium text-white mb-1">{day}</div>
              <div className="space-y-1">
                {dayBookings.slice(0, 2).map(booking => (
                  <div
                    key={booking.id}
                    onClick={() => onBookingClick(booking)}
                    className="text-xs p-1 rounded bg-brand-primary/20 text-brand-primary cursor-pointer hover:bg-brand-primary/30 truncate"
                    title={`${booking.title} - ${booking.client_name}`}
                  >
                    {booking.start_time} {booking.client_name}
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayBookings.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const BookingsPage: React.FC = () => {
  const { clients } = useClients();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'today' | 'all'>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    upcoming: 0,
    today: 0,
    completed: 0,
  });

  // Pagination for bookings list
  const fetchBookings = useCallback(
    async (page: number): Promise<PaginatedResponse<Booking>> => {
      if (activeTab === 'upcoming') {
        return bookingService.getUpcomingBookings(page);
      } else if (activeTab === 'today') {
        return bookingService.getTodayBookings(page);
      } else {
        return bookingService.getBookings(page);
      }
    },
    [activeTab]
  );

  const {
    items: bookings,
    loading,
    pagination,
    loadMore,
    refresh,
  } = usePagination<Booking>({
    fetchPage: fetchBookings,
    pageSize: 20,
    initialLoad: true,
  });

  // Load statistics and all bookings for calendar
  useEffect(() => {
    const loadStatsAndBookings = async () => {
      try {
        const [statistics, allBookingsData] = await Promise.all([
          bookingService.getStatistics(),
          bookingService.getAllBookings(),
        ]);

        setStats({
          upcoming: statistics.upcoming_bookings,
          today: statistics.todays_bookings,
          completed: statistics.completed_bookings,
        });

        setAllBookings(allBookingsData);
      } catch (error) {
        console.error('Failed to load booking data:', error);
      }
    };

    loadStatsAndBookings();
  }, []);

  // Refresh when tab changes
  useEffect(() => {
    refresh();
  }, [activeTab, refresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      case 'no_show':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await bookingService.completeBooking(bookingId, {});
      refresh();
    } catch (error) {
      console.error('Failed to complete booking:', error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const reason = prompt('Cancellation reason (optional):');
    try {
      await bookingService.cancelBooking(bookingId, reason || undefined);
      refresh();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Bookings</h1>
        <div className="flex gap-2">
          {/* View Toggle */}
          <div className="flex gap-1 bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Calendar
            </button>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <CalendarIcon />
            <span className="ml-2">New Booking</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Today</p>
            <p className="text-3xl font-bold text-white">{stats.today}</p>
          </div>
          <ClockIcon />
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Upcoming</p>
            <p className="text-3xl font-bold text-white">{stats.upcoming}</p>
          </div>
          <CalendarIcon />
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Completed</p>
            <p className="text-3xl font-bold text-white">{stats.completed}</p>
          </div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </Card>
      </div>

      {/* Tabs - Only show in list view */}
      {viewMode === 'list' && (
        <div className="flex space-x-2 border-b border-dark-700">
        {[
          { key: 'upcoming', label: 'Upcoming', count: stats.upcoming },
          { key: 'today', label: 'Today', count: stats.today },
          { key: 'all', label: 'All Bookings', count: null },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-brand-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-brand-primary/20 text-brand-primary">
                {tab.count}
              </span>
            )}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
            )}
          </button>
        ))}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <CalendarView bookings={allBookings} onBookingClick={setSelectedBooking} />
      )}

      {/* Bookings List */}
      {viewMode === 'list' && (
        <div className="space-y-4">
        {loading && bookings.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-400">Loading bookings...</p>
          </Card>
        ) : bookings.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-400 mb-4">No bookings found</p>
            <Button onClick={() => setShowCreateModal(true)}>Create Your First Booking</Button>
          </Card>
        ) : (
          <>
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className="hover:border-brand-primary transition-all cursor-pointer"
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{booking.title}</h3>
                        <p className="text-sm text-gray-400">{booking.client_name}</p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status_display || booking.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <CalendarIcon />
                        <span className="ml-2">
                          {new Date(booking.session_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon />
                        <span className="ml-2">
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span className="ml-2">{booking.location}</span>
                      </div>
                    </div>
                  </div>
                  {booking.status === 'scheduled' || booking.status === 'confirmed' ? (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteBooking(booking.id);
                        }}
                        className="text-sm"
                      >
                        Complete
                      </Button>
                      <Button
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelBooking(booking.id);
                        }}
                        className="text-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Card>
            ))}

            {/* Load More */}
            <LoadMore
              currentCount={bookings.length}
              totalCount={pagination.totalCount}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onLoadMore={loadMore}
              loading={loading}
              itemName="bookings"
            />
          </>
        )}
        </div>
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <CreateBookingModal
          clients={clients}
          onClose={() => setShowCreateModal(false)}
          onSuccess={async () => {
            setShowCreateModal(false);
            refresh();
            // Reload all bookings for calendar
            try {
              const [statistics, allBookingsData] = await Promise.all([
                bookingService.getStatistics(),
                bookingService.getAllBookings(),
              ]);
              setStats({
                upcoming: statistics.upcoming_bookings,
                today: statistics.todays_bookings,
                completed: statistics.completed_bookings,
              });
              setAllBookings(allBookingsData);
            } catch (error) {
              console.error('Failed to reload bookings:', error);
            }
          }}
        />
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={refresh}
        />
      )}
    </div>
  );
};

// Create Booking Modal Component
const CreateBookingModal: React.FC<{
  clients: any[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ clients, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<BookingCreatePayload>>({
    session_type: 'personal_training',
    duration_minutes: 60,
    location: 'Gym',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('Form data:', formData);

    if (!formData.client || !formData.title || !formData.session_date || !formData.start_time || !formData.end_time) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Submitting booking:', formData);
      const result = await bookingService.createBooking(formData as BookingCreatePayload);
      console.log('Booking created:', result);
      onSuccess();
    } catch (err: any) {
      console.error('Booking creation error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to create booking';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Create New Booking" onClose={onClose} isOpen={true} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Client *</label>
          <select
            value={formData.client || ''}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            required
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name || `${client.first_name} ${client.last_name}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Session Type *</label>
          <select
            value={formData.session_type}
            onChange={(e) => setFormData({ ...formData, session_type: e.target.value as any })}
            className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="personal_training">Personal Training</option>
            <option value="group_class">Group Class</option>
            <option value="consultation">Consultation</option>
            <option value="assessment">Assessment</option>
            <option value="virtual">Virtual Session</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="E.g., Upper Body Strength Training"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
            <input
              type="date"
              value={formData.session_date || ''}
              onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Duration (min)</label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              min="15"
              step="15"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Time *</label>
            <input
              type="time"
              value={formData.start_time || ''}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Time *</label>
            <input
              type="time"
              value={formData.end_time || ''}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="Gym"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Booking Details Modal Component
const BookingDetailsModal: React.FC<{
  booking: Booking;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ booking, onClose, onUpdate }) => {
  return (
    <Modal title="Booking Details" onClose={onClose} isOpen={true} size="lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white">{booking.title}</h3>
          <p className="text-gray-400">{booking.client_name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Date</p>
            <p className="text-white">{new Date(booking.session_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Time</p>
            <p className="text-white">
              {booking.start_time} - {booking.end_time}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Duration</p>
            <p className="text-white">{booking.duration_minutes} minutes</p>
          </div>
          <div>
            <p className="text-gray-400">Location</p>
            <p className="text-white">{booking.location}</p>
          </div>
          <div>
            <p className="text-gray-400">Status</p>
            <p className="text-white capitalize">{booking.status_display || booking.status}</p>
          </div>
          <div>
            <p className="text-gray-400">Type</p>
            <p className="text-white">{booking.session_type_display || booking.session_type}</p>
          </div>
        </div>

        {booking.description && (
          <div>
            <p className="text-gray-400 text-sm">Description</p>
            <p className="text-white">{booking.description}</p>
          </div>
        )}

        {booking.trainer_notes && (
          <div>
            <p className="text-gray-400 text-sm">Trainer Notes</p>
            <p className="text-white">{booking.trainer_notes}</p>
          </div>
        )}

        {booking.session_summary && (
          <div>
            <p className="text-gray-400 text-sm">Session Summary</p>
            <p className="text-white">{booking.session_summary}</p>
          </div>
        )}

        {booking.client_rating && (
          <div>
            <p className="text-gray-400 text-sm">Client Rating</p>
            <p className="text-white">{'⭐'.repeat(booking.client_rating)}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingsPage;
