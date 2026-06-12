import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addLiveSignal } from '../store/slices/signalsSlice';
import { setTickers, updateTicker } from '../store/slices/marketSlice';
import { getAccessToken } from '../utils/authStorage';

const WS_URL = import.meta.env.VITE_WS_URL || '';

export function useSocket(enabled = true) {
  const socketRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!enabled || !WS_URL) return undefined;

    const token = getAccessToken();
    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribe:signals');
    });

    socket.on('signal:new', (signal) => dispatch(addLiveSignal(signal)));

    socket.on('market:tickers', (tickers) => {
      if (Array.isArray(tickers) && tickers.length) dispatch(setTickers(tickers));
    });

    socket.on('ticker:update', (ticker) => {
      if (ticker?.symbol) dispatch(updateTicker(ticker));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, dispatch]);

  return socketRef;
}
