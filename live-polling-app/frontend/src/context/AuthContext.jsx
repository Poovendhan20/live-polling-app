import { useEffect, useState, createContext, useContext } from 'react';
import { getProfile, login as loginRequest, signup as signupRequest, updateProfile } from '../api/auth';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
	const [token, setToken] = useState(localStorage.getItem('token'));
	const [profile, setProfile] = useState(null);
	const complete = response => { localStorage.setItem('token', response.data.token); setProfile(null); setToken(response.data.token); };
	const login = data => loginRequest(data).then(complete);
	const signup = data => signupRequest(data).then(complete);
	const logout = () => { localStorage.removeItem('token'); setToken(null); setProfile(null); };
	useEffect(() => { if (!token) { setProfile(null); return; } getProfile().then(response => setProfile(response.data)).catch(() => setProfile(null)); }, [token]);
	const updateDisplayName = displayName => updateProfile(displayName).then(response => { setProfile(response.data); return response.data; });
	return <AuthContext.Provider value={{ token, profile, login, signup, logout, updateDisplayName }}>{children}</AuthContext.Provider>;
}
export const useAuthContext = () => useContext(AuthContext);
