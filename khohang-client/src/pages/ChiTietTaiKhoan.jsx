import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import {
    FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar,
    FiShield, FiCheckCircle, FiActivity, FiClock, FiFileText, FiTrendingUp,
    FiBox, FiAlertTriangle, FiCheckSquare, FiFilter
} from 'react-icons/fi';
import './ChiTietTaiKhoan.css';
import adminAvatar from "../components/avarta/Screenshot 2026-03-21 185323 copy.png";
import khoAvatar from "../components/avarta/Screenshot 2026-03-21 185359.png";

const ChiTietTaiKhoan = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [profileStats, setProfileStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    // 🎯 THÊM STATE QUẢN LÝ BỘ LỌC THỜI GIAN CHO KPI
    const [kpiFilter, setKpiFilter] = useState('thang');

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                // 1. Lấy thông tin cơ bản
                const resUser = await api.get(`/users/${id}`);
                setUser(resUser.data);

                // 2. Lấy thống kê - TRUYỀN THÊM FILTER VÀO ĐÂY
                const resStats = await api.get(`/users/${id}/profile-stats?filter=${kpiFilter}&t=${new Date().getTime()}`);
                setProfileStats(resStats.data);
            } catch (error) {
                console.error("Lỗi tải profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
        // 🎯 THÊM kpiFilter vào dependencies để khi đổi filter nó tự load lại số
    }, [id, activeTab, kpiFilter]); // 🎯 Mỗi khi sếp đổi Tab, nó sẽ load lại số liệu mới nhất // Khi đổi filter thì tự động gọi lại API

    const getRoleAvatar = (avatarDb, vaiTro) => {
        if (avatarDb) return avatarDb;
        const role = vaiTro?.toUpperCase();
        if (role === 'ADMIN') return adminAvatar;
        if (role === 'KHO' || role === 'QUANLYKHO') return khoAvatar;
        if (role === 'MUAHANG') return 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        return 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    };

    // 🎯 HÀM RENDER KPI ĐỘNG THEO TỪNG VAI TRÒ
    const renderRoleBasedKPIs = (vaiTro, kpis) => {
        const role = vaiTro?.toUpperCase();

        if (role === 'ADMIN') {
            return (
                <>
                    <div className="kpi-box box-inventory">
                        <FiCheckSquare className="kpi-icon" />
                        <h3>{kpis?.soPhieuDaDuyet || 0}</h3>
                        <p>Số Phiếu Yêu Cầu Đã Duyệt</p>
                    </div>
                    <div className="kpi-box box-inbound">
                        <FiTrendingUp className="kpi-icon" />
                        <h3>{kpis?.tyLeLenDon || "0%"}</h3>
                        <p>Tỷ lệ Yêu Cầu lên thành Đơn</p>
                    </div>
                </>
            );
        }

        if (role === 'KHO' || role === 'NHANVIENKHO') {
            return (
                <>
                    <div className="kpi-box box-inbound">
                        <FiFileText className="kpi-icon" />
                        <h3>{kpis?.phieuNhapThucHien || 0}</h3>
                        <p>Phiếu Nhập đã xử lý</p>
                    </div>
                    <div className="kpi-box box-outbound">
                        <FiFileText className="kpi-icon" />
                        <h3>{kpis?.phieuXuatThucHien || 0}</h3>
                        <p>Phiếu Xuất đã thực hiện</p>
                    </div>
                    <div className="kpi-box box-inventory">
                        <FiBox className="kpi-icon" />
                        <h3>{(kpis?.tongHangHoaXuLy || 0).toLocaleString()}</h3>
                        <p>Sản phẩm đã luân chuyển</p>
                    </div>
                </>
            );
        }

        if (role === 'QUANLYKHO') {
            return (
                <>
                    <div className="kpi-box box-inventory">
                        <FiFileText className="kpi-icon" />
                        <h3>{kpis?.soYeuCauDaLen || 0}</h3>
                        <p>Yêu Cầu (Nhập/Xuất) đã lập</p>
                    </div>
                    <div className="kpi-box box-inbound">
                        <FiBox className="kpi-icon" />
                        <h3>{kpis?.tongPhieuKho || 0}</h3>
                        <p>Tổng Phiếu chạy qua kho</p>
                    </div>
                </>
            );
        }

        if (role === 'MUAHANG') {
            return (
                <>
                    <div className="kpi-box box-inventory">
                        <FiFileText className="kpi-icon" />
                        <h3>{kpis?.soDonDatHang || 0}</h3>
                        <p>Đơn Đặt Hàng (PO) đã lên</p>
                    </div>
                    <div className="kpi-box box-outbound">
                        <FiAlertTriangle className="kpi-icon" />
                        <h3>{kpis?.tyLeGiaoThieu || "0%"}</h3>
                        <p>Tỷ lệ NCC giao thiếu hàng</p>
                    </div>
                    <div className="kpi-box box-inbound">
                        <FiCheckCircle className="kpi-icon" />
                        <h3>{kpis?.donHoanThanh || 0}</h3>
                        <p>Đơn PO đã hoàn thành</p>
                    </div>
                </>
            );
        }

        return <p style={{ gridColumn: '1/-1', color: '#888', textAlign: 'center', padding: '20px' }}>Hệ thống chưa thiết lập KPI cho vai trò này.</p>;
    };

    if (loading) return <div className="ct-loading">⏳ Đang đồng bộ thông tin nhân sự...</div>;
    if (!user) return <div className="ct-error">Không tìm thấy thông tin tài khoản!</div>;

    const isUserOnline = user.isOnline !== undefined ? user.isOnline : (user.vaiTro === 'ADMIN');

    return (
        <div className="ct-container">
            <div className="ct-header-bg"></div>

            <div className="ct-header-actions">
                <button className="btn-back" onClick={() => navigate('/tai-khoan')}>
                    <FiArrowLeft /> Quay lại danh sách
                </button>
                <h2 className="ct-page-title">Quản Lý Hồ Sơ Nhân Sự</h2>
            </div>

            <div className="ct-layout">
                {/* === CỘT TRÁI: THẺ NHÂN VIÊN === */}
                <div className="ct-sidebar">
                    <div className="ct-avatar-container">
                        <img src={getRoleAvatar(user.avatar, user.vaiTro)} alt="Avatar" className="ct-avatar" />
                        <span className={`status-badge ${isUserOnline ? 'online' : 'offline'}`}></span>
                    </div>

                    <h3 className="ct-name">{user.hoTen || "Chưa cập nhật tên"}</h3>
                    <p className="ct-username">@{user.tenDangNhap}</p>
                    <p className={`ct-role role-${user.vaiTro?.toLowerCase()}`}><FiShield /> {user.vaiTro}</p>

                    {/* LÝ LỊCH CÔNG VIỆC TỰ ĐỘNG TÍNH */}
                    <div style={{ background: '#f8f9fc', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.95rem', color: '#4e73df', fontWeight: 'bold', border: '1px solid #eaecf4' }}>
                        <FiClock style={{ marginBottom: '-2px', marginRight: '6px' }} />
                        Thời gian công tác: <br />
                        <span style={{ color: '#e74a3b', fontSize: '1.1rem' }}>{profileStats?.thamNien || '...'}</span>
                    </div>

                    <div className="ct-contact-list">
                        <div className="contact-item">
                            <FiMail className="contact-icon" />
                            <span>{user.email || 'Chưa có Email'}</span>
                        </div>
                        <div className="contact-item">
                            <FiPhone className="contact-icon" />
                            <span>{user.so_dt || 'Chưa có SĐT'}</span>
                        </div>
                        <div className="contact-item">
                            <FiMapPin className="contact-icon" />
                            <span>{user.diaChi || 'Chưa cập nhật địa chỉ'}</span>
                        </div>
                    </div>

                    <button className="btn-edit-profile">Sửa hồ sơ / Phân quyền</button>
                </div>

                {/* === CỘT PHẢI: KHU VỰC TABS === */}
                <div className="ct-main-content">
                    <div className="ct-tabs">
                        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                            <FiUser /> Thông tin cơ bản
                        </button>
                        <button className={`tab-btn ${activeTab === 'kpi' ? 'active' : ''}`} onClick={() => setActiveTab('kpi')}>
                            <FiActivity /> Hiệu suất ({user.vaiTro})
                        </button>
                        <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
                            <FiClock /> Lịch sử hoạt động
                        </button>
                    </div>

                    <div className="tab-content-area">

                        {/* TAB 1: THÔNG TIN */}
                        {activeTab === 'info' && (
                            <div className="tab-pane fade-in">
                                <h5 className="pane-title">Hồ Sơ Cá Nhân</h5>
                                <div className="ct-info-grid">
                                    <div className="ct-info-item">
                                        <FiUser className="ct-icon" />
                                        <div><label>Giới tính</label><p>{user.gioiTinh || '---'}</p></div>
                                    </div>
                                    <div className="ct-info-item">
                                        <FiCalendar className="ct-icon" />
                                        <div><label>Ngày sinh</label><p>{user.ngaySinh || '---'}</p></div>
                                    </div>
                                    <div className="ct-info-item">
                                        <FiBriefcase className="ct-icon" />
                                        <div><label>Mã nhân sự (ID Hệ thống)</label><p>#{user.id || user.maND}</p></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: HIỆU SUẤT LÀM VIỆC CÓ BỘ LỌC */}
                        {activeTab === 'kpi' && (
                            <div className="tab-pane fade-in">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                                    <h5 className="pane-title" style={{ margin: 0 }}>Chỉ số đánh giá KPI</h5>

                                    {/* 🎯 BỘ LỌC THỜI GIAN NHƯ SẾP YÊU CẦU */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FiFilter color="#858796" />
                                        <select
                                            value={kpiFilter}
                                            onChange={(e) => setKpiFilter(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d3e2', color: '#4e73df', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
                                        >
                                            <option value="ngay">Hôm nay</option>
                                            <option value="tuan">Tuần này</option>
                                            <option value="thang">Tháng này</option>
                                            <option value="quy">Quý này</option>
                                            <option value="nam">Năm nay</option>
                                            <option value="all">Toàn thời gian</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="kpi-grid">
                                    {renderRoleBasedKPIs(user.vaiTro, profileStats?.kpis)}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: LỊCH SỬ HOẠT ĐỘNG (GHI CHÚ SƠ SƠ THEO GIỜ) */}
                        {activeTab === 'logs' && (
                            <div className="tab-pane fade-in">
                                <h5 className="pane-title">Nhật ký công việc gần đây</h5>
                                <div className="timeline-container">
                                    {profileStats?.lichSuHoatDong?.length > 0 ? (
                                        profileStats.lichSuHoatDong.map((log, index) => (
                                            <div className="timeline-item" key={index}>
                                                <div className={`timeline-dot ${log.loai === 'SUCCESS' ? 'bg-success' : 'bg-primary'}`}></div>
                                                <div className="timeline-content">
                                                    <strong>{log.hanhDong}</strong>
                                                    <span className="timeline-time">{log.thoiGian}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '30px', color: '#858796' }}>
                                            <FiClock style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.5 }} />
                                            <p>Chưa ghi nhận hoạt động nào của nhân sự này.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChiTietTaiKhoan;