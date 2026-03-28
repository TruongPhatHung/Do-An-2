import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './POList.css'; 
import { useNavigate } from 'react-router-dom';

const POList = () => {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data);
            } catch (error) {
                console.error("Lỗi tải PO:", error);
            }
        };
        fetchOrders();
    }, []);

    const getStatusLabel = (status) => {
        // Cập nhật lại key cho khớp với dữ liệu thực tế ("HOÀN THÀNH", "HOÀN TẤT", "MỚI TẠO"...)
        const normalizedStatus = status ? status.toUpperCase() : '';
        
        switch (normalizedStatus) {
            case 'MỚI TẠO':
                return <span className="status-badge status-new">Mới Tạo</span>;
            case 'GIAO THIẾU':
                return <span className="status-badge status-partial">Giao Thiếu</span>;
            case 'HOÀN THÀNH':
            case 'HOÀN TẤT':
                return <span className="status-badge status-completed">Hoàn Tất</span>;
            default:
                return <span className="status-badge" style={{ backgroundColor: '#95a5a6', color: 'white' }}>{status}</span>;
        }
    };

    const calculateTotal = (chiTiets) => {
        return (chiTiets || []).reduce((sum, item) => sum + (item.soLuongDat * item.donGia), 0);
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = (o.maDon?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (o.nhaCungCap?.tenNCC?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        
        // So sánh không phân biệt hoa thường
        const matchesStatus = filterStatus === 'ALL' || (o.trangThai && o.trangThai.toUpperCase() === filterStatus.toUpperCase());
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
    const currentItems = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Hàm chuyển trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="polist-container">
            <div className="polist-header">
                <div className="header-title">
                    <span className="icon">📋</span>
                    <h2>Danh Sách Đơn Đặt Hàng (PO)</h2>
                </div>
                <button className="btn-create-po" onClick={() => navigate('/don-hang')}>
                    <i className="fas fa-plus"></i> Tạo Đơn Hàng Mới
                </button>
            </div>

            <div className="search-filter-section">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm theo Mã đơn hoặc Tên công ty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-box">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="MỚI TẠO">Mới tạo</option>
                        <option value="GIAO THIẾU">Giao thiếu</option>
                        <option value="HOÀN TẤT">Hoàn tất</option>
                    </select>
                </div>
            </div>

            <div className="table-responsive">
                <table className="polist-table">
                    <thead>
                        <tr>
                            <th width="15%">Mã Đơn PO</th>
                            <th width="20%">Nhà Cung Cấp</th>
                            <th width="15%">Ngày Tạo</th>
                            <th width="20%">Tổng Tiền</th>
                            <th width="15%" style={{ textAlign: 'center' }}>Trạng Thái</th>
                            <th width="15%" style={{ textAlign: 'center' }}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map(order => (
                                <tr key={order.maDon}>
                                    <td className="fw-bold text-primary">{order.maDon}</td>
                                    <td><strong>{order.nhaCungCap?.tenNCC}</strong></td>
                                    <td>{new Date(order.ngayTao).toLocaleDateString('vi-VN')}</td>
                                    <td className="fw-bold text-danger">
                                        {calculateTotal(order.chiTiets).toLocaleString()} VNĐ
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{getStatusLabel(order.trangThai)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="btn-detail" onClick={() => navigate('/po-detail', { state: { order: order } })}>
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                                    Không tìm thấy đơn hàng nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* KHU VỰC PHÂN TRANG */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        className="page-btn" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        &laquo; Trước
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                        <button 
                            key={index + 1} 
                            className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button 
                        className="page-btn" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Sau &raquo;
                    </button>
                </div>
            )}
        </div>
    );
};

export default POList;