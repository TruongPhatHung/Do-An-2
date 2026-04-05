import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Dashboard.css';

const Dashboard = () => {
    // Tồn kho state
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ tongMatHang: 0, tongSoLuong: 0, tongTienNhap: 0 });

    // Xuất kho state
    const [exportStats, setExportStats] = useState({ tongPhieuXuat: 0, tongSoLuongXuat: 0, tongGiaTriXuat: 0 });
    const [exportDataForChart, setExportDataForChart] = useState([]);
    const [exportDataTheoNgay, setExportDataTheoNgay] = useState([]);
    const [exportDataLyDo, setExportDataLyDo] = useState([]);

    // State lưu chi tiết danh sách xuất kho
    const [exportDetails, setExportDetails] = useState([]);

    const [showExportModal, setShowExportModal] = useState(false);
    const [exportType, setExportType] = useState('tonghop'); // 'tonghop', 'tonkho', 'xuatkho'

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
            const allProducts = Array.isArray(responseProducts.data) ? responseProducts.data : [];

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
                const allExports = Array.isArray(responseExports.data) ? responseExports.data : [];

                let tongSLXuat = 0;
                let tongGiaTriXuatToanBo = 0;
                const itemExportCount = {};
                const thongKeNgay = {};
                const thongKeLyDoMap = {};

                const detailedExportsList = [];

                allExports.forEach(phieu => {
                    const dateStr = phieu.ngayXuat ? new Date(phieu.ngayXuat).toLocaleDateString('vi-VN') : 'Không rõ';
                    if (!thongKeNgay[dateStr]) thongKeNgay[dateStr] = { ngay: dateStr, soLuong: 0 };

                    const lyDo = phieu.lyDoXuat || 'Khác';
                    if (!thongKeLyDoMap[lyDo]) thongKeLyDoMap[lyDo] = 0;
                    thongKeLyDoMap[lyDo] += 1;

                    let slPhieuNay = 0;

                    if (phieu.chiTiets && Array.isArray(phieu.chiTiets)) {
                        phieu.chiTiets.forEach(ct => {
                            const sl = parseInt(ct.soLuongXuat) || 0;
                            const maHang = ct.hangHoa?.maHang;
                            const tenHang = ct.hangHoa?.tenHang || "Chưa xác định";

                            const giaChuan = ct.donGia || ct.hangHoa?.giaBan || ct.hangHoa?.giaNhap || 0;
                            const tongGiaTri = sl * giaChuan;

                            tongSLXuat += sl;
                            tongGiaTriXuatToanBo += tongGiaTri;
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

                            detailedExportsList.push({
                                maPhieu: phieu.maPhieuXuat || 'N/A',
                                ngayXuat: dateStr,
                                lyDo: lyDo,
                                maHang: maHang,
                                tenHang: tenHang,
                                soLuongXuat: sl,
                                tongGiaTri: tongGiaTri
                            });
                        });
                    }

                    thongKeNgay[dateStr].soLuong += slPhieuNay;
                });

                setExportStats({
                    tongPhieuXuat: allExports.length,
                    tongSoLuongXuat: tongSLXuat,
                    tongGiaTriXuat: tongGiaTriXuatToanBo
                });

                setExportDetails(detailedExportsList);

                const chartData = Object.values(itemExportCount)
                    .sort((a, b) => b.soLuongDaXuat - a.soLuongDaXuat)
                    .slice(0, 5);
                setExportDataForChart(chartData);

                const arrTheoNgay = Object.values(thongKeNgay).slice(-7);
                setExportDataTheoNgay(arrTheoNgay);

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

    const removeVietnameseTones = (str) => {
        if (!str) return "";
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        return str;
    }

    const handleExportExcel = () => {
        const workbook = XLSX.utils.book_new();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        if (exportType === 'tonghop' || exportType === 'tonkho') {
            const excelDataTonKho = items.map((item, index) => ({
                "STT": index + 1,
                "Mã Hàng": item.maHang,
                "Tên Mặt Hàng": item.tenHang,
                "Số Lượng Tồn": item.soLuongTon,
                "Giá Nhập (VNĐ)": item.giaNhap || 0,
                "Thành Tiền (VNĐ)": item.thanhTien || 0
            }));
            excelDataTonKho.push({
                "STT": "", "Mã Hàng": "", "Tên Mặt Hàng": "TỔNG CỘNG:",
                "Số Lượng Tồn": stats.tongSoLuong, "Giá Nhập (VNĐ)": "",
                "Thành Tiền (VNĐ)": stats.tongTienNhap || 0
            });
            const wsTonKho = XLSX.utils.json_to_sheet(excelDataTonKho);
            wsTonKho['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(workbook, wsTonKho, "TonKho");
        }

        if (exportType === 'tonghop' || exportType === 'xuatkho') {
            const excelDataXuatKho = exportDetails.map((item, index) => ({
                "STT": index + 1,
                "Mã Phiếu": item.maPhieu,
                "Ngày Xuất": item.ngayXuat,
                "Lý Do": item.lyDo,
                "Mã Hàng": item.maHang,
                "Tên Mặt Hàng": item.tenHang,
                "Số Lượng Xuất": item.soLuongXuat,
                "Tổng Giá Trị (VNĐ)": item.tongGiaTri || 0
            }));
            excelDataXuatKho.push({
                "STT": "", "Mã Phiếu": "", "Ngày Xuất": "", "Lý Do": "", "Mã Hàng": "",
                "Tên Mặt Hàng": "TỔNG CỘNG:",
                "Số Lượng Xuất": exportStats.tongSoLuongXuat,
                "Tổng Giá Trị (VNĐ)": exportStats.tongGiaTriXuat || 0
            });
            const wsXuatKho = XLSX.utils.json_to_sheet(excelDataXuatKho);
            wsXuatKho['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(workbook, wsXuatKho, "XuatKho");
        }

        let fileName = `BaoCao_${exportType}_${dateStr}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        setShowExportModal(false);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        const dateStr = new Date().toLocaleDateString('vi-VN');

        doc.setFontSize(18);
        doc.text(removeVietnameseTones(`BAO CAO ${exportType.toUpperCase()} - NGAY ${dateStr}`), 14, 20);

        let startYPos = 30;

        if (exportType === 'tonghop' || exportType === 'tonkho') {
            doc.setFontSize(14);
            doc.text("DANH SACH TON KHO", 14, startYPos);

            const tableDataTonKho = items.map((item, index) => [
                index + 1,
                item.maHang,
                removeVietnameseTones(item.tenHang),
                item.soLuongTon,
                (item.giaNhap || 0).toLocaleString() + " VND",
                (item.thanhTien || 0).toLocaleString() + " VND"
            ]);

            tableDataTonKho.push(["", "", "TONG CONG:", stats.tongSoLuong, "", (stats.tongTienNhap || 0).toLocaleString() + " VND"]);

            autoTable(doc, {
                startY: startYPos + 5,
                head: [['STT', 'Ma Hang', 'Ten Mat Hang', 'So Luong Ton', 'Gia Nhap', 'Thanh Tien']],
                body: tableDataTonKho,
                theme: 'grid',
                headStyles: { fillColor: [78, 115, 223] }
            });
            startYPos = doc.lastAutoTable.finalY + 15;
        }

        if (exportType === 'tonghop' || exportType === 'xuatkho') {
            if (exportType === 'tonghop' && startYPos > 150) {
                doc.addPage();
                startYPos = 20;
            }

            doc.setFontSize(14);
            doc.text("DANH SACH XUAT KHO", 14, startYPos);

            const tableDataXuatKho = exportDetails.map((item, index) => [
                index + 1,
                item.maPhieu,
                item.ngayXuat,
                removeVietnameseTones(item.lyDo),
                item.maHang,
                removeVietnameseTones(item.tenHang),
                item.soLuongXuat,
                (item.tongGiaTri || 0).toLocaleString() + " VND"
            ]);

            tableDataXuatKho.push(["", "", "", "", "", "TONG CONG:", exportStats.tongSoLuongXuat, (exportStats.tongGiaTriXuat || 0).toLocaleString() + " VND"]);

            autoTable(doc, {
                startY: startYPos + 5,
                head: [['STT', 'Ma Phieu', 'Ngay Xuat', 'Ly Do', 'Ma Hang', 'Ten Mat Hang', 'SL Xuat', 'Tong Gia Tri']],
                body: tableDataXuatKho,
                theme: 'grid',
                headStyles: { fillColor: [231, 74, 59] }
            });
        }

        doc.save(`BaoCao_${exportType}_${new Date().toISOString().slice(0, 10)}.pdf`);
        setShowExportModal(false);
    };

    const topValueItems = items.slice(0, 5);
    const topQtyItems = [...items].sort((a, b) => b.soLuongTon - a.soLuongTon).slice(0, 7);

    if (loading) return (
        <div className="loading-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#4e73df' }}>
            <i className="fas fa-circle-notch fa-spin fa-3x" style={{ marginBottom: '1rem' }}></i>
            <h4 style={{ color: '#5a5c69' }}>Đang tổng hợp dữ liệu...</h4>
        </div>
    );

    return (
        <div className="dashboard-wrapper">
            {/* Header */}
            <header className="db-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #eaecf4' }}>
                <div>
                    <h2 style={{ color: '#4e73df', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-chart-line"></i> Phân Tích Kho Hàng Tổng Hợp
                    </h2>
                    <p style={{ margin: '5px 0 0 0', color: '#858796', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <i className="far fa-clock"></i> Cập nhật lần cuối: {new Date().toLocaleTimeString()}
                    </p>
                </div>
                <button onClick={() => setShowExportModal(true)} className="btn-export-excel" title="Mở tùy chọn xuất báo cáo" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#4e73df', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08)', transition: 'all 0.2s' }}>
                    <i className="fas fa-file-export"></i> Tùy Chọn Xuất
                </button>
            </header>

            {/* Modal Xuất Báo Cáo */}
            {showExportModal && (
                <div className="custom-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="custom-modal-content" style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h4 style={{ marginTop: 0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <i className="fas fa-cog text-primary"></i> Chọn Tùy Chọn Xuất Báo Cáo
                        </h4>

                        <div className="modal-form-group" style={{ margin: '20px 0' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>Dữ liệu muốn xuất:</label>
                            <select
                                value={exportType}
                                onChange={(e) => setExportType(e.target.value)}
                                className="modal-select"
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                            >
                                <option value="tonghop">Tất cả (Tổng Hợp)</option>
                                <option value="tonkho">Chỉ danh sách Tồn Kho</option>
                                <option value="xuatkho">Chỉ danh sách Xuất Kho</option>
                            </select>
                        </div>

                        <div className="modal-buttons-grid" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <button onClick={handleExportExcel} className="btn-export type-excel" style={{ flex: 1, padding: '10px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                <i className="fas fa-file-excel"></i> EXCEL
                            </button>
                            <button onClick={handleExportPDF} className="btn-export type-pdf" style={{ flex: 1, padding: '10px', backgroundColor: '#e74a3b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                <i className="fas fa-file-pdf"></i> PDF
                            </button>
                        </div>

                        <button onClick={() => setShowExportModal(false)} className="btn-close-modal" style={{ width: '100%', padding: '10px', backgroundColor: '#eaecf4', color: '#5a5c69', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* Thống Kê Tổng Quan */}
            <div className="db-stats-grid">
                <div className="stat-card blue">
                    <div className="stat-content">
                        <h6>TỔNG MẶT HÀNG TỒN</h6>
                        <div className="stat-value">{stats.tongMatHang}</div>
                    </div>
                    <div className="stat-icon-bg"><i className="fas fa-boxes"></i></div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-content">
                        <h6>SỐ LƯỢNG TỒN</h6>
                        <div className="stat-value">{(stats.tongSoLuong || 0).toLocaleString()}</div>
                    </div>
                    <div className="stat-icon-bg"><i className="fas fa-cubes"></i></div>
                </div>
                <div className="stat-card green">
                    <div className="stat-content">
                        <h6>TỔNG VỐN TỒN KHO</h6>
                        <div className="stat-value">{(stats.tongTienNhap || 0).toLocaleString()} đ</div>
                    </div>
                    <div className="stat-icon-bg"><i className="fas fa-money-bill-wave"></i></div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-content">
                        <h6>TỔNG PHIẾU XUẤT</h6>
                        <div className="stat-value">{exportStats.tongPhieuXuat}</div>
                    </div>
                    <div className="stat-icon-bg"><i className="fas fa-file-invoice"></i></div>
                </div>
                <div className="stat-card red">
                    <div className="stat-content">
                        <h6>TỔNG HÀNG ĐÃ XUẤT</h6>
                        <div className="stat-value">{(exportStats.tongSoLuongXuat || 0).toLocaleString()}</div>
                    </div>
                    <div className="stat-icon-bg"><i className="fas fa-shipping-fast"></i></div>
                </div>
            </div>

            {/* Biểu đồ */}
            <div className="db-main-grid">
                <div className="db-chart-container">
                    <h5 style={{ color: '#4e73df', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}><i className="fas fa-chart-bar"></i> Top 7 Sản Phẩm Tồn Kho Nhiều Nhất</h5>
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
                    <h5 style={{ color: '#1cc88a', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}><i className="fas fa-chart-pie"></i> Cơ Cấu Vốn Tồn Kho (Top 5)</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={topValueItems} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="thanhTien" nameKey="shortName">
                                {topValueItems.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val) => (val || 0).toLocaleString() + " đ"} />
                            <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="db-chart-container">
                    <h5 style={{ color: '#36b9cc', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}><i className="fas fa-chart-line"></i> Biến Động Xuất Kho (7 Ngày Qua)</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={exportDataTheoNgay}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="ngay" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ stroke: '#eee', strokeWidth: 2 }} />
                            <Line type="monotone" dataKey="soLuong" name="Số lượng xuất" stroke="#1cc88a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="db-chart-container">
                    <h5 style={{ color: '#f6c23e', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}><i className="fas fa-chart-area"></i> Phân Bổ Mục Đích Xuất Kho</h5>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={exportDataLyDo} margin={{ top: 20, right: 20, bottom: 60, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" interval={0} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8f9fc' }} formatter={(value, name) => [`${value} phiếu`, name === "count" ? "Số lượng phiếu" : name]} />
                            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                            <Bar dataKey="count" name="Số lượng (Cột)" radius={[4, 4, 0, 0]} barSize={45}>
                                {exportDataLyDo.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Bar>
                            <Line type="monotone" dataKey="count" name="Xu hướng (Đường)" stroke="#4e73df" strokeWidth={3} dot={{ r: 5, fill: '#4e73df', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="db-chart-container span-full">
                    <h5 style={{ color: '#e74a3b', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}><i className="fas fa-rocket"></i> Top 5 Sản Phẩm Xuất Nhiều Nhất (Số Lượng)</h5>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={exportDataForChart} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                            <XAxis type="number" axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="tenHang" width={180} tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8f9fc' }} />
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
                <h5 style={{ color: '#4e73df', marginBottom: '15px' }}><i className="fas fa-list-alt"></i> Danh Sách Chi Tiết Giá Trị Hàng Hóa Tồn Kho</h5>
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
                                    <span className={`badge ${item.soLuongTon < 10 ? 'bg-danger' : 'bg-success'}`} style={{ padding: '5px 10px', borderRadius: '15px', color: 'white', backgroundColor: item.soLuongTon < 10 ? '#e74a3b' : '#1cc88a' }}>
                                        {item.soLuongTon}
                                    </span>
                                </td>
                                <td className="text-right">{(item.giaNhap || 0).toLocaleString()} đ</td>
                                <td className="text-right font-weight-bold text-primary">
                                    {(item.thanhTien || 0).toLocaleString()} đ
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* BẢNG CHI TIẾT XUẤT KHO */}
            <div className="db-table-wrapper" style={{ marginTop: '30px' }}>
                <h5 style={{ color: '#e74a3b', marginBottom: '15px' }}><i className="fas fa-clipboard-list"></i> Danh Sách Chi Tiết Xuất Kho Gần Đây</h5>
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
                                                    fontWeight: 'bold',
                                                    borderRadius: '12px'
                                                }}
                                            >
                                                {item.soLuongXuat}
                                            </span>
                                        </td>
                                        <td className="text-right font-weight-bold" style={{ color: '#e74a3b' }}>
                                            {(item.tongGiaTri || 0).toLocaleString('vi-VN')} đ
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center" style={{ padding: '20px', color: '#858796' }}>
                                        <i className="fas fa-box-open fa-2x" style={{ display: 'block', margin: '0 auto 10px', color: '#d1d3e2' }}></i>
                                        Chưa có dữ liệu xuất kho
                                    </td>
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