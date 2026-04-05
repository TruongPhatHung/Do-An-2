import React, { createContext, useState } from 'react';
import api from '../services/axiosConfig'; // Đã có sẵn baseURL là link Pinggy

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [error, setError] = useState(null);
    
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const displayName = localStorage.getItem('displayName');
        
        if (token && role) {
            return { role, displayName };
        }
        return null;
    });

    const login = async (username, password) => {
        setError(null);
        try {
            console.log("Đang gửi yêu cầu đăng nhập qua Axios...");


            const response = await fetch('http://10.10.80.70:8080/api/auth/login', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Đóng gói data chuẩn Form Backend
                body: JSON.stringify({ 
                    username: username, 
                    password: password 
                }),
            });

            if (!response.ok) {
                throw new Error("Server response error");
            }

            const data = await response.json();
            console.log("Response from server:", data);


            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('displayName', data.username);

                setUser({
                    role: data.role,
                    displayName: data.username
                });

                return true;
            } else {
                setError(data.message || "Đăng nhập thất bại");
                return false;
            }
        } catch (err) {
            console.error("Lỗi kết nối server:", err);
            
            // Xử lý thông báo lỗi từ Server hoặc lỗi Network
            const msg = err.response?.data?.message || "Không thể kết nối đến máy chủ hoặc lỗi CORS!";
            setError(msg);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('displayName');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ login, logout, error, user }}>
            {children}
        </AuthContext.Provider>
    );
};