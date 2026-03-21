import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import './POForm.css'; // Import CSS đã tách

const POForm = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [supplierId, setSupplierId] = useState('');
    const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0 }]);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await api.get('/suppliers');
                setSuppliers(response.data);
            } catch (error) {
                console.error("Lỗi tải NCC:", error);
            }
        };
        fetchSuppliers();
    }, []);

    const currentSupplier = suppliers.find(s => s.maNCC === supplierId);
    const availableProducts = currentSupplier?.danhSachHangHoa || [];

    const handleSupplierChange = (e) => {
        setSupplierId(e.target.value);
        setItems([{ productId: '', quantity: 1, price: 0 }]);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        if (field === 'productId') {
            const product = availableProducts.find(p => p.maHang === value);
            newItems[index].price = product ? product.giaBan : 0;
        }
        setItems(newItems);
    };

    const addRow = () => setItems([...items, { productId: '', quantity: 1, price: 0 }]);
    const removeRow = (index) => setItems(items.filter((_, i) => i !== index));
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            // SỬA LẠI ĐƯỜNG DẪN /danh-sach-po ĐỂ QUAY VỀ ĐÚNG TRANG
            navigate('/danh-sach-po');
        } catch (error) {
            alert("❌ Lưu đơn hàng thất bại!");
        }
    };

    return (
        <div className="po-container">
            <h2 style={{ marginBottom: '20px' }}>📝 Lên Đơn Đặt Hàng (PO)</h2>
            <form onSubmit={handleSubmit}>
                <div className="po-header-section">
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Nhà cung cấp (*):</label>
                    <select value={supplierId} onChange={handleSupplierChange} required style={{ padding: '8px', borderRadius: '4px' }}>
                        <option value="">-- Chọn nhà cung cấp --</option>
                        {suppliers.map(s => <option key={s.maNCC} value={s.maNCC}>{s.tenNCC}</option>)}
                    </select>
                </div>

                <table className="po-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá gốc</th>
                            <th>Thành tiền</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <select value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} required disabled={!supplierId}>
                                        <option value="">-- Chọn hàng --</option>
                                        {availableProducts.map(p => <option key={p.maHang} value={p.maHang}>{p.tenHang}</option>)}
                                    </select>
                                </td>
                                <td><input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))} disabled={!item.productId} /></td>
                                <td><input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))} disabled={!item.productId} /></td>
                                <td style={{ fontWeight: 'bold' }}>{(item.quantity * item.price).toLocaleString()}</td>
                                <td><button type="button" onClick={() => removeRow(index)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Xóa</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button type="button" className="btn-add-row" onClick={addRow} disabled={!supplierId}>+ Thêm dòng</button>

                <div className="po-summary">
                    Tổng cộng: <span style={{ color: '#e74c3c' }}>{totalAmount.toLocaleString()} VNĐ</span>
                </div>

                <button type="submit" className="btn-submit-po" disabled={!supplierId || availableProducts.length === 0}>
                    XÁC NHẬN TẠO ĐƠN HÀNG (PO)
                </button>
            </form>
        </div>
    );
};

export default POForm;