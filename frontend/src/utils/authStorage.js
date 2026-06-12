/**
 * Auth tokens in sessionStorage — cleared when the browser/tab session ends.
 * (Unlike localStorage, which persists after closing the browser.)
 */

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

/** Move any legacy localStorage tokens into sessionStorage, then remove them. */
export function migrateAuthStorage() {
  if (typeof window === 'undefined') return;

  const access = localStorage.getItem(ACCESS_KEY);
  const refresh = localStorage.getItem(REFRESH_KEY);

  if (access && !sessionStorage.getItem(ACCESS_KEY)) {
    sessionStorage.setItem(ACCESS_KEY, access);
  }
  if (refresh && !sessionStorage.getItem(REFRESH_KEY)) {
    sessionStorage.setItem(REFRESH_KEY, refresh);
  }

  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken() {
  return typeof window !== 'undefined' ? sessionStorage.getItem(ACCESS_KEY) : null;
}

export function getRefreshToken() {
  return typeof window !== 'undefined' ? sessionStorage.getItem(REFRESH_KEY) : null;
}

export function setTokens(accessToken, refreshToken) {
  if (typeof window === 'undefined') return;
  if (accessToken) sessionStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function setAccessToken(accessToken) {
  if (typeof window === 'undefined' || !accessToken) return;
  sessionStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.removeItem(ACCESS_KEY);
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function hasAuthToken() {
  return !!getAccessToken();
}
