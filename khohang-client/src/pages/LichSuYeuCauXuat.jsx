import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { FiClock, FiCheckCircle, FiXCircle, FiInfo, FiSearch } from 'react-icons/fi';
import './LichSuYeuCauXuat.css';

const LichSuYeuCauXuat = () => {
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/yeu-cau-xuat');
                const sortedData = response.data.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
                setHistory(sortedData);
            } catch (error) {
                console.error("Lỗi tải lịch sử lệnh xuất:", error);
            }
        };
        fetchHistory();
    }, []);

    // 🎯 THUẬT TOÁN GỘP TRẠNG THÁI: Những trạng thái sau khi duyệt đều gom chung thành "Đã Duyệt"
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
                <div>
                    <h2>📤 Nhật Ký Lệnh Xuất Kho</h2>
                    <p>Theo dõi kết quả phê duyệt các lệnh xuất hàng bạn đã lập</p>
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

            {filteredHistory.length === 0 ? (
                <div className="empty-state">Không tìm thấy lệnh xuất nào.</div>
            ) : (
                <div className="lsx-grid">
                    {filteredHistory.map((yc) => {
                        // 🎯 Áp dụng hiển thị trạng thái đã gộp
                        const displayStatus = getDisplayStatus(yc.trangThai);
                        const style = getStatusStyle(displayStatus);

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
                                    <p className="lsx-note">💬 Ghi chú: <i>{yc.ghiChu || 'Không có'}</i></p>

                                    <div className="lsx-items-preview">
                                        <strong>📦 Hàng hóa yêu cầu:</strong>
                                        <ul>
                                            {yc.chiTiets.slice(0, 2).map((ct, i) => (
                                                <li key={i}>{ct.hangHoa?.tenHang} (SL: <b>{ct.soLuongYeuCau}</b>)</li>
                                            ))}
                                            {yc.chiTiets.length > 2 && <li className="more-items">... và {yc.chiTiets.length - 2} món khác</li>}
                                        </ul>
                                    </div>

                                    {/* KHUNG PHẢN HỒI */}
                                    <div className="lsx-feedback-zone">
                                        {displayStatus === 'Chờ Duyệt' && (
                                            <div className="msg-pending">Đang chờ Giám đốc phê duyệt...</div>
                                        )}

                                        {displayStatus === 'Từ Chối' && yc.lyDoTuChoi && (
                                            <div className="msg-reject">
                                                <strong>🚫 Sếp từ chối:</strong>
                                                <p>{yc.lyDoTuChoi}</p>
                                            </div>
                                        )}

                                        {displayStatus === 'Đã Duyệt' && (
                                            <div className="msg-success">
                                                <FiCheckCircle /> Lệnh đã được Sếp duyệt thành công! <br />
                                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
                                                    (Để xem tiến độ xuất hàng thực tế, vui lòng kiểm tra tại "Lịch sử xuất kho")
                                                </span>
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