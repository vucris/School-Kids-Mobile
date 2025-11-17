// src/boot/axios.js
import { boot } from 'quasar/wrappers';
import axios from 'axios';

// Đổi BASE_URL cho đúng môi trường của bạn
// Dev trên PC: dùng localhost
// Dev trên điện thoại thật: dùng IP máy BE (vd: http://192.168.1.10:8080/api/v1)
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  withCredentials: true, // để BE set cookie nếu cần
});

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export { axios, api };
