import React, { useState, useEffect, useRef } from 'react';
import api from '../services/axiosConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Import thêm thư viện xuất file và icon
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiDownload, FiChevronDown, FiFileText, FiFile } from 'react-icons/fi';

const TabTongQuan = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ tongMatHang: 0, tongSoLuong: 0, tongTienNhap: 0 });

    // State quản lý menu xuất báo cáo
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef(null);

    const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];

    const truncateName = (name) => name?.length > 20 ? name.substring(0, 20) + '...' : name || '';

    // Lấy dữ liệu
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

    // Đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- HÀM XUẤT EXCEL ---
    const handleExportExcel = () => {
        if (!items || items.length === 0) return alert("Không có dữ liệu để xuất!");

        const excelData = items.map((item, index) => ({
            "STT": index + 1,
            "Mã Hàng": item.maHang,
            "Tên Mặt Hàng": item.tenHang,
            "Số Lượng Tồn": item.soLuongTon,
            "Giá Nhập": item.giaNhap,
            "Thành Tiền": item.thanhTien
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "TongQuanTonKho");
        
        const dateStr = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `Tong_Quan_Ton_Kho_${dateStr}.xlsx`);
        setShowExportMenu(false);
    };

// --- HÀM XUẤT PDF (Đã fix font chữ + Căn chỉnh lại cột đẹp mắt) ---
    const handleExportPDF = async () => {
        if (!items || items.length === 0) return alert("Không có dữ liệu để xuất!");

        try {
            // Sửa lại thành 'landscape' (nằm ngang) để có không gian rộng hơn cho Tên SP dài
            const doc = new jsPDF('landscape');

            // 1. Tải font Roboto (hỗ trợ Tiếng Việt)
            const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf';
            const response = await fetch(fontUrl);
            const blob = await response.blob();

            // 2. Đọc file font
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result.split(',')[1];

                // 3. Nhúng font vào PDF
                doc.addFileToVFS("Roboto-Regular.ttf", base64data);
                doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
                
                // 4. Kích hoạt font tiếng Việt
                doc.setFont("Roboto"); 

                // 5. Viết tiêu đề
                doc.setFontSize(16);
                doc.text("BÁO CÁO: TỔNG QUAN TỒN KHO", 14, 15);

                // 6. Chuẩn bị dữ liệu bảng
                const tableRows = items.map((item, index) => [
                    index + 1,
                    item.maHang,
                    item.tenHang,
                    item.soLuongTon,
                    (item.giaNhap || 0).toLocaleString() + ' đ',
                    (item.thanhTien || 0).toLocaleString() + ' đ'
                ]);

                // 7. Vẽ bảng và căn chỉnh độ rộng cột
                autoTable(doc, {
                    head: [["STT", "Mã Hàng", "Tên Mặt Hàng", "Số Lượng", "Giá Nhập", "Thành Tiền"]],
                    body: tableRows,
                    startY: 22,
                    styles: { 
                        font: 'Roboto', 
                        fontStyle: 'normal',
                        fontSize: 10, // Giảm cỡ chữ xuống 10 một chút cho thanh lịch
                        valign: 'middle' // Căn giữa chữ theo chiều dọc
                    },
                    headStyles: {
                        fillColor: [78, 115, 223], 
                        textColor: [255, 255, 255],
                        halign: 'center' // Căn giữa các tiêu đề cột
                    },
                    // ĐÂY LÀ ĐOẠN MA THUẬT GIÚP CÁC CỘT GIÃN ĐỀU VÀ ĐẸP
                    columnStyles: {
                        0: { cellWidth: 15, halign: 'center' }, // Cột STT: Rộng 15, chữ nằm giữa
                        1: { cellWidth: 35 },                   // Cột Mã hàng: Rộng 35
                        2: { cellWidth: 'auto' },               // Cột Tên hàng: Tự động chiếm hết chỗ trống còn lại
                        3: { cellWidth: 25, halign: 'center' }, // Cột Số lượng: Rộng 25, chữ nằm giữa
                        4: { cellWidth: 35, halign: 'right' },  // Cột Giá nhập: Rộng 35, số căn lề phải
                        5: { cellWidth: 45, halign: 'right' }   // Cột Thành tiền: Rộng 45, số căn lề phải
                    }
                });

                // 8. Tải file về máy
                const dateStr = new Date().toISOString().slice(0, 10);
                doc.save(`Tong_Quan_Ton_Kho_${dateStr}.pdf`);
                setShowExportMenu(false);
            };
        } catch (error) {
            console.error("Lỗi khi tải font hoặc tạo PDF:", error);
            alert("Có lỗi xảy ra khi tạo PDF. Vui lòng kiểm tra kết nối mạng!");
        }
    };

    const topValueItems = items.slice(0, 5);
    const topQtyItems = [...items].sort((a, b) => b.soLuongTon - a.soLuongTon).slice(0, 7);

    if (loading) return <div className="loading-screen">⏳ Đang tổng hợp dữ liệu Tồn Kho...</div>;

    return (
        <div>
            {/* Thanh Tiêu đề & Nút Xuất Báo Cáo của Tab này */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: 0, color: '#4e73df', fontWeight: 'bold' }}>📊 Thống Kê Tổng Quan</h4>
                
            <div className="db-export-section" ref={exportMenuRef} style={{ position: 'relative' }}>
    <button 
        onClick={() => setShowExportMenu(!showExportMenu)}
        style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '6px', padding: '0 12px',
            fontSize: '14px', fontWeight: '500',
            height: '36px', whiteSpace: 'nowrap', 
            transition: 'all 0.3s ease', borderRadius: '6px', 
            backgroundColor: '#4e73df', color: '#fff', 
            border: 'none', cursor: 'pointer'
        }}
    >
        <FiDownload size={16} /> 
        Xuất báo cáo 
        <FiChevronDown 
            size={18} 
            style={{
                transition: 'transform 0.3s ease',
                transform: showExportMenu ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
        />
    </button>

    {/* MENU DROPDOWN - Đã gỡ bỏ các class gây xung đột và fix cứng layout */}
    <div 
        style={{
            position: 'absolute', right: 0, top: '100%', marginTop: '6px', 
            backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '6px', 
            padding: '4px', // Bo viền siêu nhỏ
            width: '130px', // FIX CỨNG CHIỀU RỘNG CHUẨN
            boxSizing: 'border-box', // Đảm bảo padding không làm phình width
            zIndex: 100,
            opacity: showExportMenu ? 1 : 0,
            visibility: showExportMenu ? 'visible' : 'hidden',
            transform: showExportMenu ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: showExportMenu ? 'auto' : 'none'
        }}
    >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button 
                onClick={handleExportExcel} 
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '8px 10px', 
                    border: 'none', background: 'transparent',
                    borderRadius: '4px', cursor: 'pointer', textAlign: 'left',
                    width: '100%', boxSizing: 'border-box',
                    transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <FiFileText color="#107c41" size={16}/>
                <span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Xuất Excel</span>
            </button>

            <button 
                onClick={handleExportPDF} 
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '8px 10px', 
                    border: 'none', background: 'transparent',
                    borderRadius: '4px', cursor: 'pointer', textAlign: 'left',
                    width: '100%', boxSizing: 'border-box',
                    transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <FiFile color="#d83b01" size={16}/>
                <span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Xuất PDF</span>
            </button>
        </div>
    </div>
</div>
            </div>

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