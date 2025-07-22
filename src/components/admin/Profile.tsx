import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Eye, EyeOff, Mail } from 'lucide-react';
import Layout from './Layout';
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

const Profile = () => {
    const { user, setUser } = useAuth();
    
    const [profile, setProfile] = useState({ username: '', email: '' });
    const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setProfile({ username: user.username, email: user.email });
        }
    }, [user]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const toggleShowPassword = (field: 'current' | 'new' | 'confirm') => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileSaving(true);
        const toastId = toast.loading('Updating profile...');
        try {
            const response = await apiClient.put('/admin/profile', profile);
            toast.success('Profile updated successfully!', { id: toastId });
            setUser(response.data.admin); // Update user in context
        } catch (error: any) {
            if (error.response?.data?.errors) {
                // Handle Laravel validation errors
                const messages = Object.values(error.response.data.errors).flat();
                toast.error(messages.join('\n') || 'Failed to update profile.', { id: toastId });
            } else {
                toast.error(error.response?.data?.message || 'Failed to update profile.', { id: toastId });
            }
        } finally {
            setIsProfileSaving(false);
        }
    };
  
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.password !== passwords.password_confirmation) {
            toast.error('New passwords do not match.');
            return;
        }
        setIsPasswordSaving(true);
        const toastId = toast.loading('Changing password...');
        try {
            await apiClient.put('/admin/profile/password', passwords);
            toast.success('Password updated successfully!', { id: toastId });
            setPasswords({ current_password: '', password: '', password_confirmation: '' });
        } catch (error: any) {
             if (error.response?.data?.errors) {
                const messages = Object.values(error.response.data.errors).flat();
                toast.error(messages.join('\n') || 'Failed to change password.', { id: toastId });
            } else {
                toast.error(error.response?.data?.message || 'Failed to change password.', { id: toastId });
            }
        } finally {
            setIsPasswordSaving(false);
        }
    };

    if (!user) {
        return <Layout><div className="flex justify-center items-center h-full"><p>Loading profile...</p></div></Layout>;
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8 py-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your account settings and password.</p>
                </div>

                {/* Profile Information Form */}
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <form onSubmit={handleUpdateProfile}>
                        <h3 className="text-xl font-semibold mb-6 text-gray-700 flex items-center"><User className="inline mr-3 text-gray-500" />Profile Information</h3>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input id="username" type="text" name="username" value={profile.username} onChange={handleProfileChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input id="email" type="email" name="email" value={profile.email} onChange={handleProfileChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-8">
                            <button type="submit" disabled={isProfileSaving} className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200">
                                <Save className="w-5 h-5 mr-2" />
                                {isProfileSaving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password Form */}
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <form onSubmit={handleUpdatePassword}>
                        <h3 className="text-xl font-semibold mb-6 text-gray-700 flex items-center"><Lock className="inline mr-3 text-gray-500" />Change Password</h3>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="current_password">Current Password</label>
                                <div className="relative mt-1">
                                    <input id="current_password" type={showPassword.current ? "text" : "password"} name="current_password" value={passwords.current_password} onChange={handlePasswordChange} className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Enter your current password"/>
                                    <button type="button" onClick={() => toggleShowPassword('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        {showPassword.current ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="password">New Password</label>
                                <div className="relative mt-1">
                                    <input id="password" type={showPassword.new ? "text" : "password"} name="password" value={passwords.password} onChange={handlePasswordChange} className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Enter new password (min. 8 characters)"/>
                                    <button type="button" onClick={() => toggleShowPassword('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        {showPassword.new ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="password_confirmation">Confirm New Password</label>
                                <div className="relative mt-1">
                                    <input id="password_confirmation" type={showPassword.confirm ? "text" : "password"} name="password_confirmation" value={passwords.password_confirmation} onChange={handlePasswordChange} className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Confirm your new password"/>
                                    <button type="button" onClick={() => toggleShowPassword('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        {showPassword.confirm ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-8">
                           <button type="submit" disabled={isPasswordSaving} className="flex items-center justify-center px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors duration-200">
                                <Save className="w-5 h-5 mr-2" />
                                {isPasswordSaving ? 'Saving...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;