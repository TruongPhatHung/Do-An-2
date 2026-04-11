import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { FiClock, FiCheckCircle, FiXCircle, FiInfo, FiSearch, FiTrendingUp } from 'react-icons/fi';
import './LichSuYeuCauXuat.css';

const LichSuYeuCauXuat = () => {
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

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

    const getDisplayStatus = (actualStatus) => {
        if (['Đã Duyệt', 'Giao Thiếu', 'Hoàn Thành'].includes(actualStatus)) {
            return 'Đã Duyệt';
        }
        return actualStatus;
    };

    const getStatusStyle = (displayStatus) => {
        switch (displayStatus) {
            case 'Chờ Duyệt': return { color: '#f59e0b', bg: '#fef3c7', icon: <FiClock /> };
            case 'Đã Duyệt': return { color: '#10b981', bg: '#dcfce3', icon: <FiCheckCircle /> };
            case 'Từ Chối': return { color: '#ef4444', bg: '#fee2e2', icon: <FiXCircle /> };
            default: return { color: '#64748b', bg: '#f1f5f9', icon: <FiInfo /> };
        }
    };

    const filteredHistory = history.filter(item =>
        item.maYeuCau.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.noiNhan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="lsx-container">
            <div className="lsx-header">
                <div className="lsx-header-left">
                    <h2>📤 Nhật Ký Lệnh Xuất Kho</h2>
                    <p>Theo dõi kết quả phê duyệt và giá trị hợp đồng các lệnh xuất hàng</p>
                </div>
                <div className="lsx-search">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm mã lệnh, nơi nhận..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="lsx-grid">
                {filteredHistory.map((yc) => {
                    const displayStatus = getDisplayStatus(yc.trangThai);
                    const style = getStatusStyle(displayStatus);
                    const totalRevenue = calculateTotalRevenue(yc.chiTiets);

                    return (
                        <div key={yc.maYeuCau} className="lsx-card">
                            <div className="lsx-card-header">
                                <span className="lsx-ma">#{yc.maYeuCau}</span>
                                <span className="lsx-status" style={{ color: style.color, backgroundColor: style.bg }}>
                                    {style.icon} {displayStatus}
                                </span>
                            </div>

                            <div className="lsx-card-body">
                                <h4>📍 Giao đến: {yc.noiNhan}</h4>
                                <p className="lsx-date">📅 Ngày lập: {new Date(yc.ngayTao).toLocaleString('vi-VN')}</p>
                                <p className="lsx-date">⏰ Hạn chót: {new Date(yc.ngayCanXuat).toLocaleString('vi-VN')}</p>

                                {/* 💰 KHUNG HIỂN THỊ TỔNG TIỀN (DOANH THU) */}
                                <div className="lsx-revenue-tag">
                                    <FiTrendingUp /> Giá trị xuất hàng:
                                    <span> {totalRevenue.toLocaleString('vi-VN')} VNĐ</span>
                                </div>

                                <p className="lsx-note">💬 Ghi chú: <i>{yc.ghiChu || 'Không có'}</i></p>

                                <div className="lsx-items-preview">
                                    <strong>📦 Chi tiết hàng hóa:</strong>
                                    <ul>
                                        {yc.chiTiets.map((ct, i) => (
                                            <li key={i}>
                                                <div className="item-info-row">
                                                    <span className="item-name">{ct.hangHoa?.tenHang}</span>
                                                    <span className="item-qty">x{ct.soLuongYeuCau}</span>
                                                </div>
                                                <div className="item-price-row">
                                                    Đơn giá bán: {ct.hangHoa?.giaBan?.toLocaleString('vi-VN')} VNĐ
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="lsx-feedback-zone">
                                    {displayStatus === 'Chờ Duyệt' && (
                                        <div className="msg-pending">Đang chờ Giám đốc phê duyệt...</div>
                                    )}

                                    {displayStatus === 'Từ Chối' && yc.lyDoTuChoi && (
                                        <div className="msg-reject">
                                            <strong>🚫 Lý do từ chối:</strong>
                                            <p>{yc.lyDoTuChoi}</p>
                                        </div>
                                    )}

                                    {displayStatus === 'Đã Duyệt' && (
                                        <div className="msg-success">
                                            <FiCheckCircle /> Lệnh đã được duyệt. Vui lòng xuất kho đúng hạn!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredHistory.length === 0 && (
                <div className="lsx-empty">Không tìm thấy lệnh xuất nào phù hợp.</div>
            )}
        </div>
    );
};

export default LichSuYeuCauXuat;