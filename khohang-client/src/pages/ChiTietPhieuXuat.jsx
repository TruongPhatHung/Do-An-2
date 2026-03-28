import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { 
    FiArrowLeft, 
    FiFileText, 
    FiTruck, 
    FiInfo, 
    FiShoppingCart 
} from 'react-icons/fi';
import './LichSuXuatKho.css'; 
import './ChiTietPhieuXuat.css'; 

const ChiTietPhieuXuat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [phieuXuat, setPhieuXuat] = useState(location.state?.phieu || null);
    const [loading, setLoading] = useState(!phieuXuat);

    useEffect(() => {
        if (!phieuXuat) {
            fetchChiTietPhieu();
        }
    }, [id]);

    const fetchChiTietPhieu = async () => {
        try {
            const response = await api.get(`/phieu-xuat/${id}`); 
            setPhieuXuat(response.data);
            setLoading(false);
        } catch (error) {
            toast.error("Lỗi tải chi tiết phiếu xuất!");
            setLoading(false);
        }
    };

    if (loading) return <div className="ctpx-loading">Đang tải dữ liệu...</div>;
    if (!phieuXuat) return <div className="ctpx-error">Không tìm thấy phiếu xuất.</div>;

    // Tính tổng giá trị phiếu xuất
    const tongGiaTri = phieuXuat.chiTiets?.reduce((total, ct) => {
        const displayPrice = ct.donGia || ct.hangHoa?.giaBan || ct.hangHoa?.giaNhap || 0;
        return total + (displayPrice * ct.soLuongXuat);
    }, 0) || 0;

    return (
        <div className="ctpx-container">
            {/* Thanh Header */}
            <div className="ctpx-header-row">
                <h2>
                    <FiFileText /> 
                    Chi Tiết Phiếu Xuất: <span className="text-primary">{phieuXuat.maPhieuXuat}</span>
                </h2>
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay Lại
                </button>
            </div>

            {/* 2 Khối Thông Tin */}
            <div className="ctpx-info-section">
                {/* Khối 1: Khách hàng / Nơi nhận */}
                <div className="ctpx-card">
                    <h3 className="ctpx-card-title">
                        <FiTruck /> Thông Tin Giao Nhận
                    </h3>
                    <div className="ctpx-info-row">
                        <span className="ctpx-info-label">Nơi nhận / Khách:</span>
                        <span className="ctpx-info-value">{phieuXuat.tenNguoiNhan || 'Khách lẻ'}</span>
                    </div>
                    <div className="ctpx-info-row">
                        <span className="ctpx-info-label">Lý do xuất:</span>
                        <span className="ctpx-info-value">
                            <span className="reason-badge">{phieuXuat.lyDoXuat}</span>
                        </span>
                    </div>
                    <div className="ctpx-info-row">
                        <span className="ctpx-info-label">Ghi chú:</span>
                        <span className="ctpx-info-value text-muted">
                            {phieuXuat.ghiChu || 'Không có ghi chú'}
                        </span>
                    </div>
                </div>

                {/* Khối 2: Thông tin chứng từ */}
                <div className="ctpx-card">
                    <h3 className="ctpx-card-title">
                        <FiInfo /> Thông Tin Chứng Từ
                    </h3>
                    <div className="ctpx-info-row">
                        <span className="ctpx-info-label">Ngày tạo:</span>
                        <span className="ctpx-info-value">
                            {new Date(phieuXuat.ngayXuat).toLocaleString('vi-VN')}
                        </span>
                    </div>
                    <div className="ctpx-info-row">
                        <span className="ctpx-info-label">Người lập:</span>
                        <span className="ctpx-info-value">
                            {phieuXuat.nguoiDung ? phieuXuat.nguoiDung.hoTen : 'Không rõ'}
                        </span>
                    </div>
                    <div className="ctpx-info-row">
                        <span className="ctpx-info-label">Tổng giá trị:</span>
                        <span className="ctpx-info-value text-orange-dark fw-bold" style={{ fontSize: '16px'}}>
                            {tongGiaTri.toLocaleString('vi-VN')} VNĐ
                        </span>
                    </div>
                </div>
            </div>

            {/* Khối Bảng Danh Sách */}
            <div className="ctpx-card ctpx-table-wrapper">
                <h3 className="ctpx-card-title">
                    <FiShoppingCart /> Danh Sách Hàng Hóa Xuất Kho
                </h3>
                <table className="lsxk-table mt-3">
                    <thead>
                        <tr>
                            <th className="text-center" style={{ width: '50px' }}>STT</th>
                            <th>Mã Hàng</th>
                            <th>Tên Sản Phẩm</th>
                            <th className="text-right">Đơn Giá</th>
                            <th className="text-center">Số Lượng</th>
                            <th className="text-right">Thành Tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {phieuXuat.chiTiets?.map((ct, index) => {
                            const displayPrice = ct.donGia || ct.hangHoa?.giaBan || ct.hangHoa?.giaNhap || 0;
                            const subTotal = displayPrice * ct.soLuongXuat;

                            return (
                                <tr key={index}>
                                    <td className="text-center">{index + 1}</td>
                                    <td className="fw-bold">{ct.hangHoa?.maHang}</td>
                                    <td>{ct.hangHoa?.tenHang}</td>
                                    <td className="text-right text-muted">
                                        {displayPrice.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td className="text-center fw-bold text-success">{ct.soLuongXuat}</td>
                                    <td className="text-right fw-bold text-orange-dark">
                                        {subTotal.toLocaleString('vi-VN')} đ
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

export default ChiTietPhieuXuat;