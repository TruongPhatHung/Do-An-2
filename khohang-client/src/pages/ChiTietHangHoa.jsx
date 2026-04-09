import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../services/axiosConfig';
import { FiArrowLeft, FiPackage, FiTag, FiDatabase, FiAlertTriangle, FiDollarSign, FiLayers } from 'react-icons/fi';
import './ChiTietHangHoa.css'; 

const ChiTietHangHoa = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [hangHoa, setHangHoa] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHangHoaDetail = async () => {
            console.log(`Đang tìm hàng hóa với ID: ${id}`);
            try {
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
        <div className="product-detail-wrapper">
            <div className="loading-state">⏳ Đang tải thông tin sản phẩm...</div>
        </div>
    );

    if (!hangHoa) return (
        <div className="product-detail-wrapper">
            <div className="error-state">
                <FiAlertTriangle className="error-icon" />
                <h2>Không tìm thấy hàng hóa!</h2>
                <p>Sản phẩm này có thể đã bị xóa hoặc không tồn tại.</p>
                <button onClick={() => navigate('/products')} className="btn-back">
                    <FiArrowLeft /> Quay lại danh sách
                </button>
            </div>
        </div>
    );

    const isLowStock = hangHoa.soLuongTon < hangHoa.soLuongToiThieu;

    return (
        <div className="product-detail-wrapper">
            {/* Thanh điều hướng */}
            <div className="page-header">
                <button onClick={() => navigate('/products')} className="btn-back">
                    <FiArrowLeft /> Danh sách sản phẩm
                </button>
                <h2 className="page-title">Chi Tiết Hàng Hóa</h2>
            </div>

            {/* Khung nội dung chính */}
            <div className="product-card">
                {/* Header của thẻ (Tên + Mã + Danh mục) */}
                <div className="card-header">
                    <div className="product-title-group">
                        <div className="product-avatar">
                            <FiPackage />
                        </div>
                        <div className="product-name-info">
                            <h3>{hangHoa.tenHang}</h3>
                            <span className="product-sku">Mã SP: <strong>{hangHoa.maHang}</strong></span>
                        </div>
                    </div>
                    <div className="product-category-badge">
                        <FiLayers /> {hangHoa.loaiHang ? hangHoa.loaiHang.tenLoai : 'Chưa phân loại'}
                    </div>
                </div>

                {/* Body chia Grid */}
                <div className="card-body">
                    <h4 className="section-title">Thông tin lưu kho & Định giá</h4>
                    <div className="info-grid">
                        
                        {/* Tồn kho */}
                        <div className={`info-box ${isLowStock ? 'warning-box' : 'success-box'}`}>
                            <div className="box-icon"><FiDatabase /></div>
                            <div className="box-content">
                                <label>Tồn kho hiện tại</label>
                                <div className="box-value">
                                    {hangHoa.soLuongTon} <span className="unit">{hangHoa.donViTinh}</span>
                                </div>
                                {isLowStock && <span className="warning-text">⚠ Dưới mức tối thiểu!</span>}
                            </div>
                        </div>

                        {/* Định mức */}
                        <div className="info-box">
                            <div className="box-icon neutral"><FiTag /></div>
                            <div className="box-content">
                                <label>Định mức tối thiểu</label>
                                <div className="box-value">
                                    {hangHoa.soLuongToiThieu} <span className="unit">{hangHoa.donViTinh}</span>
                                </div>
                            </div>
                        </div>

                        {/* Đơn vị tính */}
                        <div className="info-box">
                            <div className="box-icon neutral"><FiPackage /></div>
                            <div className="box-content">
                                <label>Đơn vị quản lý</label>
                                <div className="box-value">{hangHoa.donViTinh || 'Cái'}</div>
                            </div>
                        </div>

                        {/* Giá nhập */}
                        <div className="info-box price-box">
                            <div className="box-icon"><FiDollarSign /></div>
                            <div className="box-content">
                                <label>Giá nhập kho</label>
                                <div className="box-value text-price">
                                    {hangHoa.giaNhap ? hangHoa.giaNhap.toLocaleString('vi-VN') : '0'} <span className="unit">VNĐ</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="card-footer">
                    <p className="system-note">Cập nhật lần cuối bởi hệ thống WMS</p>
                </div>
            </div>
        </div>
    );
};

export default ChiTietHangHoa;