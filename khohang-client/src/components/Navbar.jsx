// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Nếu chưa đăng nhập thì không hiển thị Navbar
    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="nav-logo">WMS-SYSTEM</div>

            <ul className="nav-links">
                <li>
                    <NavLink to="/hang-hoa" className="nav-item">📦 Hàng Hóa</NavLink>
                </li>
                <li>
                    <NavLink to="/nha-cung-cap" className="nav-item">🏢 Nhà Cung Cấp</NavLink>
                </li>
                {/* Chỉ Admin hoặc Mua hàng mới thấy mục Đơn hàng */}
                {(user.role === 'ADMIN' || user.role === 'MUAHANG') && (
                    <li>
                        <NavLink to="/don-hang" className="nav-item">📝 Đơn Hàng</NavLink>
                    </li>
                )}
            </ul>

            <div className="nav-user">
                <span>Chào, <strong>{user.hoTen || 'User'}</strong> ({user.role})</span>
                <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
            </div>
        </nav>
    );
};

export default Navbar;