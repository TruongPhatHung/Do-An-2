import React, { createContext, useState } from 'react';
import api from '../services/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [error, setError] = useState(null);
    
    // SỬA Ở ĐÂY: Khởi tạo user bằng cách đọc từ localStorage thay vì để null
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const displayName = localStorage.getItem('displayName');
        
        // Nếu có token và thông tin, khôi phục lại state user
        if (token && role) {
            return {
                role: role,
                displayName: displayName
            };
        }
        return null;
    });

    const login = async (username, password) => {
        setError(null); // Xóa lỗi cũ trước khi gửi request mới
        try {
            // Gửi request tới Backend Spring Boot
            console.log("Sending login request...");


            const response = await fetch('http://localhost:8080/api/auth/login', {

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
                localStorage.setItem('role', data.role); // Lưu role vào localStorage
                localStorage.setItem('displayName', data.username);

                // Cập nhật state user để dùng trong app
                setUser({
                    role: data.role, 
                    displayName: data.username
                });

                return true;
            } else {
                setError(data.message);
                return false;
            }
        } catch (err) {
            console.error("Lỗi kết nối server:", err);
            setError("Không thể kết nối đến máy chủ!");
            return false;
        }
    };

    // Hàm đăng xuất
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