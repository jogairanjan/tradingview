import { createContext, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, clearAuth, logoutSession } from '../store/slices/authSlice';
import { migrateAuthStorage, hasAuthToken } from '../utils/authStorage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  useEffect(() => {
    migrateAuthStorage();
    if (hasAuthToken()) dispatch(fetchMe());
  }, [dispatch]);

  const logout = useCallback(async () => {
    await dispatch(logoutSession());
    dispatch(clearAuth());
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
