import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { FiBox, FiCheckCircle, FiAlertTriangle, FiClock, FiFileText, FiDollarSign } from 'react-icons/fi';
import { PieChart, Pie, Cell, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

    const PIE_COLORS = ['#1cc88a', '#f6c23e', '#e74a3b'];

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

    if (loading) return <div className="loading-screen">⏳ Đang tổng hợp dữ liệu...</div>;

    return (
        <div className="tab-inbound-container">
            {/* --- PHẦN 1: CÁC CỤC KPI (GIỮ NGUYÊN ĐẦU TRANG) --- */}
            <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card blue"><div className="stat-content"><h6>TỔNG ĐƠN NHẬP (PO)</h6><div className="stat-value">{kpi.tongDon}</div></div><div className="stat-icon-bg"><FiFileText /></div></div>
                <div className="stat-card green"><div className="stat-content"><h6>ĐƠN ĐÃ NHẬP ĐỦ</h6><div className="stat-value">{kpi.daNhapDu}</div></div><div className="stat-icon-bg"><FiCheckCircle /></div></div>
                <div className="stat-card green" style={{ borderLeftColor: '#1cc88a' }}><div className="stat-content"><h6 style={{ color: '#1cc88a' }}>TỔNG TIỀN ĐÃ NHẬP</h6><div className="stat-value">{(kpi.tongTienDaNhap).toLocaleString()} đ</div></div><div className="stat-icon-bg"><FiDollarSign /></div></div>
                <div className="stat-card orange"><div className="stat-content"><h6>ĐƠN GIAO THIẾU</h6><div className="stat-value">{kpi.giaoThieu}</div></div><div className="stat-icon-bg"><FiAlertTriangle /></div></div>
                <div className="stat-card red"><div className="stat-content"><h6>ĐƠN CHƯA NHẬP</h6><div className="stat-value">{kpi.chuaNhap}</div></div><div className="stat-icon-bg"><FiClock /></div></div>
                <div className="stat-card red" style={{ borderLeftColor: '#e74a3b' }}><div className="stat-content"><h6 style={{ color: '#e74a3b' }}>TỔNG TIỀN CHƯA NHẬP (THIẾU)</h6><div className="stat-value">{(kpi.tongTienChuaNhap).toLocaleString()} đ</div></div><div className="stat-icon-bg"><FiDollarSign /></div></div>
            </div>

            {/* --- PHẦN 2: CỤM BIỂU ĐỒ (GOM CHUNG LÊN TRÊN) --- */}
            <div className="db-main-grid" style={{ gridTemplateColumns: '1fr 2fr', marginTop: '24px' }}>
                {/* Biểu đồ tròn */}
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

                {/* Biểu đồ Cột + Đường (Đã fix đứng sát nhau) */}
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

            {/* --- PHẦN 3: CỤM BẢNG DỮ LIỆU (GOM XUỐNG DƯỚI) --- */}
            <div className="inbound-tables-section" style={{ marginTop: '24px' }}>
                {/* Bảng Giao Thiếu / Chưa Nhập */}
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

                {/* Bảng Đã Nhập Đủ */}
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