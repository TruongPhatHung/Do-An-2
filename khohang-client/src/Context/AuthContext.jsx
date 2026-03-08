import React, { createContext, useState } from 'react';
// import api from '../services/axiosConfig'; // Tạm thời bạn có thể chưa cần dòng này nếu chưa gọi API

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    try {
        // const response = await api.post('/auth/login', {username, password});
        // const {token, role, maND, hoTen} = response.data;
        // localStorage.setItem('token', token);
        // setUser({username, role, maND, hoTen});
        // setError('');
        setUser({
            maND: 'TEST01',
            username: 'hung', // Dùng biến username bạn gõ từ form
            role: 'ADMIN',
            hoTen: 'hung phat truong'
            // password: không cần lưu password vào state user để bảo mật
        });
        setError('');
        return true;
    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
        return false;
    }
 };

 const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
 };

 return(
    <AuthContext.Provider value={{user, login, logout, error}}>
        {children}
    </AuthContext.Provider>
 );
};