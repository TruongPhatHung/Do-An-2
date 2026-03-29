import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    // State quản lý việc đóng/mở của các menu dropdown
    // Mặc định cho mở nhóm Danh Mục, các nhóm khác đóng cho gọn
    const [openMenus, setOpenMenus] = useState({
        danhMuc: true,
        muaHang: false,
        kho: false,
        quanTri: false
    });

    if (!user) return null;

    const role = user?.role?.toUpperCase();

    // Phân nhóm quyền hạn
    const isAdmin = role === 'ADMIN';
    const isMuaHang = role === 'MUAHANG';
    const isKho = role === 'KHO' || role === 'QUANLYKHO';

    const navClass = ({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item";

    // Hàm toggle mở/đóng menu
    const toggleMenu = (menu) => {
        setOpenMenus(prevState => ({
            ...prevState,
            [menu]: !prevState[menu]
        }));
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-user-panel">
                <div className="user-info">
                    <p>{user?.displayName || 'Admin'}</p>
                    <span className="online-status">
                        <span className="status-dot"></span> Online
                    </span>
                </div>
            </div>

            <ul className="sidebar-menu">
                {/* --- TRANG CHỦ (Không nằm trong dropdown) --- */}
                <li className="sidebar-header">TỔNG QUAN</li>
                <li>
                    <NavLink to="/dashboard" className={navClass}>
                        <span className="menu-icon">🏠</span> Trang chủ
                    </NavLink>
                </li>

                {/* --- NHÓM DANH MỤC --- */}
                <li className="sidebar-header">QUẢN LÝ DỮ LIỆU</li>
                <li>
                    <div className={`sidebar-dropdown-header ${openMenus.danhMuc ? 'open' : ''}`} onClick={() => toggleMenu('danhMuc')}>
                        <span className="menu-icon">📁</span> Danh Mục
                        <span className="dropdown-arrow">▼</span>
                    </div>
                    {openMenus.danhMuc && (
                        <ul className="sidebar-submenu">
                            <li>
                                <NavLink to="/products" className={navClass}>📦 Hàng Hóa</NavLink>
                            </li>
                            <li>
                                <NavLink to="/categories" className={navClass}>🏷️ Loại Hàng</NavLink>
                            </li>
                            <li>
                                <NavLink to="/suppliers" className={navClass}>🏢 Nhà Cung Cấp</NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* --- NHÓM NGHIỆP VỤ MUA HÀNG --- */}
                <li className="sidebar-header">NGHIỆP VỤ</li>
                <li>
                    <div className={`sidebar-dropdown-header ${openMenus.muaHang ? 'open' : ''}`} onClick={() => toggleMenu('muaHang')}>
                        <span className="menu-icon">🛒</span> Mua Hàng
                        <span className="dropdown-arrow">▼</span>
                    </div>
                    {openMenus.muaHang && (
                        <ul className="sidebar-submenu">
                            {(isAdmin || isMuaHang) && (
                                <li>
                                    <NavLink to="/don-hang" className={navClass}>📝 Lên Đơn (PO)</NavLink>
                                </li>
                            )}
                            <li>
                                <NavLink to="/danh-sach-po" className={navClass}>📋 Danh Sách Đơn Hàng</NavLink>
                            </li>
                            <li>
                                <NavLink to="/don-giao-thieu" className={navClass}>⚠️ Đơn Giao Thiếu</NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* --- NHÓM NGHIỆP VỤ KHO --- */}
                {(isAdmin || isKho) && (
                    <li>
                        <div className={`sidebar-dropdown-header ${openMenus.kho ? 'open' : ''}`} onClick={() => toggleMenu('kho')}>
                            <span className="menu-icon">🏭</span> Kho Vận
                            <span className="dropdown-arrow">▼</span>
                        </div>
                        {openMenus.kho && (
                            <ul className="sidebar-submenu">
                                <li>
                                    <NavLink to="/nhap-kho" className={navClass}>📥 Nhập Kho</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/xuat-kho" className={navClass}>📤 Xuất Kho</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/lap-lenh-xuat" className={navClass}>📄 Lập Lệnh Xuất</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/lap-lenh-yeu-cau-mua" className={navClass}>📄 Lập Yêu Cầu Mua</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/lich-su-nhap-kho" className={navClass}>📜 Lịch Sử Nhập Kho</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/lich-su-xuat-kho" className={navClass}>📜 Lịch Sử Xuất Kho</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/lich-su-yeu-cau-mua" className={navClass}>📜 LS Yêu Cầu Mua</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/lich-su-yeu-cau-xuat" className={navClass}>📜 LS Yêu Cầu Xuất</NavLink>
                                </li>
                            </ul>
                        )}
                    </li>
                )}

                {/* --- NHÓM QUẢN TRỊ & XÉT DUYỆT --- */}
                {isAdmin && (
                    <>
                        <li className="sidebar-header">QUẢN TRỊ HỆ THỐNG</li>
                        <li>
                            <div className={`sidebar-dropdown-header ${openMenus.quanTri ? 'open' : ''}`} onClick={() => toggleMenu('quanTri')}>
                                <span className="menu-icon">🛡️</span> Quản Trị & Xét Duyệt
                                <span className="dropdown-arrow">▼</span>
                            </div>
                            {openMenus.quanTri && (
                                <ul className="sidebar-submenu">
                                    <li>
                                        <NavLink to="/duyet-yeu-cau-mua" className={navClass}>⏳ Duyệt Yêu Cầu Mua</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/duyet-yeu-cau-xuat" className={navClass}>⏳ Duyệt Yêu Cầu Xuất</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/tai-khoan" className={navClass}>👥 Quản Lý Tài Khoản</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/admin/logs" className={navClass}>⚙️ Nhật Ký Hệ Thống</NavLink>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </>
                )}
            </ul>
        </aside>
    );
};

export default Sidebar;