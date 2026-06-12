import api from './axios';
import { unwrapApi } from '../utils/api';

export const scannerApi = {
  run: async (params = {}) => {
    const res = await api.get('/scanner', { params });
    return unwrapApi(res);
  },
};

