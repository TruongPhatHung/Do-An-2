import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    const role = user?.role?.toUpperCase();

    // Hàm tiện ích để bật sáng menu đang được chọn
    const navClass = ({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item";

    return (
        <aside className="sidebar">
            {/* Phần thông tin User */}
            <div className="sidebar-user-panel">
                <div className="user-info">
                    <p>{user?.displayName  || 'admin'}</p>
                    <span className="online-status">
                        <span className="status-dot"></span> Online
                    </span>
                </div>
            </div>

            <ul className="sidebar-menu">
                <li>
                    <NavLink to="/dashboard" className={navClass}>
                        <span className="menu-icon">🏠</span> Trang chủ
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/products" className={navClass}>
                        <span className="menu-icon">📦</span> Hàng Hóa
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/suppliers" className={navClass}>
                        <span className="menu-icon">🏢</span> Nhà Cung Cấp
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/categories" className={navClass}>
                        <span className="menu-icon">🏷️</span> Quản Lý Loại Hàng
                    </NavLink>
                </li>

                {/* --- NHÓM MUA HÀNG & ĐƠN HÀNG --- */}
                {(role === 'ADMIN' || role === 'MUAHANG') && (
                    <li>
                        <NavLink to="/don-hang" className={navClass}>
                            <span className="menu-icon">📝</span> Lên Đơn (PO)
                        </NavLink>
                    </li>
                )}

                {(role === 'ADMIN' || role === 'KHO') && (
                    <li>
                        <NavLink to="/nhap-kho" className={navClass}>
                            <span className="menu-icon">📥</span> Nhập Kho
                        </NavLink>
                        <NavLink to ="/lich-su-xuat-kho" className={navClass}>
                            <span className="menu-icon">📥</span> Lich Su Xuất Kho
                        </NavLink>
                        {/* Thêm menu Lập lệnh xuất kho */}
                        
                    </li>
                )}
                {/* Lập lệnh xuat */}
                {(role === 'ADMIN' || role === 'KHO') && (
                    <li>
                        <NavLink to="/lap-lenh-xuat" className={navClass}>
                            <span className="menu-icon">📥</span> Lập Lệnh Xuất
                        </NavLink>
                    </li>
                )}
                
                <li>
                    <NavLink to="/danh-sach-po" className={navClass}>
                        <span className="menu-icon">📋</span> Danh Sách Đơn Hàng
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/don-giao-thieu" className={navClass}>
                        <span className="menu-icon">📋</span> Đơn Giao Thiếu
                    </NavLink>
                </li>

                {/* --- NHÓM KHO VẬN --- */}
                {(role === 'ADMIN' || role === 'KHO') && (
                    <li>
                        <NavLink to="/xuat-kho" className={navClass}>
                            <span className="menu-icon">📤</span> Xuất Kho
                        </NavLink>
                    </li>
                )}

                {role === 'ADMIN' && (
                    <li>
                        <NavLink to="/tai-khoan" className={navClass}>
                            <span className="menu-icon">👥</span> Quản Lý Tài Khoản
                        </NavLink>
                    </li>
                )}

                {role === 'ADMIN' && (
                    <li>
                        <NavLink to="/admin/logs" className={navClass}>
                            <span className="menu-icon">📜</span> Nhật Ký Hệ Thống
                        </NavLink>
                    </li>
                )}
            </ul>
        </aside>
    );
};

export default Sidebar;