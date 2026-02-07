import axios from 'axios';

const api = axios.create({
    // Kết nối đến máy của A qua Wifi
    baseURL: 'http://10.10.103.53:8080/api', 
});

export default api;