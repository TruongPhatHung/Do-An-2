// src/pages/POForm.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig'; // Gọi API thật
import './POForm.css';

const POForm = () => {
    // State lưu dữ liệu từ API
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    // State quản lý Form
    const [supplier, setSupplier] = useState('');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0 }]);

    // GỌI API LẤY DANH SÁCH NCC VÀ HÀNG HÓA KHI MỞ TRANG
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [nccRes, hhRes] = await Promise.all([
                    api.get('/suppliersp'),
                    api.get('/products')
                ]);
                setSuppliers(nccRes.data);
                setProducts(hhRes.data);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu nền:", error);
                alert("Không thể tải danh sách Nhà cung cấp hoặc Hàng hóa. Vui lòng kiểm tra Server!");
            }
        };
        fetchData();
    }, []);

    const addRow = () => setItems([...items, { productId: '', quantity: 1, price: 0 }]);
    const removeRow = (index) => setItems(items.filter((_, i) => i !== index));

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Tự động điền giá nhập khi chọn mã hàng
        if (field === 'productId') {
            const product = products.find(p => p.maHang === value);
            newItems[index].price = product ? product.giaNhap : 0;
        }
        setItems(newItems);
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // XỬ LÝ GỬI FORM (POST LÊN SERVER)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Kiểm tra hợp lệ cơ bản
        if (!supplier) return alert("Vui lòng chọn Nhà cung cấp!");
        if (items.some(item => !item.productId || item.quantity <= 0)) {
            return alert("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ cho tất cả các dòng!");
        }

        // Đóng gói dữ liệu theo chuẩn thường dùng
        const payload = {
            maNCC: supplier,
            ngayTao: orderDate,
            tongTien: totalAmount,
            chiTietDonHangs: items.map(item => ({
                maHang: item.productId,
                soLuong: item.quantity,
                donGia: item.price
            }))
        };

        try {
            await api.post('/don-dat-hang', payload); // API lưu Đơn hàng
            alert("Đã tạo Đơn đặt hàng thành công!");
            
            // Reset form sau khi thành công
            setSupplier('');
            setItems([{ productId: '', quantity: 1, price: 0 }]);
        } catch (error) {
            console.error("Lỗi khi tạo PO:", error);
            alert("Lưu đơn hàng thất bại. Vui lòng thử lại!");
        }
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
                            {suppliers.map(s => <option key={s.maNCC} value={s.maNCC}>{s.tenNCC}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Ngày đặt:</label>
                        <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} required />
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
                                        {products.map(p => <option key={p.maHang} value={p.maHang}>{p.tenHang}</option>)}
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
                                <td>{item.price?.toLocaleString()}</td>
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