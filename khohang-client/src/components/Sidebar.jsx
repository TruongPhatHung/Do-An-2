
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    if (!user) return null;

    return (
        <aside className="sidebar">
            <ul className="sidebar-menu">
                <li><NavLink to="/hang-hoa" className="sidebar-item">📦 Hàng Hóa</NavLink></li>
                <li><NavLink to="/nha-cung-cap" className="sidebar-item">🏢 Nhà Cung Cấp</NavLink></li>
                
                {/* Quyền ADMIN hoặc MUAHANG mới được Lên đơn đặt hàng */}
                {(user.role === 'ADMIN' || user.role === 'MUAHANG') && (
                    <li><NavLink to="/don-hang" className="sidebar-item">📝 Lên Đơn (PO)</NavLink></li>
                )}

                {/* Quyền ADMIN hoặc KHO mới được Nhập kho */}
                {(user.role === 'ADMIN' || user.role === 'KHO') && (
                    <li><NavLink to="/nhap-kho" className="sidebar-item">📥 Nhập Kho</NavLink></li>
                )}
                <li><NavLink to="/danh-sach-po" className="sidebar-item">📋 Danh Sách Đơn Hàng</NavLink></li>
            </ul>
        </aside>
    );
};

export default Sidebar;