import api from './axios';
import { unwrapApi } from '../utils/api';

export const marketApi = {
  getTickers: async (symbols) => {
    const params = symbols?.length ? { symbols: symbols.join(',') } : {};
    const res = await api.get('/market/tickers', { params });
    const data = unwrapApi(res);
    return data?.tickers || data || [];
  },
};
