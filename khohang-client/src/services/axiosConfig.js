import axios from 'axios'; // Chữ 'axios' phải viết thường hết nha,npm install axios
const api = axios.create({

    baseURL: 'http://10.10.99.127:8080/api', // Chỉnh lại cho đúng port Backend của bạn

});



// 🎯 ĐÂY LÀ ĐOẠN CODE SẼ GIẢI CỨU LỖI 403 CỦA BẠN
api.interceptors.request.use(
    (config) => {
        // Lấy token từ két sắt localStorage
        const token = localStorage.getItem('token');
        if (token) {
            // Gắn vào Header của mỗi request
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;

    },
    (error) => Promise.reject(error)
);

export default api;