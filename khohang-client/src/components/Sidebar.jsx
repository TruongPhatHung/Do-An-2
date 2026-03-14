import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    const role = user?.role?.toUpperCase();

    return (
        <aside className="sidebar">
            <ul className="sidebar-menu">

                <li>
                    <NavLink to="/products" className="sidebar-item">
                        📦 Hàng Hóa
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/suppliers" className="sidebar-item">
                        🏢 Nhà Cung Cấp
                    </NavLink>
                </li>

                {(role === 'ADMIN' || role === 'MUAHANG') && (
                    <li>
                        <NavLink to="/don-hang" className="sidebar-item">
                            📝 Lên Đơn (PO)
                        </NavLink>
                    </li>
                )}

                {(role === 'ADMIN' || role === 'KHO') && (
                    <li>
                        <NavLink to="/nhap-kho" className="sidebar-item">
                            📥 Nhập Kho
                        </NavLink>
                    </li>
                )}

                <li>
                    <NavLink to="/danh-sach-po" className="sidebar-item">
                        📋 Danh Sách Đơn Hàng
                    </NavLink>
                </li>

                {(role === 'ADMIN' || role === 'KHO') && (
                    <li>
                        <NavLink to="/xuat-kho" className="sidebar-item">
                            📤 Xuất Kho
                        </NavLink>
                    </li>
                )}

                {(role === 'ADMIN' || role === 'MUAHANG') && (
                    <li>
                        <NavLink to="/dashboard" className="sidebar-item">
                            📊 Dashboard
                        </NavLink>
                    </li>
                )}

                {role === 'ADMIN' && (
                    <li>
                        <NavLink to="/tai-khoan" className="sidebar-item">
                            👥 Quản Lý Tài Khoản
                        </NavLink>
                    </li>
                )}
                {role =='ADMIN' &&(
                    <li>
                        <NavLink to="/admin/logs" className="sidebar-item">
                        📜 Nhật Ký Hệ Thống
                        </NavLink>
                    </li>
                )}

            </ul>
        </aside>
    );
};

export default Sidebar;