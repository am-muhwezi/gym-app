import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadMore from '../components/ui/LoadMore';
import { Client, PaginatedResponse } from '../types';
import { clientService } from '../services';
import { usePagination } from '../hooks/usePagination';
import { useToast } from '../context/ToastContext';

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

const ClientListItem: React.FC<{ client: Client }> = ({ client }) => {
    const fullName = client.full_name || `${client.first_name} ${client.last_name}`;
    const initials = client.first_name.charAt(0) + (client.last_name?.charAt(0) || '');

    return (
        <Link to={`/clients/${client.id}`}>
            <Card className="hover:border-brand-primary border-2 border-transparent transition-all duration-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary text-lg font-bold">
                            {initials}
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-400">Name</p>
                                <p className="text-white font-semibold">{fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Email</p>
                                <p className="text-white">{client.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Phone</p>
                                <p className="text-white">{client.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Status</p>
                                <p className="text-white capitalize">{client.status}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

const ClientsListPage: React.FC = () => {
    const { showSuccess, showError } = useToast();

    // Pagination hook
    const fetchClients = useCallback(
        async (page: number): Promise<PaginatedResponse<Client>> => {
            return clientService.getClientsPaginated(page);
        },
        []
    );

    const {
        items: clients,
        loading,
        pagination,
        loadMore,
        refresh: refreshClients,
    } = usePagination<Client>({
        fetchPage: fetchClients,
        pageSize: 20,
        initialLoad: true,
    });

    // View mode state
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [showAddModal, setShowAddModal] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleAddClient = async () => {
        setError('');

        if (!firstName || !lastName || !email || !phone) {
            setError('Please fill in all required fields');
            return;
        }

        // Validate DOB is not in the future
        if (dob) {
            const dobDate = new Date(dob);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dobDate >= today) {
                setError('Date of birth cannot be today or in the future');
                return;
            }
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

            showSuccess(`Client ${firstName} ${lastName} created successfully`);

            // Close modal and reset form
            setShowAddModal(false);
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhone('');
            setGender('');
            setDob('');
            setError('');
        } catch (error: any) {
            console.error('Error creating client:', error);
            showError(error.message || 'Failed to create client. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };
    

    if (loading && clients.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-400">Loading clients...</p>
            </div>
        );
    }

    // Safety check to ensure clients is always an array
    const safeClients = Array.isArray(clients) ? clients : [];

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Clients</h1>
                <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
                    Add New Client
                </Button>
            </div>

            {safeClients.length === 0 ? (
                <Card className="text-center py-12">
                    <p className="text-gray-400 mb-4">No clients yet</p>
                    <Button onClick={() => setShowAddModal(true)}>Add Your First Client</Button>
                </Card>
            ) : (
                <>
                    {/* View Mode Toggle */}
                    <div className="flex gap-1 bg-dark-700 rounded-lg p-1 mb-6 w-fit">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-brand-primary text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                            title="Grid view"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-brand-primary text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                            title="List view"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Client Display - Grid or List View */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {safeClients.map(client => (
                                <ClientCard key={client.id} client={client} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {safeClients.map(client => (
                                <ClientListItem key={client.id} client={client} />
                            ))}
                        </div>
                    )}

                    {/* Load More Pagination */}
                    <LoadMore
                        currentCount={safeClients.length}
                        totalCount={pagination.totalCount}
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onLoadMore={loadMore}
                        loading={loading}
                        itemName="clients"
                    />
                </>
            )}

            {/* Add Client Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md mx-4">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4">Add New Client</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

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
                                max={new Date().toISOString().split('T')[0]}
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
                                    setError('');
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