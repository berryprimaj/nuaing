import { useEffect, useState } from 'react';
import { Users, Wifi, UserPlus, TrendingUp } from 'lucide-react';
import Layout from './Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import { echo } from '../../services/Echo';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

interface DashboardStats {
  totalUsers: { value: number };
  activeSessions: { value: number };
  totalMembers: { value: number };
  newUsersToday: { value: number };
}

interface RecentActivity {
  id: number;
  fullname: string;
  auth_method: string;
  created_at: string;
}

interface UserActivity {
  day: string;
  users: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [userActivityData, setUserActivityData] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/dashboard');
        const { stats, recentActivity, userActivityData } = response.data;
        setStats(stats);
        setRecentActivity(recentActivity);
        setUserActivityData(userActivityData);
      } catch (error) {
        toast.error('Failed to fetch dashboard data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Listen for broadcasted events
    echo.channel('dashboard')
      .listen('.dashboard.update', (event: any) => {
          console.log('Dashboard update received:', event);
          const { stats, recentActivity, userActivityData } = event.data;
          toast.success('Dashboard has been updated in real-time!');
          setStats(stats);
          setRecentActivity(recentActivity);
          setUserActivityData(userActivityData);
      });

    // Cleanup listener on component unmount
    return () => {
        echo.leaveChannel('dashboard');
    };

  }, []);
  
  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers.value,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Sessions',
      value: stats?.activeSessions.value,
      icon: Wifi,
      color: 'bg-green-500',
    },
    {
      title: 'Total Members',
      value: stats?.totalMembers.value,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
        title: 'New Users Today',
        value: stats?.newUsersToday.value,
        icon: UserPlus,
        color: 'bg-orange-500',
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome to MyHotspot management system</p>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
                <div key={stat.title} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">User Activity (Last 7 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userActivityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                            <div className="h-12 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))
                ) : (
                    recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                        <p className="font-medium text-gray-800">{activity.fullname}</p>
                        <p className="text-sm text-gray-600">Connected via {activity.auth_method}</p>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(activity.created_at).toLocaleTimeString()}</p>
                    </div>
                    ))
                )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;