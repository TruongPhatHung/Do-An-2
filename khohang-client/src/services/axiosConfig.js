import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.10.6.24:8080/api', // URL của Developer A
});

// Tự động đính kèm Token vào Header mỗi khi gọi API
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;