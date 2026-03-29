import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { FiClock, FiCheckCircle, FiXCircle, FiInfo, FiSearch } from 'react-icons/fi';
import './LichSuYeuCauMua.css';

const LichSuYeuCauMua = () => {
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Lấy toàn bộ yêu cầu (Backend đã có hàm trả về List rồi)
                const response = await api.get('/yeu-cau-mua');
                setHistory(response.data);
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
            }
        };
        fetchHistory();
    }, []);

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
                <h2>📋 Nhật ký Yêu Cầu Mua Hàng</h2>
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
                    return (
                        <div key={yc.maYeuCau} className="ls-card">
                            <div className="ls-card-header">
                                <span className="ls-ma">#{yc.maYeuCau}</span>
                                <span className="ls-status" style={{ color: style.color, backgroundColor: style.bg }}>
                                    {style.icon} {yc.trangThai}
                                </span>
                            </div>

                            <div className="ls-card-body">
                                <h4>{yc.nhaCungCap?.tenNCC}</h4>
                                <p className="ls-date">📅 Ngày gửi: {new Date(yc.ngayYeuCau).toLocaleString('vi-VN')}</p>
                                <p className="ls-note">💬 Ghi chú của tôi: <i>{yc.ghiChu || 'Không có'}</i></p>

                                <div className="ls-items-preview">
                                    <strong>Hàng hóa yêu cầu:</strong>
                                    <ul>
                                        {yc.chiTiets.slice(0, 2).map((ct, i) => (
                                            <li key={i}>{ct.hangHoa?.tenHang} (SL: {ct.soLuongCanMua})</li>
                                        ))}
                                        {yc.chiTiets.length > 2 && <li>... và {yc.chiTiets.length - 2} món khác</li>}
                                    </ul>
                                </div>

                                {/* PHẦN QUAN TRỌNG NHẤT: PHẢN HỒI CỦA SẾP */}
                                {yc.trangThai === 'Từ Chối' && yc.lyDoTuChoi && (
                                    <div className="ls-feedback-box">
                                        <strong>🚫 Phản hồi từ Sếp:</strong>
                                        <p>{yc.lyDoTuChoi}</p>
                                    </div>
                                )}
                                {yc.trangThai === 'Đã Duyệt' && (
                                    <div className="ls-feedback-success">
                                        <FiCheckCircle /> Sếp đã phê duyệt đơn này. Đang chờ phòng Mua hàng xử lý.
                                    </div>
                                )}
                            </div>
                        </div>
                        
            );
                })}
        </div>
        </div >
    );
};

export default LichSuYeuCauMua;