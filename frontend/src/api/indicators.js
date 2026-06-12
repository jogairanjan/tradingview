import api from './axios';
import { unwrapApi } from '../utils/api';

export const indicatorsApi = {
  getChart: async ({ symbol, timeframe, limit = 200 }) => {
    const res = await api.post('/indicators/chart', { symbol, timeframe, limit });
    return unwrapApi(res);
  },
};
