import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios, { InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an Axios instance for API calls
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/sessions
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Represents the currently logged-in user
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'administrator' | 'moderator' | 'viewer';
  // Permissions might not be directly on the user object from the API
  // but we can handle that logic separately if needed.
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // The interceptor will add the token to the header
        const response = await apiClient.get('/admin/user');
        setUser(response.data);
      } catch (error) {
        console.error("Session verification failed", error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
        // CSRF cookie is needed for Sanctum's stateful auth
        await axios.get('http://localhost:8000/sanctum/csrf-cookie');

        const response = await apiClient.post('/admin/login', { username, password });

      if (response.data && response.data.token) {
        const { token, admin } = response.data;
        localStorage.setItem('auth_token', token);
        setUser(admin);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
      return false;
    }
  };

  const logout = async () => {
    try {
        if(localStorage.getItem('auth_token')){
            await apiClient.post('/admin/logout');
        }
    } catch (error) {
      console.error('Logout failed:', error);
      // We still log out on the client-side even if server call fails
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};