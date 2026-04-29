import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import {
    FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar,
    FiShield, FiCheckCircle, FiActivity, FiClock, FiFileText, FiTrendingUp,
    FiBox, FiAlertTriangle, FiCheckSquare, FiFilter
} from 'react-icons/fi';
import { toast } from 'react-toastify'; // Nhớ thêm import này sếp nhé
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
    const [kpiFilter, setKpiFilter] = useState('thang');

    // 🎯 CHỈ DÙNG 2 BIẾN NÀY ĐỂ ĐẾM GIỜ CHO CHUẨN
    const [sessionSeconds, setSessionSeconds] = useState(0);
    const [totalSeconds, setTotalSeconds] = useState(0);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const t = new Date().getTime();
                // Kéo dữ liệu tươi mới từ Server
                const [resUser, resStats] = await Promise.all([
                    api.get(`/users/${id}?t=${t}`),
                    api.get(`/users/${id}/profile-stats?filter=${kpiFilter}&t=${t}`)
                ]);

                setUser(resUser.data);
                setProfileStats(resStats.data);

                // Gán tổng tích lũy từ DB (Giữ cố định theo ý sếp, chỉ nhảy khi đăng xuất rồi vào lại)
                setTotalSeconds(Number(resUser.data.tongThoiGianOnline) || 0);

            } catch (error) {
                console.error("Lỗi tải profile:", error);
                toast.error("Không thể tải thông tin nhân sự!");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [id, kpiFilter]);

    // ==========================================================
    // 🎯 LOGIC ĐỒNG HỒ: FIX LỖI CRASH KHI GẶP DỮ LIỆU NULL
    // ==========================================================
    useEffect(() => {
        let interval = null;

        if (user && !loading) {
            const isOnline = user.isOnline === true;

            const syncTime = () => {
                let session = 0;
                // 🎯 KIỂM TRA CHẶT CHẼ: Có đang Online và có giờ Đăng nhập không?
                if (isOnline && user.thoiGianDangNhap) {
                    try {
                        // Fix lỗi định dạng ngày an toàn hơn
                        const isoDate = user.thoiGianDangNhap.includes(' ')
                            ? user.thoiGianDangNhap.replace(' ', 'T')
                            : user.thoiGianDangNhap;

                        const loginTime = new Date(isoDate).getTime();
                        const now = new Date().getTime();

                        if (!isNaN(loginTime)) {
                            session = Math.floor((now - loginTime) / 1000);
                            if (session < 0) session = 0;
                        }
                    } catch (e) {
                        console.error("Lỗi parse ngày:", e);
                    }
                }
                setSessionSeconds(session);
            };

            syncTime();

            // Chỉ cho CA HIỆN TẠI nhảy số tích tắc
            if (isOnline) {
                interval = setInterval(() => {
                    setSessionSeconds(prev => prev + 1);
                }, 1000);
            } else {
                setSessionSeconds(0);
            }
        }

        return () => clearInterval(interval);
    }, [user, loading]);

    const formatLiveTime = (totalSecs) => {
        if (!totalSecs || totalSecs < 0) return "00:00:00";
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getRoleAvatar = (avatarDb, vaiTro) => {
        if (avatarDb) return avatarDb;
        const role = vaiTro?.toUpperCase();
        if (role === 'ADMIN') return adminAvatar;
        if (role === 'KHO' || role === 'QUANLYKHO') return khoAvatar;
        if (role === 'MUAHANG') return 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        return 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    };

    const renderRoleBasedKPIs = (vaiTro, kpis) => {
        const role = vaiTro?.toUpperCase();
        if (role === 'ADMIN') {
            return (
                <>
                    <div className="kpi-box box-inventory"><FiCheckSquare className="kpi-icon" /><h3>{kpis?.soPhieuDaDuyet || 0}</h3><p>Số Phiếu Đã Duyệt</p></div>
                    <div className="kpi-box box-inbound"><FiTrendingUp className="kpi-icon" /><h3>{kpis?.tyLeLenDon || "0%"}</h3><p>Tỷ lệ lên PO</p></div>
                </>
            );
        }
        if (role === 'KHO' || role === 'NHANVIENKHO') {
            return (
                <>
                    <div className="kpi-box box-inbound"><FiFileText className="kpi-icon" /><h3>{kpis?.phieuNhapThucHien || 0}</h3><p>Phiếu Nhập xử lý</p></div>
                    <div className="kpi-box box-outbound"><FiFileText className="kpi-icon" /><h3>{kpis?.phieuXuatThucHien || 0}</h3><p>Phiếu Xuất xử lý</p></div>
                    <div className="kpi-box box-inventory"><FiBox className="kpi-icon" /><h3>{(kpis?.tongHangHoaXuLy || 0).toLocaleString()}</h3><p>Hàng luân chuyển</p></div>
                </>
            );
        }
        if (role === 'QUANLYKHO') {
            return (
                <>
                    <div className="kpi-box box-inventory"><FiFileText className="kpi-icon" /><h3>{kpis?.soYeuCauDaLen || 0}</h3><p>Yêu Cầu đã lập</p></div>
                    <div className="kpi-box box-inbound"><FiBox className="kpi-icon" /><h3>{kpis?.tongPhieuKho || 0}</h3><p>Tổng Phiếu qua kho</p></div>
                </>
            );
        }
        if (role === 'MUAHANG') {
            return (
                <>
                    <div className="kpi-box box-inventory"><FiFileText className="kpi-icon" /><h3>{kpis?.soDonDatHang || 0}</h3><p>Đơn PO đã lên</p></div>
                    <div className="kpi-box box-outbound"><FiAlertTriangle className="kpi-icon" /><h3>{kpis?.tyLeGiaoThieu || "0%"}</h3><p>Tỷ lệ giao thiếu</p></div>
                    <div className="kpi-box box-inbound"><FiCheckCircle className="kpi-icon" /><h3>{kpis?.donHoanThanh || 0}</h3><p>Đơn PO hoàn thành</p></div>
                </>
            );
        }
        return <p>Chưa thiết lập KPI.</p>;
    };

    if (loading) return <div className="ct-loading">⏳ Đang đồng bộ thông tin nhân sự...</div>;
    if (!user) return <div className="ct-error">Không tìm thấy thông tin tài khoản!</div>;

    const isUserOnline = user?.isOnline === true;

    return (
        <div className="ct-container">
            <div className="ct-header-bg"></div>
            <div className="ct-header-actions">
                <button className="btn-back" onClick={() => navigate('/tai-khoan')}><FiArrowLeft /> Quay lại</button>
                <h2 className="ct-page-title">Quản Lý Hồ Sơ Nhân Sự</h2>
            </div>

            <div className="ct-layout">
                <div className="ct-sidebar">
                    <div className="ct-avatar-container">
                        <img src={getRoleAvatar(user.avatar, user.vaiTro)} alt="Avatar" className="ct-avatar" />
                        <span className={`status-badge ${isUserOnline ? 'online' : 'offline'}`}></span>
                    </div>
                    <h3 className="ct-name">{user.hoTen || "Ẩn danh"}</h3>
                    <p className="ct-username">@{user.tenDangNhap}</p>
                    <p className={`ct-role role-${user.vaiTro?.toLowerCase()}`}><FiShield /> {user.vaiTro}</p>

                    <div style={{ background: '#f8f9fc', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #eaecf4' }}>
                        <div style={{ borderTop: 'none', paddingBottom: '10px', fontSize: '0.9rem', color: '#4e73df', fontWeight: 'bold' }}>
                            <FiActivity style={{ marginRight: '6px' }} /> Tổng giờ làm (Đã chốt): <br />
                            <span style={{ color: '#2e59d9', fontSize: '1.2rem', marginLeft: '22px', fontFamily: 'monospace' }}>{formatLiveTime(totalSeconds)}</span>
                        </div>
                        <div style={{ borderTop: '1px solid #eaecf4', paddingTop: '10px', fontSize: '0.9rem', color: isUserOnline ? '#1cc88a' : '#858796', fontWeight: 'bold' }}>
                            <FiClock style={{ marginRight: '6px' }} /> Ca hiện tại: <br />
                            {isUserOnline ? (
                                <span style={{ color: '#e74a3b', fontSize: '1.4rem', marginLeft: '22px', fontFamily: 'monospace', textShadow: '0px 0px 5px rgba(231, 74, 59, 0.2)' }}>
                                    {formatLiveTime(sessionSeconds)} <span style={{ fontSize: '0.7rem', color: '#1cc88a' }}>(Online)</span>
                                </span>
                            ) : <span style={{ color: '#858796', marginLeft: '22px' }}>Ngoại tuyến</span>}
                        </div>
                    </div>

                    <div className="ct-contact-list">
                        <div className="contact-item"><FiMail /> <span>{user.email || '---'}</span></div>
                        <div className="contact-item"><FiPhone /> <span>{user.soDT || user.so_dt || '---'}</span></div>
                        <div className="contact-item"><FiMapPin /> <span>{user.diaChi || '---'}</span></div>
                    </div>
                    <button className="btn-edit-profile" onClick={() => navigate(`/sua-tai-khoan/${id}`)}>Chỉnh sửa hồ sơ</button>
                </div>

                <div className="ct-main-content">
                    <div className="ct-tabs">
                        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}><FiUser /> Thông tin</button>
                        <button className={`tab-btn ${activeTab === 'kpi' ? 'active' : ''}`} onClick={() => setActiveTab('kpi')}><FiActivity /> Hiệu suất</button>
                        <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}><FiClock /> Nhật ký</button>
                    </div>

                    <div className="tab-content-area">
                        {activeTab === 'info' && (
                            <div className="tab-pane fade-in">
                                <h5 className="pane-title">Hồ Sơ Cá Nhân</h5>
                                <div className="ct-info-grid">
                                    <div className="ct-info-item"><FiUser /><div><label>Giới tính</label><p>{user.gioiTinh || '---'}</p></div></div>
                                    <div className="ct-info-item"><FiCalendar /><div><label>Ngày sinh</label><p>{user.ngaySinh || '---'}</p></div></div>
                                    <div className="ct-info-item"><FiBriefcase /><div><label>Mã nhân sự</label><p>#{user.maND}</p></div></div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'kpi' && (
                            <div className="tab-pane fade-in">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h5 className="pane-title">Chỉ số đánh giá KPI</h5>
                                    <select value={kpiFilter} onChange={(e) => setKpiFilter(e.target.value)} style={{ padding: '5px 10px', borderRadius: '5px' }}>
                                        <option value="ngay">Hôm nay</option><option value="thang">Tháng này</option><option value="all">Tất cả</option>
                                    </select>
                                </div>
                                <div className="kpi-grid">{renderRoleBasedKPIs(user.vaiTro, profileStats?.kpis)}</div>
                            </div>
                        )}
                        {activeTab === 'logs' && (
                            <div className="timeline-container">
                                {profileStats?.lichSuHoatDong?.map((log, idx) => (
                                    <div className="timeline-item" key={idx}>
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content"><strong>{log.hanhDong}</strong><span>{log.thoiGian}</span></div>
                                    </div>
                                )) || <p>Chưa có dữ liệu lịch sử.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChiTietTaiKhoan;