
import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './Dashboard.css';

const Dashboard = () => {
    const [lowStockItems, setLowStockItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            // Lấy danh sách hàng hóa từ API thực tế
            const response = await api.get('/hang-hoa');
            const allData = response.data;

            setTotalItems(allData.length);

            // Lọc các mặt hàng có tồn kho thấp hơn định mức ngay tại Front-end
            const warnings = allData.filter(item => item.soLuongTon < item.soLuongToiThieu);
            setLowStockItems(warnings);
            
            setLoading(false);
        } catch (error) {
            console.error("Lỗi Dashboard API:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Thiết lập cơ chế tự động làm mới dữ liệu (Real-time giả lập)
        const interval = setInterval(fetchDashboardData, 30000); // 30 giây một lần
        
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="loading">Đang tải dữ liệu Dashboard...</div>;

    return (
        <div className="dashboard-container">
            <h2>📊 Bảng Điều Khiển Hệ Thống</h2>
            
            <div className="stats-row">
                <div className="stat-card">
                    <h3>Tổng mặt hàng</h3>
                    <p className="stat-number">{totalItems}</p>
                    <small>Trong danh mục hệ thống</small>
                </div>
                
                <div className={`stat-card warning ${lowStockItems.length > 0 ? 'active' : ''}`}>
                    <h3>Mặt hàng sắp hết</h3>
                    <p className="stat-number" style={{color: lowStockItems.length > 0 ? '#e74c3c' : '#2c3e50'}}>
                        {lowStockItems.length}
                    </p>
                    <small>Cần nhập hàng bổ sung</small>
                </div>
            </div>

            <div className="warning-section">
                <h3>⚠️ DANH SÁCH CẢNH BÁO ĐỊNH MỨC</h3>
                
                {lowStockItems.length > 0 ? (
                    <div className="warning-grid">
                        {lowStockItems.map(item => (
                            <div key={item.maHang} className="warning-item">
                                <div className="warning-info">
                                    <strong>{item.tenHang}</strong>
                                    <span>Mã: {item.maHang}</span>
                                </div>
                                <div className="warning-status">
                                    <span>Tồn: <b style={{color: 'red'}}>{item.soLuongTon}</b></span>
                                    <span>Định mức: {item.soLuongToiThieu}</span>
                                </div>
                                <button 
                                    className="btn-order-now" 
                                    onClick={() => window.location.href='/don-hang'}
                                >
                                    Lên đơn đặt hàng ngay
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-warning">
                        ✅ Tuyệt vời! Tất cả mặt hàng đều ở mức tồn kho an toàn.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;