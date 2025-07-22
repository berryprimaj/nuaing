import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HotspotLogin from './components/HotspotLogin';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import SocialUsers from './components/admin/SocialUsers';
import Members from './components/admin/Members';
import RouterConfig from './components/admin/RouterConfig';
import Settings from './components/admin/Settings';
import Permissions from './components/admin/Permissions';
import Profile from './components/admin/Profile';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';


function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <Router>
            <div className="min-h-screen">
              <Toaster position="top-center" reverseOrder={false} />
              <Routes>
                <Route path="/" element={<HotspotLogin />} />
                <Route path="/admin" element={<AdminLogin />} />
                {/* Rute Admin yang Dilindungi */}
                <Route 
                  path="/admin/dashboard" 
                  element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} 
                />
                <Route 
                  path="/admin/social-users" 
                  element={<ProtectedRoute><SocialUsers /></ProtectedRoute>} 
                />
                <Route 
                  path="/admin/members" 
                  element={<ProtectedRoute><Members /></ProtectedRoute>} 
                />
                <Route 
                  path="/admin/router-config" 
                  element={<ProtectedRoute><RouterConfig /></ProtectedRoute>} 
                />
                <Route 
                  path="/admin/settings" 
                  element={<ProtectedRoute><Settings /></ProtectedRoute>} 
                />
                <Route 
                  path="/admin/permissions" 
                  element={<ProtectedRoute><Permissions /></ProtectedRoute>} 
                />
                <Route 
                  path="/admin/profile" 
                  element={<ProtectedRoute><Profile /></ProtectedRoute>} 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;