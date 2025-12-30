import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../ui-component/Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/pages/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
