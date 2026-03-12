// src/pages/POList.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './POList.css';

const POList = () => {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ALL');

    // GỌI API LẤY DANH SÁCH ĐƠN HÀNG
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/don-dat-hang'); // Endpoint lấy danh sách PO
                setOrders(response.data);
            } catch (error) {
                console.error("Lỗi tải danh sách Đơn hàng:", error);
            }
        };
        fetchOrders();
    }, []);

    const getStatusLabel = (status) => {
        // Tùy thuộc Back-end của bạn trả về chữ gì (MoiTao, GiaoThieu, HoanTat)
        // Đây là ví dụ khớp với thiết kế hệ thống
        switch (status?.toUpperCase()) {
            case 'MOITAO': 
            case 'NEW': return <span className="status-badge status-new">Mới tạo</span>;
            case 'GIAOTHIEU':
            case 'PARTIAL': return <span className="status-badge status-partial">Giao thiếu</span>;
            case 'HOANTAT':
            case 'COMPLETED': return <span className="status-badge status-completed">Hoàn tất</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    const filteredOrders = filterStatus === 'ALL' 
        ? orders 
        : orders.filter(o => o.trangThai === filterStatus);

    return (
        <div className="polist-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>📋 Danh Sách Đơn Đặt Hàng</h2>
                <div>
                    <label>Lọc trạng thái: </label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{padding: '5px'}}>
                        <option value="ALL">Tất cả</option>
                        <option value="NEW">Mới tạo</option>
                        <option value="PARTIAL">Giao thiếu</option>
                        <option value="COMPLETED">Hoàn tất</option>
                    </select>
                </div>
            </div>

            <table className="polist-table">
                <thead>
                    <tr>
                        <th>Mã Đơn</th>
                        <th>Nhà Cung Cấp</th>
                        <th>Ngày Đặt</th>
                        <th>Tổng Tiền</th>
                        <th>Trạng Thái</th>
                        <th>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map(order => (
                        <tr key={order.maDon}>
                            <td style={{fontWeight: 'bold'}}>{order.maDon}</td>
                            {/* Thay ncc.tenNCC tùy thuộc vào object Back-end trả về */}
                            <td>{order.nhaCungCap?.tenNCC || order.maNCC}</td> 
                            <td>{order.ngayTao}</td>
                            <td>{order.tongTien?.toLocaleString()} VNĐ</td>
                            <td>{getStatusLabel(order.trangThai)}</td>
                            <td>
                                <button className="btn-detail">Xem chi tiết</button>
                            </td>
                        </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                        <tr><td colSpan="6" style={{textAlign: 'center'}}>Chưa có đơn đặt hàng nào.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default POList;