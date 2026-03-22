import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './NhapKho.css';
import { toast } from 'react-toastify';
const NhapKho = () => {
    const [pendingPOs, setPendingPOs] = useState([]);
    const [selectedPO, setSelectedPO] = useState(null);
    const [thucNhap, setThucNhap] = useState({});

    // Lấy danh sách PO chờ nhập từ Backend
    useEffect(() => {
        const fetchPendingPOs = async () => {
            try {
                const response = await api.get('/orders/importable');
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
        setThucNhap({}); // Reset lại form nhập khi đổi đơn khác
    };

    const handleInputChange = (maHang, value, maxAllowed) => {
        let val = parseInt(value) || 0;
        // Không cho phép nhập lố số lượng cần giao
        if (val > maxAllowed) val = maxAllowed;
        if (val < 0) val = 0;
        setThucNhap({ ...thucNhap, [maHang]: val });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Kiểm tra xem user đã nhập số lượng cho món nào chưa
        const isAnyItemInputted = Object.values(thucNhap).some(val => val > 0);
        if (!isAnyItemInputted) {
            return alert("Vui lòng nhập số lượng thực nhận ít nhất 1 mặt hàng!");
        }

        const payload = {
            maDonHang: selectedPO.maDon, 
            chiTietNhap: thucNhap      
        };

        try {
            await api.post('/phieu-nhap', payload);
            toast.success("✅ Xác nhận nhập kho thành công!");
            setSelectedPO(null);
            
            // Tải lại danh sách PO (để nếu PO đó đã giao đủ thì nó sẽ biến mất khỏi danh sách)
            const response = await api.get('/orders/importable');
            setPendingPOs(response.data);
        } catch (error) {
            toast.error("❌ Lỗi khi lưu phiếu nhập: " + (error.response?.data?.message || "Lỗi hệ thống"));
        }
    };

    return (
        <div className="nhapkho-container">
            <h2>📥 Tiếp Nhận Hàng Nhập Kho</h2>
            <div className="po-selector">
                <label style={{ fontWeight: 'bold' }}>📌 Chọn Đơn Đặt Hàng:</label>
                <select onChange={handleSelectPO} value={selectedPO?.maDon || ''} className="form-control" style={{ marginLeft: '10px', padding: '8px', width: '300px' }}>
                    <option value="">-- Chọn đơn hàng đang chờ giao --</option>
                    {pendingPOs.map(po => (
                        <option key={po.maDon} value={po.maDon}>{po.maDon} - Công ty {po.nhaCungCap?.tenNCC}</option>
                    ))}
                </select>
            </div>

            {selectedPO && (
                <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '10px', padding: '10px', background: '#e3f2fd', borderRadius: '5px' }}>
                        <strong>Đơn hàng:</strong> {selectedPO.maDon} | <strong>Nhà cung cấp:</strong> {selectedPO.nhaCungCap?.tenNCC}
                    </div>

                    <table className="nhapkho-table">
                        <thead>
                            <tr>
                                <th>Mã Hàng</th>
                                <th>Tên Sản Phẩm</th>
                                <th style={{ textAlign: 'center' }}>Số Lượng Đặt</th>
                                <th style={{ textAlign: 'center' }}>Đã Nhận Trước Đó</th>
                                <th style={{ textAlign: 'center', color: '#e67e22' }}>Cần Giao Thêm</th>
                                <th style={{ background: '#27ae60', color: 'white', textAlign: 'center' }}>Thực Nhận Lần Này</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedPO.chiTiets?.map((item) => {
                                // Tính toán số lượng cần giao thêm
                                const conLai = item.soLuongDat - (item.soLuongDaNhap || 0);
                                
                                // Nếu món này đã giao đủ rồi thì ẩn đi, không cần nhập nữa
                                if (conLai <= 0) return null; 

                                return (
                                    <tr key={item.maHang}>
                                        <td style={{ fontWeight: 'bold' }}>{item.maHang}</td>
                                        <td style={{ textAlign: 'left' }}>{item.tenHang}</td>
                                        
                                        {/* SỬA LỖI Ở ĐÂY: Hiển thị đúng số lượng đã đặt (soLuongDat) */}
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.soLuongDat}</td>
                                        
                                        <td style={{ textAlign: 'center' }}>{item.soLuongDaNhap || 0}</td>
                                        
                                        <td style={{ textAlign: 'center', color: '#e67e22', fontWeight: 'bold' }}>{conLai}</td>
                                        
                                        <td style={{ textAlign: 'center' }}>
                                            <input 
                                                type="number" 
                                                className="input-nhap"
                                                value={thucNhap[item.maHang] === 0 ? '' : (thucNhap[item.maHang] || '')}
                                                onChange={(e) => handleInputChange(item.maHang, e.target.value, conLai)}
                                                placeholder={`Tối đa ${conLai}`}
                                                style={{ width: '80px', textAlign: 'center', padding: '5px' }}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <button type="submit" className="btn-confirm" style={{ padding: '10px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                            💾 HOÀN TẤT NHẬP KHO
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default NhapKho;