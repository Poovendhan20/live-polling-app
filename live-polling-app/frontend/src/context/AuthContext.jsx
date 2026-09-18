import { createContext, useContext, useState } from 'react';
import { login as loginRequest, signup as signupRequest } from '../api/auth';
const AuthContext = createContext(null);
export function AuthProvider({ children }) { const [token, setToken] = useState(localStorage.getItem('token')); const complete = response => { localStorage.setItem('token', response.data.token); setToken(response.data.token); }; const login = data => loginRequest(data).then(complete); const signup = data => signupRequest(data).then(complete); const logout = () => { localStorage.removeItem('token'); setToken(null); }; return <AuthContext.Provider value={{ token, login, signup, logout }}>{children}</AuthContext.Provider>; }
export const useAuthContext = () => useContext(AuthContext);
