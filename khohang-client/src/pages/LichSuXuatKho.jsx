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

    // 🎯 HÀM TÍNH TIỀN ĐẶT ĐÚNG CHỖ ĐÂY SẾP
    const calculateTotal = (chiTiets) => {
        if (!chiTiets || chiTiets.length === 0) return 0;
        return chiTiets.reduce((sum, item) => {
            const soLuong = item.soLuongXuat || item.soLuongYeuCau || item.soLuong || 0;
            // Ép kiểu Number để chắc chắn không bị lỗi do DB trả về chuỗi
            const giaBan = Number(item.hangHoa?.giaBan) || 0;
            const giaNhap = Number(item.hangHoa?.giaNhap) || 0;
            const donGia = Number(item.donGia) || 0;

            // Ưu tiên lấy đơn giá lưu trong phiếu -> giá bán -> giá nhập
            const gia = donGia > 0 ? donGia : (giaBan > 0 ? giaBan : giaNhap);
            return sum + (soLuong * gia);
        }, 0);
    };

    const filteredPhieuXuats = phieuXuats.filter(px =>
        (px.maPhieuXuat || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (px.tenNguoiNhan || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (px.lyDoXuat || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (px.ghiChu || "").toLowerCase().includes(searchTerm.toLowerCase())
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
                    {/* 🎯 ĐÃ XÓA THEAD THỪA - BÂY GIỜ CHỈ CÓ 1 THEAD DUY NHẤT */}
                    <thead>
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
                        {filteredPhieuXuats.length > 0 ? filteredPhieuXuats.map((px) => {
                            // Gọi hàm tính tiền ngay tại đây
                            const displayTotal = px.tongTien > 0 ? px.tongTien : calculateTotal(px.chiTiets);

                            return (
                                <tr key={px.maPhieuXuat}>
                                    <td className="fw-bold text-primary">{px.maPhieuXuat}</td>
                                    <td>
                                        <div className="date-badge">
                                            <FiCalendar style={{ marginRight: '4px' }} />
                                            {new Date(px.ngayXuat).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td>{px.nguoiDung?.hoTen || px.maND || 'Hệ thống'}</td>
                                    <td className="fw-bold">{px.tenNguoiNhan || 'Khách lẻ'}</td>
                                    <td>
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
                        }) : (
                            <tr><td colSpan="7" className="text-center">Không có dữ liệu phù hợp</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LichSuXuatKho;