import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiTrash2, FiXCircle } from 'react-icons/fi';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import './TabKiemKe.css';

const TabKiemKe = () => {
    const [deadStock, setDeadStock] = useState([]);
    const [damagedStock, setDamagedStock] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCanhBaoKho();
    }, []);

    const fetchCanhBaoKho = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/kiem-ke/canh-bao');
            setDamagedStock(res.data.hangHuHong || []);
            setDeadStock(res.data.hangTonLau || []);
        } catch (error) {
            console.error("Lỗi tải báo cáo:", error);
            toast.error("Không thể tải dữ liệu cảnh báo từ máy chủ!");
        } finally {
            setIsLoading(false);
        }
    };

    // 🎯 HÀM 1: XUẤT HỦY (DUYỆT) - Chấp nhận mất hàng, trừ số lượng trên máy cho khớp thực tế
    const handleXuatHuy = async (id, maHang) => {
        if (!window.confirm(`Sếp xác nhận XUẤT HỦY món ${maHang} này? Hệ thống sẽ cập nhật tồn kho theo số báo cáo.`)) return;

        try {
            await api.put(`/kiem-ke/duyet/${id}`); // Gọi API duyệt phiếu
            toast.success("✅ Đã xuất hủy và cập nhật lại tồn kho!");
            fetchCanhBaoKho(); // Load lại dữ liệu, món này sẽ tự biến mất khỏi bảng
        } catch (error) {
            toast.error("❌ Lỗi khi xuất hủy!");
        }
    };

    // 🎯 HÀM 2: BỎ QUA (HỦY PHIẾU) - Nhân viên đếm sai, không thèm duyệt, xóa báo cáo đi
    const handleHuyBaoCao = async (id) => {
        if (!window.confirm("Báo cáo này sai? Sếp muốn XÓA BỎ báo cáo này và giữ nguyên tồn kho?")) return;

        try {
            await api.delete(`/kiem-ke/huy/${id}`); // Gọi API xóa phiếu
            toast.success("🗑️ Đã xóa báo cáo tào lao!");
            fetchCanhBaoKho(); // Load lại dữ liệu
        } catch (error) {
            toast.error("❌ Lỗi khi xóa báo cáo!");
        }
    };

    return (
        <div className="tab-kiemke-container">
            <h3 className="tab-kiemke-main-title">
                <FiAlertTriangle /> Báo Cáo Xử Lý Hàng Hóa Cấp Bách
            </h3>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Đang quét kho dữ liệu...</div>
            ) : (
                <>
                    {/* PHẦN 1: HÀNG HƯ HỎNG CHỜ XỬ LÝ */}
                    <div className="kiemke-section">
                        <h4 className="kiemke-section-title danger">1. Hàng Hư Hỏng / Lệch Số (Đang chờ Sếp chốt)</h4>
                        <table className="kiemke-alert-table table-danger">
                            <thead>
                                <tr>
                                    <th>Mã Hàng</th>
                                    <th>Tên Hàng</th>
                                    <th>Tồn Báo Cáo</th>
                                    <th>Lý Do / Ghi Chú</th>
                                    <th>Thao Tác Xử Lý</th>
                                </tr>
                            </thead>
                            <tbody>
                                {damagedStock.length > 0 ? (
                                    damagedStock.map(item => (
                                        <tr key={item.id}>
                                            <td><strong>{item.maHang}</strong></td>
                                            <td>{item.tenHang}</td>
                                            <td>
                                                <span style={{ color: 'red', fontWeight: 'bold' }}>{item.tonKho}</span>
                                            </td>
                                            <td className="text-danger-note">{item.ghiChuKiemKe}</td>
                                            <td>
                                                {/* 🎯 Nút 1: Xuất Hủy */}
                                                <button
                                                    className="btn-kiemke-action btn-huy"
                                                    onClick={() => handleXuatHuy(item.id, item.maHang)}
                                                >
                                                    <FiTrash2 /> Xuất Hủy (Chốt Lệch)
                                                </button>
                                                {/* 🎯 Nút 2: Bỏ Qua */}
                                                <button
                                                    className="btn-kiemke-action btn-tra"
                                                    onClick={() => handleHuyBaoCao(item.id)}
                                                    style={{ backgroundColor: '#64748b' }} // Đổi màu xám cho hợp lý
                                                >
                                                    <FiXCircle /> Bỏ qua (Sai)
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', color: '#10b981', padding: '20px' }}>
                                            🎉 Tuyệt vời! Hiện tại không có hàng hư hỏng nào trong kho.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PHẦN 2: HÀNG TỒN KHO LÂU NGÀY (DEAD STOCK) */}
                    <div className="kiemke-section">
                        <h4 className="kiemke-section-title warning">2. Cảnh Báo Hàng Tồn Lâu Ngày (Dead Stock)</h4>
                        <table className="kiemke-alert-table table-warning">
                            <thead>
                                <tr>
                                    <th>Mã Hàng</th>
                                    <th>Tên Hàng</th>
                                    <th>Tồn Kho</th>
                                    <th>Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deadStock.length > 0 ? (
                                    deadStock.map(item => (
                                        <tr key={item.maHang}>
                                            <td><strong>{item.maHang}</strong></td>
                                            <td>{item.tenHang}</td>
                                            <td>{item.tonKho}</td>
                                            <td className="text-warning-status">{item.trangThai}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', color: '#10b981', padding: '20px' }}>
                                            🎉 Kho đang luân chuyển rất tốt, không có hàng bị ế!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default TabKiemKe;