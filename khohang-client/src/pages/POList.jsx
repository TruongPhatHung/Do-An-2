// src/pages/POList.jsx
import React, { useState } from 'react';
import './POList.css';
// import api from '../services/axiosConfig'; // Tạm thời bạn có thể chưa cần dòng này nếu chưa gọi API

const POList = () => {
    // Dữ liệu giả định phản ánh đúng logic Tuần 2 (Giao hàng nhiều lần)
    const [orders] = useState([
        { id: 'PO-2024-001', supplier: 'Thép Hòa Phát', date: '2024-03-01', total: 15000000, status: 'COMPLETED' },
        { id: 'PO-2024-002', supplier: 'Nhựa Bình Minh', date: '2024-03-05', total: 8000000, status: 'PARTIAL' },
        { id: 'PO-2024-003', supplier: 'Sơn Kim Loại', date: '2024-03-07', total: 12000000, status: 'NEW' },
    ]);

    const [filterStatus, setFilterStatus] = useState('ALL');

    const getStatusLabel = (status) => {
        switch (status) {
            case 'NEW': return <span className="status-badge status-new">Mới tạo</span>;
            case 'PARTIAL': return <span className="status-badge status-partial">Giao thiếu</span>;
            case 'COMPLETED': return <span className="status-badge status-completed">Hoàn tất</span>;
            default: return status;
        }
    };

    const filteredOrders = filterStatus === 'ALL' 
        ? orders 
        : orders.filter(o => o.status === filterStatus);

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
                        <tr key={order.id}>
                            <td style={{fontWeight: 'bold'}}>{order.id}</td>
                            <td>{order.supplier}</td>
                            <td>{order.date}</td>
                            <td>{order.total.toLocaleString()} VNĐ</td>
                            <td>{getStatusLabel(order.status)}</td>
                            <td>
                                <button className="btn-detail">Xem chi tiết</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default POList;