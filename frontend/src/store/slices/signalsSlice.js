import { createSlice } from '@reduxjs/toolkit';

const signalsSlice = createSlice({
  name: 'signals',
  initialState: { list: [], live: null, history: [] },
  reducers: {
    setSignals: (state, action) => { state.list = action.payload; },
    addLiveSignal: (state, action) => {
      state.live = action.payload;
      state.list = [action.payload, ...state.list.slice(0, 49)];
    },
    setHistory: (state, action) => { state.history = action.payload; },
  },
});

export const { setSignals, addLiveSignal, setHistory } = signalsSlice.actions;
export default signalsSlice.reducer;
