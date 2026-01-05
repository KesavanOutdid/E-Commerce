import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../ui-component/Loader';
import { hasPermission } from '../utils/permissionHelper';

const ProtectedRoute = ({ children, module, action = 'view' }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/pages/login" replace />;
  }

  if (module && !hasPermission(user?.permissions, module, action)) {
    return <Navigate to="/dashboard/default" replace />;
  }

  return children;
};

export default ProtectedRoute;
