import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiDownload, FiCalendar } from 'react-icons/fi';
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
                setHistory(res.data);
            } catch (error) {
                toast.error("Không thể tải lịch sử nhập kho!");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item =>
        item.maPhieu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nguoiNhap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nhaCungCap?.tenNCC?.toLowerCase().includes(searchTerm.toLowerCase())
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
                            <tr key={item.id}>
                                <td className="font-bold text-blue">{item.maPhieu}</td>
                                <td>
                                    <div className="date-cell">
                                        <FiCalendar /> {new Date(item.ngayNhap).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                                <td>{item.nhaCungCap?.tenNCC}</td>
                                <td><span className="user-badge">{item.nguoiNhap}</span></td>
                                <td className="text-right price">
                                    {(item.tongTien || 0).toLocaleString()} đ
                                </td>
                                <td className="note-cell">{item.ghiChu || '---'}</td>
                                <td className="text-center">
                                    <button
                                        className="btn-view"
                                        onClick={() => navigate(`/phieu-nhap-detail/${item.id}`)}
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