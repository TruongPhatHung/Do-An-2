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
            <ul className="sidebar-menu">
                {/* --- NHÓM QUẢN LÝ CHUNG --- */}
                <li>
                    <NavLink to="/products" className={navClass}>
                        📦 Hàng Hóa
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/suppliers" className={navClass}>
                        🏢 Nhà Cung Cấp
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
                        <NavLink to="/create-po" className={navClass}>
                            📝 Lên Đơn (PO)
                        </NavLink>
                    </li>
                )}

                <li>
                    <NavLink to="/orders" className={navClass}>
                        📋 Danh Sách Đơn Hàng
                    </NavLink>
                </li>

                {/* --- NHÓM KHO VẬN --- */}
                {(role === 'ADMIN' || role === 'KHO') && (
                    <>
                        <li>
                            <NavLink to="/nhap-kho" className={navClass}>
                                📥 Nhập Kho
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/xuat-kho" className={navClass}>
                                📤 Xuất Kho
                            </NavLink>
                        </li>
                    </>
                )}

                {/* --- NHÓM BÁO CÁO & HỆ THỐNG --- */}
                {(role === 'ADMIN' || role === 'MUAHANG') && (
                    <li>
                        <NavLink to="/dashboard" className={navClass}>
                            📊 Dashboard
                        </NavLink>
                    </li>
                )}

                {role === 'ADMIN' && (
                    <>
                        <li>
                            <NavLink to="/tai-khoan" className={navClass}>
                                👥 Quản Lý Tài Khoản
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/logs" className={navClass}>
                                📜 Nhật Ký Hệ Thống
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
        </aside>
    );
};

export default Sidebar;