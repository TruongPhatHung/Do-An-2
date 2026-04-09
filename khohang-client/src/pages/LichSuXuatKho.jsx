import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiEye, FiSearch, FiCalendar, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './LichSuXuatKho.css';

const LichSuXuatKho = () => {
    const [phieuXuats, setPhieuXuats] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
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
        } finally {
            setLoading(false);
        }
    };

    // 🎯 HÀM TÍNH TỔNG TIỀN "BAO SÂN" (Sửa lỗi tiền bằng 0)
    const calculateTotal = (chiTiets) => {
        if (!chiTiets || chiTiets.length === 0) return 0;
        return chiTiets.reduce((sum, item) => {
            // Kiểm tra mọi khả năng tên biến: soLuongYeuCau (Xuất), soLuongDat (Mua), soLuong (Chung)
            const soLuong = item.soLuongXuat || item.soLuongYeuCau || item.soLuong || 0;
            const gia = item.donGia || item.hangHoa?.giaBan || item.hangHoa?.giaNhap || 0;
            return sum + (soLuong * gia);
        }, 0);
    };

    const filteredPhieuXuats = phieuXuats.filter(px =>
        (px.maPhieuXuat || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (px.tenNguoiNhan || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (px.lyDoXuat || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="lsxk-container">⏳ Đang tải dữ liệu...</div>;

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
                        {/* 🎯 TIÊU ĐỀ SẠCH SẼ - KHÔNG KHOẢNG TRẮNG THỪA */}
                        <tr>
                            <th>Mã Phiếu</th>
                            <th>Ngày Xuất</th>
                            <th>Người Xuất</th>
                            <th>Khách Hàng</th>
                            <th>Ghi Chú / Lý Do</th>
                            <th className="text-right">Tổng Giá Trị</th>
                            <th className="text-center">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPhieuXuats.length > 0 ? filteredPhieuXuats.map((px) => (
                            <tr key={px.maPhieuXuat}>
                                <td className="fw-bold text-primary">{px.maPhieuXuat}</td>
                                <td>
                                    <div className="date-badge">
                                        <FiCalendar style={{ marginRight: '4px' }} />
                                        {new Date(px.ngayXuat).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                                <td>{px.nguoiDung?.hoTen || 'Hệ thống'}</td>
                                <td className="fw-bold">{px.tenNguoiNhan || 'Khách lẻ'}</td>
                                <td>
                                    <span className="note-badge-custom">
                                        <FiFileText className="note-icon" />
                                        {px.ghiChu || px.lyDoXuat || "---"}
                                    </span>
                                </td>
                                {/* 🎯 CỘT TÍNH TIỀN ĐÃ ĐƯỢC FIX DƯỚI ĐÂY */}
                                <td className="text-right fw-bold text-orange-dark">
                                    {(px.tongTien > 0 ? px.tongTien : calculateTotal(px.chiTiets)).toLocaleString('vi-VN')} đ
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
                        )) : (
                            <tr><td colSpan="7" className="text-center">Không có dữ liệu phù hợp</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LichSuXuatKho;