import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import * as XLSX from 'xlsx';
import './Dashboard.css';

const Dashboard = () => {
    // Tồn kho state
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ tongMatHang: 0, tongSoLuong: 0, tongTienNhap: 0 });

    // Xuất kho state
    const [exportStats, setExportStats] = useState({ tongPhieuXuat: 0, tongSoLuongXuat: 0 });
    const [exportDataForChart, setExportDataForChart] = useState([]);

    const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#6f42c1', '#fd7e14'];

    const truncateName = (name) => {
        if (!name) return '';
        return name.length > 20 ? name.substring(0, 20) + '...' : name;
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // 1. API Lấy Dữ Liệu Sản Phẩm Tồn Kho
            const responseProducts = await api.get('/products'); 
            const allProducts = responseProducts.data;

            let tongSL = 0;
            let tongTien = 0;

            const processedProducts = allProducts.map(item => {
                const soLuong = item.soLuongTon || 0;
                const giaNhap = item.giaNhap || 0; 
                const thanhTien = soLuong * giaNhap;
                tongSL += soLuong;
                tongTien += thanhTien;

                return {
                    ...item,
                    shortName: truncateName(item.tenHang),
                    thanhTien: thanhTien
                };
            });

            setStats({
                tongMatHang: processedProducts.length,
                tongSoLuong: tongSL,
                tongTienNhap: tongTien
            });

            setItems(processedProducts.filter(item => item.soLuongTon > 0).sort((a, b) => b.thanhTien - a.thanhTien));

            // 2. Lấy Dữ Liệu Phiếu Xuất Kho
            try {
                const responseExports = await api.get('/phieu-xuat');
                const allExports = responseExports.data;
                
                let tongSLXuat = 0;
                const itemExportCount = {};

                allExports.forEach(phieu => {
                    if (phieu.chiTietXuat) {
                        // Nếu backend lưu dạng Object { "MaHang": SoLuong }
                        if (!Array.isArray(phieu.chiTietXuat)) {
                             Object.keys(phieu.chiTietXuat).forEach(maHang => {
                                 const sl = parseInt(phieu.chiTietXuat[maHang]) || 0;
                                 tongSLXuat += sl;
                                 itemExportCount[maHang] = (itemExportCount[maHang] || 0) + sl;
                             });
                        } 
                        // Nếu backend trả về mảng Array
                        else {
                             phieu.chiTietXuat.forEach(ct => {
                                 const sl = parseInt(ct.soLuongThucXuat || ct.soLuong) || 0;
                                 const maHang = ct.hangHoa?.maHang || ct.maHang;
                                 tongSLXuat += sl;
                                 if (maHang) itemExportCount[maHang] = (itemExportCount[maHang] || 0) + sl;
                             });
                        }
                    }
                });

                setExportStats({
                    tongPhieuXuat: allExports.length,
                    tongSoLuongXuat: tongSLXuat
                });

                // Chuẩn bị data cho biểu đồ xuất (Top 5)
                const chartData = Object.keys(itemExportCount).map(maHang => {
                    const productInfo = allProducts.find(p => p.maHang === maHang);
                    return {
                        maHang: maHang,
                        tenHang: productInfo ? truncateName(productInfo.tenHang) : maHang,
                        soLuongDaXuat: itemExportCount[maHang]
                    }
                }).sort((a, b) => b.soLuongDaXuat - a.soLuongDaXuat).slice(0, 5);

                setExportDataForChart(chartData);

            } catch (error) {
                console.error("Lỗi lấy dữ liệu phiếu xuất:", error);
            }

            setLoading(false);
        } catch (error) {
            console.error("Lỗi Dashboard API:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleExportExcel = () => {
        const excelData = items.map((item, index) => ({
            "STT": index + 1,
            "Mã Hàng": item.maHang,
            "Tên Mặt Hàng": item.tenHang,
            "Số Lượng Tồn": item.soLuongTon,
            "Giá Nhập (VNĐ)": item.giaNhap,
            "Thành Tiền (VNĐ)": item.thanhTien
        }));

        excelData.push({
            "STT": "",
            "Mã Hàng": "",
            "Tên Mặt Hàng": "TỔNG CỘNG:",
            "Số Lượng Tồn": stats.tongSoLuong,
            "Giá Nhập (VNĐ)": "",
            "Thành Tiền (VNĐ)": stats.tongTienNhap
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        worksheet['!cols'] = [
            { wch: 5 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 20 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoKho");

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        XLSX.writeFile(workbook, `BaoCao_TonKho_${dateStr}.xlsx`);
    };

    const topValueItems = items.slice(0, 5);
    const topQtyItems = [...items].sort((a, b) => b.soLuongTon - a.soLuongTon).slice(0, 7);

    if (loading) return <div className="loading-screen">⏳ Đang tổng hợp dữ liệu...</div>;

    return (
        <div className="dashboard-wrapper">
            <header className="db-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>📊 Phân Tích Kho Hàng Thực Thời</h2>
                    <p>Cập nhật lần cuối: {new Date().toLocaleTimeString()}</p>
                </div>
                
                <button onClick={handleExportExcel} className="btn-export-excel" title="Tải xuống báo cáo chi tiết">
                    <span style={{ marginRight: '8px' }}>📗</span> Xuất Báo Cáo
                </button>
            </header>
            
            {/* THỐNG KÊ TỔNG QUAN */}
            <div className="db-stats-grid">
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
                {/* 2 Card Mới Cho Phiếu Xuất */}
                <div className="stat-card purple">
                    <div className="stat-content">
                        <h6>TỔNG PHIẾU XUẤT</h6>
                        <div className="stat-value">{exportStats.tongPhieuXuat}</div>
                    </div>
                    <div className="stat-icon-bg">📄</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-content">
                        <h6>TỔNG HÀNG ĐÃ XUẤT</h6>
                        <div className="stat-value">{exportStats.tongSoLuongXuat.toLocaleString()}</div>
                    </div>
                    <div className="stat-icon-bg">📤</div>
                </div>
            </div>

            <div className="db-main-grid">
                {/* BIỂU ĐỒ 1: Tồn Kho */}
                <div className="db-chart-container">
                    <h5>📉 Top 7 Sản Phẩm Tồn Kho Nhiều Nhất</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topQtyItems}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="maHang" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: '#f8f9fc'}} />
                            <Bar dataKey="soLuongTon" name="Số Lượng Tồn" fill="#4e73df" radius={[4, 4, 0, 0]} barSize={35} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* BIỂU ĐỒ 2: Cơ cấu vốn */}
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
                                nameKey="shortName"
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
                
                {/* BIỂU ĐỒ 3 (MỚI): Top Sản phẩm xuất kho */}
                <div className="db-chart-container span-full">
                    <h5>🚀 Top 5 Sản Phẩm Xuất Nhiều Nhất (Theo Số Lượng)</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={exportDataForChart} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                            <XAxis type="number" axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="tenHang" width={180} tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: '#f8f9fc'}} />
                            <Bar dataKey="soLuongDaXuat" name="Số lượng đã xuất" fill="#e74a3b" radius={[0, 4, 4, 0]} barSize={30}>
                                {exportDataForChart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* BẢNG CHI TIẾT */}
            <div className="db-table-wrapper">
                <h5>📋 Danh Sách Chi Tiết Giá Trị Hàng Hóa Tồn Kho</h5>
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