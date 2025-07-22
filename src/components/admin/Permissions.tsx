import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Key, Eye } from 'lucide-react';
import Layout from './Layout';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const apiClient = axios.create({ baseURL: API_URL, withCredentials: true });
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

type Role = { id: number; name: string; };
type Admin = { id: number; username: string; email: string; roles: Role[]; };

const Permissions = () => {
    const { user } = useAuth(); // Only need user for permission checks
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '', role: '' });

    const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
    const [isDeleteAdminModalOpen, setIsDeleteAdminModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [editedAdmin, setEditedAdmin] = useState<Partial<Admin> & { role?: string } | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/admin/permissions');
            setAdmins(response.data.admins);
            setRoles(response.data.roles);
        } catch (error) {
            toast.error("Failed to fetch permissions data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddAdmin = async () => {
        try {
            await apiClient.post('/admin/permissions/admins', newAdmin);
            toast.success('Administrator added successfully!');
            setShowAddForm(false);
            setNewAdmin({ username: '', email: '', password: '', role: '' });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add admin.');
        }
    };

    const handleEditAdmin = (admin: Admin) => {
        setSelectedAdmin(admin);
        setEditedAdmin({ ...admin, role: admin.roles[0]?.name });
        setIsEditAdminModalOpen(true);
    };
    
    const handleDeleteAdmin = (admin: Admin) => {
        setSelectedAdmin(admin);
        setIsDeleteAdminModalOpen(true);
    };

    const confirmEditAdmin = async () => {
        if (!editedAdmin || !selectedAdmin) return;
        try {
            await apiClient.put(`/admin/permissions/admins/${selectedAdmin.id}`, editedAdmin);
            toast.success('Administrator updated successfully!');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update admin.');
        } finally {
            setIsEditAdminModalOpen(false);
        }
    };

    const confirmDeleteAdmin = async () => {
        if (!selectedAdmin) return;
        try {
            await apiClient.delete(`/admin/permissions/admins/${selectedAdmin.id}`);
            toast.success('Administrator deleted successfully!');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete admin.');
        } finally {
            setIsDeleteAdminModalOpen(false);
        }
    };
    
    const handleEditAdminFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (editedAdmin) {
            setEditedAdmin({ ...editedAdmin, [e.target.name]: e.target.value });
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
                        <p>Manage administrator roles and permissions</p>
                    </div>
                    {user?.role === 'super_admin' && (
                        <button onClick={() => setShowAddForm(true)}>
                            <Plus className="w-4 h-4" />
                            <span>Add Administrator</span>
                        </button>
                    )}
                </div>

                {showAddForm && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Add New Administrator</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Username" value={newAdmin.username} onChange={e => setNewAdmin(p => ({...p, username: e.target.value}))} />
                            <input type="email" placeholder="Email" value={newAdmin.email} onChange={e => setNewAdmin(p => ({...p, email: e.target.value}))} />
                            <input type="password" placeholder="Password" value={newAdmin.password} onChange={e => setNewAdmin(p => ({...p, password: e.target.value}))} />
                            <select value={newAdmin.role} onChange={e => setNewAdmin(p => ({...p, role: e.target.value}))}>
                                <option value="">Select Role</option>
                                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={() => setShowAddForm(false)}>Cancel</button>
                            <button onClick={handleAddAdmin}>Add Administrator</button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold p-6">Administrator List</h3>
                    <table className="w-full">
                        <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4}>Loading...</td></tr>
                            ) : admins.map(admin => (
                                <tr key={admin.id}>
                                    <td>{admin.username}</td>
                                    <td>{admin.email}</td>
                                    <td>{admin.roles.map(r => r.name).join(', ')}</td>
                                    <td>
                                        <button onClick={() => handleEditAdmin(admin)}><Edit /></button>
                                        <button onClick={() => handleDeleteAdmin(admin)}><Trash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isEditAdminModalOpen} onClose={() => setIsEditAdminModalOpen(false)} title="Edit Administrator">
                {editedAdmin && (
                    <form onSubmit={e => { e.preventDefault(); confirmEditAdmin(); }}>
                        <input type="text" name="username" value={editedAdmin.username || ''} onChange={handleEditAdminFormChange} />
                        <input type="email" name="email" value={editedAdmin.email || ''} onChange={handleEditAdminFormChange} />
                        <select name="role" value={editedAdmin.role} onChange={handleEditAdminFormChange}>
                            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                        </select>
                        <button type="submit">Save Changes</button>
                    </form>
                )}
            </Modal>
            
            <Modal isOpen={isDeleteAdminModalOpen} onClose={() => setIsDeleteAdminModalOpen(false)} title="Confirm Deletion">
                <p>Delete {selectedAdmin?.username}?</p>
                <button onClick={confirmDeleteAdmin}>Delete</button>
            </Modal>
        </Layout>
    );
};

export default Permissions;