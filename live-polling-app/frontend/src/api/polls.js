import api from './axios';
export const createPoll = data => api.post('/polls', data);
export const getPoll = id => api.get(`/polls/${id}`);
export const vote = (id, optionIndex) => api.post(`/polls/${id}/votes`, { optionIndex });
