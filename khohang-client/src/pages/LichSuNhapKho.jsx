import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './LichSuNhapKho.css';

const LichSuNhapKho = () => {
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/phieu-nhap');
                // Đảm bảo dữ liệu là mảng
                setHistory(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                toast.error("Không thể tải lịch sử nhập kho!");
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // 🎯 ĐÃ SỬA: Lọc theo maPhieuNhap (tên cột đúng trong Entity)
    const filteredHistory = history.filter(item =>
        (item.maPhieuNhap || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nguoiNhap || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nhaCungCap?.tenNCC || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">⏳ Đang tải lịch sử...</div>;

    return (
        <div className="history-container">
            <div className="history-header">
                <h2>📜 Lịch Sử Nhập Kho</h2>
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm theo mã phiếu, NCC, người nhập..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Mã Phiếu</th>
                            <th>Ngày Nhập</th>
                            <th>Nhà Cung Cấp</th>
                            <th>Người Nhập</th>
                            <th className="text-right">Tổng Tiền</th>
                            <th>Ghi Chú</th>
                            <th className="text-center">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHistory.map((item) => (
                            // 🎯 FIX LỖI 1: Dùng maPhieuNhap làm key duy nhất
                            <tr key={item.maPhieuNhap || Math.random()}>
                                <td className="font-bold text-blue">{item.maPhieuNhap}</td>
                                <td>
                                    <div className="date-cell">
                                        <FiCalendar /> {item.ngayNhap ? new Date(item.ngayNhap).toLocaleDateString('vi-VN') : '---'}
                                    </div>
                                </td>
                                <td>{item.nhaCungCap?.tenNCC || 'N/A'}</td>
                                <td><span className="user-badge">{item.nguoiNhap || 'Hệ thống'}</span></td>
                                <td className="text-right price">
                                    {(item.tongTien || 0).toLocaleString()} đ
                                </td>
                                <td className="note-cell">{item.ghiChu || '---'}</td>
                                <td className="text-center">
                                    <button
                                        className="btn-view"
                                        // 🎯 FIX LỖI 2: Truyền maPhieuNhap vào URL để không bị undefined
                                        onClick={() => navigate(`/chi-tiet-phieu-nhap/${item.maPhieuNhap}`)}
                                    >
                                        <FiEye /> Chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredHistory.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                        Không tìm thấy dữ liệu phiếu nhập nào.
                    </div>
                )}
            </div>
        </div>
    );
};

export default LichSuNhapKho;