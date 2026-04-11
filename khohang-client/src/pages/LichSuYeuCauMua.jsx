import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { FiClock, FiCheckCircle, FiXCircle, FiInfo, FiSearch, FiDollarSign } from 'react-icons/fi';
import './LichSuYeuCauMua.css';

const LichSuYeuCauMua = () => {
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/yeu-cau-mua');
                // Sắp xếp mới nhất lên đầu
                const sortedData = response.data.sort((a, b) => new Date(b.ngayYeuCau) - new Date(a.ngayYeuCau));
                setHistory(sortedData);
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
            }
        };
        fetchHistory();
    }, []);

    // 🎯 Hàm tính tổng giá trị dự chi của một phiếu
    const calculateTotalValue = (chiTiets) => {
        if (!chiTiets) return 0;
        return chiTiets.reduce((sum, item) => {
            const price = item.hangHoa?.giaNhap || 0;
            const qty = item.soLuongCanMua || 0;
            return sum + (price * qty);
        }, 0);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Chờ Duyệt': return { color: '#f59e0b', bg: '#fef3c7', icon: <FiClock /> };
            case 'Đã Duyệt': return { color: '#10b981', bg: '#dcfce3', icon: <FiCheckCircle /> };
            case 'Từ Chối': return { color: '#ef4444', bg: '#fee2e2', icon: <FiXCircle /> };
            case 'Đã Lên PO': return { color: '#3b82f6', bg: '#dbeafe', icon: <FiCheckCircle /> };
            default: return { color: '#64748b', bg: '#f1f5f9', icon: <FiInfo /> };
        }
    };

    const filteredHistory = history.filter(item =>
        item.maYeuCau.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nhaCungCap?.tenNCC.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="ls-container">
            <div className="ls-header">
                <div className="ls-header-left">
                    <h2>📋 Nhật ký Yêu Cầu Mua Hàng</h2>
                    <p>Theo dõi tiến độ phê duyệt và giá trị dự chi các lô hàng</p>
                </div>
                <div className="ls-search">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm mã đơn hoặc nhà cung cấp..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="ls-grid">
                {filteredHistory.map((yc) => {
                    const style = getStatusStyle(yc.trangThai);
                    const totalValue = calculateTotalValue(yc.chiTiets);

                    return (
                        <div key={yc.maYeuCau} className="ls-card">
                            <div className="ls-card-header">
                                <span className="ls-ma">#{yc.maYeuCau}</span>
                                <span className="ls-status" style={{ color: style.color, backgroundColor: style.bg }}>
                                    {style.icon} {yc.trangThai}
                                </span>
                            </div>

                            <div className="ls-card-body">
                                <h4>🏢 {yc.nhaCungCap?.tenNCC || 'NCC chưa xác định'}</h4>
                                <p className="ls-date">📅 Ngày gửi: {new Date(yc.ngayYeuCau).toLocaleString('vi-VN')}</p>

                                {/* 💰 KHUNG HIỂN THỊ TỔNG TIỀN (DỰ CHI) */}
                                <div className="ls-total-price-tag">
                                    <FiDollarSign /> Tổng tiền dự chi:
                                    <span> {totalValue.toLocaleString('vi-VN')} VNĐ</span>
                                </div>

                                <p className="ls-note">💬 Ghi chú: <i>{yc.ghiChu || 'Không có'}</i></p>

                                <div className="ls-items-preview">
                                    <strong>Hàng hóa chi tiết:</strong>
                                    <ul>
                                        {yc.chiTiets.map((ct, i) => (
                                            <li key={i}>
                                                <div className="item-info-row">
                                                    <span className="item-name">{ct.hangHoa?.tenHang}</span>
                                                    <span className="item-qty">x{ct.soLuongCanMua}</span>
                                                </div>
                                                <div className="item-price-row">
                                                    Giá nhập: {ct.hangHoa?.giaNhap?.toLocaleString('vi-VN')} VNĐ
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* PHẢN HỒI CỦA SẾP */}
                                <div className="ls-feedback-zone">
                                    {yc.trangThai === 'Từ Chối' && yc.lyDoTuChoi && (
                                        <div className="ls-feedback-box">
                                            <strong>🚫 Phản hồi từ Sếp:</strong>
                                            <p>{yc.lyDoTuChoi}</p>
                                        </div>
                                    )}
                                    {yc.trangThai === 'Đã Duyệt' && (
                                        <div className="ls-feedback-success">
                                            <FiCheckCircle /> Sếp đã phê duyệt đơn này. Đang chờ Mua hàng lên PO.
                                        </div>
                                    )}
                                    {yc.trangThai === 'Đã Lên PO' && (
                                        <div className="ls-feedback-po">
                                            <FiCheckCircle /> Hàng đã được chốt đơn mua (PO). Đang chờ về kho.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredHistory.length === 0 && (
                <div className="ls-empty">
                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" alt="empty" />
                    <p>Không có dữ liệu yêu cầu nào được tìm thấy.</p>
                </div>
            )}
        </div>
    );
};

export default LichSuYeuCauMua;