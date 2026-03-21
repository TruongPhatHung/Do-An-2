import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../services/axiosConfig';
import './ChiTietHangHoa.css'; // Sử dụng file CSS riêng vừa tạo

const ChiTietHangHoa = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [hangHoa, setHangHoa] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHangHoaDetail = async () => {
            console.log(`Đang tìm hàng hóa với ID: ${id}`);
            try {
                // Sử dụng đúng endpoint /products/${id}
                const res = await api.get(`/products/${id}`);
                setHangHoa(res.data);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết hàng hóa", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHangHoaDetail();
    }, [id]);

    if (isLoading) return (
        <div className="detail-container">
            <div className="loading-text">⏳ Đang tải thông tin sản phẩm...</div>
        </div>
    );

    if (!hangHoa) return (
        <div className="detail-container">
            <div className="error-text">❌ Không tìm thấy thông tin hàng hóa!</div>
            <button onClick={() => navigate('/products')} className="btn-back">Quay lại</button>
        </div>
    );

    // Kiểm tra trạng thái tồn kho để đổi màu
    const isLowStock = hangHoa.soLuongTon < hangHoa.soLuongToiThieu;

    return (
        <div className="detail-container">
            <div className="detail-card">
                {/* Header của thẻ chi tiết */}
                <div className="detail-header">
                    <h2>📑 Chi Tiết Sản Phẩm</h2>
                    <button onClick={() => navigate('/products')} className="btn-back">
                        ⬅ Quay lại danh sách
                    </button>
                </div>

                {/* Nội dung chi tiết */}
                <div className="detail-body">
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Mã sản phẩm</label>
                            <span className="value">#{hangHoa.maHang}</span>
                        </div>

                        <div className="detail-item">
                            <label>Loại hàng / Danh mục</label>
                            <div>
                                <span className="value badge-category">
                                    {hangHoa.loaiHang ? hangHoa.loaiHang.tenLoai : 'Chưa phân loại'}
                                </span>
                            </div>
                        </div>

                        <div className="detail-item" style={{ gridColumn: '1 / span 2' }}>
                            <label>Tên sản phẩm</label>
                            <span className="value" style={{ fontSize: '1.4rem', color: '#2980b9' }}>
                                {hangHoa.tenHang}
                            </span>
                        </div>

                        <div className="detail-item">
                            <label>Số lượng hiện tại</label>
                            <span className={`value ${isLowStock ? 'stock-warning' : 'stock-ok'}`}>
                                {hangHoa.soLuongTon} {hangHoa.donViTinh}
                                {isLowStock && " (Dưới định mức!)"}
                            </span>
                        </div>

                        <div className="detail-item">
                            <label>Định mức tối thiểu</label>
                            <span className="value">{hangHoa.soLuongToiThieu} {hangHoa.donViTinh}</span>
                        </div>

                        <div className="detail-item">
                            <label>Giá nhập kho</label>
                            <span className="value price-tag">
                                {hangHoa.giaNhap ? hangHoa.giaNhap.toLocaleString() : '0'} VNĐ
                            </span>
                        </div>

                        <div className="detail-item">
                            <label>Đơn vị tính</label>
                            <span className="value">{hangHoa.donViTinh || 'Cái'}</span>
                        </div>
                    </div>
                </div>

                {/* Phần dưới cùng (nếu cần thêm nút Sửa nhanh) */}
                <div className="detail-footer">
                    <p style={{ fontSize: '0.8rem', color: '#bdc3c7', margin: 0 }}>
                        Hệ thống quản lý kho thông minh &copy; 2024
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChiTietHangHoa;