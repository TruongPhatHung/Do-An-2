
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="nav-logo">WMS-SYSTEM</div>
            <div className="nav-user">
                <span>Chào, <strong>{user.hoTen || 'User'}</strong> ({user.role})</span>
                <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
            </div>
        </nav>
    );
};

export default Navbar;