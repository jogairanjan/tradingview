import api from './axios';

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  users: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  signals: (params) => api.get('/admin/signals', { params }),
  createSignal: (data) => api.post('/admin/signals', data),
  updateSignal: (id, data) => api.patch(`/admin/signals/${id}`, data),
  deleteSignal: (id) => api.delete(`/admin/signals/${id}`),
  subscriptions: (params) => api.get('/admin/subscriptions', { params }),
  payments: (params) => api.get('/admin/payments', { params }),
  broadcast: (data) => api.post('/admin/notifications/broadcast', data),
  pairs: () => api.get('/admin/trading-pairs'),
  analytics: () => api.get('/admin/analytics'),
};
