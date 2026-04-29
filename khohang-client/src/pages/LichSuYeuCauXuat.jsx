import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { 
    FiClock, FiCheckCircle, FiXCircle, FiInfo, FiSearch, 
    FiFilter, FiTruck, FiMapPin, FiCalendar, FiPackage, 
    FiMessageSquare, FiTrendingUp 
} from 'react-icons/fi';
import './LichSuYeuCauXuat.css';

const LichSuYeuCauXuat = () => {
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/yeu-cau-xuat');
                // Sắp xếp theo ngày tạo mới nhất
                const sortedData = response.data.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
                setHistory(sortedData);
            } catch (error) {
                console.error("Lỗi tải lịch sử lệnh xuất:", error);
            }
        };
        fetchHistory();
    }, []);

    // 🎯 Hàm tính tổng giá trị doanh thu dự kiến (Dựa trên GIÁ BÁN)
    const calculateTotalRevenue = (chiTiets) => {
        if (!chiTiets) return 0;
        return chiTiets.reduce((sum, item) => {
            const price = item.hangHoa?.giaBan || 0;
            const qty = item.soLuongYeuCau || 0;
            return sum + (price * qty);
        }, 0);
    };

    // THUẬT TOÁN GỘP TRẠNG THÁI
    const getDisplayStatus = (actualStatus) => {
        if (['Đã Duyệt', 'Giao Thiếu', 'Hoàn Thành'].includes(actualStatus)) {
            return 'Đã Duyệt';
        }
        return actualStatus;
    };

    const getStatusStyle = (displayStatus) => {
        switch (displayStatus) {
            case 'Chờ Duyệt': return { color: '#d97706', bg: '#fef3c7', icon: <FiClock /> }; // Vàng
            case 'Đã Duyệt': return { color: '#059669', bg: '#d1fae5', icon: <FiCheckCircle /> }; // Xanh lá
            case 'Từ Chối': return { color: '#dc2626', bg: '#fee2e2', icon: <FiXCircle /> }; // Đỏ
            default: return { color: '#64748b', bg: '#f1f5f9', icon: <FiInfo /> }; // Xám
        }
    };

    // Lọc theo cả Từ khóa và Trạng thái hiển thị
    const filteredHistory = history.filter(item => {
        const displayStatus = getDisplayStatus(item.trangThai);
        const matchSearch = item.maYeuCau.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.noiNhan || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'All' || displayStatus === filterStatus;
        
        return matchSearch && matchStatus;
    });

    return (
        <div className="lsx-container">
            <div className="lsx-header-section">
                <div className="lsx-title-wrapper">
                    <div className="lsx-title-icon"><FiTruck /></div>
                    <div>
                        <h2>Nhật Ký Lệnh Xuất Kho</h2>
                        <p className="lsx-subtitle">Theo dõi tiến độ phê duyệt và giá trị vận chuyển hàng hóa</p>
                    </div>
                </div>

                <div className="lsx-toolbar">
                    <div className="lsx-search-box">
                        <FiSearch className="lsx-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm mã lệnh, nơi nhận..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* BỘ LỌC TRẠNG THÁI */}
                    <div className="lsx-filter-box">
                        <FiFilter className="lsx-filter-icon" />
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="lsx-status-select"
                        >
                            <option value="All">Tất cả trạng thái</option>
                            <option value="Chờ Duyệt">⏳ Chờ Duyệt</option>
                            <option value="Đã Duyệt">✅ Đã Duyệt</option>
                            <option value="Từ Chối">❌ Từ Chối</option>
                        </select>
                    </div>
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <div className="lsx-empty-state">
                    <FiPackage className="lsx-empty-icon" />
                    <h3>Không tìm thấy lệnh xuất nào</h3>
                    <p>Thử thay đổi từ khóa hoặc bộ lọc trạng thái của bạn.</p>
                </div>
            ) : (
                <div className="lsx-grid">
                    {filteredHistory.map((yc) => {
                        const displayStatus = getDisplayStatus(yc.trangThai);
                        const style = getStatusStyle(displayStatus);
                        const totalRevenue = calculateTotalRevenue(yc.chiTiets);

                        return (
                            <div key={yc.maYeuCau} className="lsx-modern-card">
                                <div className="lsx-card-header">
                                    <div className="lsx-ma-badge">#{yc.maYeuCau}</div>
                                    <span className="lsx-status-pill" style={{ color: style.color, backgroundColor: style.bg }}>
                                        {style.icon} {displayStatus}
                                    </span>
                                </div>

                                <div className="lsx-card-body">
                                    <h4 className="lsx-destination">
                                        <FiMapPin className="lsx-destination-icon" /> {yc.noiNhan}
                                    </h4>
                                    
                                    <div className="lsx-info-row">
                                        <FiCalendar className="lsx-info-icon" />
                                        <span>Ngày lập: <strong>{new Date(yc.ngayTao).toLocaleString('vi-VN')}</strong></span>
                                    </div>
                                    <div className="lsx-info-row">
                                        <FiClock className="lsx-info-icon" style={{ color: '#ef4444' }} />
                                        <span>Hạn chót: <strong style={{ color: '#ef4444' }}>{new Date(yc.ngayCanXuat).toLocaleString('vi-VN')}</strong></span>
                                    </div>
                                    <div className="lsx-info-row">
                                        <FiMessageSquare className="lsx-info-icon" />
                                        <span>Ghi chú: <i className="lsx-note-text">{yc.ghiChu || 'Không có ghi chú'}</i></span>
                                    </div>

                                    {/* 💰 KHUNG HIỂN THỊ TỔNG TIỀN (DOANH THU) */}
                                    <div className="lsx-revenue-tag">
                                        <FiTrendingUp /> Giá trị xuất hàng:
                                        <span> {totalRevenue.toLocaleString('vi-VN')} VNĐ</span>
                                    </div>

                                    <div className="lsx-items-preview">
                                        <div className="lsx-preview-title"><FiPackage /> Hàng hóa yêu cầu:</div>
                                        <ul className="lsx-preview-list">
                                            {yc.chiTiets?.slice(0, 2).map((ct, i) => (
                                                <li key={i} style={{ flexDirection: 'column', gap: '4px' }}>
                                                    <div className="item-info-row">
                                                        <span className="lsx-item-name">{ct.hangHoa?.tenHang}</span>
                                                        <span className="lsx-item-qty">x{ct.soLuongYeuCau}</span>
                                                    </div>
                                                    <div className="item-price-row">
                                                        Đơn giá: {ct.hangHoa?.giaBan?.toLocaleString('vi-VN')} VNĐ
                                                    </div>
                                                </li>
                                            ))}
                                            {yc.chiTiets?.length > 2 && (
                                                <li className="lsx-item-more">... và {yc.chiTiets.length - 2} mặt hàng khác</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* KHUNG PHẢN HỒI */}
                                    <div className="lsx-feedback-zone">
                                        {displayStatus === 'Chờ Duyệt' && (
                                            <div className="lsx-msg pending">
                                                <FiClock /> Đang chờ Giám đốc phê duyệt...
                                            </div>
                                        )}

                                        {displayStatus === 'Từ Chối' && yc.lyDoTuChoi && (
                                            <div className="lsx-msg rejected">
                                                <strong><FiXCircle /> Sếp từ chối:</strong>
                                                <p>{yc.lyDoTuChoi}</p>
                                            </div>
                                        )}

                                        {displayStatus === 'Đã Duyệt' && (
                                            <div className="lsx-msg approved">
                                                <div>
                                                    <strong><FiCheckCircle /> Đã phê duyệt!</strong>
                                                    <p className="lsx-sub-msg">Đơn đã chuyển sang kho để xuất hàng.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LichSuYeuCauXuat;