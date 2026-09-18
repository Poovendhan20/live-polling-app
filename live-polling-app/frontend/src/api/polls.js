import api from './axios';
export const createPoll = data => api.post('/polls', data);
export const getPoll = id => api.get(`/polls/${id}`);
export const getMyPolls = () => api.get('/polls/mine');
export const deletePoll = id => api.delete(`/polls/${id}`);
export const getPollVoters = id => api.get(`/polls/${id}/voters`);
export const getPollAnalytics = id => api.get(`/polls/${id}/analytics`);
export const getPollReport = id => api.get(`/polls/${id}/report`, { responseType: 'blob' });
export const vote = (id, optionIndex, voterName, voterEmail) => api.post(`/polls/${id}/votes`, { optionIndex, voterName, voterEmail });