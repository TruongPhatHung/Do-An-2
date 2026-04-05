import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { FiArrowLeft, FiPrinter, FiUser, FiCalendar, FiFileText, FiTruck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './PhieuNhapDetail.css'; // Dùng chung CSS để chuẩn Form A4

const PhieuXuatDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [phieu, setPhieu] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // 🎯 Sếp kiểm tra lại bên Backend xem @RequestMapping có đúng là /api/phieu-xuat không nhé
                const res = await api.get(`/phieu-xuat/${id}`);
                setPhieu(res.data);
            } catch (error) {
                console.error("Lỗi API:", error);
                toast.error("Không tìm thấy thông tin phiếu xuất " + id);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="loading-container">⏳ Đang lấy dữ liệu phiếu {id}...</div>;

    if (!phieu) return (
        <div className="error-container">
            <button onClick={() => navigate(-1)} className="btn-back"><FiArrowLeft /> Quay lại</button>
            <p>❌ Phiếu xuất <strong>{id}</strong> không tồn tại trên hệ thống!</p>
        </div>
    );

    // Tính tổng tiền an toàn
    const displayTotal = phieu.tongTien || phieu.chiTiets?.reduce((sum, ct) => {
        const gia = ct.donGia || ct.hangHoa?.giaBan || 0;
        return sum + (gia * (ct.soLuongXuat || 0));
    }, 0) || 0;

    return (
        <div className="detail-container">
            <div className="no-print detail-header-actions">
                <button onClick={() => navigate('/lich-su-xuat-kho')} className="btn-back">
                    <FiArrowLeft /> Danh sách
                </button>
                <button onClick={handlePrint} className="btn-print">
                    <FiPrinter /> In phiếu xuất
                </button>
            </div>

            <div className="printable-receipt">
                <div className="receipt-header">
                    <h2>PHIẾU XUẤT KHO KIÊM GIAO HÀNG</h2>
                    <p className="receipt-code">Mã số: {phieu.maPhieuXuat || id}</p>
                </div>

                <div className="receipt-info-grid">
                    <div className="info-item">
                        <FiUser /> <strong>Người xuất:</strong> {phieu.nguoiDung?.hoTen || phieu.nguoiTao || 'Thủ kho'}
                    </div>
                    <div className="info-item">
                        <FiCalendar /> <strong>Ngày xuất:</strong> {phieu.ngayXuat ? new Date(phieu.ngayXuat).toLocaleString('vi-VN') : '---'}
                    </div>
                    <div className="info-item">
                        <FiTruck /> <strong>Khách hàng:</strong> {phieu.tenNguoiNhan || 'Khách hàng vãng lai'}
                    </div>
                    <div className="info-item">
                        <FiFileText /> <strong>Lý do:</strong> {phieu.lyDoXuat || 'Xuất kho bán hàng'}
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
                        {phieu.chiTiets && phieu.chiTiets.length > 0 ? (
                            phieu.chiTiets.map((ct, index) => {
                                const gia = ct.donGia || ct.hangHoa?.giaBan || 0;
                                const sl = ct.soLuongXuat || 0;
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td style={{ fontWeight: 'bold' }}>{ct.hangHoa?.maHang || '---'}</td>
                                        <td>{ct.hangHoa?.tenHang || 'Sản phẩm lỗi'}</td>
                                        <td className="text-center">{sl}</td>
                                        <td className="text-right">{gia.toLocaleString('vi-VN')} đ</td>
                                        <td className="text-right">{(gia * sl).toLocaleString('vi-VN')} đ</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="6" className="text-center">Không có chi tiết hàng hóa</td></tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="5" className="total-row-label">TỔNG GIÁ TRỊ XUẤT KHO:</td>
                            <td className="total-amount">{displayTotal.toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="receipt-footer">
                    <div className="signature-box">
                        <p><strong>Người lập phiếu</strong></p>
                        <p>(Ký, ghi rõ họ tên)</p>
                    </div>
                    <div className="signature-box">
                        <p><strong>Thủ kho</strong></p>
                        <p>(Ký, ghi rõ họ tên)</p>
                    </div>
                    <div className="signature-box">
                        <p><strong>Người nhận hàng</strong></p>
                        <p>(Ký, ghi rõ họ tên)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhieuXuatDetail;