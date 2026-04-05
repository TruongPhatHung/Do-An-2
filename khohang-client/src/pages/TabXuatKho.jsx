import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ComposedChart, Legend } from 'recharts';
import { FiUpload, FiBox, FiDollarSign, FiTag } from 'react-icons/fi';

const TabXuatKho = () => {
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const fetchOutboundData = async () => {
            try {
                // Gọi API lấy danh sách Phiếu Xuất
                const response = await api.get('/phieu-xuat');
                const allExports = Array.isArray(response.data) ? response.data : [];

                let tongSL = 0;
                let tongTien = 0;

                // Các object để gom nhóm dữ liệu
                const itemMap = {};
                const trendMap = {};
                const reasonMap = {};
                const detailedList = [];

                allExports.forEach(phieu => {
                    const dateStr = phieu.ngayXuat ? new Date(phieu.ngayXuat).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'N/A';
                    const lyDo = phieu.lyDoXuat || 'Khác';

                    // 1. Gom nhóm theo Lý do xuất
                    if (!reasonMap[lyDo]) reasonMap[lyDo] = 0;
                    reasonMap[lyDo] += 1;

                    let slPhieuNay = 0;

                    if (phieu.chiTiets && Array.isArray(phieu.chiTiets)) {
                        phieu.chiTiets.forEach(ct => {
                            const sl = parseInt(ct.soLuongXuat) || 0;
                            const maHang = ct.hangHoa?.maHang || 'N/A';
                            const tenHang = ct.hangHoa?.tenHang || "Chưa xác định";

                            // Tính giá trị
                            const giaChuan = ct.donGia || ct.hangHoa?.giaBan || 0;
                            const tongGiaTri = sl * giaChuan;

                            tongSL += sl;
                            tongTien += tongGiaTri;
                            slPhieuNay += sl;

                            // 2. Gom nhóm Top Sản phẩm
                            if (maHang !== 'N/A') {
                                if (!itemMap[maHang]) {
                                    itemMap[maHang] = {
                                        tenHang: tenHang.length > 15 ? tenHang.substring(0, 15) + '...' : tenHang,
                                        slXuat: 0
                                    };
                                }
                                itemMap[maHang].slXuat += sl;
                            }

                            // 3. Đẩy vào Bảng chi tiết
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

                    // 4. Gom nhóm Biến động theo ngày
                    if (!trendMap[dateStr]) trendMap[dateStr] = { ngay: dateStr, soLuong: 0 };
                    trendMap[dateStr].soLuong += slPhieuNay;
                });

                // Cập nhật state KPI
                setExportStats({
                    tongPhieuXuat: allExports.length,
                    tongSoLuongXuat: tongSL,
                    tongGiaTriXuat: tongTien,
                    soMatHangXuat: Object.keys(itemMap).length
                });

                // Cập nhật state Bảng (Sắp xếp mới nhất lên đầu)
                setExportDetails(detailedList.reverse());

                // Cập nhật state 3 Biểu đồ
                setChartTopItems(Object.values(itemMap).sort((a, b) => b.slXuat - a.slXuat).slice(0, 5));
                setChartTrendLine(Object.values(trendMap).slice(-7)); // Lấy 7 ngày gần nhất
                setChartReason(Object.keys(reasonMap).map(key => ({ name: key, count: reasonMap[key] })));

            } catch (error) {
                console.error("Lỗi lấy dữ liệu phiếu xuất:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOutboundData();
    }, []);

    if (loading) return <div className="loading-screen">⏳ Đang tổng hợp dữ liệu Xuất Kho...</div>;

    return (
        <div className="tab-outbound-container">
            {/* --- 4 CỤC KPI --- */}
            <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="stat-card purple">
                    <div className="stat-content">
                        <h6>TỔNG PHIẾU XUẤT</h6>
                        <div className="stat-value">{exportStats.tongPhieuXuat}</div>
                    </div>
                    <div className="stat-icon-bg"><FiUpload /></div>
                </div>
                <div className="stat-card red">
                    <div className="stat-content">
                        <h6>SỐ LƯỢNG HÀNG XUẤT</h6>
                        <div className="stat-value">{(exportStats.tongSoLuongXuat || 0).toLocaleString()}</div>
                    </div>
                    <div className="stat-icon-bg"><FiBox /></div>
                </div>
                <div className="stat-card green">
                    <div className="stat-content">
                        <h6>TỔNG GIÁ TRỊ XUẤT</h6>
                        <div className="stat-value">{(exportStats.tongGiaTriXuat || 0).toLocaleString()} đ</div>
                    </div>
                    <div className="stat-icon-bg"><FiDollarSign /></div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-content">
                        <h6>SỐ LOẠI MẶT HÀNG</h6>
                        <div className="stat-value">{exportStats.soMatHangXuat}</div>
                    </div>
                    <div className="stat-icon-bg"><FiTag /></div>
                </div>
            </div>

            {/* --- KHU VỰC BIỂU ĐỒ (CHIA LÀM 2 HÀNG) --- */}
            {/* Hàng 1: Line Chart và Composed Chart nằm ngang nhau */}
            <div className="db-main-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '24px' }}>

                {/* Biểu đồ 1: Biến động xuất kho (Line Chart) */}
                <div className="db-chart-container">
                    <h5>📈 Biến Động Xuất Kho (7 Ngày Qua)</h5>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartTrendLine}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="ngay" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ stroke: '#eee', strokeWidth: 2 }} />
                            <Line type="monotone" dataKey="soLuong" name="Số lượng xuất" stroke="#1cc88a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Biểu đồ 2: Phân bổ mục đích (Composed Chart: Cột + Đường) */}
                <div className="db-chart-container">
                    <h5>📊 Phân Bổ Mục Đích Xuất Kho</h5>
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={chartReason} margin={{ top: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8f9fc' }} formatter={(value, name) => [`${value} phiếu`, name === "count" ? "Số lượng phiếu" : name]} />
                            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
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

            {/* Hàng 2: Biểu đồ Top 5 trải dài full width */}
            <div className="db-main-grid" style={{ gridTemplateColumns: '1fr', marginTop: '24px' }}>
                <div className="db-chart-container span-full">
                    <h5>🚀 Top 5 Sản Phẩm Xuất Nhiều Nhất</h5>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartTopItems} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                            <XAxis type="number" axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="tenHang" width={150} tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8f9fc' }} />
                            <Bar dataKey="slXuat" name="Số lượng xuất" fill="#e74a3b" radius={[0, 4, 4, 0]} barSize={20}>
                                {chartTopItems.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- BẢNG CHI TIẾT --- */}
            <div className="db-table-wrapper" style={{ marginTop: '24px' }}>
                <h5>📤 Danh Sách Chi Tiết Xuất Kho</h5>
                <div className="custom-scrollbar" style={{ overflowX: 'auto', maxHeight: '400px' }}>
                    <table className="db-modern-table custom-compact-table">
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                            <tr>
                                <th width="12%">MÃ PHIẾU</th>
                                <th width="12%">NGÀY XUẤT</th>
                                <th width="15%">LÝ DO</th>
                                <th width="35%">TÊN MẶT HÀNG</th>
                                <th width="10%" className="text-center">SL XUẤT</th>
                                <th width="16%" className="text-right">TỔNG GIÁ TRỊ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exportDetails.length > 0 ? (
                                exportDetails.map((item, index) => (
                                    <tr key={index}>
                                        <td className="font-weight-bold text-primary">{item.maPhieu}</td>
                                        <td>{item.ngayXuat}</td>
                                        <td><span className="status-pill status-pending">{item.lyDo}</span></td>
                                        <td>
                                            <div className="item-name-compact" title={item.tenHang}>{item.tenHang}</div>
                                            <div className="item-supplier">{item.maHang}</div>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge" style={{ backgroundColor: '#f6c23e', color: '#000' }}>
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
                                    <td colSpan="6" className="empty-table-msg">Chưa có dữ liệu xuất kho.</td>
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