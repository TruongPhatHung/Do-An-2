import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './POForm.css';

const POForm = () => {
    // Chỉ cần 1 state lưu danh sách Nhà Cung Cấp (bên trong nó đã có sẵn mảng danhSachHangHoa)
    const [suppliers, setSuppliers] = useState([]);

    // State quản lý form
    const [supplierId, setSupplierId] = useState('');
    const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0 }]);

    // 1. Chỉ cần gọi API lấy danh sách Nhà Cung Cấp
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await api.get('/suppliers');
                setSuppliers(response.data);
            } catch (error) {
                console.error("Lỗi tải dữ liệu NCC:", error);
                alert("Không thể tải danh sách Nhà cung cấp!");
            }
        };
        fetchSuppliers();
    }, []);

    // 2. TÌM DANH SÁCH MẶT HÀNG CỦA CÔNG TY ĐANG CHỌN
    // Tìm object NCC hiện tại trong mảng suppliers
    const currentSupplier = suppliers.find(s => s.maNCC === supplierId);
    // Nếu tìm thấy thì lấy danhSachHangHoa của nó, nếu không thì trả về mảng rỗng
    const availableProducts = currentSupplier?.danhSachHangHoa || [];

    // Xử lý khi người dùng ĐỔI Nhà cung cấp
    const handleSupplierChange = (e) => {
        setSupplierId(e.target.value);
        // Reset lại giỏ hàng về 1 dòng trống
        setItems([{ productId: '', quantity: 1, price: 0 }]);
    };

    // Xử lý khi chọn mặt hàng
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Tự động điền giá nhập gốc khi chọn mã hàng
        if (field === 'productId') {
            const product = availableProducts.find(p => p.maHang === value);
            newItems[index].price = product ? product.giaBan : 0; // Lấy giaBan từ bảng san_pham_ncc
        }
        setItems(newItems);
    };

    const addRow = () => setItems([...items, { productId: '', quantity: 1, price: 0 }]);
    const removeRow = (index) => setItems(items.filter((_, i) => i !== index));
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!supplierId) return alert("Vui lòng chọn Nhà cung cấp!");
        if (items.some(item => !item.productId || item.quantity <= 0)) {
            return alert("Vui lòng chọn mặt hàng và nhập số lượng hợp lệ cho tất cả các dòng!");
        }

        const payload = {
            maDon: "PO-" + Date.now(), 
            nhaCungCap: { maNCC: supplierId },
            chiTiets: items.map(item => ({
                hangHoa: { maHang: item.productId },
                soLuongDat: item.quantity,
                donGia: item.price
            }))
        };

        try {
            await api.post('/orders', payload); 
            alert("✅ Đã tạo Đơn đặt hàng thành công!");
            
            // Reset form
            setSupplierId('');
            setItems([{ productId: '', quantity: 1, price: 0 }]);
        } catch (error) {
            console.error("Lỗi khi tạo PO:", error);
            alert("❌ Lưu đơn hàng thất bại!");
        }
    };

    return (
        <div className="po-container">
            <h2>📝 Lên Đơn Đặt Hàng (PO)</h2>
            <form onSubmit={handleSubmit}>
                <div className="po-header">
                    <div className="input-group">
                        <label>Nhà cung cấp (*):</label>
                        <select value={supplierId} onChange={handleSupplierChange} required>
                            <option value="">-- Chọn nhà cung cấp --</option>
                            {suppliers.map(s => <option key={s.maNCC} value={s.maNCC}>{s.tenNCC}</option>)}
                        </select>
                    </div>
                </div>

                {!supplierId && (
                    <div style={{color: '#e67e22', fontStyle: 'italic', marginBottom: '15px'}}>
                        Vui lòng chọn Nhà cung cấp để xem bảng báo giá mặt hàng!
                    </div>
                )}

                <table className="po-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng mua</th>
                            <th>Đơn giá gốc (VNĐ)</th>
                            <th>Thành tiền</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <select 
                                        value={item.productId} 
                                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                        required
                                        disabled={!supplierId || availableProducts.length === 0}
                                    >
                                        <option value="">-- Chọn hàng --</option>
                                        {availableProducts.map(p => (
                                            <option key={p.maHang} value={p.maHang}>
                                                {p.tenHang}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={item.quantity} 
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)} 
                                        disabled={!item.productId} // Khóa nhập số lượng nếu chưa chọn mặt hàng
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={item.price} 
                                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)} 
                                        disabled={!item.productId}
                                    />
                                </td>
                                <td style={{ fontWeight: 'bold' }}>
                                    {(item.quantity * item.price).toLocaleString()}
                                </td>
                                <td>
                                    {items.length > 1 && (
                                        <button type="button" className="btn-remove" onClick={() => removeRow(index)}>Xóa</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Cảnh báo nếu NCC không có bán mặt hàng nào */}
                {supplierId && availableProducts.length === 0 && (
                    <div style={{color: '#c0392b', margin: '10px 0', fontSize: '14px', fontStyle: 'italic'}}>
                        ⚠️ Nhà cung cấp này hiện chưa có danh mục mặt hàng nào trong hệ thống!
                    </div>
                )}

                <button 
                    type="button" 
                    className="btn-add" 
                    onClick={addRow}
                    disabled={!supplierId || availableProducts.length === 0} 
                    style={{ opacity: (!supplierId || availableProducts.length === 0) ? 0.5 : 1, cursor: (!supplierId || availableProducts.length === 0) ? 'not-allowed' : 'pointer' }}
                >
                    + Thêm dòng
                </button>

                <div className="po-footer">
                    Tổng thanh toán: <span style={{color: '#e74c3c', fontSize: '20px', fontWeight: 'bold'}}>
                        {totalAmount.toLocaleString()} VNĐ
                    </span>
                </div>

                <button type="submit" className="btn-submit" disabled={!supplierId || items.length === 0 || availableProducts.length === 0}>
                    XÁC NHẬN TẠO ĐƠN HÀNG (PO)
                </button>
            </form>
        </div>
    );
};

export default POForm;