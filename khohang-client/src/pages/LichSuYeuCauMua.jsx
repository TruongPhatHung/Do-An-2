import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { 
    FiClock, FiCheckCircle, FiXCircle, FiInfo, FiSearch, 
    FiShoppingCart, FiCalendar, FiMessageSquare, FiFilter, FiPackage, FiDollarSign 
} from 'react-icons/fi';
import './LichSuYeuCauMua.css';

const LichSuYeuCauMua = () => {
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All'); // State cho bộ lọc trạng thái

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
            case 'Chờ Duyệt': return { color: '#d97706', bg: '#fef3c7', icon: <FiClock /> }; // Vàng cam
            case 'Đã Duyệt': return { color: '#059669', bg: '#d1fae5', icon: <FiCheckCircle /> }; // Xanh lá
            case 'Từ Chối': return { color: '#dc2626', bg: '#fee2e2', icon: <FiXCircle /> }; // Đỏ
            case 'Đã Lên PO': return { color: '#2563eb', bg: '#dbeafe', icon: <FiCheckCircle /> }; // Xanh dương
            default: return { color: '#64748b', bg: '#f1f5f9', icon: <FiInfo /> }; // Xám
        }
    };

    // Lọc theo cả Từ khóa và Trạng thái
    const filteredHistory = history.filter(item => {
        const matchSearch = item.maYeuCau.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.nhaCungCap?.tenNCC || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'All' || item.trangThai === filterStatus;
        
        return matchSearch && matchStatus;
    });

    return (
        <div className="ls-container">
            <div className="ls-header-section">
                <div className="ls-title-wrapper">
                    <div className="ls-title-icon"><FiShoppingCart /></div>
                    <div>
                        <h2>Nhật Ký Yêu Cầu Mua Hàng</h2>
                        <p className="ls-subtitle">Theo dõi tiến độ và phản hồi từ Ban Giám Đốc</p>
                    </div>
                </div>

                <div className="ls-toolbar">
                    <div className="ls-search-box">
                        <FiSearch className="ls-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm mã đơn hoặc nhà cung cấp..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* BỘ LỌC TRẠNG THÁI */}
                    <div className="ls-filter-box">
                        <FiFilter className="ls-filter-icon" />
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="ls-status-select"
                        >
                            <option value="All">Tất cả trạng thái</option>
                            <option value="Chờ Duyệt">⏳ Chờ Duyệt</option>
                            <option value="Đã Duyệt">✅ Đã Duyệt</option>
                            <option value="Đã Lên PO">📝 Đã Lên PO</option>
                            <option value="Từ Chối">❌ Từ Chối</option>
                        </select>
                    </div>
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <div className="ls-empty-state">
                    <FiPackage className="ls-empty-icon" />
                    <h3>Không tìm thấy yêu cầu nào</h3>
                    <p>Thử thay đổi từ khóa hoặc bộ lọc trạng thái của bạn.</p>
                </div>
            ) : (
                <div className="ls-grid">
                    {filteredHistory.map((yc) => {
                        const style = getStatusStyle(yc.trangThai);
                        const totalValue = calculateTotalValue(yc.chiTiets);

                        return (
                            <div key={yc.maYeuCau} className="ls-modern-card">
                                <div className="ls-card-header">
                                    <div className="ls-ma-badge">#{yc.maYeuCau}</div>
                                    <span className="ls-status-pill" style={{ color: style.color, backgroundColor: style.bg }}>
                                        {style.icon} {yc.trangThai}
                                    </span>
                                </div>

                                <div className="ls-card-body">
                                    <h4 className="ls-supplier-name">{yc.nhaCungCap?.tenNCC || 'Chưa xác định NCC'}</h4>
                                    
                                    <div className="ls-info-row">
                                        <FiCalendar className="ls-info-icon" />
                                        <span>Ngày gửi: <strong>{new Date(yc.ngayYeuCau).toLocaleString('vi-VN')}</strong></span>
                                    </div>
                                    
                                    {/* 💰 KHUNG HIỂN THỊ TỔNG TIỀN (DỰ CHI) (Tích hợp từ upstream) */}
                                    <div className="ls-total-price-tag">
                                        <FiDollarSign /> Tổng tiền dự chi:
                                        <span> {totalValue.toLocaleString('vi-VN')} VNĐ</span>
                                    </div>

                                    <div className="ls-info-row">
                                        <FiMessageSquare className="ls-info-icon" />
                                        <span>Ghi chú: <i className="ls-note-text">{yc.ghiChu || 'Không có ghi chú'}</i></span>
                                    </div>

                                    <div className="ls-items-preview">
                                        <div className="ls-preview-title">Hàng hóa yêu cầu:</div>
                                        <ul className="ls-preview-list">
                                            {yc.chiTiets?.slice(0, 2).map((ct, i) => (
                                                <li key={i}>
                                                    <span className="ls-item-name">{ct.hangHoa?.tenHang}</span>
                                                    <span className="ls-item-qty">x{ct.soLuongCanMua}</span>
                                                </li>
                                            ))}
                                            {yc.chiTiets?.length > 2 && (
                                                <li className="ls-item-more">... và {yc.chiTiets.length - 2} mặt hàng khác</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* PHẢN HỒI CỦA SẾP / TIẾN ĐỘ */}
                                    {yc.trangThai === 'Từ Chối' && yc.lyDoTuChoi && (
                                        <div className="ls-feedback-box rejected">
                                            <div className="ls-feedback-title"><FiXCircle /> Phản hồi từ Sếp:</div>
                                            <p>{yc.lyDoTuChoi}</p>
                                        </div>
                                    )}
                                    {yc.trangThai === 'Đã Duyệt' && (
                                        <div className="ls-feedback-box approved">
                                            <FiCheckCircle /> Sếp đã phê duyệt. Đang chờ lên PO.
                                        </div>
                                    )}
                                    {yc.trangThai === 'Đã Lên PO' && (
                                        <div className="ls-feedback-po">
                                            <FiCheckCircle /> Hàng đã chốt đơn mua (PO). Đang chờ về.
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LichSuYeuCauMua;