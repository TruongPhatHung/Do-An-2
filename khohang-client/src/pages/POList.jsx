import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './POList.css'; // Import CSS đã tách
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
        const styles = {
            'Mới Tạo': { bg: '#3498db', label: 'Mới tạo' },
            'Giao Thiếu': { bg: '#f39c12', label: 'Giao thiếu' },
            'Hoàn Tất': { bg: '#27ae60', label: 'Hoàn tất' }
        };
        const config = styles[status] || { bg: '#95a5a6', label: status };
        return <span className="status-badge" style={{ background: config.bg }}>{config.label}</span>;
    };

    const calculateTotal = (chiTiets) => {
        return (chiTiets || []).reduce((sum, item) => sum + (item.soLuongDat * item.donGia), 0);
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = (o.maDon?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (o.nhaCungCap?.tenNCC?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || o.trangThai === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const currentItems = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    return (
        <div className="polist-container">
            <div className="polist-header">
                <h2>📋 Danh Sách Đơn Đặt Hàng (PO)</h2>
                {/* SỬA LẠI ĐƯỜNG DẪN /don-hang ĐỂ KHỚP VỚI App.js */}
                <button className="btn-create-po" onClick={() => navigate('/don-hang')}>
                    + Tạo Đơn Hàng PO Mới
                </button>
            </div>

            <div className="search-filter-section">
                <input
                    type="text"
                    placeholder="🔍 Tìm theo Mã đơn hoặc Tên công ty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '8px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px', borderRadius: '5px' }}>
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="Mới Tạo">Mới tạo</option>
                    <option value="Giao Thiếu">Giao thiếu</option>
                    <option value="Hoàn Tất">Hoàn tất</option>
                </select>
            </div>

            <table className="polist-table">
                <thead>
                    <tr>
                        <th>Mã Đơn PO</th>
                        <th>Nhà Cung Cấp</th>
                        <th>Ngày Tạo</th>
                        <th>Tổng Tiền</th>
                        <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                        <th style={{ textAlign: 'center' }}>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map(order => (
                        <tr key={order.maDon}>
                            <td style={{ fontWeight: 'bold', color: '#2980b9' }}>{order.maDon}</td>
                            <td><strong>{order.nhaCungCap?.tenNCC}</strong></td>
                            <td>{new Date(order.ngayTao).toLocaleDateString('vi-VN')}</td>
                            <td style={{ color: '#d35400', fontWeight: 'bold' }}>{calculateTotal(order.chiTiets).toLocaleString()} VNĐ</td>
                            <td style={{ textAlign: 'center' }}>{getStatusLabel(order.trangThai)}</td>
                            <td style={{ textAlign: 'center' }}>
                                <button className="btn-detail" onClick={() => navigate('/po-detail', { state: { order: order } })}>
                                    Xem chi tiết
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default POList;