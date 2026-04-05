import React, { useState, useEffect, useContext } from 'react';
import api from '../services/axiosConfig';
import { AuthContext } from '../Context/AuthContext';
import './HangHoaList.css';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiEdit, FiAlertCircle, FiFilter, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-toastify'; // 🎯 Thêm Toast để bật popup

const HangHoaList = () => {
    const [hangHoa, setHangHoa] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchHangHoa = async () => {
            try {
                const response = await api.get('/products');
                const data = Array.isArray(response.data) ? response.data : [];
                setHangHoa(data);

                // 🎯 1. BẬT POPUP CẢNH BÁO KHI TẢI XONG DỮ LIỆU
                const lowStockCount = data.filter(item => (item.soLuongTon || 0) < (item.soLuongToiThieu || 0)).length;
                if (lowStockCount > 0) {
                    toast.warn(`Cảnh báo: Có ${lowStockCount} mặt hàng đang dưới định mức, cần nhập kho!`, {
                        position: "top-right",
                        autoClose: 5000,
                        toastId: 'low-stock-alert' // Ngăn toast bị lặp lại nhiều lần
                    });
                }

            } catch (error) {
                console.error("Lỗi khi tải danh sách hàng hóa:", error);
                setHangHoa([]);
            }
        };
        fetchHangHoa();
    }, []);

    // 🎯 2. TÍNH TOÁN DANH SÁCH SẮP HẾT HÀNG CHO BANNER
    const lowStockItems = hangHoa.filter(item => (item.soLuongTon || 0) < (item.soLuongToiThieu || 0));

    // Logic Lọc Dữ Liệu Kết Hợp
    const filteredHangHoa = hangHoa.filter(item => {
        if (!item) return false;

        const term = searchTerm.toLowerCase();
        const matchSearch = (item.tenHang || "").toLowerCase().includes(term) ||
            (item.maHang || "").toLowerCase().includes(term) ||
            (item.loaiHang?.tenLoai || "").toLowerCase().includes(term);

        let matchStock = true;
        const stock = item.soLuongTon || 0;
        const minStock = item.soLuongToiThieu || 0;

        if (stockFilter === 'under10') matchStock = stock < 10;
        else if (stockFilter === 'under20') matchStock = stock < 20;
        else if (stockFilter === 'under50') matchStock = stock < 50;
        else if (stockFilter === 'over50') matchStock = stock >= 50;
        else if (stockFilter === 'outOfStock') matchStock = stock === 0;
        // 🎯 3. THÊM LOGIC LỌC NHỮNG MÓN DƯỚI ĐỊNH MỨC
        else if (stockFilter === 'lowStockWarning') matchStock = stock < minStock;

        return matchSearch && matchStock;
    });

    const totalPages = Math.ceil(filteredHangHoa.length / itemsPerPage);
    const currentItems = filteredHangHoa.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, stockFilter]);

    return (
        <div className="hanghoa-container">
            <div className="hanghoa-header">
                <h2>📦 Quản Lý Danh Mục Hàng Hóa</h2>
            </div>

            {/* 🎯 4. BANNER CẢNH BÁO KHẨN CẤP TRÊN CÙNG */}
            {lowStockItems.length > 0 && (
                <div className="alert-banner">
                    <div className="alert-banner-content">
                        <FiAlertCircle size={28} className="alert-pulse" />
                        <div>
                            <strong>HỆ THỐNG CẢNH BÁO:</strong> Phát hiện <strong>{lowStockItems.length}</strong> mặt hàng có số lượng tồn kho thấp hơn định mức an toàn.
                        </div>
                    </div>
                    <button
                        className="btn-filter-alert"
                        onClick={() => setStockFilter('lowStockWarning')}
                    >
                        <FiFilter /> Lọc xem ngay
                    </button>
                </div>
            )}

            <div className="toolbar-container">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Tìm theo mã, tên hoặc loại hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-box">
                    <FiFilter className="filter-icon" />
                    <select
                        className="filter-select"
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                    >
                        <option value="all">Tất cả số lượng</option>
                        {/* 🎯 Thêm option Lọc cảnh báo vào Menu */}
                        <option value="lowStockWarning">⚠️ Cần nhập kho (Dưới định mức)</option>
                        <option value="under10">Tồn kho dưới 10</option>
                        <option value="under20">Tồn kho dưới 20</option>
                        <option value="under50">Tồn kho dưới 50</option>
                        <option value="over50">Tồn kho từ 50 trở lên</option>
                        <option value="outOfStock">Đã hết hàng (0)</option>
                    </select>
                </div>
            </div>

            <div className="table-responsive">
                <table className="hanghoa-table">
                    <thead>
                        <tr>
                            <th>Mã Hàng</th>
                            <th>Tên Hàng</th>
                            <th>Loại Hàng</th>
                            <th>Đơn Vị Tính</th>
                            <th>Số Lượng Tồn</th>
                            <th>Định Mức</th>
                            {(user?.role === 'ADMIN' || user?.role === 'MUAHANG') && (
                                <th>Giá Nhập</th>
                            )}
                            <th style={{ textAlign: 'center' }}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item) => {
                            const isLowStock = (item.soLuongTon || 0) < (item.soLuongToiThieu || 0);

                            return (
                                <tr key={item.maHang || Math.random()}>
                                    <td className="font-medium">{item.maHang || 'N/A'}</td>
                                    <td>{item.tenHang || 'Không tên'}</td>
                                    <td>
                                        <span className="badge-category">
                                            {item.loaiHang ? item.loaiHang.tenLoai : 'Chưa phân loại'}
                                        </span>
                                    </td>
                                    <td>{item.donViTinh || 'Cái'}</td>

                                    <td>
                                        <div className={isLowStock ? "stock-warning" : "stock-normal"}>
                                            {item.soLuongTon ?? 0}
                                            {isLowStock && <FiAlertCircle className="warning-icon" title="Sắp hết hàng!" />}
                                        </div>
                                    </td>

                                    <td className="text-muted">{item.soLuongToiThieu ?? 0}</td>

                                    {(user?.role === 'ADMIN' || user?.role === 'MUAHANG') && (
                                        <td className="price-text">
                                            {item.giaNhap ? item.giaNhap.toLocaleString() : '0'} VNĐ
                                        </td>
                                    )}

                                    <td className="action-buttons">
                                        <button
                                            className="btn-action btn-view"
                                            onClick={() => navigate(`/product-detail/${item.maHang}`)}
                                            title="Xem chi tiết"
                                        >
                                            <FiEye /> Xem
                                        </button>
                                        <button
                                            className="btn-action btn-edit"
                                            onClick={() => navigate(`/edit-product/${item.maHang}`)}
                                            title="Chỉnh sửa"
                                        >
                                            <FiEdit /> Sửa
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {currentItems.length === 0 && (
                            <tr>
                                <td colSpan={user?.role === 'ADMIN' || user?.role === 'MUAHANG' ? 8 : 7} className="empty-message">
                                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" alt="Empty" width="60" style={{ opacity: 0.5, marginBottom: '10px' }} />
                                    <p>Không tìm thấy hàng hóa nào phù hợp với điều kiện lọc.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button className="page-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Trước</button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button key={index + 1} className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => paginate(index + 1)}>
                            {index + 1}
                        </button>
                    ))}
                    <button className="page-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Sau</button>
                </div>
            )}
        </div>
    );
};

export default HangHoaList;