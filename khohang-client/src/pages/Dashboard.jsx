// src/pages/Dashboard.jsx
import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
    // Giả lập dữ liệu từ API cảnh báo của Dev A
    const lowStockItems = [
        { maHang: 'SP001', tenHang: 'Thép tấm 5mm', tonKho: 5, dinhMuc: 10 },
        { maHang: 'SP003', tenHang: 'Sơn chống rỉ', tonKho: 2, dinhMuc: 5 },
    ];

    return (
        <div className="dashboard-container">
            <h2>📊 Bảng Điều Khiển Quản Lý</h2>
            
            <div className="stats-row">
                <div className="stat-card">
                    <h3>Tổng mặt hàng</h3>
                    <p className="stat-number">150</p>
                </div>
                <div className="stat-card warning">
                    <h3>Cảnh báo hết hàng</h3>
                    <p className="stat-number">{lowStockItems.length}</p>
                </div>
            </div>

            <div className="warning-section">
                <h3>⚠️ DANH SÁCH CẦN NHẬP HÀNG GẤP</h3>
                <div className="warning-grid">
                    {lowStockItems.map(item => (
                        <div key={item.maHang} className="warning-item">
                            <div className="warning-info">
                                <strong>{item.tenHang}</strong>
                                <span>Mã: {item.maHang}</span>
                            </div>
                            <div className="warning-status">
                                <span>Tồn: <b style={{color: 'red'}}>{item.tonKho}</b></span>
                                <span>Định mức: {item.dinhMuc}</span>
                            </div>
                            <button className="btn-order-now">Lên đơn ngay</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;