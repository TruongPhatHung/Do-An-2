import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TabTongQuan = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ tongMatHang: 0, tongSoLuong: 0, tongTienNhap: 0 });

    const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];

    const truncateName = (name) => name?.length > 20 ? name.substring(0, 20) + '...' : name || '';

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await api.get('/products');
                const allProducts = Array.isArray(res.data) ? res.data : [];
                let tongSL = 0, tongTien = 0;

                const processed = allProducts.map(item => {
                    const soLuong = item.soLuongTon || 0;
                    const giaNhap = item.giaNhap || 0;
                    tongSL += soLuong;
                    tongTien += (soLuong * giaNhap);
                    return { ...item, shortName: truncateName(item.tenHang), thanhTien: soLuong * giaNhap };
                });

                setStats({ tongMatHang: processed.length, tongSoLuong: tongSL, tongTienNhap: tongTien });
                setItems(processed.filter(item => item.soLuongTon > 0).sort((a, b) => b.thanhTien - a.thanhTien));
            } catch (error) {
                console.error("Lỗi lấy dữ liệu tồn kho:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, []);

    const topValueItems = items.slice(0, 5);
    const topQtyItems = [...items].sort((a, b) => b.soLuongTon - a.soLuongTon).slice(0, 7);

    if (loading) return <div className="loading-screen">⏳ Đang tổng hợp dữ liệu Tồn Kho...</div>;

    return (
        <div>
            {/* 3 Cục Thống Kê Chính */}
            <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card blue">
                    <div className="stat-content">
                        <h6>TỔNG MẶT HÀNG TỒN</h6>
                        <div className="stat-value">{stats.tongMatHang}</div>
                    </div>
                    <div className="stat-icon-bg">📦</div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-content">
                        <h6>SỐ LƯỢNG TỒN</h6>
                        <div className="stat-value">{(stats.tongSoLuong || 0).toLocaleString()}</div>
                    </div>
                    <div className="stat-icon-bg">📈</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-content">
                        <h6>TỔNG VỐN TỒN KHO</h6>
                        <div className="stat-value">{(stats.tongTienNhap || 0).toLocaleString()} đ</div>
                    </div>
                    <div className="stat-icon-bg">💰</div>
                </div>
            </div>

            {/* Biểu đồ */}
            <div className="db-main-grid">
                <div className="db-chart-container">
                    <h5>📉 Top 7 Sản Phẩm Tồn Kho Nhiều Nhất</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topQtyItems}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="maHang" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8f9fc' }} />
                            <Bar dataKey="soLuongTon" name="Số Lượng Tồn" fill="#4e73df" radius={[4, 4, 0, 0]} barSize={35} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="db-chart-container">
                    <h5>💰 Cơ Cấu Vốn Tồn Kho (Top 5 Giá Trị)</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={topValueItems} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="thanhTien" nameKey="shortName">
                                {topValueItems.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                            </Pie>
                            <Tooltip formatter={(val) => (val || 0).toLocaleString() + " đ"} />
                            <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bảng Chi Tiết */}
            <div className="db-table-wrapper" style={{ marginTop: '20px' }}>
                <h5>📋 Chi Tiết Giá Trị Hàng Hóa Tồn Kho</h5>
                <table className="db-modern-table">
                    <thead>
                        <tr>
                            <th>Mã Hàng</th>
                            <th>Tên Mặt Hàng</th>
                            <th className="text-center">Số Lượng</th>
                            <th className="text-right">Giá Nhập</th>
                            <th className="text-right">Thành Tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.maHang}>
                                <td className="font-weight-bold">{item.maHang}</td>
                                <td className="text-muted">{item.tenHang}</td>
                                <td className="text-center">
                                    <span className={`badge ${item.soLuongTon < 10 ? 'bg-danger' : 'bg-success'}`}>{item.soLuongTon}</span>
                                </td>
                                <td className="text-right">{(item.giaNhap || 0).toLocaleString()} đ</td>
                                <td className="text-right font-weight-bold text-primary">{(item.thanhTien || 0).toLocaleString()} đ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TabTongQuan;