// src/pages/NhapKho.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './NhapKho.css';

const NhapKho = () => {
    const [pendingPOs, setPendingPOs] = useState([]);
    const [selectedPO, setSelectedPO] = useState(null);
    const [thucNhap, setThucNhap] = useState({});

    // Lấy danh sách PO chờ nhập từ Backend
    useEffect(() => {
        const fetchPendingPOs = async () => {
            try {
                // Endpoint lấy các đơn hàng chưa hoàn tất
                const response = await api.get('/don-dat-hang/pending'); 
                setPendingPOs(response.data);
            } catch (error) {
                console.error("Lỗi tải PO chờ nhập:", error);
            }
        };
        fetchPendingPOs();
    }, []);

    const handleSelectPO = (e) => {
        const po = pendingPOs.find(p => p.maDon === e.target.value);
        setSelectedPO(po);
        setThucNhap({}); 
    };

    const handleInputChange = (maHang, value, maxAllowed) => {
        let val = parseInt(value) || 0;
        if (val > maxAllowed) val = maxAllowed;
        setThucNhap({ ...thucNhap, [maHang]: val });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            maPO: selectedPO.maDon,
            ngayNhap: new Date().toISOString(),
            chiTietNhap: Object.keys(thucNhap).map(maHang => ({
                maHang: maHang,
                soLuongThucNhap: thucNhap[maHang]
            }))
        };

        try {
            await api.post('/phieu-nhap', payload); // API xử lý phiếu nhập
            alert("Xác nhận nhập kho thành công! Tồn kho đã tự động tăng.");
            setSelectedPO(null);
            // Refresh lại danh sách PO
            const res = await api.get('/don-dat-hang/pending');
            setPendingPOs(res.data);
        } catch (error) {
            alert("Lỗi khi lưu phiếu nhập!");
        }
    };

    return (
        <div className="nhapkho-container">
            <h2>📥 Tiếp Nhận Hàng Nhập Kho (Real-time)</h2>
            <div className="po-selector">
                <label>📌 Chọn Đơn Đặt Hàng:</label>
                <select onChange={handleSelectPO} value={selectedPO?.maDon || ''}>
                    <option value="">-- Danh sách PO chưa giao đủ --</option>
                    {pendingPOs.map(po => (
                        <option key={po.maDon} value={po.maDon}>{po.maDon} - {po.nhaCungCap?.tenNCC}</option>
                    ))}
                </select>
            </div>

            {selectedPO && (
                <form onSubmit={handleSubmit}>
                    <table className="nhapkho-table">
                        <thead>
                            <tr>
                                <th>Mã Hàng</th>
                                <th>Tên Sản Phẩm</th>
                                <th>Đặt</th>
                                <th>Đã Nhập</th>
                                <th>Còn Lại</th>
                                <th style={{background: '#27ae60'}}>Thực Nhận Lần Này</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedPO.chiTietDonHangs.map((item) => {
                                const conLai = item.soLuong - (item.soLuongDaNhap || 0);
                                if (conLai <= 0) return null;
                                return (
                                    <tr key={item.maHang}>
                                        <td>{item.maHang}</td>
                                        <td style={{textAlign: 'left'}}>{item.tenHang}</td>
                                        <td>{item.soLuong}</td>
                                        <td>{item.soLuongDaNhap || 0}</td>
                                        <td className="status-warning">{conLai}</td>
                                        <td>
                                            <input 
                                                type="number" className="input-nhap"
                                                onChange={(e) => handleInputChange(item.maHang, e.target.value, conLai)}
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <button type="submit" className="btn-confirm">HOÀN TẤT NHẬP KHO</button>
                </form>
            )}
        </div>
    );
};

export default NhapKho;