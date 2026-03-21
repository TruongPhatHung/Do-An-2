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

    if (!user) return null;

    return (
        <nav className="navbar-top">
            {/* Phần Logo bên trái */}
            <div className="nav-brand-area">
                <span className="nav-logo">WMS-SYSTEM</span>
            </div>

            {/* Phần chức năng bên phải */}
            <div className="nav-right-area">
                <button className="menu-toggle-btn" onClick={onToggleSidebar}>☰</button> {/* Nút menu giả lập */}
                
                <div className="nav-user-actions">
                    <NotificationBell />

                    <div className="nav-user-profile">
                     
                        <span className="nav-greeting">
                            Xin Chào: <strong>{user.hoTen || 'admin'}</strong>
                        </span>
                    </div>

                    <button onClick={handleLogout} className="btn-logout-custom">
                        Đăng xuất
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;