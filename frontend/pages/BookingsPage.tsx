import React from 'react';
import Card from '../components/ui/Card';

const BookingsPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Bookings</h1>
            <Card>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-white">Booking & Scheduling Coming Soon</h2>
                    <p className="text-gray-400 mt-2">This section will allow you to manage your schedule, book sessions with clients, and view your availability.</p>
                </div>
            </Card>
        </div>
    );
};

export default BookingsPage;