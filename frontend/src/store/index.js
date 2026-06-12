import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import signalsReducer from './slices/signalsSlice';
import marketReducer from './slices/marketSlice';
import chartReducer from './slices/chartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    signals: signalsReducer,
    market: marketReducer,
    chart: chartReducer,
  },
});
