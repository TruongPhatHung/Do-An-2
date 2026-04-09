import React, { createContext, useState } from 'react';
import api from '../services/axiosConfig'; // Dùng cho các file khác

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [error, setError] = useState(null);

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const hoTen = localStorage.getItem('hoTen');
        const username = localStorage.getItem('username');

        if (token && role) {
            return { role, hoTen, username };
        }
        return null;
    });

    const login = async (username, password) => {
        setError(null);
        try {
            console.log("Đang gửi yêu cầu đăng nhập...");

            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
            });

            // 🎯 1. BẮT BUỘC PHẢI PARSE JSON TRƯỚC KHI ĐỌC DỮ LIỆU
            const data = await response.json();
            console.log("Response from server:", data);

            // 🎯 2. KIỂM TRA BẰNG BIẾN 'data' (Thay vì response.data)
            if (data.token) {
                // Lưu vào LocalStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('hoTen', data.hoTen);
                localStorage.setItem('username', data.username); // Quan trọng cho lúc Logout

                // Cập nhật State
                setUser({
                    username: data.username,
                    role: data.role,
                    hoTen: data.hoTen
                });

                return true;
            } else {
                // Nếu Backend trả về sai pass / tài khoản
                setError(data.message || "Đăng nhập thất bại");
                return false;
            }
        } catch (err) {
            console.error("Lỗi kết nối server:", err);
            setError("Không thể kết nối đến máy chủ hoặc lỗi mạng!");
            return false;
        }
    };

    const logout = () => {
        // Quét sạch sẽ khi đăng xuất
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('hoTen');
        localStorage.removeItem('username');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ login, logout, error, user }}>
            {children}
        </AuthContext.Provider>
    );
};