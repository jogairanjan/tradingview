import { createSlice } from '@reduxjs/toolkit';

const marketSlice = createSlice({
  name: 'market',
  initialState: { tickers: [], activeTab: 'crypto', watchlist: [] },
  reducers: {
    setTickers: (state, action) => { state.tickers = action.payload; },
    updateTicker: (state, action) => {
      const t = action.payload;
      if (!t?.symbol) return;
      const i = state.tickers.findIndex((x) => x.symbol === t.symbol);
      if (i >= 0) state.tickers[i] = { ...state.tickers[i], ...t };
      else state.tickers.push(t);
    },
    setActiveTab: (state, action) => { state.activeTab = action.payload; },
    setWatchlist: (state, action) => { state.watchlist = action.payload; },
  },
});

export const { setTickers, updateTicker, setActiveTab, setWatchlist } = marketSlice.actions;
export default marketSlice.reducer;
