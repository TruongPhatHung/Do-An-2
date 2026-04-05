import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiCalendar, FiFileText } from 'react-icons/fi';
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
    

    const filteredHistory = history.filter(item =>
        (item.maPhieuNhap || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nguoiNhap || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nhaCungCap?.tenNCC || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        // 🎯 Vét cả ghi chú để tìm kiếm cho sếp
        (item.ghiChu || "").toLowerCase().includes(searchTerm.toLowerCase())
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
                        placeholder="Tìm mã phiếu, NCC, ghi chú..."
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
                            <th>Ghi Chú</th> {/* 🎯 Cột Ghi chú mới */}
                            <th className="text-center">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHistory.map((item) => (
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
                                <td>
                                    {/* 🎯 Ghi chú kiểu Badge giống bên Yêu cầu */}
                                    <span className="note-badge-custom">
                                        <FiFileText className="note-icon" />
                                        {item.ghiChu || item.lyDo || "---"}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <button
                                        className="btn-view"
                                        onClick={() => navigate(`/chi-tiet-phieu-nhap/${item.maPhieuNhap}`)}
                                    >
                                        <FiEye /> Chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LichSuNhapKho;