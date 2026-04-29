import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './PhieuXuatKho.css';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiAlertTriangle, FiArrowLeft, FiUser, FiTag, FiFileText } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const PhieuXuatKho = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [inventory, setInventory] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState('');
    const [selectedReqData, setSelectedReqData] = useState(null); // Lưu thông tin chi tiết của lệnh đang chọn
    const [items, setItems] = useState([]);

    const [tenNguoiNhan, setTenNguoiNhan] = useState('');
    const [mucDich, setMucDich] = useState('Xuất bán khách hàng');

    const refreshData = async () => {
        try {
            const resStock = await api.get('/products');
            setInventory(resStock.data);

            // Backend trả về list đã lọc "Đã Duyệt" & "Giao Thiếu"
            const resReq = await api.get('/yeu-cau-xuat/pending');
            setPendingRequests(resReq.data);
            return { stock: resStock.data, reqs: resReq.data };
        } catch (error) {
            console.error("Lỗi tải lại dữ liệu:", error);
            toast.error("Không thể tải dữ liệu lệnh xuất!");
        }
    };

    useEffect(() => {
        const init = async () => {
            const data = await refreshData();

            // Xử lý khi bay từ trang Giao Thiếu sang
            const maYeuCauTuDong = location.state?.maYeuCauTuDong;
            if (maYeuCauTuDong && data) {
                setTimeout(() => {
                    handleSelectRequest(maYeuCauTuDong, data.reqs, data.stock);
                }, 200);
            }
        };
        init();
    }, [location.state]);

    const handleSelectRequest = (maYeuCau, currentRequests = pendingRequests, currentInventory = inventory) => {
        setSelectedRequest(maYeuCau);
        if (!maYeuCau) {
            setItems([]);
            setTenNguoiNhan('');
            setSelectedReqData(null);
            return;
        }

        const request = currentRequests.find(req => req.maYeuCau === maYeuCau);
        if (request) {
            setSelectedReqData(request); // Lưu lại để hiển thị ghi chú
            setTenNguoiNhan(request.noiNhan || '');
            if (request.chiTiets) {
                const mappedItems = request.chiTiets.map(ct => {
                    const stockItem = currentInventory.find(inv => inv.maHang === ct.hangHoa.maHang);
                    const daXuat = ct.soLuongDaXuat || 0;
                    const canXuat = ct.soLuongYeuCau - daXuat;

                    return {
                        maHang: ct.hangHoa.maHang,
                        tenHang: ct.hangHoa.tenHang,
                        soLuongYeuCau: ct.soLuongYeuCau,
                        soLuongDaXuat: daXuat,
                        soLuongTon: stockItem ? stockItem.soLuongTon : 0,
                        soLuongThucXuat: canXuat > 0 ? canXuat : 0
                    };
                });
                setItems(mappedItems);
            }
        }
    };

    const updateQuantity = (index, value) => {
        const val = parseInt(value) || 0;
        if (val < 0) return;
        const newItems = [...items];
        newItems[index].soLuongThucXuat = val;
        setItems(newItems);
    };

    // Kiểm tra điều kiện để mở khóa nút Submit
    const isValidToSubmit = items.length > 0 && !items.some(i => {
        const conNo = i.soLuongYeuCau - i.soLuongDaXuat;
        return i.soLuongThucXuat > i.soLuongTon || i.soLuongThucXuat < 0 || i.soLuongThucXuat > conNo;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const chiTietMap = {};
        let totalExport = 0;

        items.forEach(item => {
            if (item.soLuongThucXuat > 0) {
                chiTietMap[item.maHang] = item.soLuongThucXuat;
                totalExport += item.soLuongThucXuat;
            }
        });

        if (totalExport === 0) {
            toast.warn("Bạn chưa điền số lượng thực xuất nào cả!");
            return;
        }

        const randomMaPhieu = "PX-" + Date.now().toString().slice(-6);

        const payload = {
            maPhieuXuat: randomMaPhieu,
            lyDo: `${mucDich} (Lệnh: ${selectedRequest})`,
            tenNguoiNhan: tenNguoiNhan,
            chiTietXuat: chiTietMap
        };

        try {
            await api.post('/phieu-xuat', payload);
            toast.success("✅ Xuất kho thành công! Hàng đã rời kho.");

            // Reset form
            setSelectedRequest('');
            setSelectedReqData(null);
            setItems([]);
            setTenNguoiNhan('');

            await refreshData();
        } catch (error) {
            toast.error(error.response?.data?.message || "❌ Lỗi xuất kho! Có thể do hệ thống bị gián đoạn.");
        }
    };

    return (
        <div className="xuatkho-container">
            <div className="xuatkho-header">
                <button type="button" className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-title-group">
                    <h2>📤 Tạo Phiếu Xuất Kho (Thực Thi Lệnh)</h2>
                    <p>Chọn lệnh yêu cầu <strong style={{ color: '#10b981' }}>đã được Sếp duyệt</strong> để tiến hành xuất kho</p>
                </div>
            </div>

            <div className="xuatkho-card">
                <div className="request-section">
                    <label className="section-label">📋 Chọn Lệnh Yêu Cầu Từ Quản Lý:</label>
                    <select
                        value={selectedRequest}
                        onChange={(e) => handleSelectRequest(e.target.value)}
                        className="custom-select select-request"
                    >
                        <option value="">-- Click để chọn Lệnh xuất kho --</option>
                        {pendingRequests.map(req => (
                            <option key={req.maYeuCau} value={req.maYeuCau}>
                                {req.trangThai === 'Giao Thiếu' ? '⚠️' : '🟢'} [{req.trangThai}] Lệnh: {req.maYeuCau} | Giao đến: {req.noiNhan}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedRequest ? (
                    <form onSubmit={handleSubmit} className="xuatkho-form">

                        {/* HIỂN THỊ GHI CHÚ CỦA LỆNH */}
                        {selectedReqData?.ghiChu && (
                            <div style={{ backgroundColor: '#eff6ff', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #3b82f6', color: '#1e3a8a', fontSize: '0.95rem' }}>
                                <FiFileText style={{ marginRight: '8px' }} />
                                <strong>Ghi chú lệnh: </strong> {selectedReqData.ghiChu}
                            </div>
                        )}

                        {/* KHUNG THÔNG TIN XUẤT KHO */}
                        <div className="info-export-box" style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>
                                    <FiUser style={{ marginRight: '5px' }} /> Nơi nhận / Khách hàng:
                                </label>
                                <input
                                    type="text"
                                    value={tenNguoiNhan}
                                    onChange={(e) => setTenNguoiNhan(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>
                                    <FiTag style={{ marginRight: '5px' }} /> Mục đích xuất kho:
                                </label>
                                <select
                                    value={mucDich}
                                    onChange={(e) => setMucDich(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="Xuất bán khách hàng">Xuất Bán Hàng (Tính Giá Bán)</option>
                                    <option value="Xuất nội bộ">Xuất Nội Bộ (Tính Giá Vốn)</option>
                                    <option value="Xuất trả NCC">Trả Nhà Cung Cấp (Tính Giá Vốn)</option>
                                    <option value="Xuất hủy hàng">Xuất Hủy/Hư Hỏng (Tính Giá Vốn)</option>
                                </select>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="xuatkho-modern-table">
                                <thead>
                                    <tr>
                                        <th>Mã Hàng</th>
                                        <th>Tên Hàng</th>
                                        <th className="text-center">Yêu Cầu (Đã Duyệt)</th>
                                        <th className="text-center">Đã Giao Trước Đó</th>
                                        <th className="text-center">Tồn Kho</th>
                                        <th width="20%" className="text-center">SL Nhập Lần Này</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const conNo = item.soLuongYeuCau - item.soLuongDaXuat;
                                        if (conNo <= 0) return null;

                                        return (
                                            <tr key={item.maHang} className={conNo > 0 ? 'row-pending' : ''}>
                                                <td className="fw-bold text-primary">{item.maHang}</td>
                                                <td>{item.tenHang}</td>
                                                <td className="text-center" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.soLuongYeuCau}</td>
                                                <td className="text-center text-success">{item.soLuongDaXuat}</td>
                                                <td className="text-center">{item.soLuongTon}</td>
                                                <td>
                                                    <div className="input-qty-wrapper">
                                                        <input
                                                            type="number"
                                                            value={item.soLuongThucXuat}
                                                            onChange={(e) => updateQuantity(index, e.target.value)}
                                                            className={`input-qty ${item.soLuongThucXuat > item.soLuongTon || item.soLuongThucXuat > conNo ? 'input-qty-error' : item.soLuongThucXuat > 0 && item.soLuongThucXuat < conNo ? 'input-qty-warn' : ''}`}
                                                            max={conNo}
                                                        />

                                                        {item.soLuongThucXuat > item.soLuongTon && (
                                                            <span className="error-msg" style={{ color: '#ef4444', fontSize: '13px', display: 'block', marginTop: '4px', fontWeight: '500' }}>❌ Vượt tồn kho!</span>
                                                        )}

                                                        {item.soLuongThucXuat > conNo && item.soLuongThucXuat <= item.soLuongTon && (
                                                            <span className="error-msg" style={{ color: '#ef4444', fontSize: '13px', display: 'block', marginTop: '4px', fontWeight: '500' }}>❌ Vượt SL yêu cầu!</span>
                                                        )}

                                                        {item.soLuongThucXuat > 0 && item.soLuongThucXuat < conNo && item.soLuongThucXuat <= item.soLuongTon && (
                                                            <span className="warn-msg" style={{ color: '#d97706', fontSize: '13px', display: 'block', marginTop: '4px', fontWeight: '600' }}><FiAlertTriangle /> Giao thiếu (Sẽ nợ)</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="form-actions xuatkho-footer">
                            <button type="submit" className="btn-submit-main" disabled={!isValidToSubmit}>
                                🚚 XÁC NHẬN GIAO HÀNG & TRỪ TỒN KHO
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="empty-state">
                        <img src="https://cdn-icons-png.flaticon.com/512/1157/1157056.png" alt="Empty" style={{ width: '80px', opacity: 0.5, marginBottom: '15px' }} />
                        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Vui lòng chọn một lệnh yêu cầu xuất ở trên để bắt đầu lấy hàng!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhieuXuatKho;