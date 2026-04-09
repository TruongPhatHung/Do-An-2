import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { FiArrowLeft, FiPrinter, FiUser, FiCalendar, FiFileText, FiTruck, FiMapPin, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './PhieuNhapDetail.css'; 

const PhieuXuatDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [phieu, setPhieu] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Thêm timestamp để chống cache dữ liệu cũ
                const res = await api.get(`/phieu-xuat/${id}?t=${new Date().getTime()}`);
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

    // 🎯 HÀM TÍNH TỔNG TIỀN PHÒNG NGỪA (NẾU BACKEND TRẢ VỀ 0)
    const calculateGrandTotal = () => {
        if (phieu.tongTien > 0) return phieu.tongTien;
        return phieu.chiTiets?.reduce((sum, ct) => {
            const gia = ct.donGia || ct.hangHoa?.giaBan || 0;
            const sl = ct.soLuongXuat || 0;
            return sum + (gia * sl);
        }, 0) || 0;
    };

    return (
        <div className="detail-container">
            {/* Thanh thao tác không hiện khi in */}
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
                    <h2 className="company-name">WMS - HỆ THỐNG QUẢN LÝ KHO</h2>
                    <div className="divider"></div>
                    <h2>PHIẾU XUẤT KHO KIÊM GIAO HÀNG</h2>
                    <p className="receipt-code">Mã số: <b>{phieu.maPhieuXuat || id}</b></p>
                </div>

                <div className="receipt-info-grid">
                    <div className="info-item">
                        <FiUser className="icon" /> <span><strong>Người lập phiếu:</strong> {phieu.nguoiDung?.hoTen || phieu.nguoiTao || 'Thủ kho'}</span>
                    </div>
                    <div className="info-item">
                        <FiCalendar className="icon" /> <span><strong>Ngày xuất kho:</strong> {phieu.ngayXuat ? new Date(phieu.ngayXuat).toLocaleString('vi-VN') : '---'}</span>
                    </div>
                    <div className="info-item">
                        <FiTruck className="icon" /> <span><strong>Khách hàng:</strong> {phieu.tenNguoiNhan || 'Khách hàng lẻ'}</span>
                    </div>
                    <div className="info-item">
                        <FiFileText className="icon" /> <span><strong>Lý do xuất:</strong> {phieu.lyDoXuat || phieu.ghiChu || 'Xuất hàng theo yêu cầu'}</span>
                    </div>
                </div>

                <table className="receipt-table">
                    <thead>
                        {/* 🎯 SẠCH SẼ - KHÔNG KHOẢNG TRẮNG GIỮA CÁC THẺ TH/TD */}
                        <tr>
                            <th style={{ width: '50px' }}>STT</th>
                            <th style={{ width: '120px' }}>Mã Hàng</th>
                            <th>Tên Mặt Hàng</th>
                            <th className="text-center" style={{ width: '80px' }}>SL</th>
                            <th className="text-right" style={{ width: '120px' }}>Đơn Giá</th>
                            <th className="text-right" style={{ width: '150px' }}>Thành Tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {phieu.chiTiets && phieu.chiTiets.length > 0 ? phieu.chiTiets.map((ct, index) => {
                            const gia = ct.donGia || ct.hangHoa?.giaBan || 0;
                            const sl = ct.soLuongXuat || 0;
                            const thanhTien = gia * sl;
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="fw-bold">{ct.hangHoa?.maHang || '---'}</td>
                                    <td>{ct.hangHoa?.tenHang || 'Sản phẩm không xác định'}</td>
                                    <td className="text-center">{sl}</td>
                                    <td className="text-right">{gia.toLocaleString('vi-VN')} đ</td>
                                    <td className="text-right">{thanhTien.toLocaleString('vi-VN')} đ</td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4">Không có dữ liệu chi tiết hàng hóa</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="5" className="total-row-label">TỔNG GIÁ TRỊ THANH TOÁN:</td>
                            <td className="total-amount">{calculateGrandTotal().toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="receipt-footer-notes">
                    <p><i>* Ghi chú: {phieu.ghiChu || 'Không có ghi chú thêm.'}</i></p>
                </div>

                <div className="receipt-signature-area">
                    <div className="sig-box">
                        <p><strong>Người lập phiếu</strong></p>
                        <p className="sig-sub">(Ký, ghi rõ họ tên)</p>
                        <div className="sig-space"></div>
                        <p><b>{phieu.nguoiDung?.hoTen || phieu.nguoiTao || ''}</b></p>
                    </div>
                    <div className="sig-box">
                        <p><strong>Thủ kho</strong></p>
                        <p className="sig-sub">(Ký, ghi rõ họ tên)</p>
                        <div className="sig-space"></div>
                    </div>
                    <div className="sig-box">
                        <p><strong>Người nhận hàng</strong></p>
                        <p className="sig-sub">(Ký, ghi rõ họ tên)</p>
                        <div className="sig-space"></div>
                        <p><b>{phieu.tenNguoiNhan || ''}</b></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhieuXuatDetail;