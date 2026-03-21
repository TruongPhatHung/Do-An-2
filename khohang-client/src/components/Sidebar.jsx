import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    const role = user?.role?.toUpperCase();

    // Hàm tiện ích để tránh lặp lại code class
    const navClass = ({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item";

    return (
        <aside className="sidebar">
            {/* Phần thông tin User giống hình */}
            <div className="sidebar-user-panel">
                
                <div className="user-info">
                    <p>{user.hoTen || 'admin'}</p>
                    <span className="online-status">
                        <span className="status-dot"></span> Online
                    </span>
                </div>
            </div>

            <ul className="sidebar-menu">

                {/* Trang Chủ (Giả lập theo hình) */}
                <li>
                    <NavLink to="/dashboard" className="sidebar-item">
                        <span className="menu-icon">🏠</span> Trang chủ
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/products" className="sidebar-item">
                        <span className="menu-icon">📦</span> Hàng Hóa

                    </NavLink>
                </li>

                <li>

                    <NavLink to="/suppliers" className="sidebar-item">
                        <span className="menu-icon">🏢</span> Nhà Cung Cấp

                    </NavLink>
                </li>

                <li>
                    <NavLink to="/categories" className={navClass}>
                        🏷️ Quản Lý Loại Hàng
                    </NavLink>
                </li>

                {/* --- NHÓM MUA HÀNG & ĐƠN HÀNG --- */}
                {(role === 'ADMIN' || role === 'MUAHANG') && (
                    <li>

                        <NavLink to="/don-hang" className="sidebar-item">
                            <span className="menu-icon">📝</span> Lên Đơn (PO)

                        </NavLink>
                    </li>
                )}


                {(role === 'ADMIN' || role === 'KHO') && (
                    <li>
                        <NavLink to="/nhap-kho" className="sidebar-item">
                            <span className="menu-icon">📥</span> Nhập Kho
                        </NavLink>
                    </li>
                )}

                <li>
                    <NavLink to="/danh-sach-po" className="sidebar-item">
                        <span className="menu-icon">📋</span> Danh Sách Đơn Hàng

                    </NavLink>
                </li>

                {/* --- NHÓM KHO VẬN --- */}
                {(role === 'ADMIN' || role === 'KHO') && (

                    <li>
                        <NavLink to="/xuat-kho" className="sidebar-item">
                            <span className="menu-icon">📤</span> Xuất Kho

                        </NavLink>
                    </li>
                )}

                {role === 'ADMIN' && (

                    <li>
                        <NavLink to="/tai-khoan" className="sidebar-item">
                            <span className="menu-icon">👥</span> Quản Lý Tài Khoản
                        </NavLink>
                    </li>
                )}

                {role === 'ADMIN' && (
                    <li>
                        <NavLink to="/admin/logs" className="sidebar-item">
                            <span className="menu-icon">📜</span> Nhật Ký Hệ Thống
                        </NavLink>
                    </li>

                )}
            </ul>
        </aside>
    );
};

export default Sidebar;