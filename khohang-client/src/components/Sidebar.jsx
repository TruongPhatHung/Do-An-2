import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import {
    FiBox, FiLayers, FiTruck, FiShoppingCart,
    FiFileText, FiArchive, FiClock, FiShield, FiUsers, FiActivity,
    FiDownload, FiUpload, FiChevronDown, FiBriefcase, FiClipboard,
    FiAlertCircle, FiPieChart, FiBell, FiSettings
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    // 🎯 PHÂN QUYỀN CHUẨN RẠCH RÒI THEO USE CASE
    const role = user?.role?.toUpperCase() || '';
    const isAdmin = role === 'ADMIN';
    const isMuaHang = role === 'MUAHANG';
    const isQuanLyKho = role === 'QUANLYKHO';
    const isNhanVienKho = role === 'KHO';
    const isKho = isNhanVienKho || isQuanLyKho; // Nhóm dùng chung cho kho
    const isKinhdoanh = role === 'NV_KD';

    const [openMenus, setOpenMenus] = useState({
        danhMuc: !isAdmin, // Admin không xem danh mục hàng hóa
        kinhDoanh: isKinhdoanh,
        muaHang: isMuaHang,
        kho: isKho,
        quanTri: isQuanLyKho,
        heThong: isAdmin // Menu dành riêng cho Admin
    });

    const navClass = ({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item";

    const toggleMenu = (menu) => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-user-panel">
                <div className="user-avatar">
                    {user?.hoTen?.charAt(0) || 'S'}
                </div>
                <div className="user-info">
                    <p className="user-name">{user?.hoTen || 'Người dùng'}</p>
                    <span className="user-role">{role}</span>
                </div>
            </div>

            <ul className="sidebar-menu">

                {/* 🎯 [UC: Quản lý kho] - Xem tổng quan báo cáo */}
                {(isQuanLyKho || isAdmin) && (
                    <>
                        <li className="sidebar-header">BÁO CÁO CHIẾN LƯỢC</li>
                        <li>
                            <NavLink to="/dashboard" className={navClass}>
                                <FiPieChart className="menu-icon-svg" /> <span>Thống Kê Tổng Quan</span>
                            </NavLink>
                        </li>
                    </>
                )}

                {/* --- 1. NHÓM DANH MỤC (Dành cho các role nghiệp vụ, Admin KHÔNG được thấy) --- */}
                {!isAdmin && (
                    <li>
                        <div className={`sidebar-dropdown-header ${openMenus.danhMuc ? 'open' : ''}`} onClick={() => toggleMenu('danhMuc')}>
                            <div className="header-left">
                                <FiLayers className="menu-icon-svg" /> <span>Danh Mục</span>
                            </div>
                            <FiChevronDown className="arrow-icon" />
                        </div>
                        {openMenus.danhMuc && (
                            <ul className="sidebar-submenu">
                                <li><NavLink to="/categories" className={navClass}><FiClock /> Loại Hàng</NavLink></li>
                                <li><NavLink to="/products" className={navClass}><FiBox /> Hàng Hóa</NavLink></li>

                                {/* 🎯 [UC: Quản lý kho] - Quản lý nhà cung cấp */}
                                {isQuanLyKho && (
                                    <li><NavLink to="/suppliers" className={navClass}><FiTruck /> Nhà Cung Cấp</NavLink></li>
                                )}
                            </ul>
                        )}
                    </li>
                )}

                {/* --- 2. NGHIỆP VỤ KINH DOANH --- */}
                {isKinhdoanh && (
                    <li>
                        <div className={`sidebar-dropdown-header ${openMenus.kinhDoanh ? 'open' : ''}`} onClick={() => toggleMenu('kinhDoanh')}>
                            <div className="header-left">
                                <FiBriefcase className="menu-icon-svg" /> <span>Kinh Doanh</span>
                            </div>
                            <FiChevronDown className="arrow-icon" />
                        </div>
                        {openMenus.kinhDoanh && (
                            <ul className="sidebar-submenu">
                                <li className="submenu-label">Giao dịch với Khách</li>
                                <li><NavLink to="/lap-lenh-xuat" className={navClass}><FiFileText /> Lập Yêu Cầu Xuất</NavLink></li>
                                <li><NavLink to="/lich-su-yeu-cau-xuat" className={navClass}><FiClock /> LS Yêu Cầu Xuất</NavLink></li>

                                <li className="submenu-label">Giao dịch Hoàn/Nhập</li>
                                <li><NavLink to="/lap-lenh-yeu-cau-mua" className={navClass}><FiFileText /> Lập Yêu Cầu Nhập</NavLink></li>
                                <li><NavLink to="/lich-su-yeu-cau-mua" className={navClass}><FiClock /> LS Yêu Cầu Nhập</NavLink></li>
                            </ul>
                        )}
                    </li>
                )}

                {/* --- 3. NGHIỆP VỤ MUA HÀNG --- */}
                {isMuaHang && (
                    <li>
                        <div className={`sidebar-dropdown-header ${openMenus.muaHang ? 'open' : ''}`} onClick={() => toggleMenu('muaHang')}>
                            <div className="header-left">
                                <FiShoppingCart className="menu-icon-svg" /> <span>Mua Hàng (PO)</span>
                            </div>
                            <FiChevronDown className="arrow-icon" />
                        </div>
                        {openMenus.muaHang && (
                            <ul className="sidebar-submenu">
                                <li><NavLink to="/don-hang" className={navClass}><FiClipboard /> Lập Đơn Đặt Hàng</NavLink></li>
                                <li><NavLink to="/danh-sach-po" className={navClass}><FiActivity /> Quản Lý Danh Sách PO</NavLink></li>
                            </ul>
                        )}
                    </li>
                )}

                {/* --- 4. NGHIỆP VỤ KHO VẬN --- */}
                {isKho && (
                    <li>
                        <div className={`sidebar-dropdown-header ${openMenus.kho ? 'open' : ''}`} onClick={() => toggleMenu('kho')}>
                            <div className="header-left">
                                <FiArchive className="menu-icon-svg" /> <span>Kho Vận</span>
                            </div>
                            <FiChevronDown className="arrow-icon" />
                        </div>
                        {openMenus.kho && (
                            <ul className="sidebar-submenu">
                                {/* CHỈ Nhân viên kho được làm thao tác thực tế */}
                                {isNhanVienKho && (
                                    <>
                                        <li><NavLink to="/nhap-kho" className={navClass}><FiDownload /> Nhập Kho Thực Tế</NavLink></li>
                                        <li><NavLink to="/xuat-kho" className={navClass}><FiUpload /> Xuất Kho Thực Tế</NavLink></li>
                                        <li><NavLink to="/don-giao-thieu" className={navClass}><FiAlertCircle /> Xử Lý Đơn Giao Thiếu</NavLink></li>
                                        <li><NavLink to="/kiem-ke" className={navClass}><FiClipboard /> Kiểm Tra Tồn Kho (Kiểm kê)</NavLink></li>
                                    </>
                                )}

                                {/* [UC: Xem lịch sử giao dịch] - Cả QL Kho và NV Kho đều xem được */}
                                <li className="submenu-label">Lịch sử giao dịch</li>
                                <li><NavLink to="/lich-su-nhap-kho" className={navClass}><FiClock /> LS Nhập Kho</NavLink></li>
                                <li><NavLink to="/lich-su-xuat-kho" className={navClass}><FiClock /> LS Xuất Kho</NavLink></li>
                            </ul>
                        )}
                    </li>
                )}

                {/* --- 5. PHÊ DUYỆT (Chỉ Quản lý kho) --- */}
                {isQuanLyKho && (
                    <li>
                        <div className={`sidebar-dropdown-header ${openMenus.quanTri ? 'open' : ''}`} onClick={() => toggleMenu('quanTri')}>
                            <div className="header-left">
                                <FiShield className="menu-icon-svg" /> <span>Quản Trị & Phê Duyệt</span>
                            </div>
                            <FiChevronDown className="arrow-icon" />
                        </div>
                        {openMenus.quanTri && (
                            <ul className="sidebar-submenu">
                                <li><NavLink to="/duyet-yeu-cau-mua" className={navClass}><FiActivity /> Duyệt YC Nhập Kho</NavLink></li>
                                <li><NavLink to="/duyet-yeu-cau-xuat" className={navClass}><FiActivity /> Duyệt YC Xuất Kho</NavLink></li>
                                <li><NavLink to="/canh-bao-ton-kho" className={navClass}><FiBell /> Cảnh Báo Tồn Kho</NavLink></li>
                            </ul>
                        )}
                    </li>
                )}

                {/* --- 6. HỆ THỐNG (CHỈ DÀNH RIÊNG CHO ADMIN) --- */}
                {/* 🎯 [UC: Admin -> Quản lý tài khoản, Xem nhật ký hoạt động] */}
                {isAdmin && (
                    <li>
                        <div className={`sidebar-dropdown-header ${openMenus.heThong ? 'open' : ''}`} onClick={() => toggleMenu('heThong')}>
                            <div className="header-left">
                                <FiSettings className="menu-icon-svg" /> <span>Hệ Thống Admin</span>
                            </div>
                            <FiChevronDown className="arrow-icon" />
                        </div>
                        {openMenus.heThong && (
                            <ul className="sidebar-submenu">
                                <li><NavLink to="/tai-khoan" className={navClass}><FiUsers /> Quản Lý Tài Khoản</NavLink></li>
                                <li><NavLink to="/admin/logs" className={navClass}><FiActivity /> Nhật Ký Hoạt Động (Logs)</NavLink></li>
                            </ul>
                        )}
                    </li>
                )}
            </ul>
        </aside>
    );
};

export default Sidebar;