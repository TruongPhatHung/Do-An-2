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
    const [lyDo, setLyDo] = useState('Xuất theo lệnh'); // Mặc định là xuất theo lệnh của sếp

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
                    soLuongDaXuat: ct.soLuongDaXuat || 0, // Trường hợp xuất làm nhiều đợt
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
        const val = parseInt(value);
        if (isNaN(val) || val < 0) return;
        const newItems = [...items];
        newItems[index].soLuongThucXuat = val;
        setItems(newItems);
    };

    // Kiểm tra xem phiếu có hợp lệ không (Không được xuất lố tồn kho)
    const isValidToSubmit = items.length > 0 && !items.some(i => i.soLuongThucXuat > i.soLuongTon);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Chuyển mảng thành Map { "SP001": 10 } theo định dạng của Backend cũ
        // Nếu Backend cũ của bạn vẫn dùng format cũ.
        const chiTietMap = {};
        items.forEach(item => {
            if (item.soLuongThucXuat > 0) { // Chỉ xuất những mặt hàng có số lượng > 0
                chiTietMap[item.maHang] = item.soLuongThucXuat;
            }
        });

        if (Object.keys(chiTietMap).length === 0) {
            toast.warn("Bạn chưa điền số lượng thực xuất nào cả!");
            return;
        }

        const payload = {
            maPhieuXuat: "PX-" + Date.now(),
            lyDo: `Xuất cho lệnh: ${selectedRequest}`, // Ghi chú lại mã lệnh để dễ dò
            chiTietXuat: chiTietMap
            // TODO (Backend nâng cao): Bạn cần gửi thêm "maYeuCau" về Backend để nó 
            // đổi trạng thái YeuCauXuatKho thành "Hoàn Thành"
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
                <h2>📤 Tạo Phiếu Xuất Kho (Thực Thi Lệnh)</h2>
            </div>

            <div className="xuatkho-card">
                {/* 1. KẾT NỐI VỚI LỆNH XUẤT */}
                <div className="request-section">
                    <label className="section-label">📋 Chọn Lệnh Yêu Cầu Từ Quản Lý:</label>
                    <select
                        value={selectedRequest}
                        onChange={(e) => handleSelectRequest(e.target.value)}
                        className="select-request"
                    >
                        <option value="">-- Click để chọn Lệnh xuất kho đang chờ --</option>
                        {pendingRequests.map(req => (
                            <option key={req.maYeuCau} value={req.maYeuCau}>
                                {req.maYeuCau} - {req.noiNhan} (Hạn: {new Date(req.ngayCanXuat).toLocaleString()})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedRequest && (
                    <form onSubmit={handleSubmit} className="xuatkho-form">
                        <div className="table-responsive">
                            <table className="xuatkho-modern-table">
                                <thead>
                                    <tr>
                                        <th>Mã Hàng</th>
                                        <th width="35%">Tên Hàng</th>
                                        <th style={{ textAlign: 'center' }}>SL Yêu Cầu</th>
                                        <th style={{ textAlign: 'center' }}>Tồn Kho Thực Tế</th>
                                        <th width="20%">SL Nhặt (Thực Xuất)</th>
                                        <th width="5%"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        // Cảnh báo nếu sếp đòi 10 cái mà kho chỉ còn 5
                                        const isShortage = item.soLuongYeuCau > item.soLuongTon;
                                        // Cảnh báo nếu NV nhặt lố số lượng tồn kho
                                        const isError = item.soLuongThucXuat > item.soLuongTon;

                                        return (
                                            <tr key={item.maHang} className={isShortage ? 'row-warning' : ''}>
                                                <td className="font-mono">{item.maHang}</td>
                                                <td>{item.tenHang}</td>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.soLuongYeuCau}</td>

                                                {/* Tồn kho thực tế (đỏ nếu kho không đủ trả cho lệnh) */}
                                                <td style={{ textAlign: 'center' }} className={isShortage ? 'text-danger fw-bold' : 'fw-bold'}>
                                                    {item.soLuongTon}
                                                    {isShortage && <FiAlertTriangle style={{ marginLeft: '5px', color: '#ef4444' }} title="Kho thiếu hàng!" />}
                                                </td>

                                                <td>
                                                    <input
                                                        type="number" min="0"
                                                        value={item.soLuongThucXuat === '' ? '' : item.soLuongThucXuat}
                                                        onChange={(e) => updateQuantity(index, e.target.value)}
                                                        className={`input-thuc-xuat ${isError ? 'input-error' : ''}`}
                                                    />
                                                    {isError && <div className="error-text">Không đủ tồn kho!</div>}
                                                    {item.soLuongThucXuat < item.soLuongYeuCau && !isError && (
                                                        <div className="warn-text">Xuất thiếu!</div>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {item.soLuongThucXuat === item.soLuongYeuCau && !isError && (
                                                        <FiCheckCircle color="#22c55e" size={20} title="Đã nhặt đủ" />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="xuatkho-footer">
                            <button type="submit" className="btn-submit-xuatkho" disabled={!isValidToSubmit}>
                                🚚 XÁC NHẬN GIAO HÀNG
                            </button>
                        </div>
                    </form>
                )}

                {/* Giao diện trống khi chưa chọn lệnh */}
                {!selectedRequest && (
                    <div className="empty-state">
                        <img src="https://cdn-icons-png.flaticon.com/512/1157/1157056.png" alt="Empty" />
                        <p>Vui lòng chọn một lệnh xuất kho ở trên để bắt đầu soạn hàng!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhieuXuatKho;