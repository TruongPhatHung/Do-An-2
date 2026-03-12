import React, { createContext, useState } from 'react';
import api from '../services/axiosConfig';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null); // Lưu thông tin role, displayName

    const login = async (username, password) => {
        setError(null); // Xóa lỗi cũ trước khi gửi request mới
        try {
            // Gửi request tới Backend Spring Boot
            console.log("Sending login request...");

            const response = await fetch('http://10.10.148.243:8080/api/auth/login', {

            // const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Đóng gói data chuẩn Form Backend
                body: JSON.stringify({ 
                    username: username, password:password }),
            });
            if (!response.ok) {
    throw new Error("Server response error");
}


            const data = await response.json();
            console.log("Response from server:", data);

            // Kiểm tra status từ cục JSON backend trả về
          //  const data = await response.json();

if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.roler);
    localStorage.setItem('displayName', data.username);

    setUser({
        role: data.roler,
        displayName: data.username
    });
//
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