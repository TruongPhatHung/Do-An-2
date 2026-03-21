import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Hàm lấy ảnh đại diện dựa trên Role hoặc URL có sẵn
    const getAvatar = () => {
        if (user?.avatar) return user.avatar; // Nếu user có link ảnh riêng thì dùng luôn

        const role = user?.role?.toUpperCase();
        if (role === 'ADMIN') return 'src/components/avarta/Screenshot 2026-03-21 185323.png'; // Icon Admin
        if (role === 'KHO') return 'src/components/avarta/Screenshot 2026-03-21 185323.png';   // Icon Kho
        if (role === 'MUAHANG') return 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; // Icon Mua hàng
        return 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; // Icon mặc định
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="nav-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                📦 WMS-SYSTEM
            </div>

            <div className="nav-user">
                {/* Chuông thông báo */}
                <NotificationBell />

                {/* Khu vực thông tin Profile */}
                <div className="nav-profile">
                    <img
                        src={getAvatar()}
                        alt="avatar"
                        className="nav-avatar"
                        title={`Tài khoản: ${user.hoTen}`}
                    />
                    <div className="nav-text">
                        <span className="nav-name">Chào, <strong>{user.hoTen || 'User'}</strong></span>
                        <span className="nav-role">{user.role}</span>
                    </div>
                </div>

                <button onClick={handleLogout} className="logout-btn">
                    🚪 Đăng xuất
                </button>
            </div>
        </nav>
    );
};

export default Navbar;