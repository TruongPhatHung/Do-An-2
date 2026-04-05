import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiEye, FiSearch, FiCalendar, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './LichSuXuatKho.css';

const LichSuXuatKho = () => {
    const [phieuXuats, setPhieuXuats] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPhieuXuats();
    }, []);

    const fetchPhieuXuats = async () => {
        try {
            const response = await api.get('/phieu-xuat');
            setPhieuXuats(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            toast.error("Lỗi tải lịch sử xuất kho!");
        }
    };

    const filteredPhieuXuats = phieuXuats.filter(px =>
        px.maPhieuXuat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (px.lyDoXuat && px.lyDoXuat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (px.ghiChu && px.ghiChu.toLowerCase().includes(searchTerm.toLowerCase())) || // 🎯 Thêm ghi chú vào lọc
        (px.tenNguoiNhan && px.tenNguoiNhan.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="lsxk-container">
            <div className="lsxk-header">
                <h2>📦 Lịch Sử Xuất Kho</h2>
                <div className="lsxk-search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm mã phiếu, khách hàng, lý do..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="lsxk-card">
                <table className="lsxk-table">
                    <thead>
                        <tr>
                            <th>Mã Phiếu</th>
                            <th>Ngày Xuất</th>
                            <th>Người Xuất</th>
                            <th>Khách Hàng</th>
                            <th>Ghi Chú / Lý Do</th> {/* 🎯 Đổi tên cho đồng bộ */}
                            <th className="text-right">Tổng Giá Trị</th>
                            <th className="text-center">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPhieuXuats.map((px) => {
                            const displayTotal = px.tongTien || 0;

                            return (
                                <tr key={px.maPhieuXuat}>
                                    <td className="fw-bold text-primary">{px.maPhieuXuat}</td>
                                    <td>
                                        <div className="date-badge">
                                            <FiCalendar style={{ marginRight: '4px' }} />
                                            {new Date(px.ngayXuat).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td>{px.nguoiDung ? px.nguoiDung.hoTen : 'Hệ thống'}</td>
                                    <td className="fw-bold">{px.tenNguoiNhan || 'Khách lẻ'}</td>
                                    <td>
                                        {/* 🎯 Ghi chú (Lý do) kiểu Badge */}
                                        <span className="note-badge-custom">
                                            <FiFileText className="note-icon" />
                                            {px.ghiChu || px.lyDoXuat || "---"}
                                        </span>
                                    </td>
                                    <td className="text-right fw-bold text-orange-dark">
                                        {displayTotal.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td className="text-center">
                                        <button
                                            className="btn-view-detail"
                                            onClick={() => navigate(`/phieu-xuat-detail/${px.maPhieuXuat}`)}
                                        >
                                            <FiEye /> Xem
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LichSuXuatKho;