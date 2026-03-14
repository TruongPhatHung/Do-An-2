import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PODetail.css';

const PODetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Nhận dữ liệu order từ POList truyền sang
    const order = location.state?.order;

    // Nếu F5 trang hoặc không có dữ liệu thì báo lỗi và cho quay lại
    if (!order) {
        return (
            <div className="podetail-container" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Không tìm thấy thông tin đơn hàng!</h2>
                <button className="btn-back" onClick={() => navigate('/orders')}>Quay lại danh sách</button>
            </div>
        );
    }

    const calculateTotal = (chiTiets) => {
        if (!chiTiets || chiTiets.length === 0) return 0;
        return chiTiets.reduce((sum, item) => sum + (item.soLuongDat * item.donGia), 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className="podetail-container">
            <div className="podetail-header">
                <h2>📄 Chi Tiết Đơn Đặt Hàng: <span className="text-highlight">{order.maDon}</span></h2>
                <button className="btn-back" onClick={() => navigate('/danh-sach-po')}>⬅ Quay Lại</button>
            </div>

            <div className="info-grid">
                {/* Thẻ thông tin Nhà cung cấp */}
                <div className="info-card">
                    <h3>🏢 Thông Tin Nhà Cung Cấp</h3>
                    <p><strong>Tên công ty:</strong> {order.nhaCungCap?.tenNCC || 'N/A'}</p>
                    <p><strong>Mã NCC:</strong> {order.nhaCungCap?.maNCC}</p>
                    <p><strong>Email:</strong> {order.nhaCungCap?.email || 'Chưa cập nhật'}</p>
                    <p><strong>Địa chỉ:</strong> {order.nhaCungCap?.diaChi || 'Chưa cập nhật'}</p>
                </div>

                {/* Thẻ thông tin Đơn hàng */}
                <div className="info-card">
                    <h3>📦 Thông Tin Đơn Hàng</h3>
                    <p><strong>Ngày tạo:</strong> {formatDate(order.ngayTao)}</p>
                    <p><strong>Trạng thái:</strong> <span className={`badge ${order.trangThai === 'Mới Tạo' ? 'badge-new' : order.trangThai === 'Giao Thiếu' ? 'badge-partial' : 'badge-completed'}`}>{order.trangThai}</span></p>
                    <p><strong>Tổng giá trị:</strong> <span className="total-money">{calculateTotal(order.chiTiets).toLocaleString()} VNĐ</span></p>
                    <p><strong>Tiến độ giao:</strong> {order.trangThai === 'Hoàn Thành' ? '✅ Đã nhận đủ' : '⏳ Đang chờ hàng'}</p>
                </div>
            </div>

            {/* Bảng chi tiết mặt hàng */}
            <div className="table-section">
                <h3>🛒 Danh Sách Hàng Hóa Cần Mua</h3>
                <table className="podetail-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã Hàng</th>
                            <th>Tên Mặt Hàng</th>
                            <th style={{ textAlign: 'center' }}>Số Lượng Đặt</th>
                            <th style={{ textAlign: 'center' }}>Đã Nhập Kho</th>
                            <th style={{ textAlign: 'right' }}>Đơn Giá (VNĐ)</th>
                            <th style={{ textAlign: 'right' }}>Thành Tiền (VNĐ)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.chiTiets?.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td style={{ fontWeight: 'bold' }}>{item.maHang}</td>
                                <td>{item.tenHang}</td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.soLuongDat}</td>
                                
                                {/* Tô màu nếu hàng giao chưa đủ */}
                                <td style={{ 
                                    textAlign: 'center', 
                                    fontWeight: 'bold',
                                    color: item.soLuongDaNhap < item.soLuongDat ? '#e67e22' : '#27ae60'
                                }}>
                                    {item.soLuongDaNhap} / {item.soLuongDat}
                                </td>

                                <td style={{ textAlign: 'right' }}>{item.donGia?.toLocaleString()}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#2c3e50' }}>
                                    {(item.soLuongDat * item.donGia).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PODetail;