import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CHANGE_PASSWORD_PATH = '/cambiar-password';

export default function RoleGuard({ allow, children }) {
  const { isAuthenticated, role, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-10 text-center text-steel-500">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/ingresar" replace />;
  }

  // A temporary password (set by an admin) must be changed before the
  // person can use anything else in the panel.
  if (profile?.must_change_password && location.pathname !== CHANGE_PASSWORD_PATH) {
    return <Navigate to={CHANGE_PASSWORD_PATH} replace />;
  }

  if (allow && !allow.includes(role)) {
    return <Navigate to="/panel" replace />;
  }

  return children;
}