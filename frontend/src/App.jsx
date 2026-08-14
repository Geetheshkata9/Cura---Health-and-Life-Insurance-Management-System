import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerClaimSubmission from './pages/CustomerClaimSubmission';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';

// Role-based protective route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};


const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Public Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Customer routes */}
          <Route 
            path="/customer/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/customer/claims/new" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerClaimSubmission />
              </ProtectedRoute>
            } 
          />

          {/* Staff/Admin routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'agent']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Profile route (all authenticated roles) */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'agent']}>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
  );
};

export default App;
