import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
export default function ProtectedRoute({ children }) { const location = useLocation(); return useAuth().token ? children : <Navigate to="/login" replace state={{ from: location }} />; }
