import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Hàm lấy ảnh đại diện dựa trên Role hoặc URL có sẵn
    const getAvatar = () => {
        if (user?.avatar) return user.avatar; 

        const role = user?.role?.toUpperCase();
        if (role === 'ADMIN') return 'src/components/avarta/Screenshot 2026-03-21 185323.png'; 
        if (role === 'KHO') return 'src/components/avarta/Screenshot 2026-03-21 185323.png';   
        if (role === 'MUAHANG') return 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; 
        return 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; 
    };
    
    console.log("Dữ liệu user lấy được:", user);

    if (!user) return null;

    return (
        <nav className="navbar navbar-top">
            
            {/* --- BÊN TRÁI: Nút Menu --- */}
            <div className="nav-left-area">
                <button className="menu-toggle-btn" onClick={onToggleSidebar} title="Đóng/Mở Sidebar">
                    ☰
                </button>
            </div>

            {/* --- Ở GIỮA: Logo WMS-SYSTEM --- */}
            <div 
                className="nav-center-area" 
                onClick={() => navigate('/dashboard')} 
                title="Về trang chủ"
            >
                📦 WMS-SYSTEM
            </div>

            {/* --- BÊN PHẢI: Thông báo, Profile & Đăng xuất --- */}
            <div className="nav-right-area nav-user">
                <NotificationBell />

                <div className="nav-user-profile nav-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                        src={getAvatar()}
                        alt="avatar"
                        className="nav-avatar"
                        title={`Tài khoản: ${user.hoTen}`}
                        style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div className="nav-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                        <span className="nav-name">Chào, <strong>{user.role || 'Người dùng'}</strong></span>
                        <span className="nav-role" style={{ fontSize: '12px', color: '#666' }}></span>
                    </div>
                </div>

                <button onClick={handleLogout} className="btn-logout-custom logout-btn">
                    Đăng xuất
                </button>
            </div>
            
        </nav>
    );
};

export default Navbar;