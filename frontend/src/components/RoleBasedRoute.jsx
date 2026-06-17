import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function RoleBasedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner text="Checking access..." />;
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
