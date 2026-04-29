import React, { useState, useEffect, useContext } from 'react';
import api from '../services/axiosConfig';
import { AuthContext } from '../Context/AuthContext';
import './HangHoaList.css';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiEdit, FiAlertCircle, FiFilter, FiShoppingCart, FiTruck } from 'react-icons/fi';
import { FaBoxes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const HangHoaList = () => {
    const [hangHoa, setHangHoa] = useState([]);
    const [pendingItems, setPendingItems] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Chuẩn hóa role để dễ kiểm tra
    const userRole = user?.role?.toUpperCase();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resProducts, resPending] = await Promise.all([
                    api.get('/products'),
                    api.get('/yeu-cau-mua/hang-dang-cho-ve')
                ]);

                const productsData = Array.isArray(resProducts.data) ? resProducts.data : [];
                setHangHoa(productsData);

                const pendingData = resPending.data || {};
                setPendingItems(pendingData);

                const itemsToOrder = productsData.filter(item => {
                    const stock = Number(item.soLuongTon || 0);
                    const minStock = Number(item.soLuongToiThieu || 0);
                    const incomingQty = pendingData[item.maHang] || 0;
                    return (stock + incomingQty) < minStock;
                });

                if (itemsToOrder.length > 0) {
                    toast.warn(`Cảnh báo: Có ${itemsToOrder.length} mặt hàng đang thiếu hụt, cần đặt thêm!`, {
                        position: "top-right", autoClose: 5000, toastId: 'low-stock-alert'
                    });
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách:", error);
            }
        };
        fetchData();
    }, []);

    const lowStockItems = hangHoa.filter(item => {
        const stock = Number(item.soLuongTon || 0);
        const incomingQty = pendingItems[item.maHang] || 0;
        return (stock + incomingQty) < Number(item.soLuongToiThieu || 0);
    });

    const incomingItems = hangHoa.filter(item => {
        const stock = Number(item.soLuongTon || 0);
        const minStock = Number(item.soLuongToiThieu || 0);
        const incomingQty = pendingItems[item.maHang] || 0;
        return stock < minStock && (stock + incomingQty) >= minStock;
    });

   // Thay thế đoạn này trong HangHoaList.jsx
