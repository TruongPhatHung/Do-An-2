import React, { useState } from 'react';
import './NhapKho.css';
// import api from '../services/axiosConfig'; // Tạm thời bạn có thể chưa cần dòng này nếu chưa gọi API

const NhapKho = () => {
    // Dữ liệu giả định: Danh sách đơn hàng đang ở trạng thái "Mới tạo" hoặc "Giao thiếu"
    const mockPendingPOs = [
        { 
            maDon: 'PO-2024-001', 
            nhaCungCap: 'Công ty Thép Hòa Phát',
            chiTiet: [
                { maHang: 'SP001', tenHang: 'Thép tấm 5mm', soLuongDat: 100, daNhap: 60 },
                { maHang: 'SP002', tenHang: 'Bulong M10', soLuongDat: 450, daNhap: 50 }
            ]
        },
        { 
            maDon: 'PO-2024-002', 
            nhaCungCap: 'Nhà máy Nhựa Bình Minh',
            chiTiet: [
                { maHang: 'SP003', tenHang: 'Sơn chống rỉ', soLuongDat: 20, daNhap: 0 }
            ]
        }
    ];

    const [selectedPO, setSelectedPO] = useState(null);
    const [thucNhap, setThucNhap] = useState({});

    const handleSelectPO = (e) => {
        const po = mockPendingPOs.find(p => p.maDon === e.target.value);
        setSelectedPO(po);
        setThucNhap({}); 
    };

    const handleInputChange = (maHang, value, maxAllowed) => {
        let val = parseInt(value) || 0;
        if (val > maxAllowed) val = maxAllowed; // Giới hạn không cho nhập quá
        if (val < 0) val = 0;

        setThucNhap({
            ...thucNhap,
            [maHang]: val
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Kiểm tra xem có nhập gì không
        if (Object.keys(thucNhap).length === 0 || Object.values(thucNhap).every(v => v === 0)) {
            alert("Vui lòng nhập số lượng thực nhận ít nhất 1 mặt hàng!");
            return;
        }

        console.log("Dữ liệu gửi đi:", {
            maPO: selectedPO.maDon,
            ngayNhap: new Date().toISOString(),
            items: thucNhap
        });
        alert("Xác nhận nhập kho thành công! Tồn kho đã được cập nhật.");
    };

    return (
        <div className="nhapkho-container">
            <h2>📥 Tiếp Nhận Hàng Nhập Kho</h2>
            <hr />
            
            <div className="po-selector">
                <label>📌 Chọn Đơn Đặt Hàng (PO):</label>
                <select onChange={handleSelectPO} value={selectedPO?.maDon || ''}>
                    <option value="">-- Danh sách đơn hàng chờ --</option>
                    {mockPendingPOs.map(po => (
                        <option key={po.maDon} value={po.maDon}>
                            {po.maDon} - {po.nhaCungCap}
                        </option>
                    ))}
                </select>
            </div>

            {selectedPO ? (
                <form onSubmit={handleSubmit}>
                    <div style={{marginBottom: '10px'}}>
                        <strong>Nhà cung cấp:</strong> {selectedPO.nhaCungCap}
                    </div>
                    <table className="nhapkho-table">
                        <thead>
                            <tr>
                                <th>Mã Hàng</th>
                                <th>Tên Sản Phẩm</th>
                                <th>Số Lượng Đặt</th>
                                <th>Đã Nhập</th>
                                <th>Còn Lại</th>
                                <th style={{background: '#27ae60'}}>Thực Nhận</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedPO.chiTiet.map((item) => {
                                const conLai = item.soLuongDat - item.daNhap;
                                return (
                                    <tr key={item.maHang}>
                                        <td>{item.maHang}</td>
                                        <td style={{textAlign: 'left'}}>{item.tenHang}</td>
                                        <td>{item.soLuongDat}</td>
                                        <td style={{color: 'blue'}}>{item.daNhap}</td>
                                        <td className="status-warning">{conLai}</td>
                                        <td>
                                            <input 
                                                type="number" 
                                                className="input-nhap"
                                                value={thucNhap[item.maHang] || ''}
                                                onChange={(e) => handleInputChange(item.maHang, e.target.value, conLai)}
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    <div style={{textAlign: 'right'}}>
                        <button type="submit" className="btn-confirm">
                            HOÀN TẤT NHẬP KHO
                        </button>
                    </div>
                </form>
            ) : (
                <div style={{textAlign: 'center', color: '#7f8c8d', marginTop: '50px'}}>
                    <p>Vui lòng chọn một đơn hàng để bắt đầu kiểm đếm.</p>
                </div>
            )}
        </div>
    );
};

export default NhapKho;