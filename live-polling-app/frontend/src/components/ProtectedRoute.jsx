import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
export default function ProtectedRoute({ children }) { return useAuth().token ? children : <Navigate to="/login" replace />; }
