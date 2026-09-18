import api from './axios';
export const signup = data => api.post('/auth/signup', data);
export const login = data => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = displayName => api.patch('/auth/profile', { displayName });
