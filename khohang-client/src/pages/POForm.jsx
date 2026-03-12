import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './POForm.css';

const POForm = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    const [supplier, setSupplier] = useState('');
    const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0 }]);

    // 1. Lấy dữ liệu từ Database (Sửa lại endpoint cho đúng)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [nccRes, hhRes] = await Promise.all([
                    api.get('/suppliers'), // Đổi từ /suppliersp thành /suppliers cho khớp các trang trước
                    api.get('/products')
                ]);
                setSuppliers(nccRes.data);
                setProducts(hhRes.data);
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
                alert("Không thể tải danh sách NCC hoặc Hàng hóa!");
            }
        };
        fetchData();
    }, []);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === 'productId') {
            const product = products.find(p => p.maHang === value);
            newItems[index].price = product ? product.giaNhap : 0;
        }
        setItems(newItems);
    };

    const addRow = () => setItems([...items, { productId: '', quantity: 1, price: 0 }]);
    const removeRow = (index) => setItems(items.filter((_, i) => i !== index));
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // 2. XỬ LÝ GỬI FORM (Sửa payload cho khớp DTO Java)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!supplier) return alert("Vui lòng chọn Nhà cung cấp!");

        // ĐÓNG GÓI ĐÚNG CẤU TRÚC DonHangRequest TRONG JAVA
        const payload = {
            maDon: "PO-" + Date.now(), // Tự tạo mã đơn hàng dựa trên thời gian
            nhaCungCap: {
                maNCC: supplier // Chỗ này phải là Object chứa maNCC
            },
            chiTiets: items.map(item => ({
                hangHoa: {
                    maHang: item.productId // Chỗ này phải là Object chứa maHang
                },
                soLuongDat: item.quantity,
                donGia: item.price
            }))
        };

        try {
            console.log("Dữ liệu gửi đi:", payload);
            await api.post('/orders', payload); 
            alert("✅ Đã tạo Đơn đặt hàng thành công!");
            
            // Reset form
            setSupplier('');
            setItems([{ productId: '', quantity: 1, price: 0 }]);
        } catch (error) {
            console.error("Lỗi khi tạo PO:", error.response?.data || error.message);
            alert("Lưu đơn hàng thất bại: " + (error.response?.data?.message || "Lỗi hệ thống"));
        }
    };

    return (
        <div className="po-container">
            <h2>📝 Lên Đơn Đặt Hàng (PO)</h2>
            <form onSubmit={handleSubmit}>
                <div className="po-header">
                    <div className="input-group">
                        <label>Nhà cung cấp:</label>
                        <select value={supplier} onChange={(e) => setSupplier(e.target.value)} required>
                            <option value="">-- Chọn nhà cung cấp --</option>
                            {suppliers.map(s => <option key={s.maNCC} value={s.maNCC}>{s.tenNCC}</option>)}
                        </select>
                    </div>
                </div>

                <table className="po-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
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
                                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))} />
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
                    Tổng tiền: <span style={{color: '#e74c3c', fontWeight: 'bold'}}>{totalAmount.toLocaleString()} VNĐ</span>
                </div>

                <button type="submit" className="btn-submit">XÁC NHẬN TẠO ĐƠN HÀNG</button>
            </form>
        </div>
    );
};

export default POForm;