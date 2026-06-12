import { createSlice } from '@reduxjs/toolkit';

const loadDrawings = () => {
  try {
    return JSON.parse(localStorage.getItem('chartDrawings') || '[]');
  } catch {
    return [];
  }
};

const loadAlerts = () => {
  try {
    return JSON.parse(localStorage.getItem('chartAlerts') || '[]');
  } catch {
    return [];
  }
};

const chartSlice = createSlice({
  name: 'chart',
  initialState: {
    layout: 1,
    syncSymbol: true,
    syncTimeframe: false,
    syncCrosshair: true,
    magnetMode: false,
    activeTool: 'cursor',
    selectedDrawingId: null,
    drawings: loadDrawings(),
    alerts: loadAlerts(),
    undoStack: [],
    showAutoTrendlines: true,
    showSRZones: true,
    showPatterns: true,
    crosshair: null,
  },
  reducers: {
    setLayout: (state, action) => { state.layout = action.payload; },
    setActiveTool: (state, action) => {
      state.activeTool = action.payload;
      if (!['cursor', 'select'].includes(action.payload)) state.selectedDrawingId = null;
    },
    setSelectedDrawing: (state, action) => { state.selectedDrawingId = action.payload; },
    toggleMagnet: (state) => { state.magnetMode = !state.magnetMode; },
    setSync: (state, action) => ({ ...state, ...action.payload }),
    addDrawing: (state, action) => {
      state.drawings.push(action.payload);
      localStorage.setItem('chartDrawings', JSON.stringify(state.drawings));
    },
    updateDrawing: (state, action) => {
      const i = state.drawings.findIndex((d) => d.id === action.payload.id);
      if (i >= 0) state.drawings[i] = action.payload;
      localStorage.setItem('chartDrawings', JSON.stringify(state.drawings));
    },
    removeDrawing: (state, action) => {
      state.drawings = state.drawings.filter((d) => d.id !== action.payload);
      if (state.selectedDrawingId === action.payload) state.selectedDrawingId = null;
      localStorage.setItem('chartDrawings', JSON.stringify(state.drawings));
    },
    clearDrawings: (state) => {
      state.drawings = [];
      state.selectedDrawingId = null;
      localStorage.setItem('chartDrawings', '[]');
    },
    addAlert: (state, action) => {
      state.alerts.push({ ...action.payload, id: action.payload.id || Date.now().toString(), active: true });
      localStorage.setItem('chartAlerts', JSON.stringify(state.alerts));
    },
    triggerAlert: (state, action) => {
      const i = state.alerts.findIndex((a) => a.id === action.payload.id);
      if (i >= 0) {
        state.alerts[i] = {
          ...state.alerts[i],
          triggered: true,
          lastTriggeredAt: action.payload.triggeredAt || new Date().toISOString(),
          lastPrice: action.payload.price,
        };
        localStorage.setItem('chartAlerts', JSON.stringify(state.alerts));
      }
    },
    setCrosshair: (state, action) => {
      state.crosshair = action.payload;
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter((a) => a.id !== action.payload);
      localStorage.setItem('chartAlerts', JSON.stringify(state.alerts));
    },
    setShowAutoTrendlines: (state, action) => { state.showAutoTrendlines = action.payload; },
    setShowSRZones: (state, action) => { state.showSRZones = action.payload; },
    setShowPatterns: (state, action) => { state.showPatterns = action.payload; },
  },
});

export const {
  setLayout,
  setActiveTool,
  setSelectedDrawing,
  toggleMagnet,
  setSync,
  addDrawing,
  updateDrawing,
  removeDrawing,
  clearDrawings,
  addAlert,
  triggerAlert,
  removeAlert,
  setCrosshair,
  setShowAutoTrendlines,
  setShowSRZones,
  setShowPatterns,
} = chartSlice.actions;

export default chartSlice.reducer;
