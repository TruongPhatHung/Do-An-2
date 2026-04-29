import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './POList.css'; 
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiCalendar, FiPlus, FiEye, FiCheckCircle, FiClock, FiAlertCircle, FiFileText } from 'react-icons/fi';

const POList = () => {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    // States cho bộ lọc thời gian
    const [timeFilter, setTimeFilter] = useState('ALL'); 
    const [specificDate, setSpecificDate] = useState(''); 

    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
        if (!chiTiets || chiTiets.length === 0) return 0;
        return chiTiets.reduce((sum, item) => {
            const soLuong = item.soLuongDat || item.soLuongYeuCau || item.soLuong || 0;
            const gia = item.donGia || (item.hangHoa?.giaNhap) || (item.hangHoa?.giaBan) || 0;
            return sum + (soLuong * gia);
        }, 0);
    }

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
                if (!selectedDateStr) return true; 
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
        
        // Sửa lỗi lọc: Chuẩn hóa NFC trước khi so sánh
        const safeStatus = typeof o.trangThai === 'string' ? o.trangThai.trim().normalize('NFC').toUpperCase() : '';
        const targetFilter = filterStatus.normalize('NFC').toUpperCase();
        
        const matchesStatus = filterStatus === 'ALL' || safeStatus === targetFilter;
        
        const matchesTime = checkTimeFilter(o.ngayTao, timeFilter, specificDate);

        return matchesSearch && matchesStatus && matchesTime;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, timeFilter, specificDate]);

    const currentItems = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="polist-container">
            <div className="polist-header">
                <div className="header-title">
                    <FiFileText className="title-icon" />
                    <h2>Danh Sách Đơn Đặt Hàng (PO)</h2>
                </div>
                <button className="btn-create-po" onClick={() => navigate('/don-hang')}>
                    <FiPlus size={18} /> Tạo Đơn Hàng Mới
                </button>
            </div>

            <div className="search-filter-section">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm theo Mã đơn hoặc Tên công ty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-group">
                    <div className="filter-box has-icon">
                        <FiCalendar className="filter-inner-icon" />
                        <select 
                            value={timeFilter} 
                            onChange={(e) => {
                                setTimeFilter(e.target.value);
                                if (e.target.value !== 'SPECIFIC_DATE') {
                                    setSpecificDate(''); 
                                }
                            }}
                        >
                            <option value="ALL">Toàn thời gian</option>
                            <option value="SPECIFIC_DATE">Chọn ngày cụ thể...</option>
                            <option value="THIS_WEEK">Tuần này</option>
                            <option value="THIS_MONTH">Tháng này</option>
                            <option value="THIS_QUARTER">Quý này</option>
                        </select>
                    </div>

                    {timeFilter === 'SPECIFIC_DATE' && (
                        <div className="filter-box date-slide-in">
                            <input 
                                type="date" 
                                className="custom-date-picker"
                                value={specificDate}
                                onChange={(e) => setSpecificDate(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="filter-box has-icon">
                        <FiFilter className="filter-inner-icon" />
                        {/* ĐÃ SỬA VALUE KHỚP VỚI API TRẢ VỀ ĐỂ LỌC ĐƯỢC */}
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="ALL">Tất cả trạng thái</option>
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
                            <th width="25%">Nhà Cung Cấp</th>
                            <th width="15%">Ngày Tạo</th>
                            <th width="15%" className="text-right">Tổng Tiền</th>
                            <th width="15%" className="text-center">Trạng Thái</th>
                            <th width="15%" className="text-center">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map(order => (
                                <tr key={order.maDon}>
                                    <td className="col-id font-semibold">{order.maDon}</td>
                                    <td className="col-name">{order.nhaCungCap?.tenNCC}</td>
                                    <td className="col-date">{new Date(order.ngayTao).toLocaleDateString('vi-VN')}</td>
                                    <td className="col-total text-right font-bold text-orange">
                                        {calculateTotal(order.chiTiets).toLocaleString()} VNĐ
                                    </td>

                                    {/* CỘT TRẠNG THÁI HIỂN THỊ BADGE */}
                                    <td className="text-center">
                                        {getStatusLabel(order.trangThai)}
                                    </td>

                                    <td className="text-center">
                                        <button className="btn-action-view" onClick={() => navigate('/po-detail', { state: { order: order } })}>
                                            <FiEye /> Xem
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="empty-state">
                                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" alt="Empty" width="64" />
                                    <p>Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button className="page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        &laquo; Trước
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button key={index + 1} className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => handlePageChange(index + 1)}>
                            {index + 1}
                        </button>
                    ))}
                    <button className="page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Sau &raquo;
                    </button>
                </div>
            )}
        </div>
    );
};

export default POList;