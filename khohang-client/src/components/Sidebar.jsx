import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import {
    FiHome, FiBox, FiLayers, FiTruck, FiShoppingCart,
    FiFileText, FiArchive, FiClock, FiShield, FiUsers, FiActivity,
    FiDownload, FiUpload, FiChevronDown
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    // Quản lý đóng mở menu
    const [openMenus, setOpenMenus] = useState({
        danhMuc: true,
        muaHang: false,
        kho: true, // Mặc định mở kho cho tiện
        quanTri: false
    });

    if (!user) return null;

    const role = user?.role?.toUpperCase();
    const isAdmin = role === 'ADMIN';
    const isMuaHang = role === 'MUAHANG';
    const isKho = role === 'KHO' || role === 'QUANLYKHO';

    const navClass = ({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item";

    const toggleMenu = (menu) => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-user-panel">
                <div className="user-avatar">
                    {user?.hoTen?.charAt(0) || 'A'}
                </div>
                <div className="user-info">
                    <p className="user-name">{user?.hoTen  || 'Người dùng'}</p>
                    <span className="user-role">{role}</span>
                </div>
            </div>

            <ul className="sidebar-menu">
                {/* --- TỔNG QUAN --- */}
                <li className="sidebar-header">HỆ THỐNG</li>
                <li>
                    <NavLink to="/dashboard" className={navClass}>
                        <FiHome className="menu-icon-svg" /> <span>Trang chủ</span>
                    </NavLink>
                </li>

                {/* --- NHÓM DANH MỤC --- */}
                <li>
                    <div className={`sidebar-dropdown-header ${openMenus.danhMuc ? 'open' : ''}`} onClick={() => toggleMenu('danhMuc')}>
                        <div className="header-left">
                            <FiLayers className="menu-icon-svg" /> <span>Danh Mục</span>
                        </div>
                        <FiChevronDown className="arrow-icon" />
                    </div>
                    {openMenus.danhMuc && (
                        <ul className="sidebar-submenu">
                            <li><NavLink to="/products" className={navClass}><FiBox /> Hàng Hóa</NavLink></li>
                            <li><NavLink to="/categories" className={navClass}><FiLayers /> Loại Hàng</NavLink></li>
                            <li><NavLink to="/suppliers" className={navClass}><FiTruck /> Nhà Cung Cấp</NavLink></li>
                        </ul>
                    )}
                </li>

                {/* --- NHÓM MUA HÀNG --- */}
                <li>
                    <div className={`sidebar-dropdown-header ${openMenus.muaHang ? 'open' : ''}`} onClick={() => toggleMenu('muaHang')}>
                        <div className="header-left">
                            <FiShoppingCart className="menu-icon-svg" /> <span>Nghiệp Vụ Mua</span>
                        </div>
                        <FiChevronDown className="arrow-icon" />
                    </div>
                    {openMenus.muaHang && (
                        <ul className="sidebar-submenu">
                            {(isAdmin || isMuaHang) && (
                                <li><NavLink to="/don-hang" className={navClass}><FiFileText /> Lên Đơn (PO)</NavLink></li>
                            )}
                            <li><NavLink to="/danh-sach-po" className={navClass}><FiActivity /> Danh Sách PO</NavLink></li>
                            <li><NavLink to="/don-giao-thieu" className={navClass}><FiClock /> Đơn Giao Thiếu</NavLink></li>
                        </ul>
                    )}
                </li>

                {/* --- NHÓM KHO VẬN (CẬP NHẬT MỚI) --- */}
                {(isAdmin || isKho) && (
                    <li>
                        <div className={`sidebar-dropdown-header ${openMenus.kho ? 'open' : ''}`} onClick={() => toggleMenu('kho')}>
                            <div className="header-left">
                                <FiArchive className="menu-icon-svg" /> <span>Kho Vận</span>
                            </div>
                            <FiChevronDown className="arrow-icon" />
                        </div>
                        {openMenus.kho && (
                            <ul className="sidebar-submenu">
                                <li className="submenu-label">Giao dịch</li>
                                <li><NavLink to="/nhap-kho" className={navClass}><FiDownload /> Nhập Kho</NavLink></li>
                                <li><NavLink to="/xuat-kho" className={navClass}><FiUpload /> Xuất Kho</NavLink></li>

                                <li className="submenu-label">Lệnh & Yêu cầu</li>
                                <li><NavLink to="/lap-lenh-yeu-cau-mua" className={navClass}><FiFileText /> Yêu Cầu Mua</NavLink></li>
                                <li><NavLink to="/lap-lenh-xuat" className={navClass}><FiFileText /> Yêu Cầu Xuất</NavLink></li>

                                <li className="submenu-label">Lịch sử dữ liệu</li>
                                <li><NavLink to="/lich-su-nhap-kho" className={navClass}><FiClock /> LS Nhập Kho</NavLink></li>
                                <li><NavLink to="/lich-su-xuat-kho" className={navClass}><FiClock /> LS Xuất Kho</NavLink></li>
                                <li><NavLink to="/lich-su-yeu-cau-mua" className={navClass}><FiClock /> LS Yêu Cầu Mua</NavLink></li>
                                <li><NavLink to="/lich-su-yeu-cau-xuat" className={navClass}><FiClock /> LS Yêu Cầu Xuất</NavLink></li>
                            </ul>
                        )}
                    </li>
                )}

                {/* --- QUẢN TRỊ --- */}
                {isAdmin && (
                    <li>
                        <div className={`sidebar-dropdown-header ${openMenus.quanTri ? 'open' : ''}`} onClick={() => toggleMenu('quanTri')}>
                            <div className="header-left">
                                <FiShield className="menu-icon-svg" /> <span>Hệ Thống</span>
                            </div>
                            <FiChevronDown className="arrow-icon" />
                        </div>
                        {openMenus.quanTri && (
                            <ul className="sidebar-submenu">
                                <li><NavLink to="/duyet-yeu-cau-mua" className={navClass}><FiActivity /> Duyệt Mua</NavLink></li>
                                <li><NavLink to="/duyet-yeu-cau-xuat" className={navClass}><FiActivity /> Duyệt Xuất</NavLink></li>
                                <li><NavLink to="/tai-khoan" className={navClass}><FiUsers /> Tài Khoản</NavLink></li>
                                <li><NavLink to="/admin/logs" className={navClass}><FiActivity /> Logs Hệ Thống</NavLink></li>
                            </ul>
                        )}
                    </li>
                )}
            </ul>
        </aside>
    );
};

export default Sidebar;