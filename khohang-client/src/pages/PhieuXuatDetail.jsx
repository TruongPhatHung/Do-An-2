import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { FiArrowLeft, FiPrinter, FiUser, FiCalendar, FiFileText, FiTruck, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './PhieuNhapDetail.css'; // Sếp dùng chung style với Phiếu Nhập là hợp lý

const PhieuXuatDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [phieu, setPhieu] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Thêm timestamp để tránh cache dữ liệu cũ của trình duyệt
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

    // 🎯 HÀM TÍNH TỔNG GIÁ TRỊ PHIẾU (LUÔN DÙNG ĐƠN GIÁ CHỐT LÚC XUẤT)
    const calculateGrandTotal = () => {
        if (!phieu) return 0;
        // Nếu Backend đã tính sẵn tongTien thì dùng luôn, không thì cộng dồn thủ công
        if (phieu.tongTien > 0) return phieu.tongTien;

        return phieu.chiTiets?.reduce((sum, ct) => {
            const giaThucTe = ct.donGia || 0; // Đơn giá đã được Backend chốt (Giá bán hoặc Giá nhập)
            return sum + (giaThucTe * (ct.soLuongXuat || 0));
        }, 0) || 0;
    };

    if (loading) return <div className="loading-container">⏳ Đang tải thông tin phiếu xuất {id}...</div>;

    if (!phieu) return (
        <div className="error-container">
            <button onClick={() => navigate(-1)} className="btn-back"><FiArrowLeft /> Quay lại</button>
            <p>❌ Phiếu xuất <strong>{id}</strong> không tồn tại!</p>
        </div>
    );

    return (
        <div className="detail-container">
            {/* Nút bấm (Sẽ ẩn đi khi bấm In) */}
            <div className="no-print detail-header-actions">
                <button onClick={() => navigate('/lich-su-xuat-kho')} className="btn-back">
                    <FiArrowLeft /> Quay lại lịch sử
                </button>
                <button onClick={handlePrint} className="btn-print">
                    <FiPrinter /> In Phiếu Giao Hàng
                </button>
            </div>

            {/* PHẦN NỘI DUNG PHIẾU IN */}
            <div className="printable-receipt">
                <div className="receipt-header">
                    <h2 className="company-name">WMS - QUẢN LÝ KHO ĐẠI LÝ</h2>
                    <div className="divider"></div>
                    <h2>PHIẾU XUẤT KHO KIÊM GIAO HÀNG</h2>
                    <p className="receipt-code">Số phiếu: <b>{phieu.maPhieuXuat || id}</b></p>
                </div>

                <div className="receipt-info-grid">
                    <div className="info-item">
                        <FiUser className="icon" />
                        <span><strong>Người lập:</strong> {phieu.nguoiDung?.hoTen || phieu.nguoiTao || 'Thủ kho'}</span>
                    </div>
                    <div className="info-item">
                        <FiCalendar className="icon" />
                        <span><strong>Ngày xuất:</strong> {phieu.ngayXuat ? new Date(phieu.ngayXuat).toLocaleString('vi-VN') : '---'}</span>
                    </div>
                    <div className="info-item">
                        <FiTruck className="icon" />
                        <span><strong>Đối tác/Đại lý:</strong> {phieu.tenNguoiNhan || 'Khách hàng lẻ'}</span>
                    </div>
                    <div className="info-item">
                        <FiFileText className="icon" />
                        <span><strong>Nghiệp vụ:</strong> {phieu.lyDoXuat || 'Xuất bán hàng'}</span>
                    </div>
                </div>

                <table className="receipt-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>STT</th>
                            <th style={{ width: '120px' }}>Mã Hàng</th>
                            <th>Tên Mặt Hàng</th>
                            <th className="text-center" style={{ width: '80px' }}>SL</th>
                            <th className="text-right" style={{ width: '140px' }}>Đơn Giá (VND)</th>
                            <th className="text-right" style={{ width: '160px' }}>Thành Tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {phieu.chiTiets?.map((ct, index) => {
                            const giaChot = ct.donGia || 0; // Đây chính là GIÁ BÁN nếu sếp xuất cho Đại lý
                            const thanhTien = giaChot * (ct.soLuongXuat || 0);

                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="fw-bold">{ct.hangHoa?.maHang || '---'}</td>
                                    <td>{ct.hangHoa?.tenHang || 'Sản phẩm không xác định'}</td>
                                    <td className="text-center">{ct.soLuongXuat}</td>
                                    <td className="text-right">{giaChot.toLocaleString('vi-VN')}</td>
                                    <td className="text-right fw-bold">{thanhTien.toLocaleString('vi-VN')}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="5" className="total-row-label">TỔNG CỘNG GIÁ TRỊ THANH TOÁN:</td>
                            <td className="total-amount">{calculateGrandTotal().toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="receipt-footer-notes">
                    <p><i>* Ghi chú: {phieu.ghiChu || 'Hàng xuất kho theo hợp đồng đại lý.'}</i></p>
                </div>

                {/* KHU VỰC KÝ TÊN */}
                <div className="receipt-signature-area">
                    <div className="sig-box">
                        <p><strong>Người lập phiếu</strong></p>
                        <p className="sig-sub">(Ký, họ tên)</p>
                        <div className="sig-space"></div>
                        <p><b>{phieu.nguoiDung?.hoTen || phieu.nguoiTao || ''}</b></p>
                    </div>
                    <div className="sig-box">
                        <p><strong>Thủ kho</strong></p>
                        <p className="sig-sub">(Ký, họ tên)</p>
                        <div className="sig-space"></div>
                    </div>
                    <div className="sig-box">
                        <p><strong>Đại lý nhận hàng</strong></p>
                        <p className="sig-sub">(Ký, họ tên)</p>
                        <div className="sig-space"></div>
                        <p><b>{phieu.tenNguoiNhan || ''}</b></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhieuXuatDetail;