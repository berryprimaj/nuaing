import React, { useState, useEffect, useCallback } from 'react';
import { Router, Plus, Edit, Trash2, RotateCcw, Power, Save, Clock, Users, ArrowLeftRight, Server } from 'lucide-react';
import Layout from './Layout';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const apiClient = axios.create({ baseURL: API_URL, withCredentials: true });
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Types based on RouterOS API response
type SystemResource = { 'uptime': string; 'cpu-load': string; 'free-memory-percentage': number; /* ... other fields */ };
type Routerboard = { 'board-name': string; /* ... */ };
type Interface = { '.id': string; name: string; 'mac-address': string; type: string; disabled: string; /* ... */ };
type HotspotProfile = { '.id': string; name: string; 'session-timeout': string; 'idle-timeout': string; 'shared-users': string; 'rate-limit': string; };

const RouterConfig = () => {
    // Connection and status state
    const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
    const [systemResources, setSystemResources] = useState<SystemResource | null>(null);
    const [routerboard, setRouterboard] = useState<Routerboard | null>(null);
    
    // Data state
    const [interfaces, setInterfaces] = useState<Interface[]>([]);
    const [hotspotProfiles, setHotspotProfiles] = useState<HotspotProfile[]>([]);
    
    // UI State
    const [config, setConfig] = useState({ host: '', port: 8728, user: 'admin', pass: '' });
    const [isSaving, setIsSaving] = useState(false);
    
    const fetchAllData = useCallback(async () => {
        setConnectionStatus('loading');
        try {
            const [statusRes, interfacesRes, profilesRes] = await Promise.all([
                apiClient.get('/admin/router-config/status'),
                apiClient.get('/admin/router-config/interfaces'),
                apiClient.get('/admin/router-config/hotspot-profiles')
            ]);

            setSystemResources(statusRes.data.resources);
            setRouterboard(statusRes.data.routerboard);
            setInterfaces(interfacesRes.data);
            setHotspotProfiles(profilesRes.data);
            
            setConnectionStatus('connected');
            toast.success('Router data refreshed!');
        } catch (error) {
            setConnectionStatus('disconnected');
            toast.error('Failed to connect to router and fetch data.');
        }
    }, []);

    useEffect(() => {
        // Also fetch saved config from DB to populate the form
        // For now, let's assume it's blank or default
        fetchAllData();
    }, [fetchAllData]);

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveConfig = async () => {
        setIsSaving(true);
        try {
            await apiClient.post('/admin/router-config/save', config);
            toast.success('Configuration saved!');
        } catch (error) {
            toast.error('Failed to save configuration.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestConnection = async () => {
        const toastId = toast.loading('Testing connection...');
        try {
            await apiClient.post('/admin/router-config/test-connection', config);
            toast.success('Connection successful!', { id: toastId });
        } catch (error) {
            toast.error('Connection failed.', { id: toastId });
        }
    };
    
    const handleReboot = async () => {
        if (window.confirm('Are you sure you want to reboot the router?')) {
            const toastId = toast.loading('Sending reboot command...');
            try {
                await apiClient.post('/admin/router-config/reboot');
                toast.success('Reboot command sent!', { id: toastId });
            } catch (error) {
                toast.error('Failed to send reboot command.', { id: toastId });
            }
        }
    };

    // Placeholder functions for modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedInterface, setSelectedInterface] = useState<Interface | null>(null);

    return (
        <Layout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Router Configuration</h1>
                    <p className="text-gray-600">Configure and monitor your MikroTik Router</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-6"><Router className="w-5 h-5 mr-2" /> MikroTik API Connection</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <input type="text" name="host" value={config.host} onChange={handleConfigChange} placeholder="Host (IP/Domain)" />
                        <input type="text" name="port" value={config.port} onChange={handleConfigChange} placeholder="API Port" />
                        <input type="text" name="user" value={config.user} onChange={handleConfigChange} placeholder="Username" />
                        <input type="password" name="pass" value={config.pass} onChange={handleConfigChange} placeholder="Password" />
                    </div>
                    <div className="flex justify-end items-center mt-6 space-x-4">
                        <button onClick={handleTestConnection}>Test Connection</button>
                        <button onClick={handleSaveConfig} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</button>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                        <h3 className="text-base font-semibold">Connection Status</h3>
                        <div className={`status ${connectionStatus}`}>{connectionStatus}</div>
                    </div>
                    {connectionStatus === 'connected' && systemResources && (
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div><p>Uptime</p><p>{systemResources.uptime}</p></div>
                            <div><p>CPU Load</p><p>{systemResources['cpu-load']}%</p></div>
                            <div><p>Board Name</p><p>{routerboard?.['board-name']}</p></div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between md:items-center mb-6">
                        <h3 className="text-lg font-semibold">Router Management</h3>
                        <button onClick={handleReboot} className="bg-red-600 text-white"><Power className="w-4 h-4" /><span>Reboot</span></button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Network Interfaces</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr><th>Name</th><th>MAC Address</th><th>Type</th><th>Status</th></tr></thead>
                            <tbody>
                                {interfaces.map(iface => (
                                    <tr key={iface['.id']}>
                                        <td>{iface.name}</td>
                                        <td>{iface['mac-address']}</td>
                                        <td>{iface.type}</td>
                                        <td>{iface.disabled === 'true' ? 'Disabled' : 'Running'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Hotspot Profiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {hotspotProfiles.map(profile => (
                            <div key={profile['.id']} className="border p-4">
                                <h4>{profile.name}</h4>
                                <p>Session Timeout: {profile['session-timeout']}</p>
                                <p>Rate Limit: {profile['rate-limit']}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RouterConfig;