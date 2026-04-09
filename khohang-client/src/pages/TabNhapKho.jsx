import React, { useState, useEffect, useRef } from 'react';
import api from '../services/axiosConfig';
import { FiBox, FiCheckCircle, FiAlertTriangle, FiClock, FiFileText, FiDollarSign, FiDownload, FiChevronDown, FiFile } from 'react-icons/fi';
import { PieChart, Pie, Cell, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Import thư viện xuất file
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TabNhapKho = () => {
    const [loading, setLoading] = useState(true);

    const [kpi, setKpi] = useState({
        tongDon: 0, daNhapDu: 0, giaoThieu: 0, chuaNhap: 0,
        tongTienDaNhap: 0, tongTienChuaNhap: 0
    });

    const [receivedItems, setReceivedItems] = useState([]);
    const [missingItems, setMissingItems] = useState([]);

    const [chartDataStatus, setChartDataStatus] = useState([]);
    const [chartDataTrend, setChartDataTrend] = useState([]);

    // State quản lý menu xuất báo cáo
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef(null);

    const PIE_COLORS = ['#1cc88a', '#f6c23e', '#e74a3b'];

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

    useEffect(() => {
        const fetchInboundData = async () => {
            try {
                const res = await api.get('/orders');
                const pos = Array.isArray(res.data) ? res.data : [];

                let tempKpi = { tongDon: pos.length, daNhapDu: 0, giaoThieu: 0, chuaNhap: 0, tongTienDaNhap: 0, tongTienChuaNhap: 0 };
                let tempReceived = [];
                let tempMissing = [];
                let trendMap = {};

                pos.forEach(po => {
                    const status = po.trangThai ? po.trangThai.toLowerCase() : '';
                    const ngayDatStr = po.ngayDat ? new Date(po.ngayDat).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'Khác';

                    if (status.includes('hoàn tất') || status.includes('đã giao đủ') || status.includes('đã nhập đủ')) {
                        tempKpi.daNhapDu++;
                    } else if (status.includes('thiếu') || status.includes('một phần') || status.includes('đang giao')) {
                        tempKpi.giaoThieu++;
                    } else {
                        tempKpi.chuaNhap++;
                    }

                    if (!trendMap[ngayDatStr]) {
                        trendMap[ngayDatStr] = { ngay: ngayDatStr, slDat: 0, slNhap: 0, slThieu: 0 };
                    }

                    if (po.chiTiets && Array.isArray(po.chiTiets)) {
                        po.chiTiets.forEach(ct => {
                            const tenHang = ct.hangHoa?.tenHang || 'Sản phẩm không xác định';
                            const maHang = ct.hangHoa?.maHang || '---';
                            const slDat = ct.soLuongDat || 0;
                            const slNhap = ct.soLuongDaNhap || 0;
                            const slThieu = slDat - slNhap;
                            const ncc = po.nhaCungCap?.tenNCC || 'N/A';
                            const maPO = po.maDon || po.id || 'N/A';
                            const donGia = ct.donGia || 0;

                            tempKpi.tongTienDaNhap += (slNhap * donGia);
                            tempKpi.tongTienChuaNhap += (slThieu * donGia);

                            trendMap[ngayDatStr].slDat += slDat;
                            trendMap[ngayDatStr].slNhap += slNhap;
                            trendMap[ngayDatStr].slThieu += slThieu;

                            if (slNhap > 0) {
                                tempReceived.push({ maDon: maPO, maHang, tenHang, slDat, slNhap, ncc, tyLe: Math.round((slNhap / slDat) * 100) });
                            }
                            if (slThieu > 0) {
                                tempMissing.push({ maDon: maPO, maHang, tenHang, slNhap, slThieu, ncc, trangThai: slNhap === 0 ? 'Chưa giao' : 'Giao thiếu' });
                            }
                        });
                    }
                });

                setKpi(tempKpi);
                setReceivedItems(tempReceived);
                setMissingItems(tempMissing);
                setChartDataStatus([
                    { name: 'Đã nhập đủ', value: tempKpi.daNhapDu },
                    { name: 'Giao thiếu', value: tempKpi.giaoThieu },
                    { name: 'Chưa nhập', value: tempKpi.chuaNhap }
                ]);
                setChartDataTrend(Object.values(trendMap).slice(-7));
            } catch (error) {
                console.error("Lỗi dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInboundData();
    }, []);

    // --- HÀM XUẤT EXCEL (2 Sheets) ---
    const handleExportExcel = () => {
        if (receivedItems.length === 0 && missingItems.length === 0) return alert("Không có dữ liệu để xuất!");

        const workbook = XLSX.utils.book_new();

        // Sheet 1: Hàng đã nhập
        if (receivedItems.length > 0) {
            const receivedData = receivedItems.map((item, index) => ({
                "STT": index + 1,
                "Mã PO": item.maDon,
                "Tên Mặt Hàng": item.tenHang,
                "Nhà Cung Cấp": item.ncc,
                "Số Lượng Đặt": item.slDat,
                "Số Lượng Đã Nhập": item.slNhap,
                "Tiến Độ (%)": item.tyLe
            }));
            const wsReceived = XLSX.utils.json_to_sheet(receivedData);
            XLSX.utils.book_append_sheet(workbook, wsReceived, "Da_Nhap_Kho");
        }

        // Sheet 2: Hàng giao thiếu
        if (missingItems.length > 0) {
            const missingData = missingItems.map((item, index) => ({
                "STT": index + 1,
                "Mã PO": item.maDon,
                "Tên Mặt Hàng": item.tenHang,
                "Nhà Cung Cấp": item.ncc,
                "Số Lượng Đã Nhập": item.slNhap,
                "Số Lượng Còn Thiếu": item.slThieu,
                "Tình Trạng": item.trangThai
            }));
            const wsMissing = XLSX.utils.json_to_sheet(missingData);
            XLSX.utils.book_append_sheet(workbook, wsMissing, "Giao_Thieu_Chua_Nhap");
        }

        const dateStr = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `Bao_Cao_Nhap_Kho_${dateStr}.xlsx`);
        setShowExportMenu(false);
    };

// --- HÀM XUẤT PDF (Đã fix lỗi font Tiếng Việt) ---
  const handleExportPDF = async () => {
    if (receivedItems.length === 0 && missingItems.length === 0) return alert("Không có dữ liệu để xuất!");

    try {
      const doc = new jsPDF('landscape');
      const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf';
      const response = await fetch(fontUrl);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        doc.addFileToVFS("Roboto-Regular.ttf", base64data);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto"); 

        doc.setFontSize(16);
        doc.text("BÁO CÁO: TÌNH HÌNH NHẬP KHO", 14, 15);

        let finalY = 25;

        // --- BẢNG 1: GIAO THIẾU ---
        if (missingItems.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(231, 74, 59); // Chữ màu đỏ cho tiêu đề
          doc.text("1. Danh Sách Mặt Hàng Chưa Nhập / Giao Thiếu", 14, finalY);
          
          const missingRows = missingItems.map((item, index) => [
            index + 1, item.maDon, item.tenHang, item.ncc, item.slNhap, item.slThieu, item.trangThai
          ]);

          autoTable(doc, {
            head: [["STT", "Mã PO", "Tên Mặt Hàng", "Nhà Cung Cấp", "Đã Nhập", "Còn Thiếu", "Tình Trạng"]],
            body: missingRows,
            startY: finalY + 5,
            styles: { font: 'Roboto', fontSize: 10, valign: 'middle' },
            headStyles: { 
                            fillColor: [231, 74, 59], 
                            textColor: [255, 255, 255], 
                            halign: 'center',
                            font: 'Roboto', // Đảm bảo khai báo font cho header
                            fontStyle: 'normal' // FIX: Ép về normal để không bị lỗi chữ
                        }, 
            columnStyles: {
              0: { cellWidth: 15, halign: 'center' },
              1: { cellWidth: 35 },
              2: { cellWidth: 'auto' },
              3: { cellWidth: 50 },
              4: { cellWidth: 25, halign: 'center' },
              5: { cellWidth: 25, halign: 'center' },
              6: { cellWidth: 30, halign: 'center' }
            }
          });
          finalY = doc.lastAutoTable.finalY + 15; 
        }

        // --- BẢNG 2: ĐÃ NHẬP ĐỦ ---
        if (receivedItems.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(28, 200, 138); 
          doc.text(`${missingItems.length > 0 ? '2.' : '1.'} Danh Sách Mặt Hàng Đã Nhập Vào Kho`, 14, finalY);

          const receivedRows = receivedItems.map((item, index) => [
            index + 1, item.maDon, item.tenHang, item.ncc, item.slDat, item.slNhap, item.tyLe + "%"
          ]);

          autoTable(doc, {
            head: [["STT", "Mã PO", "Tên Mặt Hàng", "Nhà Cung Cấp", "Số Lượng Đặt", "Đã Nhập", "Tiến Độ"]],
            body: receivedRows,
            startY: finalY + 5,
            styles: { font: 'Roboto', fontSize: 10, valign: 'middle' },
            headStyles: { 
                            fillColor: [28, 200, 138], 
                            textColor: [255, 255, 255], 
                            halign: 'center',
                            font: 'Roboto', // Đảm bảo khai báo font cho header
                            fontStyle: 'normal' // FIX: Ép về normal để không bị lỗi chữ
                        }, 
            columnStyles: {
              0: { cellWidth: 15, halign: 'center' },
              1: { cellWidth: 35 },
              2: { cellWidth: 'auto' },
              3: { cellWidth: 50 },
              4: { cellWidth: 30, halign: 'center' },
              5: { cellWidth: 30, halign: 'center' },
              6: { cellWidth: 25, halign: 'center' }
            }
          });
        }

        const dateStr = new Date().toISOString().slice(0, 10);
        doc.save(`Bao_Cao_Nhap_Kho_${dateStr}.pdf`);
        setShowExportMenu(false);
      };
    } catch (error) {
      console.error("Lỗi tạo PDF:", error);
      alert("Có lỗi xảy ra khi tạo PDF. Vui lòng kiểm tra mạng!");
    }
  };

    if (loading) return <div className="loading-screen">⏳ Đang tổng hợp dữ liệu...</div>;

    return (
        <div className="tab-inbound-container">
            
            {/* --- THANH TIÊU ĐỀ VÀ NÚT XUẤT BÁO CÁO --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: 0, color: '#4e73df', fontWeight: 'bold' }}>📥 Thống Kê Tình Hình Nhập Kho</h4>
                
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

            {/* --- PHẦN 1: CÁC CỤC KPI --- */}
            <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card blue"><div className="stat-content"><h6>TỔNG ĐƠN NHẬP (PO)</h6><div className="stat-value">{kpi.tongDon}</div></div><div className="stat-icon-bg"><FiFileText /></div></div>
                <div className="stat-card green"><div className="stat-content"><h6>ĐƠN ĐÃ NHẬP ĐỦ</h6><div className="stat-value">{kpi.daNhapDu}</div></div><div className="stat-icon-bg"><FiCheckCircle /></div></div>
                <div className="stat-card green" style={{ borderLeftColor: '#1cc88a' }}><div className="stat-content"><h6 style={{ color: '#1cc88a' }}>TỔNG TIỀN ĐÃ NHẬP</h6><div className="stat-value">{(kpi.tongTienDaNhap).toLocaleString()} đ</div></div><div className="stat-icon-bg"><FiDollarSign /></div></div>
                <div className="stat-card orange"><div className="stat-content"><h6>ĐƠN GIAO THIẾU</h6><div className="stat-value">{kpi.giaoThieu}</div></div><div className="stat-icon-bg"><FiAlertTriangle /></div></div>
                <div className="stat-card red"><div className="stat-content"><h6>ĐƠN CHƯA NHẬP</h6><div className="stat-value">{kpi.chuaNhap}</div></div><div className="stat-icon-bg"><FiClock /></div></div>
                <div className="stat-card red" style={{ borderLeftColor: '#e74a3b' }}><div className="stat-content"><h6 style={{ color: '#e74a3b' }}>TỔNG TIỀN CHƯA NHẬP (THIẾU)</h6><div className="stat-value">{(kpi.tongTienChuaNhap).toLocaleString()} đ</div></div><div className="stat-icon-bg"><FiDollarSign /></div></div>
            </div>

            {/* --- PHẦN 2: CỤM BIỂU ĐỒ --- */}
            <div className="db-main-grid" style={{ gridTemplateColumns: '1fr 2fr', marginTop: '24px' }}>
                <div className="db-chart-container">
                    <h5>🍩 Tỷ Trọng Trạng Thái Đơn Nhập</h5>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie data={chartDataStatus} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                {chartDataStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} stroke="none" />)}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="db-chart-container">
                    <h5>📈 Phân Tích Xu Hướng Nhập Kho (7 Ngày Gần Nhất)</h5>
                    <ResponsiveContainer width="100%" height={320}>
                        <ComposedChart data={chartDataTrend} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="ngay" tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8f9fc' }} />
                            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '15px' }} />
                            <Bar dataKey="slDat" name="Số Lượng Đặt" fill="#4e73df" radius={[4, 4, 0, 0]} barSize={40} />
                            <Bar dataKey="slNhap" name="Thực Nhập" fill="#fd7e14" radius={[4, 4, 0, 0]} barSize={40} />
                            <Line type="linear" dataKey="slThieu" name="Còn Thiếu" stroke="#858796" strokeWidth={3} dot={{ r: 6, fill: '#858796', stroke: '#fff', strokeWidth: 2 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- PHẦN 3: CỤM BẢNG DỮ LIỆU --- */}
            <div className="inbound-tables-section" style={{ marginTop: '24px' }}>
                
                <div className="inbound-panel panel-warning" style={{ marginBottom: '24px', height: 'auto', maxHeight: '450px' }}>
                    <div className="panel-header">
                        <h5>⚠️ CHI TIẾT MẶT HÀNG CHƯA NHẬP / GIAO THIẾU</h5>
                        <span className="panel-count">{missingItems.length} mặt hàng</span>
                    </div>
                    <div className="panel-body custom-scrollbar">
                        <table className="db-modern-table custom-compact-table">
                            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                <tr><th width="15%">MÃ PO</th><th width="45%">TÊN MẶT HÀNG</th><th width="12%" className="text-center">ĐÃ NHẬP</th><th width="13%" className="text-center">THIẾU</th><th width="15%" className="text-center">TÌNH TRẠNG</th></tr>
                            </thead>
                            <tbody>
                                {missingItems.length > 0 ? missingItems.map((item, index) => (
                                    <tr key={`miss-${index}`}>
                                        <td className="font-weight-bold text-primary">{item.maDon}</td>
                                        <td><div className="item-name-compact" title={item.tenHang}>{item.tenHang}</div><div className="item-supplier">{item.ncc}</div></td>
                                        <td className="text-center">{item.slNhap}</td><td className="text-center font-weight-bold" style={{ color: '#e74a3b' }}>{item.slThieu}</td>
                                        <td className="text-center"><span className={`status-pill ${item.trangThai === 'Chưa giao' ? 'status-pending' : 'status-missing'}`}>{item.trangThai}</span></td>
                                    </tr>
                                )) : <tr><td colSpan="5" className="empty-table-msg">Không có mặt hàng nào giao thiếu.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="inbound-panel panel-success" style={{ height: 'auto', maxHeight: '500px' }}>
                    <div className="panel-header">
                        <h5>📦 DANH SÁCH MẶT HÀNG ĐÃ NHẬP VÀO KHO</h5>
                        <span className="panel-count">{receivedItems.length} mặt hàng</span>
                    </div>
                    <div className="panel-body custom-scrollbar">
                        <table className="db-modern-table custom-compact-table">
                            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                <tr><th width="15%">MÃ PO</th><th width="45%">TÊN MẶT HÀNG</th><th width="12%" className="text-center">ĐẶT</th><th width="15%" className="text-center">NHẬP</th><th width="13%" className="text-center">TIẾN ĐỘ</th></tr>
                            </thead>
                            <tbody>
                                {receivedItems.length > 0 ? receivedItems.map((item, index) => (
                                    <tr key={`rec-${index}`}>
                                        <td className="font-weight-bold text-primary">{item.maDon}</td>
                                        <td><div className="item-name-compact" title={item.tenHang}>{item.tenHang}</div><div className="item-supplier">{item.ncc}</div></td>
                                        <td className="text-center">{item.slDat}</td><td className="text-center font-weight-bold" style={{ color: '#1cc88a' }}>{item.slNhap}</td>
                                        <td className="text-center"><span className={`progress-badge ${item.tyLe === 100 ? 'full' : 'partial'}`}>{item.tyLe}%</span></td>
                                    </tr>
                                )) : <tr><td colSpan="5" className="empty-table-msg">Chưa có dữ liệu hàng đã nhập.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabNhapKho;