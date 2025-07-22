import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, MessageCircle, Calendar } from 'lucide-react';
import Layout from './Layout';
import Modal from '../common/Modal';
import axios from 'axios';
import toast from 'react-hot-toast';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type SocialUser = {
  id: number;
  name: string;
  email: string;
  ip_address: string;
  whatsapp_number: string;
  provider: 'Google' | 'WhatsApp';
  created_at: string;
  session_time: string; // Assuming these come from API
  data_usage: string;   // Assuming these come from API
  status: 'online' | 'offline';
};

type PaginatedResponse = {
    data: SocialUser[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

const SocialUsers = () => {
    const [users, setUsers] = useState<SocialUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Omit<PaginatedResponse, 'data'> | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('All Providers');
    const [dateRange, setDateRange] = useState('Custom Range');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<SocialUser | null>(null);
    const [editedUser, setEditedUser] = useState<Partial<SocialUser> | null>(null);
    const [whatsAppMessage, setWhatsAppMessage] = useState('');
    
    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedProvider !== 'All Providers') params.append('provider', selectedProvider);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        return params;
    }, [searchTerm, selectedProvider, startDate, endDate]);


    const fetchUsers = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            queryParams.set('page', page.toString());
            const response = await apiClient.get<PaginatedResponse>(`/admin/social-users?${queryParams.toString()}`);
            setUsers(response.data.data);
            const { data, ...rest } = response.data;
            setPagination(rest);
        } catch (err) {
            setError('Failed to fetch users.');
            toast.error('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchUsers();
    }, [queryParams]);

    const handleSearch = () => fetchUsers(1);

    const handleDeleteRange = async () => {
        if (!startDate || !endDate) {
            toast.error('Please select both start and end dates.');
            return;
        }
        if (window.confirm(`Are you sure you want to delete users from ${startDate} to ${endDate}?`)) {
            try {
                const response = await apiClient.post('/admin/social-users/delete-range', { start_date: startDate, end_date: endDate });
                toast.success(response.data.message);
                fetchUsers(1); // Refresh list
            } catch (err) {
                toast.error('Failed to delete users.');
            }
        }
    };

    const handleExport = async () => {
        try {
            const response = await apiClient.get(`/admin/social-users/export?${queryParams.toString()}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `social-users-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Failed to export data.');
        }
    };

    const handleViewUser = (user: SocialUser) => {
      setSelectedUser(user);
      setIsViewModalOpen(true);
    };
  
    const handleEditUser = (user: SocialUser) => {
      setSelectedUser(user);
      setEditedUser(user);
      setIsEditModalOpen(true);
    };
  
    const handleSendWhatsApp = (user: SocialUser) => {
      setSelectedUser(user);
      setIsWhatsAppModalOpen(true);
    };
  
    const handleDeleteUser = (user: SocialUser) => {
      setSelectedUser(user);
      setIsDeleteModalOpen(true);
    };
    
    const confirmDelete = async () => {
        if (!selectedUser) return;
        try {
            await apiClient.delete(`/admin/social-users/${selectedUser.id}`);
            toast.success(`User ${selectedUser.name} deleted successfully.`);
            fetchUsers(pagination?.current_page || 1);
        } catch (err) {
            toast.error('Failed to delete user.');
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
        }
    };

    const confirmEdit = async () => {
        if (!editedUser || !selectedUser) return;
        try {
            const response = await apiClient.put(`/admin/social-users/${selectedUser.id}`, editedUser);
            toast.success(`User ${response.data.name} updated successfully.`);
            fetchUsers(pagination?.current_page || 1);
        } catch (err) {
            toast.error('Failed to update user.');
        } finally {
            setIsEditModalOpen(false);
            setSelectedUser(null);
            setEditedUser(null);
        }
    };

    const confirmSendWhatsApp = async () => {
        if (!selectedUser || !whatsAppMessage) return;
        try {
            await apiClient.post(`/admin/social-users/${selectedUser.id}/send-whatsapp`, { message: whatsAppMessage });
            toast.success(`Message sent to ${selectedUser.name}.`);
        } catch (err) {
            toast.error('Failed to send message.');
        } finally {
            setIsWhatsAppModalOpen(false);
            setSelectedUser(null);
            setWhatsAppMessage('');
        }
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editedUser) {
            setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
        }
    };
  
    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Social Users</h1>
                        <p className="text-gray-600">Manage users connected via social media</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Data</span>
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center mb-4">
                        <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Auto Delete Settings</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date Range</label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option>Custom Range</option>
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>Last 3 months</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex flex-col justify-end">
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSearch}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                                >
                                    <Search className="w-4 h-4" />
                                    <span>Search</span>
                                </button>
                                <button
                                    onClick={handleDeleteRange}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users by name, email, or WhatsApp number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={selectedProvider}
                                onChange={(e) => setSelectedProvider(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option>All Providers</option>
                                <option>Google</option>
                                <option>WhatsApp</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connected At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Usage</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-red-500">{error}</td></tr>
                                ) : users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email || user.whatsapp_number}</div>
                                            <div className="text-xs text-gray-400">{user.ip_address}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.provider}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(user.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.data_usage}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }} className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100"><Eye className="w-4 h-4" /></button>
                                                <button onClick={() => handleEditUser(user)} className="p-1.5 rounded-md text-green-600 hover:bg-green-100"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleSendWhatsApp(user)} className="p-1.5 rounded-md text-orange-600 hover:bg-orange-100"><MessageCircle className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteUser(user)} className="p-1.5 rounded-md text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {pagination && pagination.last_page > 1 && (
                        <div className="flex justify-center items-center py-4">
                            <button
                                onClick={() => fetchUsers(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1 || loading}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-gray-700">
                                Page {pagination.current_page} of {pagination.last_page}
                            </span>
                            <button
                                onClick={() => fetchUsers(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page || loading}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`View User: ${selectedUser?.name}`}>
                {selectedUser && (
                    <div className="space-y-3 text-sm">
                        <p><strong>Name:</strong> {selectedUser.name}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>WhatsApp:</strong> {selectedUser.whatsapp_number}</p>
                        <p><strong>IP Address:</strong> {selectedUser.ip_address}</p>
                        <p><strong>Provider:</strong> {selectedUser.provider}</p>
                        <p><strong>Connected At:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>
                        <p><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedUser.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedUser.status}</span></p>
                        <div className="flex justify-end pt-4">
                            <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit User: ${selectedUser?.name}`}>
                {editedUser && (
                    <form onSubmit={(e) => { e.preventDefault(); confirmEdit(); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" name="name" value={editedUser.name || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" value={editedUser.email || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                <input type="tel" name="whatsapp_number" value={editedUser.whatsapp_number || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-6">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Save Changes</button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} title={`Send WhatsApp to ${selectedUser?.name}`}>
                {selectedUser && (
                    <form onSubmit={(e) => { e.preventDefault(); confirmSendWhatsApp(); }}>
                        <p className="mb-4">To: {selectedUser.whatsapp_number}</p>
                        <textarea
                            value={whatsAppMessage}
                            onChange={(e) => setWhatsAppMessage(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Type your message here..."
                            required
                        />
                        <div className="flex justify-end space-x-4 pt-6">
                            <button type="button" onClick={() => setIsWhatsAppModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Send Message</button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                {selectedUser && (
                    <div>
                        <p>Are you sure you want to delete the user <strong>{selectedUser.name}</strong>? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4 pt-6">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</button>
                        </div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default SocialUsers;