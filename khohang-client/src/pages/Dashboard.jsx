import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import * as XLSX from 'xlsx'; // <--- IMPORT THƯ VIỆN Ở ĐÂY
import './Dashboard.css';

const Dashboard = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ tongMatHang: 0, tongSoLuong: 0, tongTienNhap: 0 });

    // Bộ màu chuyên nghiệp hơn
    const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];

    // HÀM QUAN TRỌNG: Rút gọn tên sản phẩm để không làm nát biểu đồ
    const truncateName = (name) => {
        return name.length > 20 ? name.substring(0, 20) + '...' : name;
    };

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/products'); 
            const allData = response.data;

            let tongSL = 0;
            let tongTien = 0;

            const processedData = allData.map(item => {
                const soLuong = item.soLuongTon || 0;
                const giaNhap = item.giaNhap || 0; 
                const thanhTien = soLuong * giaNhap;
                tongSL += soLuong;
                tongTien += thanhTien;

                return {
                    ...item,
                    shortName: truncateName(item.tenHang), // Tên hiển thị trên chart
                    thanhTien: thanhTien
                };
            });

            setStats({
                tongMatHang: processedData.length,
                tongSoLuong: tongSL,
                tongTienNhap: tongTien
            });

            setItems(processedData.filter(item => item.soLuongTon > 0).sort((a, b) => b.thanhTien - a.thanhTien));
            setLoading(false);
        } catch (error) {
            console.error("Lỗi Dashboard API:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // ===== HÀM XUẤT EXCEL =====
    const handleExportExcel = () => {
        // 1. Chuẩn bị dữ liệu định dạng đẹp cho Excel
        const excelData = items.map((item, index) => ({
            "STT": index + 1,
            "Mã Hàng": item.maHang,
            "Tên Mặt Hàng": item.tenHang, // Dùng tên đầy đủ, không cắt ngắn
            "Số Lượng Tồn": item.soLuongTon,
            "Giá Nhập (VNĐ)": item.giaNhap,
            "Thành Tiền (VNĐ)": item.thanhTien
        }));

        // 2. Thêm một dòng tổng cộng ở cuối
        excelData.push({
            "STT": "",
            "Mã Hàng": "",
            "Tên Mặt Hàng": "TỔNG CỘNG:",
            "Số Lượng Tồn": stats.tongSoLuong,
            "Giá Nhập (VNĐ)": "",
            "Thành Tiền (VNĐ)": stats.tongTienNhap
        });

        // 3. Tạo Worksheet và Workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Căn chỉnh độ rộng cột cho đẹp
        worksheet['!cols'] = [
            { wch: 5 },   // STT
            { wch: 15 },  // Mã hàng
            { wch: 40 },  // Tên
            { wch: 15 },  // Số lượng
            { wch: 20 },  // Giá nhập
            { wch: 20 }   // Thành tiền
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoKho");

        // 4. Xuất file với tên chứa ngày giờ hiện tại
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // Dạng YYYYMMDD
        XLSX.writeFile(workbook, `BaoCao_TonKho_${dateStr}.xlsx`);
    };

    const topValueItems = items.slice(0, 5);
    const topQtyItems = [...items].sort((a, b) => b.soLuongTon - a.soLuongTon).slice(0, 7);

    if (loading) return <div className="loading-screen">⏳ Đang tổng hợp dữ liệu...</div>;

    return (
        <div className="dashboard-wrapper">
           {/* ĐÃ SỬA HEADER Ở ĐÂY */}
            <header className="db-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>📊 Phân Tích Kho Hàng Thực Thời</h2>
                    <p>Cập nhật lần cuối: {new Date().toLocaleTimeString()}</p>
                </div>
                
                {/* NÚT XUẤT EXCEL */}
                <button 
                    onClick={handleExportExcel} 
                    className="btn-export-excel"
                    title="Tải xuống báo cáo chi tiết"
                >
                    <span style={{ marginRight: '8px' }}>📗</span> Xuất Báo Cáo
                </button>
            </header>
            
            {/* 1. THỐNG KÊ TỔNG QUAN (Card thiết kế lại) */}
            <div className="db-stats-grid">
                <div className="stat-card blue">
                    <div className="stat-content">
                        <h6>TỔNG MẶT HÀNG</h6>
                        <div className="stat-value">{stats.tongMatHang}</div>
                    </div>
                    <div className="stat-icon-bg">📦</div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-content">
                        <h6>SỐ LƯỢNG TỒN</h6>
                        <div className="stat-value">{stats.tongSoLuong.toLocaleString()}</div>
                    </div>
                    <div className="stat-icon-bg">📈</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-content">
                        <h6>TỔNG VỐN TỒN KHO</h6>
                        <div className="stat-value">{stats.tongTienNhap.toLocaleString()} đ</div>
                    </div>
                    <div className="stat-icon-bg">💰</div>
                </div>
            </div>

            <div className="db-main-grid">
                {/* 2. BIỂU ĐỒ CỘT */}
                <div className="db-chart-container">
                    <h5>📉 Top 7 Sản Phẩm Tồn Kho Nhiều Nhất</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topQtyItems}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="maHang" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: '#f8f9fc'}} />
                            <Bar dataKey="soLuongTon" fill="#4e73df" radius={[4, 4, 0, 0]} barSize={35} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. BIỂU ĐỒ TRÒN (Đã sửa lỗi hiển thị) */}
                <div className="db-chart-container">
                    <h5>🍩 Cơ Cấu Vốn (Top 5 Giá Trị)</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={topValueItems}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={85}
                                paddingAngle={5}
                                dataKey="thanhTien"
                                nameKey="shortName" // Dùng tên đã rút gọn
                            >
                                {topValueItems.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val) => val.toLocaleString() + " đ"} />
                            <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 4. BẢNG CHI TIẾT */}
            <div className="db-table-wrapper">
                <h5>📋 Danh Sách Chi Tiết Giá Trị Hàng Hóa</h5>
                <table className="db-modern-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã Hàng</th>
                            <th>Tên Mặt Hàng</th>
                            <th className="text-center">Số Lượng</th>
                            <th className="text-right">Giá Nhập</th>
                            <th className="text-right">Thành Tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.maHang}>
                                <td>{index + 1}</td>
                                <td className="font-weight-bold">{item.maHang}</td>
                                <td className="text-muted">{item.tenHang}</td>
                                <td className="text-center">
                                    <span className={`badge ${item.soLuongTon < 10 ? 'bg-danger' : 'bg-success'}`}>
                                        {item.soLuongTon}
                                    </span>
                                </td>
                                <td className="text-right">{item.giaNhap.toLocaleString()} đ</td>
                                <td className="text-right font-weight-bold text-primary">
                                    {item.thanhTien.toLocaleString()} đ
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;