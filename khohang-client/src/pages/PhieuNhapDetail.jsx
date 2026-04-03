import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { FiArrowLeft, FiPrinter, FiPackage, FiUser, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './LichSuNhapKho.css'; // Dùng chung file CSS hoặc tạo mới

const PhieuNhapDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [phieu, setPhieu] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
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
                    <p className="receipt-code">Mã phiếu: {phieu.maPhieuNhap || phieu.maPhieu}</p>
                </div>

                <div className="receipt-info-grid">
                    <div className="info-item">
                        <FiUser /> <strong>Người nhập:</strong> {phieu.nguoiNhap}
                    </div>
                    <div className="info-item">
                        <FiCalendar /> <strong>Ngày nhập:</strong> {new Date(phieu.ngayNhap).toLocaleString('vi-VN')}
                    </div>
                    <div className="info-item">
                        <FiPackage /> <strong>Nhà cung cấp:</strong> {phieu.nhaCungCap?.tenNCC}
                    </div>
                    <div className="info-item">
                        <strong>Đơn hàng gốc:</strong> {phieu.donDatHang?.maDon}
                    </div>
                </div>

                <table className="receipt-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã Hàng</th>
                            <th>Tên Mặt Hàng</th>
                            <th className="text-center">Số Lượng</th>
                            <th className="text-right">Đơn Giá</th>
                            <th className="text-right">Thành Tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {phieu.chiTiets?.map((ct, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{ct.hangHoa?.maHang}</td>
                                <td>{ct.hangHoa?.tenHang}</td>
                                <td className="text-center">{ct.soLuong}</td>
                                <td className="text-right">{(ct.donGia || 0).toLocaleString()} đ</td>
                                <td className="text-right">{(ct.soLuong * (ct.donGia || 0)).toLocaleString()} đ</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="5" className="text-right font-bold">TỔNG CỘNG CỦA PHIẾU:</td>
                            <td className="text-right total-amount">{(phieu.tongTien || 0).toLocaleString()} VNĐ</td>
                        </tr>
                    </tfoot>
                </table>

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