import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { FiArrowLeft, FiPrinter, FiPackage, FiUser, FiCalendar, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
// 🎯 Dùng chung file CSS "bọc thép" đã fix lỗi in ấn
import './PhieuNhapDetail.css';

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
        window.print();
    };

    if (loading) return <div className="loading">⏳ Đang lấy dữ liệu phiếu {id}...</div>;
    if (!phieu) return <div className="error">❌ Phiếu nhập không tồn tại!</div>;

    // Tính tổng tiền an toàn
    const displayTotal = phieu.tongTien || phieu.chiTiets?.reduce((sum, ct) => {
        return sum + ((ct.soLuong || 0) * (ct.donGia || 0));
    }, 0) || 0;

    return (
        <div className="detail-container">
            {/* Nút điều hướng - Sẽ ẩn khi in */}
            <div className="no-print detail-header-actions">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <FiArrowLeft /> Quay lại
                </button>
                <button onClick={handlePrint} className="btn-print">
                    <FiPrinter /> In phiếu nhập
                </button>
            </div>

            {/* Vùng nội dung phiếu - Chuẩn Form A4 */}
            <div className="printable-receipt">
                <div className="receipt-header">
                    <h2>PHIẾU NHẬP KHO VẬT TƯ</h2>
                    <p className="receipt-code">Mã phiếu: {phieu.maPhieuNhap || id}</p>
                </div>

                {/* Grid thông tin chia 2 cột chuyên nghiệp */}
                <div className="receipt-info-grid">
                    <div className="info-group">
                        <div className="info-item">
                            <FiUser className="icon-green" />
                            <strong>Người nhập:</strong> {phieu.nguoiNhap || '---'}
                        </div>
                        <div className="info-item">
                            <FiPackage className="icon-green" />
                            <strong>Nhà cung cấp:</strong> {phieu.nhaCungCap?.tenNCC || 'N/A'}
                        </div>
                    </div>
                    <div className="info-group">
                        <div className="info-item">
                            <FiCalendar className="icon-green" />
                            <strong>Ngày nhập:</strong> {phieu.ngayNhap ? new Date(phieu.ngayNhap).toLocaleString('vi-VN') : '---'}
                        </div>
                        <div className="info-item">
                            <FiFileText className="icon-green" />
                            <strong>Đơn hàng gốc:</strong> {phieu.donDatHang?.maDon || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Bảng chi tiết chuẩn mẫu */}
                <table className="receipt-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>STT</th>
                            <th>MÃ HÀNG</th>
                            <th>TÊN MẶT HÀNG</th>
                            <th className="text-center">SỐ LƯỢNG</th>
                            <th className="text-right">ĐƠN GIÁ</th>
                            <th className="text-right">THÀNH TIỀN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {phieu.chiTiets?.map((ct, index) => {
                            const thanhTien = (ct.soLuong || 0) * (ct.donGia || 0);
                            return (
                                <tr key={index}>
                                    <td className="text-center">{index + 1}</td>
                                    <td className="text-bold-blue">{ct.hangHoa?.maHang || '---'}</td>
                                    <td>{ct.hangHoa?.tenHang || 'Sản phẩm lỗi'}</td>
                                    <td className="text-center">{ct.soLuong}</td>
                                    <td className="text-right">{(ct.donGia || 0).toLocaleString()} đ</td>
                                    <td className="text-right">{thanhTien.toLocaleString()} đ</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="total-row">
                            <td colSpan="5" className="total-row-label">TỔNG GIÁ TRỊ NHẬP KHO:</td>
                            <td className="total-amount">
                                {displayTotal.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>VNĐ</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Khu vực chữ ký 2 bên cân đối */}
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