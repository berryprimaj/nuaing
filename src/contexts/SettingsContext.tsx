import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const apiClient = axios.create({ baseURL: API_URL, withCredentials: true });
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// A single, flat structure for all settings
export interface AllSettings {
  hotspot_site_name: string;
  hotspot_primary_color: string;
  hotspot_secondary_color: string;
  hotspot_logo: string | null;
  hotspot_bg_image: string | null;
  hotspot_welcome_message: string;
  
  admin_site_name: string;
  admin_primary_color: string;
  admin_secondary_color: string;
  admin_logo: string | null;
  admin_background_image: string | null;
  admin_welcome_message: string;

  fonte_api_key: string;
  fonte_device_id: string;
  google_client_id: string;
  google_client_secret: string;
  google_redirect_uri: string;
}

const defaultSettings: AllSettings = {
  hotspot_site_name: 'MyHotspot-WiFi',
  hotspot_primary_color: '#3B82F6',
  hotspot_secondary_color: '#8B5CF6',
  hotspot_logo: null,
  hotspot_bg_image: null,
  hotspot_welcome_message: 'Welcome to MyHotspot Free WiFi',
  
  admin_site_name: 'MYHOTSPOT',
  admin_primary_color: '#1E3A8A',
  admin_secondary_color: '#475569',
  admin_logo: null,
  admin_background_image: null,
  admin_welcome_message: 'Administrator Panel',

  fonte_api_key: '',
  fonte_device_id: '',
  google_client_id: '',
  google_client_secret: '',
  google_redirect_uri: 'https://yourdomain.com/auth/google/callback',
};

interface SettingsContextType {
  settings: AllSettings;
  setSettings: React.Dispatch<React.SetStateAction<AllSettings>>;
  saveSettings: (formData: FormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AllSettings>({
    hotspot_site_name: 'MyHotspot-WiFi',
    hotspot_primary_color: '#3B82F6',
    hotspot_secondary_color: '#8B5CF6',
    hotspot_logo: null,
    hotspot_bg_image: null,
    hotspot_welcome_message: 'Welcome to MyHotspot Free WiFi',
    
    admin_site_name: 'MYHOTSPOT',
    admin_primary_color: '#1E3A8A',
    admin_secondary_color: '#475569',
    admin_logo: null,
    admin_background_image: null,
    admin_welcome_message: 'Welcome to the Admin Panel',

    fonte_api_key: '',
    fonte_device_id: '',
    google_client_id: '',
    google_client_secret: '',
    google_redirect_uri: 'https://yourdomain.com/auth/google/callback',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/admin/settings');
        // Merge fetched settings with defaults to ensure all keys are present
        setSettings(prev => ({ ...prev, ...response.data }));
      } catch (error) {
        toast.error('Failed to load settings.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
        const { data } = await apiClient.post('/admin/settings', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        setSettings(data.settings);
        toast.success(data.message || 'Settings saved successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save settings.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, isLoading, error, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};