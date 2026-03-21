import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi'; // Cài react-icons
import './POForm.css';

const POForm = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [supplierId, setSupplierId] = useState('');
    const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0 }]);
    const location = useLocation();
    const suggestedMaHang = location.state?.suggestProduct;

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await api.get('/suppliers');
                const dataSuppliers = response.data;
                setSuppliers(dataSuppliers);

                // 🎯 ĐÂY LÀ ĐOẠN CODE "GÁN DÔ THẰNG LÊN ĐƠN"
                if (suggestedMaHang) {
                    let foundSupplierId = null;
                    let foundProduct = null;

                    // Chạy vòng lặp tìm xem ông Nhà cung cấp nào bán món này
                    for (const supp of dataSuppliers) {
                        const product = supp.danhSachHangHoa?.find(p => p.maHang === suggestedMaHang);
                        if (product) {
                            foundSupplierId = supp.maNCC;
                            foundProduct = product;
                            break;
                        }
                    }

                    // Nếu tìm thấy -> Tự động điền ID Nhà cung cấp và ID Mặt hàng vào State của Form
                    if (foundSupplierId && foundProduct) {
                        setSupplierId(foundSupplierId); // Tự động chọn NCC
                        setItems([{
                            productId: foundProduct.maHang, // Tự động chọn Mã Hàng
                            quantity: 1,
                            price: foundProduct.giaBan || 0
                        }]);
                    }
                }
            } catch (error) {
                console.error("Lỗi:", error);
            }
        };
        fetchSuppliers();
    }, [suggestedMaHang]); // Chú ý mảng dependency có chứa suggestedMaHang
    

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
    const removeRow = (index) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };
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
            navigate('/danh-sach-po');
        } catch (error) {
            alert("❌ Lưu đơn hàng thất bại!");
        }
    };

    return (
        <div className="po-wrapper">
            <div className="po-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <h2>📝 Lên Đơn Đặt Hàng (PO)</h2>
            </div>

            <form onSubmit={handleSubmit} className="po-card">
                {/* Section 1: Thông tin NCC */}
                <div className="po-section">
                    <h4 className="section-title">1. Thông tin nhà cung cấp</h4>
                    <div className="supplier-select-box">
                        <label>Chọn nhà cung cấp <span className="required">*</span></label>
                        <select value={supplierId} onChange={handleSupplierChange} required>
                            <option value="">-- Click để chọn nhà cung cấp --</option>
                            {suppliers.map(s => <option key={s.maNCC} value={s.maNCC}>{s.tenNCC} ({s.maNCC})</option>)}
                        </select>
                        {!supplierId && <p className="hint-text">Vui lòng chọn NCC trước khi thêm sản phẩm</p>}
                    </div>
                </div>

                {/* Section 2: Danh sách hàng hóa */}
                <div className="po-section">
                    <h4 className="section-title">2. Chi tiết mặt hàng</h4>
                    <div className="table-responsive">
                        <table className="po-modern-table">
                            <thead>
                                <tr>
                                    <th width="40%">Sản phẩm</th>
                                    <th width="15%">Số lượng</th>
                                    <th width="20%">Đơn giá (VNĐ)</th>
                                    <th width="20%">Thành tiền</th>
                                    <th width="5%"></th>
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
                                            <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))} disabled={!item.productId} />
                                        </td>
                                        <td>
                                            <input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))} disabled={!item.productId} />
                                        </td>
                                        <td className="col-subtotal">
                                            {(item.quantity * item.price).toLocaleString()}
                                        </td>
                                        <td>
                                            <button type="button" className="btn-remove" onClick={() => removeRow(index)} title="Xóa dòng">
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" className="btn-add-row" onClick={addRow} disabled={!supplierId}>
                        <FiPlus /> Thêm dòng sản phẩm
                    </button>
                </div>

                {/* Section 3: Tổng kết & Xác nhận */}
                <div className="po-footer">
                    <div className="po-total">
                        <span>Tổng tiền thanh toán:</span>
                        <h3 className="amount">{totalAmount.toLocaleString()} đ</h3>
                    </div>
                    <button type="submit" className="btn-submit-po" disabled={!supplierId || items[0].productId === ''}>
                        <FiSave style={{marginRight: '8px'}} /> XÁC NHẬN TẠO ĐƠN HÀNG
                    </button>
                </div>
            </form>
        </div>
    );
};

export default POForm;