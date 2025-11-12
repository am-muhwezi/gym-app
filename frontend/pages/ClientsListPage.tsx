import React, { useState } from 'react';
import { useClients } from '../context/ClientContext';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Client } from '../types';
import { clientService } from '../services';

const ClientCard: React.FC<{ client: Client }> = ({ client }) => {
    const fullName = client.full_name || `${client.first_name} ${client.last_name}`;
    const initials = client.first_name.charAt(0) + (client.last_name?.charAt(0) || '');

    return (
        <Link to={`/clients/${client.id}`}>
            <Card className="hover:border-brand-primary border-2 border-transparent transition-all duration-200 hover:scale-105">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary text-2xl font-bold">
                        {initials}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{fullName}</h3>
                        <p className="text-gray-400">{client.phone}</p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-dark-700 flex justify-between text-sm">
                    <div>
                        <p className="text-gray-400">Status</p>
                        <p className="font-semibold text-white capitalize">{client.status}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Joined</p>
                        <p className="font-semibold text-white">
                            {new Date(client.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

const ClientsListPage: React.FC = () => {
    const { clients, loading, refreshClients } = useClients();
    const [showAddModal, setShowAddModal] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleAddClient = async () => {
        if (!firstName || !lastName || !email || !phone) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            await clientService.createClient({
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
                gender: gender || undefined,
                dob: dob || undefined,
            });

            // Refresh the client list
            await refreshClients();

            // Close modal and reset form
            setShowAddModal(false);
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhone('');
            setGender('');
            setDob('');
        } catch (error: any) {
            console.error('Error creating client:', error);
            alert(`Failed to create client: ${error.message || 'Unknown error'}`);
        } finally {
            setSubmitting(false);
        }
    };
    

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-400">Loading clients...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Clients</h1>
                <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
                    Add New Client
                </Button>
            </div>

            {clients.length === 0 ? (
                <Card className="text-center py-12">
                    <p className="text-gray-400 mb-4">No clients yet</p>
                    <Button onClick={() => setShowAddModal(true)}>Add Your First Client</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {clients.map(client => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </div>
            )}

            {/* Add Client Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md mx-4">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4">Add New Client</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="First Name *"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder-gray-500"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Last Name *"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder-gray-500"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email *"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder-gray-500"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number *"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder-gray-500"
                                required
                            />
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            >
                                <option value="">Select Gender (Optional)</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                            <input
                                type="date"
                                placeholder="Date of Birth (Optional)"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                        </div>
                        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:space-x-4">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setFirstName('');
                                    setLastName('');
                                    setEmail('');
                                    setPhone('');
                                    setGender('');
                                    setDob('');
                                }}
                                disabled={submitting}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddClient}
                                disabled={submitting}
                                className="w-full sm:w-auto"
                            >
                                {submitting ? 'Adding...' : 'Add Client'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ClientsListPage;