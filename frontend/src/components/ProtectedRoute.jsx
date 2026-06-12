import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasAuthToken } from '../utils/authStorage';
import PageLoader from './ui/PageLoader';

export default function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const hasToken = hasAuthToken();

  if (loading && !user && hasToken) return <PageLoader />;
  if (!isAuthenticated && !hasToken) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAuthenticated && hasToken) return <PageLoader />;
  return children;
}
