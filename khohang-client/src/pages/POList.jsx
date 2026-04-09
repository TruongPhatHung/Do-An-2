import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './POList.css'; 
import { useNavigate } from 'react-router-dom';

const POList = () => {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    // States cho bộ lọc thời gian
    const [timeFilter, setTimeFilter] = useState('ALL'); 
    const [specificDate, setSpecificDate] = useState(''); // State lưu ngày cụ thể người dùng chọn

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
        // 🎯 1. Xử lý vụ DB bị NULL hoặc rỗng
        if (!status || status.trim() === '') {
            return <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: 'bold', fontSize: '0.85rem' }}>Chờ xử lý</span>;
        }

        const normalizedStatus = status.trim().toUpperCase();

        switch (normalizedStatus) {
            case 'MỚI TẠO':
                return <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold', fontSize: '0.85rem' }}>Mới Tạo</span>;

            case 'ĐANG GIAO': // 🎯 Thêm case Đang Giao cho sếp
            case 'GIAO THIẾU':
                return <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 'bold', fontSize: '0.85rem' }}>{status}</span>;

            case 'HOÀN THÀNH':
            case 'HOÀN TẤT':
                return <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 'bold', fontSize: '0.85rem' }}>Hoàn Tất</span>;

            default:
                // Nếu có trạng thái lạ nào khác, nó vẫn sẽ hiện cái nền xám và tên trạng thái
                return <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 'bold', fontSize: '0.85rem' }}>{status}</span>;
        }
    };

    const calculateTotal = (chiTiets) => {
        return (chiTiets || []).reduce((sum, item) => sum + (item.soLuongDat * item.donGia), 0);
    };

    // --- LOGIC XỬ LÝ THỜI GIAN ---
    const checkTimeFilter = (dateString, filterType, selectedDateStr) => {
        if (filterType === 'ALL') return true;
        
        const date = new Date(dateString);
        const now = new Date();
        
        const isSameDay = (d1, d2) => 
            d1.getDate() === d2.getDate() && 
            d1.getMonth() === d2.getMonth() && 
            d1.getFullYear() === d2.getFullYear();

        switch (filterType) {
            case 'SPECIFIC_DATE':
                if (!selectedDateStr) return true; // Nếu chưa chọn ngày thì bỏ qua lọc
                const selectedDate = new Date(selectedDateStr);
                return isSameDay(date, selectedDate);
                
            case 'THIS_WEEK':
                const currentDay = now.getDay() || 7; 
                const firstDayOfWeek = new Date(now);
                firstDayOfWeek.setDate(now.getDate() - currentDay + 1);
                firstDayOfWeek.setHours(0, 0, 0, 0);
                
                const lastDayOfWeek = new Date(firstDayOfWeek);
                lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                lastDayOfWeek.setHours(23, 59, 59, 999);
                
                return date >= firstDayOfWeek && date <= lastDayOfWeek;
                
            case 'THIS_MONTH':
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                
            case 'THIS_QUARTER':
                const getQuarter = (d) => Math.floor(d.getMonth() / 3);
                return getQuarter(date) === getQuarter(now) && date.getFullYear() === now.getFullYear();
                
            default:
                return true;
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = (o.maDon?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (o.nhaCungCap?.tenNCC?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'ALL' || (o.trangThai && o.trangThai.toUpperCase() === filterStatus.toUpperCase());
        
        // Truyền thêm specificDate vào hàm kiểm tra
        const matchesTime = checkTimeFilter(o.ngayTao, timeFilter, specificDate);

        return matchesSearch && matchesStatus && matchesTime;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
    
    // Reset về trang 1 nếu đổi bất kỳ bộ lọc nào
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, timeFilter, specificDate]);

    const currentItems = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                    
                    <input
                        type="text"
                        placeholder="Tìm theo Mã đơn hoặc Tên công ty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-group">
                    <div className="filter-box">
                        <select 
                            value={timeFilter} 
                            onChange={(e) => {
                                setTimeFilter(e.target.value);
                                if (e.target.value !== 'SPECIFIC_DATE') {
                                    setSpecificDate(''); // Xoá ngày đã chọn nếu chuyển sang lọc Tuần/Tháng/Quý
                                }
                            }}
                        >
                            <option value="ALL">🗓️ Toàn thời gian</option>
                            <option value="SPECIFIC_DATE">📅 Chọn ngày cụ thể</option>
                            <option value="THIS_WEEK">📊 Tuần này</option>
                            <option value="THIS_MONTH">📆 Tháng này</option>
                            <option value="THIS_QUARTER">📈 Quý này</option>
                        </select>
                    </div>

                    {/* Ô CHỌN NGÀY CHỈ HIỆN RA KHI CHỌN "Chọn ngày cụ thể" */}
                    {timeFilter === 'SPECIFIC_DATE' && (
                        <div className="filter-box">
                            <input 
                                type="date" 
                                className="custom-date-picker"
                                value={specificDate}
                                onChange={(e) => setSpecificDate(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="filter-box">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="ALL">🏷️ Tất cả trạng thái</option>
                            <option value="MỚI TẠO">Mới tạo</option>
                            <option value="GIAO THIẾU">Giao thiếu</option>
                            <option value="HOÀN TẤT">Hoàn tất</option>
                        </select>
                    </div>
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
                                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📭</div>
                                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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