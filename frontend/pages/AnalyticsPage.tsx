import React from 'react';
import Card from '../components/ui/Card';

const AnalyticsPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Analytics</h1>
            <Card>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-white">Advanced Analytics Coming Soon</h2>
                    <p className="text-gray-400 mt-2">Track client progress, view attendance trends, and gain insights into your training business.</p>
                </div>
            </Card>
        </div>
    );
};

export default AnalyticsPage;
