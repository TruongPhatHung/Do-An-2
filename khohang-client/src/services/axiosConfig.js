import axios from 'axios';

const api = axios.create({

  baseURL: 'http://10.10.12.18:8080/api', // URL của Developer A
  headers: {
        'Content-Type': 'application/json',
    },


});

// Tự động đính kèm Token vào Header mỗi khi gọi API
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
     //config.headers['Authorization'] = token;
  }
  return config;
});
export default api;