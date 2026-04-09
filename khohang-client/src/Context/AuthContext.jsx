import React, { createContext, useState, useEffect, useRef } from 'react';
import api from '../services/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [error, setError] = useState(null);
    const pingIntervalRef = useRef(null); // 🎯 Biến giữ nhịp tim

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const hoTen = localStorage.getItem('hoTen');
        const username = localStorage.getItem('username');

        if (token && role && username) {
            return { role, hoTen, username };
        }
        return null;
    });

    // ==========================================================
    // 🎯 HÀM BẮT ĐẦU BƠM NHỊP TIM (Gửi API /ping mỗi 15 giây)
    // ==========================================================
    const startHeartbeat = (username) => {
        // Xóa nhịp tim cũ nếu có để tránh chạy chồng chéo
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        console.log("💗 Bắt đầu gửi Ping trạng thái cho:", username);

        pingIntervalRef.current = setInterval(async () => {
            try {
                await api.post('/auth/ping', { username });
            } catch (err) {
                console.error("Lỗi gửi Ping (Mất kết nối server):", err);
            }
        }, 15000); // 15,000 ms = 15 giây
    };

    // Dừng nhịp tim khi đăng xuất
    const stopHeartbeat = () => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
            console.log("⏹️ Đã dừng gửi Ping trạng thái.");
        }
    };

    // Khi Load trang lại (F5), nếu đang có user thì tiếp tục bơm nhịp tim
    useEffect(() => {
        if (user && user.username) {
            startHeartbeat(user.username);
        }
        return () => stopHeartbeat(); // Cleanup khi component bị hủy (Tắt tab)
    }, [user]);

    const login = async (username, password) => {
        setError(null);
        try {
            const response = await api.post('/auth/login', {
                username: username,
                password: password
            });

            const data = response.data;

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('hoTen', data.hoTen);
                localStorage.setItem('username', data.username);

                setUser({
                    username: data.username,
                    role: data.role,
                    hoTen: data.hoTen
                });

                // Đăng nhập thành công là kích hoạt nhịp tim ngay
                startHeartbeat(data.username);

                return true;
            }
            return false;
        } catch (err) {
            const msg = err.response?.data?.message || "Không thể kết nối đến máy chủ!";
            setError(msg);
            return false;
        }
    };

    const logout = async () => {
        // Gửi lệnh tắt điện cuối cùng (Cho nhanh, đỡ phải chờ 1 phút)
        if (user?.username) {
            try {
                await api.post('/auth/logout', { username: user.username });
            } catch (e) { console.error(e); }
        }

        stopHeartbeat(); // Tắt máy tạo nhịp tim

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