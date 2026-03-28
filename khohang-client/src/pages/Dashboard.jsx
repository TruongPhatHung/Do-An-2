import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, ComposedChart 
} from 'recharts';
import * as XLSX from 'xlsx';
import './Dashboard.css';

const Dashboard = () => {
    // Tồn kho state
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ tongMatHang: 0, tongSoLuong: 0, tongTienNhap: 0 });

    // Xuất kho state (ĐÃ SỬA: Thêm tongGiaTriXuat)
    const [exportStats, setExportStats] = useState({ tongPhieuXuat: 0, tongSoLuongXuat: 0, tongGiaTriXuat: 0 });
    const [exportDataForChart, setExportDataForChart] = useState([]);
    const [exportDataTheoNgay, setExportDataTheoNgay] = useState([]);
    const [exportDataLyDo, setExportDataLyDo] = useState([]);
    
    // State lưu chi tiết danh sách xuất kho
    const [exportDetails, setExportDetails] = useState([]);

    const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#6f42c1', '#fd7e14'];
    const PIE_COLORS = ['#f6c23e', '#e74a3b', '#6f42c1', '#36b9cc', '#1cc88a'];

    const truncateName = (name) => {
        if (!name) return '';
        return name.length > 20 ? name.substring(0, 20) + '...' : name;
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // 1. Lấy Dữ Liệu Tồn Kho
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
                let tongGiaTriXuatToanBo = 0; // ĐÃ SỬA: Biến tính tổng giá trị toàn bộ hàng xuất
                const itemExportCount = {};
                const thongKeNgay = {};
                const thongKeLyDoMap = {};
                
                // Mảng lưu chi tiết xuất kho
                const detailedExportsList = [];

                allExports.forEach(phieu => {
                    // Thống kê theo ngày
                    const dateStr = phieu.ngayXuat ? new Date(phieu.ngayXuat).toLocaleDateString('vi-VN') : 'Không rõ';
                    if (!thongKeNgay[dateStr]) thongKeNgay[dateStr] = { ngay: dateStr, soLuong: 0 };

                    // Thống kê theo lý do
                    const lyDo = phieu.lyDoXuat || 'Khác';
                    if (!thongKeLyDoMap[lyDo]) thongKeLyDoMap[lyDo] = 0;
                    thongKeLyDoMap[lyDo] += 1;

                    let slPhieuNay = 0;

                    // Xử lý lặp qua mảng chiTiets
                    if (phieu.chiTiets && Array.isArray(phieu.chiTiets)) {
                        phieu.chiTiets.forEach(ct => {
                            const sl = parseInt(ct.soLuongXuat) || 0;
                            const maHang = ct.hangHoa?.maHang;
                            const tenHang = ct.hangHoa?.tenHang || "Chưa xác định";

                            // ĐÃ SỬA: Tính tổng giá trị dựa vào logic file LichSuXuatKho
                            const giaChuan = ct.donGia || ct.hangHoa?.giaBan || ct.hangHoa?.giaNhap || 0;
                            const tongGiaTri = sl * giaChuan;

                            tongSLXuat += sl;
                            tongGiaTriXuatToanBo += tongGiaTri; // Cộng dồn tổng giá trị
                            slPhieuNay += sl;

                            if (maHang) {
                                if (!itemExportCount[maHang]) {
                                    itemExportCount[maHang] = {
                                        maHang: maHang,
                                        tenHang: truncateName(tenHang),
                                        soLuongDaXuat: 0
                                    };
                                }
                                itemExportCount[maHang].soLuongDaXuat += sl;
                            }

                            // Đẩy dữ liệu vào mảng chi tiết (thêm tongGiaTri)
                            detailedExportsList.push({
                                maPhieu: phieu.maPhieuXuat || 'N/A',
                                ngayXuat: dateStr,
                                lyDo: lyDo,
                                maHang: maHang,
                                tenHang: tenHang,
                                soLuongXuat: sl,
                                tongGiaTri: tongGiaTri // <-- THÊM MỚI
                            });
                        });
                    }

                    thongKeNgay[dateStr].soLuong += slPhieuNay;
                });

                // ĐÃ SỬA: Lưu thêm tongGiaTriXuat
                setExportStats({
                    tongPhieuXuat: allExports.length,
                    tongSoLuongXuat: tongSLXuat,
                    tongGiaTriXuat: tongGiaTriXuatToanBo 
                });

                // Cập nhật state danh sách xuất kho chi tiết
                setExportDetails(detailedExportsList);

                // Top 5 Xuất Nhiều Nhất
                const chartData = Object.values(itemExportCount)
                    .sort((a, b) => b.soLuongDaXuat - a.soLuongDaXuat)
                    .slice(0, 5);
                setExportDataForChart(chartData);

                // Data Biến động theo ngày
                const arrTheoNgay = Object.values(thongKeNgay).slice(-7);
                setExportDataTheoNgay(arrTheoNgay);

                // Data Cơ cấu lý do xuất
                const arrLyDo = Object.keys(thongKeLyDoMap).map(lyDo => ({ name: lyDo, count: thongKeLyDoMap[lyDo] }));
                setExportDataLyDo(arrLyDo);

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
        // ==========================================
        // SHEET 1: DỮ LIỆU TỒN KHO
        // ==========================================
        const excelDataTonKho = items.map((item, index) => ({
            "STT": index + 1,
            "Mã Hàng": item.maHang,
            "Tên Mặt Hàng": item.tenHang,
            "Số Lượng Tồn": item.soLuongTon,
            "Giá Nhập (VNĐ)": item.giaNhap,
            "Thành Tiền (VNĐ)": item.thanhTien
        }));

        excelDataTonKho.push({
            "STT": "", "Mã Hàng": "", "Tên Mặt Hàng": "TỔNG CỘNG:",
            "Số Lượng Tồn": stats.tongSoLuong, "Giá Nhập (VNĐ)": "",
            "Thành Tiền (VNĐ)": stats.tongTienNhap
        });

        const wsTonKho = XLSX.utils.json_to_sheet(excelDataTonKho);
        wsTonKho['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];


        // ==========================================
        // SHEET 2: DỮ LIỆU XUẤT KHO (ĐÃ CẬP NHẬT)
        // ==========================================
        const excelDataXuatKho = exportDetails.map((item, index) => ({
            "STT": index + 1,
            "Mã Phiếu": item.maPhieu,
            "Ngày Xuất": item.ngayXuat,
            "Lý Do": item.lyDo,
            "Mã Hàng": item.maHang,
            "Tên Mặt Hàng": item.tenHang,
            "Số Lượng Xuất": item.soLuongXuat,
            "Tổng Giá Trị (VNĐ)": item.tongGiaTri // <-- THÊM MỚI
        }));

        // Thêm dòng tổng cộng cho Xuất Kho
        excelDataXuatKho.push({
            "STT": "", "Mã Phiếu": "", "Ngày Xuất": "", "Lý Do": "", "Mã Hàng": "", 
            "Tên Mặt Hàng": "TỔNG CỘNG:",
            "Số Lượng Xuất": exportStats.tongSoLuongXuat,
            "Tổng Giá Trị (VNĐ)": exportStats.tongGiaTriXuat // <-- THÊM MỚI
        });

        const wsXuatKho = XLSX.utils.json_to_sheet(excelDataXuatKho);
        // ĐÃ SỬA: Căn chỉnh lại độ rộng cột, thêm cột Tổng Giá Trị
        wsXuatKho['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 20 }];


        // ==========================================
        // TẠO WORKBOOK VÀ XUẤT FILE
        // ==========================================
        const workbook = XLSX.utils.book_new();
        
        XLSX.utils.book_append_sheet(workbook, wsTonKho, "TonKho");
        XLSX.utils.book_append_sheet(workbook, wsXuatKho, "XuatKho");

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        XLSX.writeFile(workbook, `BaoCao_TongHopKho_${dateStr}.xlsx`);
    };

    const topValueItems = items.slice(0, 5);
    const topQtyItems = [...items].sort((a, b) => b.soLuongTon - a.soLuongTon).slice(0, 7);

    if (loading) return <div className="loading-screen">⏳ Đang tổng hợp dữ liệu...</div>;

    return (
        <div className="dashboard-wrapper">
            <header className="db-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>📊 Phân Tích Kho Hàng Tổng Hợp</h2>
                    <p>Cập nhật lần cuối: {new Date().toLocaleTimeString()}</p>
                </div>
                <button onClick={handleExportExcel} className="btn-export-excel" title="Tải xuống báo cáo chi tiết">
                    <span style={{ marginRight: '8px' }}>📊</span> Xuất Báo Cáo
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

            {/* LƯỚI BIỂU ĐỒ CHÍNH */}
            <div className="db-main-grid">
                
                {/* 1. Tồn Kho */}
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

                {/* 2. Cơ Cấu Vốn Tồn Kho */}
                <div className="db-chart-container">
                    <h5>💰 Cơ Cấu Vốn Tồn Kho (Top 5 Giá Trị)</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={topValueItems} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="thanhTien" nameKey="shortName">
                                {topValueItems.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val) => val.toLocaleString() + " đ"} />
                            <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Biến động lượng xuất */}
                <div className="db-chart-container">
                    <h5>📈 Biến Động Số Lượng Xuất (7 Ngày Gần Nhất)</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={exportDataTheoNgay}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="ngay" tick={{fontSize: 12, fill: '#888'}} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{stroke: '#eee', strokeWidth: 2}} />
                            <Line type="monotone" dataKey="soLuong" name="Số lượng xuất" stroke="#1cc88a" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                {/* 4. Phân bổ mục đích xuất (Cột kết hợp Đường) */}
                <div className="db-chart-container">
                    <h5>📊 Phân Bổ Mục Đích Xuất Kho</h5>
                    <ResponsiveContainer width="100%" height={350}> 
                        <ComposedChart 
                            data={exportDataLyDo} 
                            margin={{ top: 20, right: 20, bottom: 60, left: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            
                            <XAxis 
                                dataKey="name" 
                                tick={{fill: '#888', fontSize: 12}} 
                                axisLine={false} 
                                tickLine={false}
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                            />
                            <YAxis axisLine={false} tickLine={false} />
                            
                            <Tooltip 
                                cursor={{fill: '#f8f9fc'}} 
                                formatter={(value, name) => [
                                    `${value} phiếu`, 
                                    name === "count" ? "Số lượng phiếu" : name
                                ]} 
                            />
                            
                            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />

                            <Bar dataKey="count" name="Số lượng (Cột)" radius={[4, 4, 0, 0]} barSize={45}>
                                {exportDataLyDo.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Bar>

                            <Line 
                                type="monotone" 
                                dataKey="count" 
                                name="Xu hướng (Đường)" 
                                stroke="#4e73df"
                                strokeWidth={3} 
                                dot={{ r: 5, fill: '#4e73df', stroke: '#fff', strokeWidth: 2 }} 
                                activeDot={{ r: 7 }} 
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                {/* 5. Top 5 Sản phẩm xuất nhiều nhất */}
                <div className="db-chart-container span-full">
                    <h5>🚀 Top 5 Sản Phẩm Xuất Nhiều Nhất (Theo Số Lượng)</h5>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={exportDataForChart} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                            <XAxis type="number" axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="tenHang" width={180} tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: '#f8f9fc'}} />
                            <Bar dataKey="soLuongDaXuat" name="Số lượng đã xuất" fill="#e74a3b" radius={[0, 4, 4, 0]} barSize={25}>
                                {exportDataForChart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* BẢNG CHI TIẾT TỒN KHO */}
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

            {/* BẢNG CHI TIẾT XUẤT KHO */}
            <div className="db-table-wrapper" style={{ marginTop: '30px' }}>
                <h5>📤 Danh Sách Chi Tiết Xuất Kho Gần Đây</h5>
                
                <div style={{ overflowX: 'auto' }}>
                    <table className="db-modern-table">
                        <thead style={{ backgroundColor: '#f8f9fc' }}>
                            <tr>
                                <th>STT</th>
                                <th>Mã Phiếu</th>
                                <th>Ngày Xuất</th>
                                <th>Lý Do</th>
                                <th>Mã Hàng</th>
                                <th>Tên Hàng</th>
                                <th className="text-center">SL Xuất</th>
                                {/* ĐÃ SỬA: Thêm cột Tổng Giá Trị */}
                                <th className="text-right">Tổng Giá Trị</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {exportDetails.length > 0 ? (
                                exportDetails.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td className="font-weight-bold text-primary">{item.maPhieu}</td>
                                        <td>{item.ngayXuat}</td>
                                        <td>{item.lyDo}</td>
                                        <td className="font-weight-bold">{item.maHang}</td>
                                        <td className="text-muted">{item.tenHang}</td>
                                        <td className="text-center">
                                            <span 
                                                className="badge" 
                                                style={{ 
                                                    backgroundColor: '#f6c23e', 
                                                    color: '#000000', 
                                                    padding: '0.4em 0.8em',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {item.soLuongXuat}
                                            </span>
                                        </td>
                                        {/* ĐÃ SỬA: Hiển thị Tổng Giá Trị cho từng dòng xuất */}
                                        <td className="text-right font-weight-bold" style={{ color: '#e74a3b' }}>
                                            {item.tongGiaTri.toLocaleString('vi-VN')} đ
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">Chưa có dữ liệu xuất kho</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
    );
};

export default Dashboard;