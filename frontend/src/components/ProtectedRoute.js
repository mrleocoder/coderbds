import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, memberOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate login page based on route type
    if (adminOnly) {
      return <Navigate to="/admin/login" replace />;
    }
    if (memberOnly) {
      return <Navigate to="/" replace />; // Members login via modal on homepage
    }
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  if (memberOnly && user.role !== 'member') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;