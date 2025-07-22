import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Upload, FileSpreadsheet, X } from 'lucide-react';
import Layout from './Layout';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import axios from 'axios';

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

type Member = {
  id: number;
  name: string;
  email: string;
  department: string;
  is_active: boolean;
  last_login_at: string | null;
  total_data_usage: number;
  total_session_time: number;
  created_at: string;
};

type NewMember = {
    name: string;
    email: string;
    department: string;
    password: string;
    is_active: boolean;
}

type PaginatedResponse = {
    data: Member[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

const Members = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Omit<PaginatedResponse, 'data'> | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [newMember, setNewMember] = useState<NewMember>({
        name: '',
        email: '',
        department: '',
        password: '',
        is_active: true,
    });

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [editedMember, setEditedMember] = useState<Partial<Member> & { password?: string } | null>(null);

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedStatus !== 'All Status') params.append('status', selectedStatus);
        return params;
    }, [searchTerm, selectedStatus]);

    const fetchMembers = async (page = 1) => {
        setLoading(true);
        queryParams.set('page', page.toString());
        try {
            const response = await apiClient.get<PaginatedResponse>(`/admin/members?${queryParams.toString()}`);
            setMembers(response.data.data);
            const { data, ...rest } = response.data;
            setPagination(rest);
        } catch (error) {
            toast.error('Failed to fetch members.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers(1);
    }, [queryParams]);

    const handleAddMember = async () => {
        if (!newMember.name || !newMember.email || !newMember.password) {
            toast.error('Name, Email, and Password are required.');
            return;
        }
        try {
            await apiClient.post('/admin/members', newMember);
            toast.success('Member added successfully!');
            setShowAddForm(false);
            setNewMember({ name: '', email: '', department: '', password: '', is_active: true });
            fetchMembers(1);
        } catch (error: any) {
            const errors = error.response?.data?.errors;
            if (errors) {
                Object.values(errors).flat().forEach((err: any) => toast.error(err));
            } else {
                toast.error('Failed to add member.');
            }
        }
    };

    const handleEditMember = (member: Member) => {
        setSelectedMember(member);
        setEditedMember(member);
        setIsEditModalOpen(true);
    };

    const handleDeleteMember = (member: Member) => {
        setSelectedMember(member);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedMember) return;
        try {
            await apiClient.delete(`/admin/members/${selectedMember.id}`);
            toast.success(`Member '${selectedMember.name}' deleted.`);
            fetchMembers(pagination?.current_page || 1);
        } catch (error) {
            toast.error('Failed to delete member.');
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedMember(null);
        }
    };

    const confirmEdit = async () => {
        if (!editedMember || !selectedMember) return;
        
        const payload = { ...editedMember };
        if (payload.password === '') {
            delete payload.password;
        }

        try {
            await apiClient.put(`/admin/members/${selectedMember.id}`, payload);
            toast.success('Member updated successfully.');
            fetchMembers(pagination?.current_page || 1);
        } catch (error: any) {
             const errors = error.response?.data?.errors;
            if (errors) {
                Object.values(errors).flat().forEach((err: any) => toast.error(err));
            } else {
                toast.error('Failed to update member.');
            }
        } finally {
            setIsEditModalOpen(false);
            setSelectedMember(null);
            setEditedMember(null);
        }
    };
    
    const handleNewMemberFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setNewMember(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue: string | boolean = value;
        if (type === 'checkbox') {
             finalValue = (e.target as HTMLInputElement).checked;
        } else if (name === 'is_active') {
             finalValue = value === 'active';
        }

        if (editedMember) {
            setEditedMember({ ...editedMember, [name]: finalValue });
        }
    };
    
    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Members</h1>
                        <p className="text-gray-600">Manage employee member accounts</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => {}} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Export Excel</span>
                        </button>
                        <button onClick={() => {}} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                            <Upload className="w-4 h-4" />
                            <span>Upload Excel</span>
                        </button>
                        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Add Member</span>
                        </button>
                    </div>
                </div>

                {showAddForm && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                         <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Add New Member</h3>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="name" value={newMember.name} onChange={handleNewMemberFormChange} placeholder="Full Name *" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            <input type="email" name="email" value={newMember.email} onChange={handleNewMemberFormChange} placeholder="Email Address *" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="department" value={newMember.department} onChange={handleNewMemberFormChange} placeholder="Department" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            <input type="password" name="password" value={newMember.password} onChange={handleNewMemberFormChange} placeholder="Password *" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                            <button onClick={handleAddMember} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Member</button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input type="text" placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                            <option>All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th>Member</th><th>Department</th><th>Last Login</th><th>Data Usage</th><th>Status</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                                ) : members.map((member) => (
                                    <tr key={member.id}>
                                        <td>{member.name}</td>
                                        <td>{member.department}</td>
                                        <td>{member.last_login_at ? new Date(member.last_login_at).toLocaleString() : 'Never'}</td>
                                        <td>{`${(member.total_data_usage / (1024*1024)).toFixed(2)} MB`}</td>
                                        <td>{member.is_active ? 'Active' : 'Inactive'}</td>
                                        <td>
                                            <button onClick={() => handleEditMember(member)}><Edit/></button>
                                            <button onClick={() => handleDeleteMember(member)}><Trash2/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination will be added here */}
                </div>
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Member">
                {editedMember && (
                    <form onSubmit={(e) => { e.preventDefault(); confirmEdit(); }}>
                        <input type="text" name="name" value={editedMember.name || ''} onChange={handleEditFormChange} />
                        <input type="email" name="email" value={editedMember.email || ''} onChange={handleEditFormChange} />
                        <input type="text" name="department" value={editedMember.department || ''} onChange={handleEditFormChange} />
                        <input type="password" name="password" onChange={handleEditFormChange} placeholder="New Password (optional)" />
                        <select name="is_active" value={editedMember.is_active ? 'active' : 'inactive'} onChange={handleEditFormChange}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <button type="submit">Save Changes</button>
                    </form>
                )}
            </Modal>
            
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                <p>Are you sure you want to delete {selectedMember?.name}?</p>
                <button onClick={confirmDelete}>Delete</button>
                <button onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            </Modal>
        </Layout>
    );
};

export default Members;