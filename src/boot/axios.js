// src/boot/axios.js
import { boot } from 'quasar/wrappers';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const USE_CREDENTIALS =
  (import.meta.env.VITE_WITH_CREDENTIALS ?? 'true') === 'true';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: USE_CREDENTIALS,
});

// luôn gắn Authorization từ localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token'); // 👈 trùng với auth.js
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { axios, api };
