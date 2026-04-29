import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiCalendar, FiFileText, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './LichSuNhapKho.css';

const LichSuNhapKho = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 🎯 States cho Bộ Lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSupplier, setFilterSupplier] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/phieu-nhap');
                setHistory(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                toast.error("Không thể tải lịch sử nhập kho!");
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Lấy danh sách Nhà cung cấp duy nhất để đưa vào Dropdown bộ lọc
    const uniqueSuppliers = [...new Set(history.map(item => item.nhaCungCap?.tenNCC).filter(Boolean))];

    // 🎯 Logic Lọc Dữ Liệu
    const filteredHistory = history.filter(item => {
        // 1. Lọc theo từ khóa (Mã, Người nhập, NCC, Ghi chú)
        const matchSearch = (item.maPhieuNhap || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.nguoiNhap || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.nhaCungCap?.tenNCC || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.ghiChu || "").toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Lọc theo Nhà cung cấp
        const matchSupplier = filterSupplier ? (item.nhaCungCap?.tenNCC === filterSupplier) : true;

        // 3. Lọc theo Khoảng thời gian
        let matchDate = true;
        if (startDate || endDate) {
            const itemDate = new Date(item.ngayNhap).getTime();
            const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;
            const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;
            matchDate = itemDate >= start && itemDate <= end;
        }

        return matchSearch && matchSupplier && matchDate;
    });

    // Reset bộ lọc
    const handleResetFilters = () => {
        setSearchTerm('');
        setFilterSupplier('');
        setStartDate('');
        setEndDate('');
    };

    if (loading) return <div className="loading-spinner">⏳ Đang tải dữ liệu...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2><FiFileText className="header-icon" /> Lịch Sử Nhập Kho</h2>
            </div>

            {/* 🎯 KHU VỰC BỘ LỌC TÌM KIẾM */}
            <div className="filter-section">
                <div className="search-wrapper">
                    <FiSearch className="input-icon" />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm mã phiếu, người nhập, ghi chú..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Nhà Cung Cấp</label>
                        <select 
                            className="form-control"
                            value={filterSupplier}
                            onChange={(e) => setFilterSupplier(e.target.value)}
                        >
                            <option value="">-- Tất cả NCC --</option>
                            {uniqueSuppliers.map((ncc, index) => (
                                <option key={index} value={ncc}>{ncc}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group date-group">
                        <label>Từ ngày</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="filter-group date-group">
                        <label>Đến ngày</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="filter-actions">
                        <button className="btn-reset" onClick={handleResetFilters} title="Xóa bộ lọc">
                            <FiRefreshCw /> Làm mới
                        </button>
                    </div>
                </div>
            </div>

            {/* 🎯 KHU VỰC BẢNG DỮ LIỆU */}
            <div className="table-card">
                <div className="table-responsive">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Mã Phiếu</th>
                                <th>Ngày Nhập</th>
                                <th>Nhà Cung Cấp</th>
                                <th>Người Nhập</th>
                                <th className="text-right">Tổng Tiền</th>
                                <th>Ghi Chú</th>
                                <th className="text-center">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((item) => (
                                    <tr key={item.maPhieuNhap || Math.random()}>
                                        <td className="font-semibold text-primary">{item.maPhieuNhap}</td>
                                        <td>
                                            <div className="flex-align-center text-muted">
                                                <FiCalendar className="mr-2" /> 
                                                {item.ngayNhap ? new Date(item.ngayNhap).toLocaleDateString('vi-VN') : '---'}
                                            </div>
                                        </td>
                                        <td className="font-medium">{item.nhaCungCap?.tenNCC || '---'}</td>
                                        <td><span className="badge-user">{item.nguoiNhap || 'Hệ thống'}</span></td>
                                        <td className="text-right text-danger font-semibold">
                                            {(item.tongTien || 0).toLocaleString()} ₫
                                        </td>
                                        <td>
                                            <span className="badge-note" title={item.ghiChu || item.lyDo || ""}>
                                                <FiFileText />
                                                <span className="truncate">{item.ghiChu || item.lyDo || "---"}</span>
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn-action-view"
                                                onClick={() => navigate(`/chi-tiet-phieu-nhap/${item.maPhieuNhap}`)}
                                            >
                                                <FiEye /> Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center empty-state">
                                        <div className="empty-content">
                                            <FiFilter size={40} className="empty-icon" />
                                            <p>Không tìm thấy phiếu nhập nào phù hợp với bộ lọc.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LichSuNhapKho;