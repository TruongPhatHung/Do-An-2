import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './PhieuXuatKho.css';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const PhieuXuatKho = () => {
    const navigate = useNavigate();
    const [inventory, setInventory] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState('');
    const [items, setItems] = useState([]);
    const [lyDo, setLyDo] = useState('Xuất theo lệnh'); 

    // Tải danh sách Hàng trong kho và Danh sách Lệnh yêu cầu xuất
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Tải kho tổng để lấy số lượng tồn thực tế
                const resStock = await api.get('/products');
                setInventory(resStock.data);

                // Tải Lệnh Yêu Cầu Xuất ( Pending )
                const resReq = await api.get('/yeu-cau-xuat/pending');
                setPendingRequests(resReq.data);
            } catch (error) {
                toast.error("Lỗi tải dữ liệu. Vui lòng kiểm tra lại kết nối!");
            }
        };
        fetchData();
    }, []);

    // Khi chọn 1 Lệnh Xuất -> Tự động đổ hàng ra bảng
    const handleSelectRequest = (maYeuCau) => {
        setSelectedRequest(maYeuCau);
        if (!maYeuCau) {
            setItems([]);
            return;
        }

        const request = pendingRequests.find(req => req.maYeuCau === maYeuCau);
        if (request && request.chiTiets) {
            const mappedItems = request.chiTiets.map(ct => {
                // Đối chiếu với kho thực tế để xem còn bao nhiêu hàng
                const stockItem = inventory.find(inv => inv.maHang === ct.hangHoa.maHang);
                return {
                    maHang: ct.hangHoa.maHang,
                    tenHang: ct.hangHoa.tenHang,
                    soLuongYeuCau: ct.soLuongYeuCau,
                    soLuongDaXuat: ct.soLuongDaXuat || 0,
                    soLuongTon: stockItem ? stockItem.soLuongTon : 0,
                    // Mặc định điền sẵn số lượng cần xuất (nhưng NV có thể sửa nếu kho thiếu)
                    soLuongThucXuat: ct.soLuongYeuCau - (ct.soLuongDaXuat || 0)
                };
            });
            setItems(mappedItems);
        }
    };

    // Hàm cập nhật số lượng nhặt thực tế của Nhân viên Kho
    const updateQuantity = (index, value) => {
        const val = parseInt(value) || 0;
        if (val < 0) return;
        const newItems = [...items];
        newItems[index].soLuongThucXuat = val;
        setItems(newItems);
    };

    // Kiểm tra xem phiếu có hợp lệ không (Không được xuất lố tồn kho)
    const isValidToSubmit = items.length > 0 && !items.some(i => i.soLuongThucXuat > i.soLuongTon || i.soLuongThucXuat < 0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const chiTietMap = {};
        items.forEach(item => {
            if (item.soLuongThucXuat > 0) { 
                chiTietMap[item.maHang] = item.soLuongThucXuat;
            }
        });

        if (Object.keys(chiTietMap).length === 0) {
            toast.warn("Bạn chưa điền số lượng thực xuất nào cả!");
            return;
        }

        const randomMaPhieu = "PX-" + Date.now().toString().slice(-6);

        const payload = {
            maPhieuXuat: randomMaPhieu,
            lyDo: `Xuất cho lệnh: ${selectedRequest}`, 
            chiTietXuat: chiTietMap
        };

        try {
            await api.post('/phieu-xuat', payload);
            toast.success("✅ Xuất kho thành công! Hàng đã rời kho.");

            // Xóa form, tải lại dữ liệu
            setSelectedRequest('');
            setItems([]);

            const resStock = await api.get('/products');
            setInventory(resStock.data);

            const resReq = await api.get('/yeu-cau-xuat/pending');
            setPendingRequests(resReq.data);

        } catch (error) {
            toast.error("❌ Lỗi xuất kho! Có thể do hệ thống bị gián đoạn.");
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
                    <p>Chọn lệnh yêu cầu từ sếp để tiến hành xuất kho</p>
                </div>
            </div>

            <div className="xuatkho-card">
                {/* KẾT NỐI VỚI LỆNH XUẤT */}
                <div className="request-section">
                    <label className="section-label">📋 Chọn Lệnh Yêu Cầu Từ Quản Lý:</label>
                    <select
                        value={selectedRequest}
                        onChange={(e) => handleSelectRequest(e.target.value)}
                        className="custom-select select-request"
                    >
                        <option value="">-- Click để chọn Lệnh xuất kho đang chờ xử lý --</option>
                        {pendingRequests.map(req => (
                            <option key={req.maYeuCau} value={req.maYeuCau}>
                                Lệnh: {req.maYeuCau} | Giao đến: {req.noiNhan} | Hạn: {new Date(req.ngayCanXuat).toLocaleDateString('vi-VN')}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedRequest ? (
                    <form onSubmit={handleSubmit} className="xuatkho-form">
                        <div className="table-responsive">
                            <table className="xuatkho-modern-table">
                                <thead>
                                    <tr>
                                        <th width="15%">Mã Hàng</th>
                                        <th width="35%">Tên Hàng</th>
                                        <th style={{ textAlign: 'center' }}>SL Yêu Cầu</th>
                                        <th style={{ textAlign: 'center' }}>Tồn Kho Thực Tế</th>
                                        <th width="20%" style={{ textAlign: 'center' }}>SL Nhặt (Thực Xuất)</th>
                                        <th width="5%"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const isShortage = item.soLuongYeuCau > item.soLuongTon;
                                        const isError = item.soLuongThucXuat > item.soLuongTon;

                                        return (
                                            <tr key={item.maHang} className={`${isShortage ? 'row-warning' : ''} ${isError ? 'row-error' : ''}`}>
                                                <td className="font-mono text-primary fw-bold">{item.maHang}</td>
                                                <td><strong>{item.tenHang}</strong></td>
                                                <td style={{ textAlign: 'center', fontSize: '1.1rem' }} className="fw-bold">{item.soLuongYeuCau}</td>
                                                
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`stock-badge ${isShortage ? 'badge-danger' : 'badge-success'}`}>
                                                        {item.soLuongTon}
                                                        {isShortage && <FiAlertTriangle style={{ marginLeft: '5px' }} title="Kho thiếu hàng!" />}
                                                    </span>
                                                </td>

                                                <td style={{ textAlign: 'center' }}>
                                                    <div className="input-qty-wrapper">
                                                        <input
                                                            type="number" min="0"
                                                            value={item.soLuongThucXuat === '' ? '' : item.soLuongThucXuat}
                                                            onChange={(e) => updateQuantity(index, e.target.value)}
                                                            className={`input-qty ${isError ? 'input-qty-error' : ''}`}
                                                        />
                                                        {isError && <div className="error-msg">Lố tồn kho!</div>}
                                                        {item.soLuongThucXuat < item.soLuongYeuCau && !isError && (
                                                            <div className="warn-msg">Xuất thiếu!</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {item.soLuongThucXuat === item.soLuongYeuCau && !isError && (
                                                        <FiCheckCircle color="#2ecc71" size={22} title="Đã nhặt đủ" />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="form-actions xuatkho-footer">
                            <button type="submit" className="btn-submit-main" disabled={!isValidToSubmit}>
                                🚚 XÁC NHẬN GIAO HÀNG
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="empty-state">
                        <img src="https://cdn-icons-png.flaticon.com/512/1157/1157056.png" alt="Empty" />
                        <p>Vui lòng chọn một lệnh yêu cầu xuất ở trên để bắt đầu lấy hàng!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhieuXuatKho;