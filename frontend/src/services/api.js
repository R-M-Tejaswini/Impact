import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function for paginated responses
const extractResults = (response) => {
  return response.data.results ? response.data.results : Array.isArray(response.data) ? response.data : [];
};

// Blocker API
export const blockerAPI = {
  getAll: () => api.get('/blockers/'),
  get: (id) => api.get(`/blockers/${id}/`),
  create: (data) => api.post('/blockers/', data),
  update: (id, data) => api.put(`/blockers/${id}/`, data),
  delete: (id) => api.delete(`/blockers/${id}/`),
  resolve: (id) => api.post(`/blockers/${id}/resolve/`),
  getActive: () => api.get('/blockers/active/'),
};

// Work Entry API
export const workAPI = {
  getAll: () => api.get('/work-entries/'),
  get: (id) => api.get(`/work-entries/${id}/`),
  create: (data) => api.post('/work-entries/', data),
  update: (id, data) => api.put(`/work-entries/${id}/`, data),
  delete: (id) => api.delete(`/work-entries/${id}/`),
  getWeekly: () => api.get('/work-entries/weekly/'),
  getStats: () => api.get('/work-entries/stats/'),
};

// Skill API
export const skillAPI = {
  getAll: () => api.get('/skills/'),
  get: (id) => api.get(`/skills/${id}/`),
  create: (data) => api.post('/skills/', data),
  update: (id, data) => api.put(`/skills/${id}/`, data),
  delete: (id) => api.delete(`/skills/${id}/`),
};

// Project API
export const projectAPI = {
  getAll: () => api.get('/projects/'),
  get: (id) => api.get(`/projects/${id}/`),
  create: (data) => api.post('/projects/', data),
  update: (id, data) => api.put(`/projects/${id}/`, data),
  delete: (id) => api.delete(`/projects/${id}/`),
  complete: (id) => api.post(`/projects/${id}/complete/`),
  getActive: () => api.get('/projects/active/'),
};

// Calendar API
export const calendarAPI = {
  getAll: () => api.get('/calendar/'),
  get: (id) => api.get(`/calendar/${id}/`),
  create: (data) => api.post('/calendar/', data),
  update: (id, data) => api.put(`/calendar/${id}/`, data),
  delete: (id) => api.delete(`/calendar/${id}/`),
  getUpcoming: () => api.get('/calendar/upcoming/'),
  getWeek: () => api.get('/calendar/week/'),
};

// Company API
export const companyAPI = {
  getAll: () => api.get('/companies/'),
  get: (id) => api.get(`/companies/${id}/`),
  create: (data) => api.post('/companies/', data),
  update: (id, data) => api.put(`/companies/${id}/`, data),
  delete: (id) => api.delete(`/companies/${id}/`),
  getActive: () => api.get('/companies/active/'),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview/'),
  gapAnalysis: () => api.post('/ai/gap-analysis/'),
};

// AI API
export const aiAPI = {
  generateWeeklySummary: () => api.post('/ai/weekly-summary/'),
  generateOneOnOnePrep: () => api.post('/ai/one-on-one-prep/'),
  extractSkills: () => api.post('/ai/extract-skills/'),
  getSummaries: () => api.get('/ai/summaries/'),
  gapAnalysis: () => api.post('/ai/gap-analysis/'),
};

// GitHub API
export const githubAPI = {
  connect: (token) => api.post('/github/connect/', { token }),
  status: () => api.get('/github/status/'),
  sync: () => api.post('/github/sync/'),
};

export default api;