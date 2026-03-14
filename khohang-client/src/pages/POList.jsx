import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './POList.css';
import { useNavigate } from 'react-router-dom';

const POList = () => {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const navigate = useNavigate();

    // Lấy danh sách Đơn đặt hàng từ Backend
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Sửa URL API cho khớp với Controller Java của bạn
                const response = await api.get('/orders'); 
                setOrders(response.data);
            } catch (error) {
                console.error("Lỗi tải danh sách Đơn hàng:", error);
            }
        };
        fetchOrders();
    }, []);

    // 1. ĐỒNG BỘ TRẠNG THÁI VỚI BACKEND (Dùng tiếng Việt có dấu)
    const getStatusLabel = (status) => {
        switch (status) {
            case 'Mới Tạo': return <span className="status-badge status-new">Mới tạo</span>;
            case 'Giao Thiếu': return <span className="status-badge status-partial">Giao thiếu</span>;
            case 'Hoàn Thành': return <span className="status-badge status-completed">Hoàn tất</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    // 2. HÀM TÍNH TỔNG TIỀN TỪ CHI TIẾT ĐƠN HÀNG
    const calculateTotal = (chiTiets) => {
        if (!chiTiets || chiTiets.length === 0) return 0;
        return chiTiets.reduce((sum, item) => sum + (item.soLuongDat * item.donGia), 0);
    };

    // 3. HÀM FORMAT NGÀY THÁNG (DD/MM/YYYY)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    // Logic lọc theo trạng thái
    const filteredOrders = filterStatus === 'ALL' 
        ? orders 
        : orders.filter(o => o.trangThai === filterStatus);

    return (
        <div className="polist-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📋 Danh Sách Đơn Đặt Hàng (PO)</h2>
                <div>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Lọc trạng thái: </label>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)} 
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        <option value="ALL">Tất cả</option>
                        <option value="Mới Tạo">Mới tạo</option>
                        <option value="Giao Thiếu">Giao thiếu</option>
                        <option value="Hoàn Thành">Hoàn tất</option>
                    </select>
                </div>
            </div>

            <table className="polist-table">
                <thead>
                    <tr>
                        <th>Mã Đơn PO</th>
                        <th>Nhà Cung Cấp</th>
                        <th>Ngày Tạo Đơn</th>
                        <th>Tổng Tiền</th>
                        <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                        <th style={{ textAlign: 'center' }}>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map(order => (
                        <tr key={order.maDon}>
                            <td style={{fontWeight: 'bold', color: '#2980b9'}}>{order.maDon}</td>
                            
                            {/* Trỏ vào object nhaCungCap để lấy tên */}
                            <td>{order.nhaCungCap?.tenNCC || 'Không xác định'}</td> 
                            
                            {/* Format ngày tháng */}
                            <td>{formatDate(order.ngayTao)}</td>
                            
                            {/* Tự động tính tiền từ mảng chiTiets */}
                            <td style={{ fontWeight: 'bold' }}>
                                {calculateTotal(order.chiTiets).toLocaleString()} VNĐ
                            </td>
                            
                            <td style={{ textAlign: 'center' }}>{getStatusLabel(order.trangThai)}</td>
                            
                            <td style={{ textAlign: 'center' }}>
                                <button 
                                    className="btn-detail" 
                                    onClick={() => navigate('/po-detail', { state: { order: order } })}
                                >
                                    Xem chi tiết
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                        <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Chưa có đơn đặt hàng nào trong hệ thống.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default POList;