import React from 'react';
import Card from '../components/ui/Card';

const PaymentsPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Payments</h1>
            <Card>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-white">Payment Management Coming Soon</h2>
                    <p className="text-gray-400 mt-2">This section will allow you to track client payments, manage subscriptions, and send invoices.</p>
                </div>
            </Card>
        </div>
    );
};

export default PaymentsPage;
