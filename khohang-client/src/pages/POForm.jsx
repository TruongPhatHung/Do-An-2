// src/pages/POForm.jsx
import React, { useState } from 'react';
import './POForm.css';

const POForm = () => {
    // 1. Dữ liệu giả định để chọn (Sau này lấy từ API)
    const mockSuppliers = [
        { id: 'NCC001', name: 'Thép Hòa Phát' },
        { id: 'NCC002', name: 'Nhựa Bình Minh' }
    ];
    const mockProducts = [
        { id: 'SP001', name: 'Thép tấm 5mm', price: 500000 },
        { id: 'SP002', name: 'Bulong M10', price: 50000 },
        { id: 'SP003', name: 'Sơn chống rỉ', price: 1200000 }
    ];

    // 2. State quản lý Header đơn hàng
    const [supplier, setSupplier] = useState('');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);

    // 3. State quản lý danh sách món hàng trong đơn (Line Items)
    const [items, setItems] = useState([
        { productId: '', quantity: 1, price: 0 }
    ]);

    // Thêm một dòng hàng mới
    const addRow = () => {
        setItems([...items, { productId: '', quantity: 1, price: 0 }]);
    };

    // Xóa một dòng hàng
    const removeRow = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    // Cập nhật giá trị khi người dùng nhập/chọn
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Tự động điền giá nếu chọn sản phẩm
        if (field === 'productId') {
            const product = mockProducts.find(p => p.id === value);
            newItems[index].price = product ? product.price : 0;
        }
        setItems(newItems);
    };

    // Tính tổng tiền đơn hàng
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const orderData = { supplier, orderDate, items, totalAmount };
        console.log("Dữ liệu đơn hàng gửi lên Server:", orderData);
        alert("Đã lưu đơn hàng (Xem log ở console)!");
    };

    return (
        <div className="po-container">
            <h2>Lên Đơn Đặt Hàng (PO)</h2>
            <form onSubmit={handleSubmit}>
                <div className="po-header">
                    <div className="input-group">
                        <label>Nhà cung cấp:</label>
                        <select value={supplier} onChange={(e) => setSupplier(e.target.value)} required>
                            <option value="">-- Chọn nhà cung cấp --</option>
                            {mockSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Ngày đặt:</label>
                        <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
                    </div>
                </div>

                <table className="po-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá (VNĐ)</th>
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
                                    >
                                        <option value="">-- Chọn hàng --</option>
                                        {mockProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </td>
                                <td>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={item.quantity} 
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                    />
                                </td>
                                <td>{item.price.toLocaleString()}</td>
                                <td>{(item.quantity * item.price).toLocaleString()}</td>
                                <td>
                                    {items.length > 1 && (
                                        <button type="button" className="btn-remove" onClick={() => removeRow(index)}>Xóa</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button type="button" className="btn-add" onClick={addRow}>+ Thêm mặt hàng</button>

                <div className="po-footer">
                    Tổng tiền thanh toán: <span style={{color: '#e74c3c'}}>{totalAmount.toLocaleString()} VNĐ</span>
                </div>

                <button type="submit" className="btn-submit">XÁC NHẬN TẠO ĐƠN HÀNG</button>
            </form>
        </div>
    );
};

export default POForm;