const handleChuyenSangTrangLapYeuCau = () => {
    if (lowStockItems.length === 0) return toast.info("Không có hàng cần nhập!");

    const dataToOrder = lowStockItems.map(item => {
        const stock = Number(item.soLuongTon || 0);
        const incomingQty = pendingItems[item.maHang] || 0;
        // Trả về đúng Tồn kho thực tế, và truyền thêm biến hangDangVe
        return { ...item, soLuongTon: stock, hangDangVe: incomingQty }; 
    });

    navigate('/lap-lenh-yeu-cau-mua', { state: { items: dataToOrder } });
};

    const filteredHangHoa = hangHoa.filter(item => {
        if (!item) return false;

        const term = searchTerm.toLowerCase();
        const matchSearch = (item.tenHang || "").toLowerCase().includes(term) ||
            (item.maHang || "").toLowerCase().includes(term) ||
            (item.loaiHang?.tenLoai || "").toLowerCase().includes(term);

        let matchStock = true;
        const stock = Number(item.soLuongTon || 0);
        const minStock = Number(item.soLuongToiThieu || 0);
        const incomingQty = pendingItems[item.maHang] || 0;
        const totalExpected = stock + incomingQty;

        if (stockFilter === 'under10') matchStock = stock < 10;
        else if (stockFilter === 'under20') matchStock = stock < 20;
        else if (stockFilter === 'under50') matchStock = stock < 50;
        else if (stockFilter === 'over50') matchStock = stock >= 50;
        else if (stockFilter === 'outOfStock') matchStock = stock === 0;
        else if (stockFilter === 'lowStockWarning') matchStock = totalExpected < minStock;
        else if (stockFilter === 'incoming') matchStock = stock < minStock && totalExpected >= minStock;

        return matchSearch && matchStock;
    });

    const totalPages = Math.ceil(filteredHangHoa.length / itemsPerPage);
    const currentItems = filteredHangHoa.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, stockFilter]);

    return (
        <div className="hanghoa-container">
            <div className="hanghoa-header">
                <h2 className="page-title"><FaBoxes className="title-icon" /> Quản Lý Danh Mục Hàng Hóa</h2>
            </div>

            {lowStockItems.length > 0 && (
                <div className="alert-banner">
                    <div className="alert-banner-content">
                        <FiAlertCircle size={28} className="alert-pulse" />
                        <div>
                            <strong>HỆ THỐNG CẢNH BÁO:</strong> Có <strong>{lowStockItems.length}</strong> mặt hàng hụt định mức, cần bổ sung.
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-filter-alert" onClick={() => setStockFilter('lowStockWarning')}>
                            <FiFilter /> Lọc xem ngay
                        </button>
                        {/* 🎯 Phân quyền: CHỈ Admin và Nhân viên Kinh doanh mới được thấy nút Tự động lên đơn mua */}
                        {(userRole === 'ADMIN' || userRole === 'NV_KD') && (
                            <button className="btn-filter-alert" onClick={handleChuyenSangTrangLapYeuCau} style={{ background: '#fff', color: '#e74a3b', border: '1px solid #e74a3b' }}>
                                <FiShoppingCart /> Tự động lên Đơn
                            </button>
                        )}
                    </div>
                </div>
            )}

            {incomingItems.length > 0 && (
                <div className="alert-banner pending-banner">
                    <div className="alert-banner-content">
                        <FiTruck size={28} style={{ color: '#1976d2' }} />
                        <div>
                            <strong>THÔNG TIN:</strong> Có <strong>{incomingItems.length}</strong> mặt hàng tồn kho thấp nhưng <strong>ĐÃ ĐẶT ĐỦ</strong>, đang chờ về.
                        </div>
                    </div>
                    <button className="btn-filter-alert" onClick={() => setStockFilter('incoming')} style={{ background: '#1976d2', color: '#fff', border: 'none' }}>
                        <FiFilter /> Xem hàng đang về
                    </button>
                </div>
            )}

            <div className="toolbar-container">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input type="text" className="search-bar" placeholder="Tìm theo mã, tên hoặc loại hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                <div className="filter-box">
                    <FiFilter className="filter-icon" />
                    <select className="filter-select" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                        <option value="all">Tất cả số lượng</option>
                        <option value="lowStockWarning">⚠️ Cần nhập kho (Thiếu hụt)</option>
                        <option value="incoming">🚚 Đã lên đơn đủ (Đang chờ về)</option>
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
                            <th className="col-id">Mã Hàng</th>
                            <th className="col-name">Tên Hàng</th>
                            <th className="col-category">Loại Hàng</th>
                            <th className="col-unit">ĐVT</th>
                            <th className="col-stock text-right">Số Lượng Tồn</th>
                            <th className="col-min-stock text-right">Định Mức</th>
                            {(userRole === 'ADMIN' || userRole === 'MUAHANG') && (
                                <th className="col-price text-right">Giá Nhập</th>
                            )}
                            <th className="col-actions">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item) => {
                            const stock = Number(item.soLuongTon || 0);
                            const minStock = Number(item.soLuongToiThieu || 0);
                            const incomingQty = pendingItems[item.maHang] || 0;
                            const totalExpected = stock + incomingQty;

                            let stockClass = "stock-normal";
                            let iconObj = null;

                            if (totalExpected < minStock) {
                                stockClass = "stock-warning";
                                iconObj = <FiAlertCircle className="warning-icon" title={`Thiếu ${minStock - totalExpected} cái!`} />;
                            } else if (stock < minStock && totalExpected >= minStock) {
                                stockClass = "stock-pending";
                                iconObj = <FiTruck title={`Đang chờ về ${incomingQty} cái!`} />;
                            }

                            return (
                                <tr key={item.maHang || Math.random()}>
                                    <td className="font-medium col-id">{item.maHang || 'N/A'}</td>
                                    <td className="col-name"><span className="truncate-text" title={item.tenHang}>{item.tenHang || 'Không tên'}</span></td>
                                    <td className="col-category"><span className="badge-category">{item.loaiHang ? item.loaiHang.tenLoai : 'Chưa phân loại'}</span></td>
                                    <td className="col-unit text-center">{item.donViTinh || 'Cái'}</td>

                                    <td className="col-stock text-right">
                                        <div className={stockClass} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                            <span>{stock}</span>
                                            {iconObj}
                                        </div>
                                    </td>

                                    <td className="col-min-stock text-muted text-right">{minStock}</td>

                                    {(userRole === 'ADMIN' || userRole === 'MUAHANG') && (
                                        <td className="col-price price-text text-right">
                                            {item.giaNhap ? item.giaNhap.toLocaleString() : '0'} VNĐ
                                        </td>
                                    )}

                                    <td className="col-actions action-buttons">
                                        <button className="btn-action btn-view" onClick={() => navigate(`/product-detail/${item.maHang}`)} title="Xem chi tiết"><FiEye /> Xem</button>
                                        
                                        {/* 🎯 Phân quyền: CHỈ Quản lý kho và Admin mới có quyền Sửa */}
                                        {(userRole === 'ADMIN' || userRole === 'QUANLYKHO') && (
                                            <button className="btn-action btn-edit" onClick={() => navigate(`/edit-product/${item.maHang}`)} title="Chỉnh sửa"><FiEdit /> Sửa</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}

                        {currentItems.length === 0 && (
                            <tr>
                                <td colSpan={userRole === 'ADMIN' || userRole === 'MUAHANG' ? 8 : 7} className="empty-message">
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
                        <button key={index + 1} className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => paginate(index + 1)}>{index + 1}</button>
                    ))}
                    <button className="page-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Sau</button>
                </div>
            )}
        </div>
    );
};

export default HangHoaList;