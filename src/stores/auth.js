// src/stores/auth.js
import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';
const WITH_CREDENTIALS = (import.meta.env.VITE_WITH_CREDENTIALS ?? 'true') === 'true';

function readJSON(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return fallback;
  }
}

function getTokensFromResponse(data) {
  const access = data?.accessToken ?? data?.access_token ?? data?.token ?? '';
  const refresh = data?.refreshToken ?? data?.refresh_token ?? '';
  return { access, refresh };
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') || '',
    refreshToken: localStorage.getItem('refresh_token') || '',
    user: readJSON('auth_user', null)
  }),
  getters: {
    isAuthenticated: (s) => !!s.accessToken
  },
  actions: {
    initFromStorage() {
      this.accessToken = localStorage.getItem('access_token') || '';
      this.refreshToken = localStorage.getItem('refresh_token') || '';
      this.user = readJSON('auth_user', null);
    },

    setTokens(access, refresh) {
      this.accessToken = access || '';
      this.refreshToken = refresh || '';
      access
        ? localStorage.setItem('access_token', access)
        : localStorage.removeItem('access_token');
      refresh
        ? localStorage.setItem('refresh_token', refresh)
        : localStorage.removeItem('refresh_token');
    },

    setUser(user) {
      this.user = user || null;
      user
        ? localStorage.setItem('auth_user', JSON.stringify(user))
        : localStorage.removeItem('auth_user');
    },

    async login({ username, password }) {
      const { data } = await axios.post(
        `${BASE_URL}/auth/login`,
        { username, password },
        { withCredentials: WITH_CREDENTIALS }
      );

      const { access, refresh } = getTokensFromResponse(data);
      this.setTokens(access, refresh);
      this.setUser(data.user || null);
      return data;
    },

    async refreshTokenOnce() {
      if (!this.refreshToken) throw new Error('No refresh token');
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken: this.refreshToken },
        { withCredentials: WITH_CREDENTIALS }
      );

      const { access, refresh } = getTokensFromResponse(data);
      this.setTokens(access, refresh || this.refreshToken);
      return access;
    },

    async logout() {
      try {
        await axios.get(`${BASE_URL}/auth/logout`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        });
      } catch (e) {
        console.warn('[Logout error]', e?.response?.data || e.message);
      } finally {
        this.setTokens('', '');
        this.setUser(null);
        localStorage.clear();
      }
    }
  }
});
