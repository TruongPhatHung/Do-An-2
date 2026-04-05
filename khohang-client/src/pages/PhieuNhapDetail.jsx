import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { FiArrowLeft, FiPrinter, FiPackage, FiUser, FiCalendar, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
// 🎯 ĐÃ ĐỔI: Import file CSS mới
import './PhieuNhapDetail.css';

const PhieuNhapDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [phieu, setPhieu] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Đảm bảo sếp dùng đúng ID khóa chính, ví dụ 'PNK-123...'
                const res = await api.get(`/phieu-nhap/${id}`);
                setPhieu(res.data);
            } catch (error) {
                toast.error("Không tìm thấy thông tin phiếu nhập!");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handlePrint = () => {
        window.print(); // Lệnh in nhanh của trình duyệt
    };

    if (loading) return <div className="loading">⏳ Đang lấy dữ liệu...</div>;
    if (!phieu) return <div className="error">❌ Phiếu không tồn tại!</div>;

    return (
        <div className="detail-container">
            {/* Header điều hướng - Sẽ ẩn khi in */}
            {/* 🎯 ĐÃ ĐỔI: Gom nút lên trên cùng */}
            <div className="no-print detail-header-actions">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <FiArrowLeft /> Quay lại
                </button>
                <button onClick={handlePrint} className="btn-print">
                    <FiPrinter /> In phiếu nhập
                </button>
            </div>

            {/* Vùng nội dung phiếu - Sẽ được in */}
            <div className="printable-receipt">
                <div className="receipt-header">
                    <h2>PHIẾU NHẬP KHO VẬT TƯ</h2>
                    {/* Sửa lại để lấy đúng mã khóa chính 'PNK-...' */}
                    <p className="receipt-code">Mã phiếu: {phieu.maPhieuNhap}</p>
                </div>

                <div className="receipt-info-grid">
                    <div className="info-item">
                        <FiUser /> <strong>Người nhập:</strong> {phieu.nguoiNhap || '---'}
                    </div>
                    <div className="info-item">
                        <FiCalendar /> <strong>Ngày nhập:</strong> {phieu.ngayNhap ? new Date(phieu.ngayNhap).toLocaleString('vi-VN') : '---'}
                    </div>
                    <div className="info-item">
                        <FiPackage /> <strong>Nhà cung cấp:</strong> {phieu.nhaCungCap?.tenNCC || 'N/A'}
                    </div>
                    <div className="info-item">
                        <FiFileText /> <strong>Đơn hàng gốc:</strong> {phieu.donDatHang?.maDon || 'N/A'}
                    </div>
                </div>

                <table className="receipt-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã Hàng</th>
                            <th>Tên Mặt Hàng</th>
                            <th>Số Lượng</th>
                            <th>Đơn Giá</th>
                            <th>Thành Tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {phieu.chiTiets?.map((ct, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                {/* 🎯 ĐÃ SỬA LỖI: Lấy đúng object hangHoa theo Entity mới */}
                                <td>{ct.hangHoa?.maHang}</td>
                                <td>{ct.hangHoa?.tenHang}</td>
                                <td>{ct.soLuong}</td>
                                <td>{(ct.donGia || 0).toLocaleString()} đ</td>
                                <td>{(ct.soLuong * (ct.donGia || 0)).toLocaleString()} đ</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="5" className="total-row-label">TỔNG CỘNG CỦA PHIẾU:</td>
                            {/* 🎯 ĐÃ ĐỔI: Style màu đỏ in đậm */}
                            <td className="total-amount">{(phieu.tongTien || 0).toLocaleString()} VNĐ</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Khu vực chữ ký - Gom lại 2 bên */}
                <div className="receipt-footer">
                    <div className="signature-box">
                        <p><strong>Người lập phiếu</strong></p>
                        <p>(Ký, họ tên)</p>
                    </div>
                    <div className="signature-box">
                        <p><strong>Thủ kho</strong></p>
                        <p>(Ký, họ tên)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhieuNhapDetail;