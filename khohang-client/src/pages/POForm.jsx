import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import './POForm.css';

const POForm = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [supplierId, setSupplierId] = useState('');
    const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0 }]);

    // Bắt dữ liệu từ Chuông thông báo
    const location = useLocation();
    const suggestedMaHang = location.state?.suggestProduct;

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await api.get('/suppliers');
                const dataSuppliers = response.data;
                setSuppliers(dataSuppliers);

                // 🎯 LOGIC TỰ ĐỘNG ĐIỀN
                if (suggestedMaHang) {
                    // Bước 1: Dò tìm Nhà cung cấp nào bán món hàng này
                    let foundSupplierId = null;
                    let foundProduct = null;

                    for (const supp of dataSuppliers) {
                        const product = supp.danhSachHangHoa?.find(p => p.maHang === suggestedMaHang);
                        if (product) {
                            foundSupplierId = supp.maNCC;
                            foundProduct = product;
                            break;
                        }
                    }

                    // Bước 2: Tự động chọn NCC và Sản phẩm nếu tìm thấy
                    if (foundSupplierId && foundProduct) {
                        setSupplierId(foundSupplierId);
                        setItems([{
                            productId: foundProduct.maHang,
                            quantity: 1, // Để mặc định là 1, nhân viên sẽ tự nhập lại số lượng thực tế cần mua
                            price: foundProduct.giaBan || 0
                        }]);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải NCC:", error);
            }
        };
        fetchSuppliers();
    }, [suggestedMaHang]);

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

        // Kiểm tra xem đã chọn mặt hàng chưa
        if (items.some(item => !item.productId)) {
            alert("⚠️ Vui lòng chọn mặt hàng trước khi lưu!");
            return;
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
            navigate('/danh-sach-po');
        } catch (error) {
            alert("❌ Lưu đơn hàng thất bại!");
        }
    };

    return (
        <div className="po-container">
            <h2 style={{ marginBottom: '20px' }}>📝 Lên Đơn Đặt Hàng (PO)</h2>

            {/* 🎯 HIỂN THỊ BANNER NHẮC NHỞ */}
            {suggestedMaHang && (
                <div style={{
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    borderLeft: '5px solid #ffc107',
                    fontWeight: '500'
                }}>
                    🔔 <strong>Gợi ý từ hệ thống:</strong> Đang lên đơn bổ sung khẩn cấp cho mặt hàng <strong>{suggestedMaHang}</strong>.
                    Hệ thống đã tự động chọn Nhà cung cấp. Vui lòng nhập số lượng cần mua!
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="po-header-section" style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Nhà cung cấp (*):</label>
                    <select value={supplierId} onChange={handleSupplierChange} required style={{ padding: '8px', borderRadius: '4px', minWidth: '250px' }}>
                        <option value="">-- Chọn nhà cung cấp --</option>
                        {suppliers.map(s => <option key={s.maNCC} value={s.maNCC}>{s.tenNCC}</option>)}
                    </select>
                </div>

                <table className="po-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng cần mua</th>
                            <th>Đơn giá gốc</th>
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
                                        disabled={!supplierId}
                                    >
                                        <option value="">-- Chọn hàng --</option>
                                        {availableProducts.map(p => <option key={p.maHang} value={p.maHang}>{p.tenHang}</option>)}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                        disabled={!item.productId}
                                        style={{ textAlign: 'center' }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                        disabled={!item.productId}
                                    />
                                </td>
                                <td style={{ fontWeight: 'bold' }}>
                                    {(item.quantity * item.price).toLocaleString()}
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => removeRow(index)}
                                        style={{ color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button type="button" className="btn-add-row" onClick={addRow} disabled={!supplierId}>
                    + Thêm dòng
                </button>

                <div className="po-summary" style={{ marginTop: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Tổng cộng: <span style={{ color: '#e74c3c' }}>{totalAmount.toLocaleString()} VNĐ</span>
                </div>

                <button
                    type="submit"
                    className="btn-submit-po"
                    disabled={!supplierId || items.some(i => !i.productId)}
                    style={{ marginTop: '20px', padding: '12px 24px', fontSize: '1.1rem' }}
                >
                    🚀 XÁC NHẬN TẠO ĐƠN HÀNG (PO)
                </button>
            </form>
        </div>
    );
};

export default POForm;