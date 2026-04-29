import React, { useState, useEffect, useRef } from 'react';
import api from '../services/axiosConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ComposedChart, Legend } from 'recharts';
import { FiUpload, FiBox, FiDollarSign, FiTag, FiDownload, FiFileText, FiChevronDown, FiTrendingUp } from 'react-icons/fi'; 

// --- IMPORT THƯ VIỆN XUẤT FILE ---
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TabXuatKho = () => {
    const [loading, setLoading] = useState(true);
    
    // State quản lý việc mở/đóng dropdown xuất báo cáo
    const [showExportMenu, setShowExportMenu] = useState(false);
    const dropdownRef = useRef(null);

    // State chứa số liệu KPI
    const [exportStats, setExportStats] = useState({
        tongPhieuXuat: 0,
        tongSoLuongXuat: 0,
        tongGiaTriXuat: 0,
        soMatHangXuat: 0
    });

    // State chứa dữ liệu cho 3 Biểu đồ
    const [chartTopItems, setChartTopItems] = useState([]);
    const [chartTrendLine, setChartTrendLine] = useState([]);
    const [chartReason, setChartReason] = useState([]);

    // State chứa dữ liệu Bảng chi tiết
    const [exportDetails, setExportDetails] = useState([]);

    const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#6f42c1', '#fd7e14'];
    const PIE_COLORS = ['#f6c23e', '#e74a3b', '#6f42c1', '#36b9cc', '#1cc88a'];

    // Xử lý click ra ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchOutboundData = async () => {
            try {
                const response = await api.get('/phieu-xuat');
                const allExports = Array.isArray(response.data) ? response.data : [];

                let tongSL = 0;
                let tongTien = 0;

                const itemMap = {};
                const trendMap = {};
                const reasonMap = {};
                const detailedList = [];

                allExports.forEach(phieu => {
                    const dateStr = phieu.ngayXuat ? new Date(phieu.ngayXuat).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'N/A';
                    const lyDo = phieu.lyDoXuat || 'Khác';

                    if (!reasonMap[lyDo]) reasonMap[lyDo] = 0;
                    reasonMap[lyDo] += 1;

                    let slPhieuNay = 0;

                    if (phieu.chiTiets && Array.isArray(phieu.chiTiets)) {
                        phieu.chiTiets.forEach(ct => {
                            const sl = parseInt(ct.soLuongXuat) || 0;
                            const maHang = ct.hangHoa?.maHang || 'N/A';
                            const tenHang = ct.hangHoa?.tenHang || "Chưa xác định";

                            const giaChuan = ct.donGia || ct.hangHoa?.giaBan || 0;
                            const tongGiaTri = sl * giaChuan;

                            tongSL += sl;
                            tongTien += tongGiaTri;
                            slPhieuNay += sl;

                            if (maHang !== 'N/A') {
                                if (!itemMap[maHang]) {
                                    itemMap[maHang] = {
                                        tenHang: tenHang.length > 20 ? tenHang.substring(0, 20) + '...' : tenHang,
                                        slXuat: 0
                                    };
                                }
                                itemMap[maHang].slXuat += sl;
                            }

                            detailedList.push({
                                maPhieu: phieu.maPhieuXuat || '---',
                                ngayXuat: dateStr,
                                lyDo: lyDo,
                                maHang: maHang,
                                tenHang: tenHang,
                                soLuongXuat: sl,
                                tongGiaTri: tongGiaTri
                            });
                        });
                    }

                    if (!trendMap[dateStr]) trendMap[dateStr] = { ngay: dateStr, soLuong: 0 };
                    trendMap[dateStr].soLuong += slPhieuNay;
                });

                setExportStats({
                    tongPhieuXuat: allExports.length,
                    tongSoLuongXuat: tongSL,
                    tongGiaTriXuat: tongTien,
                    soMatHangXuat: Object.keys(itemMap).length
                });

                setExportDetails(detailedList.reverse());
                setChartTopItems(Object.values(itemMap).sort((a, b) => b.slXuat - a.slXuat).slice(0, 5));
                setChartTrendLine(Object.values(trendMap).slice(-7));
                setChartReason(Object.keys(reasonMap).map(key => ({ name: key, count: reasonMap[key] })));

            } catch (error) {
                console.error("Lỗi lấy dữ liệu phiếu xuất:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOutboundData();
    }, []);

    const handleExportExcel = () => {
        if (exportDetails.length === 0) {
            alert("Không có dữ liệu để xuất!");
            return;
        }

        const dataToExport = exportDetails.map((item, index) => ({
            "STT": index + 1,
            "Mã Phiếu": item.maPhieu,
            "Ngày Xuất": item.ngayXuat,
            "Lý Do": item.lyDo,
            "Mã Hàng": item.maHang,
            "Tên Hàng": item.tenHang,
            "Số Lượng Xuất": item.soLuongXuat,
            "Tổng Giá Trị (VNĐ)": item.tongGiaTri
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bao_Cao_Xuat_Kho");
        
        worksheet['!cols'] = [
            { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, 
            { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 20 }
        ];

        XLSX.writeFile(workbook, `Bao_Cao_Xuat_Kho_${new Date().getTime()}.xlsx`);
        setShowExportMenu(false);
    };

    const handleExportPDF = () => {
        if (exportDetails.length === 0) {
            alert("Không có dữ liệu để xuất!");
            return;
        }

        const doc = new jsPDF('l', 'pt', 'a4'); 
        doc.setFontSize(16);
        doc.setTextColor(78, 115, 223); 
        doc.text("BAO CAO CHI TIET XUAT KHO", 40, 40); 
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 40, 60);

        const tableColumn = ["STT", "Ma Phieu", "Ngay Xuat", "Ly Do", "Ma Hang", "Ten Hang", "SL", "Tong Tien"];
        const tableRows = [];

        exportDetails.forEach((item, index) => {
            const rowData = [
                index + 1,
                item.maPhieu,
                item.ngayXuat,
                item.lyDo,
                item.maHang,
                item.tenHang,
                item.soLuongXuat,
                (item.tongGiaTri || 0).toLocaleString('vi-VN') + " d"
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 80,
            theme: 'grid',
            styles: { fontSize: 9, font: "helvetica", cellPadding: 5 },
            headStyles: { fillColor: [78, 115, 223], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            columnStyles: {
                0: { cellWidth: 30, halign: 'center' },
                6: { halign: 'center' },
                7: { halign: 'right' }
            }
        });

        doc.save(`Bao_Cao_Xuat_Kho_${new Date().getTime()}.pdf`);
        setShowExportMenu(false);
    };

    if (loading) return <div className="loading-screen" style={{ padding: '40px', textAlign: 'center', color: '#858796' }}>⏳ Đang tổng hợp dữ liệu Xuất Kho...</div>;

    return (
        <div className="tab-outbound-container" style={{ padding: '0 8px' }}>
            
            {/* --- HEADER CHỨA TIÊU ĐỀ VÀ NÚT XUẤT BÁO CÁO Ở ĐẦU TRANG --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h4 style={{ margin: 0, color: '#5a5c69', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiTrendingUp color="#4e73df" /> Thống Kê Tình Hình Xuất Kho
                </h4>
                
                <div className="dropdown-export-container" ref={dropdownRef} style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        style={{ 
                            padding: '8px 16px', 
                            backgroundColor: '#4e73df', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(78, 115, 223, 0.2)',
                            transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2e59d9'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4e73df'}
                    >
                        <FiDownload size={16} /> Xuất báo cáo 
                        <FiChevronDown 
                            size={18} 
                            style={{ 
                                transition: 'transform 0.2s', 
                                transform: showExportMenu ? 'rotate(180deg)' : 'rotate(0deg)' 
                            }} 
                        />
                    </button>

                    {/* Đã sửa: Không dùng {showExportMenu && ...} nữa, mà dùng CSS để ẩn hiện mượt mà */}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '8px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        minWidth: '160px',
                        zIndex: 100,
                        overflow: 'hidden',
                        border: '1px solid #e3e6f0',
                        // CSS Animation properties
                        transition: 'all 0.2s ease-out',
                        visibility: showExportMenu ? 'visible' : 'hidden',
                        opacity: showExportMenu ? 1 : 0,
                        transform: showExportMenu ? 'translateY(0)' : 'translateY(-10px)',
                        pointerEvents: showExportMenu ? 'auto' : 'none'
                    }}>
                        <button 
                            onClick={handleExportExcel}
                            style={{
                                width: '100%', padding: '12px 16px', backgroundColor: 'white', border: 'none',
                                borderBottom: '1px solid #f8f9fc', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                gap: '10px', color: '#1cc88a', fontWeight: '500', textAlign: 'left', transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fc'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            <FiFileText size={18} /> Xuất Excel
                        </button>
                        <button 
                            onClick={handleExportPDF}
                            style={{
                                width: '100%', padding: '12px 16px', backgroundColor: 'white', border: 'none',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                gap: '10px', color: '#e74a3b', fontWeight: '500', textAlign: 'left', transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fc'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            <FiFileText size={18} /> Xuất PDF
                        </button>
                    </div>
                </div>
            </div>

         {/* --- 4 CỤC KPI --- (Đã đổi màu icon về xám đen) */}
<div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
    <div className="stat-card purple" style={{ boxShadow: '0 .15rem 1.75rem 0 rgba(58,59,69,.15)', borderRadius: '8px' }}>
        <div className="stat-content">
            <h6 style={{ fontSize: '12px', fontWeight: 'bold', color: '#b7b9cc', textTransform: 'uppercase' }}>TỔNG PHIẾU XUẤT</h6>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#5a5c69' }}>{exportStats.tongPhieuXuat}</div>
        </div>
        {/* Đổi màu icon thành Xám đen */}
        <div className="stat-icon-bg"><FiUpload size={32} color="#5a5c69" /></div> 
    </div>
    <div className="stat-card red" style={{ boxShadow: '0 .15rem 1.75rem 0 rgba(58,59,69,.15)', borderRadius: '8px' }}>
        <div className="stat-content">
            <h6 style={{ fontSize: '12px', fontWeight: 'bold', color: '#b7b9cc', textTransform: 'uppercase' }}>SỐ LƯỢNG HÀNG XUẤT</h6>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#5a5c69' }}>{(exportStats.tongSoLuongXuat || 0).toLocaleString()}</div>
        </div>
        {/* Đổi màu icon thành Xám đen */}
        <div className="stat-icon-bg"><FiBox size={32} color="#5a5c69" /></div>
    </div>
    <div className="stat-card green" style={{ boxShadow: '0 .15rem 1.75rem 0 rgba(58,59,69,.15)', borderRadius: '8px' }}>
        <div className="stat-content">
            <h6 style={{ fontSize: '12px', fontWeight: 'bold', color: '#b7b9cc', textTransform: 'uppercase' }}>TỔNG GIÁ TRỊ XUẤT</h6>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#5a5c69' }}>{(exportStats.tongGiaTriXuat || 0).toLocaleString()} đ</div>
        </div>
        {/* Đổi màu icon thành Xám đen */}
        <div className="stat-icon-bg"><FiDollarSign size={32} color="#5a5c69" /></div>
    </div>
    <div className="stat-card orange" style={{ boxShadow: '0 .15rem 1.75rem 0 rgba(58,59,69,.15)', borderRadius: '8px' }}>
        <div className="stat-content">
            <h6 style={{ fontSize: '12px', fontWeight: 'bold', color: '#b7b9cc', textTransform: 'uppercase' }}>SỐ LOẠI MẶT HÀNG</h6>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#5a5c69' }}>{exportStats.soMatHangXuat}</div>
        </div>
        {/* Đổi màu icon thành Xám đen */}
        <div className="stat-icon-bg"><FiTag size={32} color="#5a5c69" /></div>
    </div>
</div>

            {/* --- KHU VỰC BIỂU ĐỒ (CHIA LÀM 2 HÀNG) --- */}
            <div className="db-main-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '24px', gap: '20px' }}>
                <div className="db-chart-container" style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 .15rem 1.75rem 0 rgba(58,59,69,.15)' }}>
                    <h5 style={{ color: '#4e73df', fontWeight: 'bold', marginBottom: '16px', fontSize: '16px' }}>📉 Biến Động Xuất Kho (7 Ngày Qua)</h5>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartTrendLine} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaecf4" />
                            <XAxis dataKey="ngay" tick={{ fontSize: 12, fill: '#858796' }} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#858796' }} />
                            <Tooltip cursor={{ stroke: '#eaecf4', strokeWidth: 2 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 0.15rem 1.75rem 0 rgba(58,59,69,.15)' }} />
                            <Line type="monotone" dataKey="soLuong" name="Số lượng xuất" stroke="#1cc88a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="db-chart-container" style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 .15rem 1.75rem 0 rgba(58,59,69,.15)' }}>
                    <h5 style={{ color: '#4e73df', fontWeight: 'bold', marginBottom: '16px', fontSize: '16px' }}>📊 Phân Bổ Mục Đích Xuất Kho</h5>
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={chartReason} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaecf4" />
                            <XAxis dataKey="name" tick={{ fill: '#858796', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#858796' }} />
                            <Tooltip cursor={{ fill: '#f8f9fc' }} formatter={(value, name) => [`${value} phiếu`, name === "count" ? "Số lượng phiếu" : name]} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 0.15rem 1.75rem 0 rgba(58,59,69,.15)' }} />
                            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} iconType="circle" />
                            <Bar dataKey="count" name="Số lượng (Cột)" radius={[4, 4, 0, 0]} barSize={40}>
                                {chartReason.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Bar>
                            <Line type="monotone" dataKey="count" name="Xu hướng (Đường)" stroke="#4e73df" strokeWidth={3} dot={{ r: 5, fill: '#4e73df', stroke: '#fff', strokeWidth: 2 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="db-main-grid" style={{ gridTemplateColumns: '1fr', marginTop: '24px' }}>
                <div className="db-chart-container span-full" style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 .15rem 1.75rem 0 rgba(58,59,69,.15)' }}>
                    <h5 style={{ color: '#4e73df', fontWeight: 'bold', marginBottom: '16px', fontSize: '16px' }}>🚀 Top 5 Sản Phẩm Xuất Nhiều Nhất</h5>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartTopItems} layout="vertical" margin={{ left: 10, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eaecf4" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#858796' }} />
                            <YAxis type="category" dataKey="tenHang" width={180} tick={{ fill: '#5a5c69', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8f9fc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 0.15rem 1.75rem 0 rgba(58,59,69,.15)' }} />
                            <Bar dataKey="slXuat" name="Số lượng xuất" radius={[0, 4, 4, 0]} barSize={24}>
                                {chartTopItems.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- BẢNG CHI TIẾT --- */}
            <div className="db-table-wrapper" style={{ marginTop: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 .15rem 1.75rem 0 rgba(58,59,69,.15)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e3e6f0', backgroundColor: '#f8f9fc' }}>
                    <h5 style={{ margin: 0, color: '#4e73df', fontWeight: 'bold', fontSize: '16px' }}>📋 Danh Sách Chi Tiết Phieu Xuất Kho</h5>
                </div>

                <div className="custom-scrollbar" style={{ overflowX: 'auto', maxHeight: '400px', padding: '0 20px 20px 20px' }}>
                    <table className="db-modern-table custom-compact-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'white' }}>
                            <tr style={{ borderBottom: '2px solid #e3e6f0' }}>
                                <th style={{ padding: '12px 8px', color: '#858796', fontSize: '12px', textAlign: 'left' }} width="12%">MÃ PHIẾU</th>
                                <th style={{ padding: '12px 8px', color: '#858796', fontSize: '12px', textAlign: 'left' }} width="12%">NGÀY XUẤT</th>
                                <th style={{ padding: '12px 8px', color: '#858796', fontSize: '12px', textAlign: 'left' }} width="15%">LÝ DO</th>
                                <th style={{ padding: '12px 8px', color: '#858796', fontSize: '12px', textAlign: 'left' }} width="35%">TÊN MẶT HÀNG</th>
                                <th style={{ padding: '12px 8px', color: '#858796', fontSize: '12px', textAlign: 'center' }} width="10%">SL XUẤT</th>
                                <th style={{ padding: '12px 8px', color: '#858796', fontSize: '12px', textAlign: 'right' }} width="16%">TỔNG GIÁ TRỊ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exportDetails.length > 0 ? (
                                exportDetails.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e3e6f0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#4e73df' }}>{item.maPhieu}</td>
                                        <td style={{ padding: '12px 8px', color: '#5a5c69' }}>{item.ngayXuat}</td>
                                        <td style={{ padding: '12px 8px' }}>
                                            <span style={{ padding: '4px 8px', backgroundColor: '#e2e3e5', color: '#383d41', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                                                {item.lyDo}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 8px' }}>
                                            <div style={{ color: '#5a5c69', fontWeight: '500', marginBottom: '4px' }} title={item.tenHang}>{item.tenHang}</div>
                                            <div style={{ color: '#858796', fontSize: '12px' }}>{item.maHang}</div>
                                        </td>
                                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                            <span style={{ padding: '4px 10px', backgroundColor: '#f6c23e', color: '#fff', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                                {item.soLuongXuat}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold', color: '#e74a3b' }}>
                                            {(item.tongGiaTri || 0).toLocaleString('vi-VN')} đ
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#858796' }}>Chưa có dữ liệu xuất kho.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TabXuatKho;