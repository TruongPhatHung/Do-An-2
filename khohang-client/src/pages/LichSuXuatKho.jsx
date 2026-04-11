import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiEye, FiSearch, FiCalendar, FiFileText, FiUser, FiRefreshCcw, FiFilter, FiInbox } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './LichSuXuatKho.css';

const LichSuXuatKho = () => {
    const [phieuXuats, setPhieuXuats] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    // 🎯 THÊM STATE CHO BỘ LỌC NGÀY THÁNG
    const [tuNgay, setTuNgay] = useState('');
    const [denNgay, setDenNgay] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPhieuXuats();
    }, []);

    const fetchPhieuXuats = async () => {
        setLoading(true);
        try {
            const response = await api.get('/phieu-xuat');
            setPhieuXuats(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            toast.error("Lỗi tải lịch sử xuất kho!");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (chiTiets) => {
        if (!chiTiets || chiTiets.length === 0) return 0;
        return chiTiets.reduce((sum, item) => {
            const soLuong = item.soLuongXuat || item.soLuongYeuCau || item.soLuong || 0;
            const giaBan = Number(item.hangHoa?.giaBan) || 0;
            const giaNhap = Number(item.hangHoa?.giaNhap) || 0;
            const donGia = Number(item.donGia) || 0;
            const gia = donGia > 0 ? donGia : (giaBan > 0 ? giaBan : giaNhap);
            return sum + (soLuong * gia);
        }, 0);
    };

    // 🎯 HÀM LÀM MỚI BỘ LỌC
    const handleResetFilter = () => {
        setSearchTerm('');
        setTuNgay('');
        setDenNgay('');
    };

    // 🎯 LOGIC LỌC DỮ LIỆU TỔNG HỢP (KẾT HỢP TÌM KIẾM & NGÀY THÁNG)
    const filteredPhieuXuats = phieuXuats.filter(px => {
        // Lọc theo text
        const matchSearch = (px.maPhieuXuat || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (px.tenNguoiNhan || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (px.lyDoXuat || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (px.ghiChu || "").toLowerCase().includes(searchTerm.toLowerCase());

        // Lọc theo ngày
        let matchDate = true;
        if (tuNgay || denNgay) {
            const pxDate = new Date(px.ngayXuat);
            pxDate.setHours(0, 0, 0, 0); // Đưa về đầu ngày để so sánh chính xác

            if (tuNgay) {
                const fromDate = new Date(tuNgay);
                fromDate.setHours(0, 0, 0, 0);
                if (pxDate < fromDate) matchDate = false;
            }
            if (denNgay) {
                const toDate = new Date(denNgay);
                toDate.setHours(23, 59, 59, 999); // Đến cuối ngày
                if (pxDate > toDate) matchDate = false;
            }
        }

        return matchSearch && matchDate;
    });

    if (loading) return (
        <div className="lsxk-loading">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu xuất kho...</p>
        </div>
    );

    return (
        <div className="lsxk-container">
            <div className="lsxk-header">
                <div className="header-title">
                    <div className="title-icon"><FiInbox /></div>
                    <h2>Lịch Sử Xuất Kho</h2>
                </div>
            </div>

            {/* 🎯 KHU VỰC BỘ LỌC */}
            <div className="lsxk-filter-section">
                <div className="filter-group flex-fill">
                    <label>Tìm kiếm nhanh</label>
                    <div className="filter-input-wrapper">
                        <FiSearch className="input-icon" />
                        <input
                            type="text"
                            placeholder="Mã phiếu, khách hàng, lý do..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="filter-group">
                    <label>Từ ngày</label>
                    <div className="filter-input-wrapper">
                        <input
                            type="date"
                            value={tuNgay}
                            onChange={(e) => setTuNgay(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-group">
                    <label>Đến ngày</label>
                    <div className="filter-input-wrapper">
                        <input
                            type="date"
                            value={denNgay}
                            onChange={(e) => setDenNgay(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-actions">
                    <button className="btn-reset" onClick={handleResetFilter} title="Làm mới bộ lọc">
                        <FiRefreshCcw /> Làm mới
                    </button>
                </div>
            </div>

            <div className="lsxk-card">
                <div className="table-responsive">
                    <table className="lsxk-table">
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
                                const displayTotal = px.tongTien > 0 ? px.tongTien : calculateTotal(px.chiTiets);

                                return (
                                    <tr key={px.maPhieuXuat}>
                                        <td>
                                            <span className="code-badge">{px.maPhieuXuat}</span>
                                        </td>
                                        <td>
                                            <div className="date-badge">
                                                <FiCalendar className="icon-sm" />
                                                {new Date(px.ngayXuat).toLocaleDateString('vi-VN')}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-badge">
                                                <FiUser className="icon-sm" />
                                                {px.nguoiDung?.hoTen || px.maND || 'Hệ thống'}
                                            </div>
                                        </td>
                                        <td className="fw-bold text-dark">{px.tenNguoiNhan || 'Khách lẻ'}</td>
                                        <td>
                                            <span className="note-badge">
                                                <FiFileText className="icon-sm" />
                                                {px.ghiChu || px.lyDoXuat || "Không có ghi chú"}
                                            </span>
                                        </td>
                                        <td className="text-right fw-bold text-orange-dark price-cell">
                                            {displayTotal.toLocaleString('vi-VN')} đ
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn-view-detail"
                                                onClick={() => navigate(`/phieu-xuat-detail/${px.maPhieuXuat}`)}
                                                title="Xem chi tiết phiếu"
                                            >
                                                <FiEye /> <span className="btn-text">Xem</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7">
                                        <div className="empty-state">
                                            <FiFilter className="empty-icon" />
                                            <h4>Không tìm thấy phiếu xuất nào!</h4>
                                            <p>Vui lòng thử thay đổi từ khóa tìm kiếm hoặc khoảng thời gian.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LichSuXuatKho;