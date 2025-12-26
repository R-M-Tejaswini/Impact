import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Work Entries
export const workAPI = {
  getAll: () => api.get('/work-entries/'),
  getWeekly: () => api.get('/work-entries/weekly/'),
  getStats: () => api.get('/work-entries/stats/'),
  create: (data) => api.post('/work-entries/', data),
  update: (id, data) => api.put(`/work-entries/${id}/`, data),
  delete: (id) => api.delete(`/work-entries/${id}/`),
};

// Blockers
export const blockerAPI = {
  getAll: () => api.get('/blockers/'),
  getActive: () => api.get('/blockers/active/'),
  create: (data) => api.post('/blockers/', data),
  resolve: (id) => api.post(`/blockers/${id}/resolve/`),
  delete: (id) => api.delete(`/blockers/${id}/`),
};

// Skills
export const skillAPI = {
  getAll: () => api.get('/skills/'),
  create: (data) => api.post('/skills/', data),
  delete: (id) => api.delete(`/skills/${id}/`),
};

// AI Services
export const aiAPI = {
  generateWeeklySummary: () => api.post('/ai/weekly-summary/'),
  generateOneOnOnePrep: () => api.post('/ai/one-on-one-prep/'),
  extractSkills: () => api.post('/ai/extract-skills/'),
};

// GitHub Integration
export const githubAPI = {
  getStatus: () => api.get('/github/status/'),
  connect: (accessToken) => api.post('/github/connect/', { access_token: accessToken }),
  sync: () => api.post('/github/sync/'),
};

export default api;