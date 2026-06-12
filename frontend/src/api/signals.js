import api from './axios';

export const signalsApi = {
  list: (params) => api.get('/signals', { params }),
  get: (id) => api.get(`/signals/${id}`),
  history: (id) => api.get(`/signals/${id}/history`),
  watchlist: () => api.get('/signals/user/watchlist'),
  addWatchlist: (tradingPairId) => api.post('/signals/user/watchlist', { tradingPairId }),
  removeWatchlist: (id) => api.delete(`/signals/user/watchlist/${id}`),
};
