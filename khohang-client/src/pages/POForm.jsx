import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiCalendar } from 'react-icons/fi';
import './POForm.css';

const POForm = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [supplierId, setSupplierId] = useState('');
    const [ngayDuKienGiao, setNgayDuKienGiao] = useState('');
    const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0 }]);

    const location = useLocation();
    const suggestedMaHang = location.state?.suggestProduct;

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await api.get('/suppliers');
                const dataSuppliers = response.data;
                setSuppliers(dataSuppliers);

                if (suggestedMaHang) {
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
                    if (foundSupplierId && foundProduct) {
                        setSupplierId(foundSupplierId);
                        setItems([{ productId: foundProduct.maHang, quantity: 1, price: foundProduct.giaBan || 0 }]);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải nhà cung cấp:", error);
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
    const removeRow = (index) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            maDon: "PO-" + Date.now(),
            nhaCungCap: { maNCC: supplierId },
            ngayDuKienGiao: ngayDuKienGiao,
            chiTiets: items.map(item => ({
                hangHoa: { maHang: item.productId },
                soLuongDat: item.quantity,
                donGia: item.price
            }))
        };

        try {
            await api.post('/orders', payload);
            toast.success("✅ Đã tạo Đơn đặt hàng thành công!");
            navigate('/danh-sach-po');
        } catch (error) {
            toast.error("❌ Lưu đơn hàng thất bại!");
        }
    };

    return (
        <div className="po-wrapper">
            <div className="po-header">
                <button type="button" className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <h2>📝 Lên Đơn Đặt Hàng (PO)</h2>
            </div>

            <form onSubmit={handleSubmit} className="po-card">
                <div className="po-section">
                    <h4 className="po-section-title">1. Thông tin đơn hàng & Nhà cung cấp</h4>
                    <div className="po-form-grid">
                        <div className="po-form-group">
                            <label>Chọn nhà cung cấp <span className="po-required">*</span></label>
                            <select className="po-input-control" value={supplierId} onChange={handleSupplierChange} required>
                                <option value="">-- Click để chọn nhà cung cấp --</option>
                                {suppliers.map(s => <option key={s.maNCC} value={s.maNCC}>{s.tenNCC} ({s.maNCC})</option>)}
                            </select>
                            {!supplierId && <p className="po-hint-text">Vui lòng chọn NCC trước khi thêm sản phẩm</p>}
                        </div>

                        <div className="po-form-group">
                            <label><FiCalendar className="po-icon" /> Ngày dự kiến giao hàng <span className="po-required">*</span></label>
                            <input
                                type="date"
                                className="po-input-control"
                                value={ngayDuKienGiao}
                                onChange={(e) => setNgayDuKienGiao(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="po-section">
                    <h4 className="po-section-title">2. Chi tiết mặt hàng</h4>
                    <div className="po-table-responsive">
                        <table className="po-modern-table">
                            <thead>
                                <tr>
                                    <th width="40%">Sản phẩm</th>
                                    <th width="15%" className="text-center">Số lượng</th>
                                    <th width="20%">Đơn giá (VNĐ)</th>
                                    <th width="20%" className="text-right">Thành tiền</th>
                                    <th width="5%" className="text-center">Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <select className="po-input-control" value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} required disabled={!supplierId}>
                                                <option value="">-- Chọn hàng --</option>
                                                {availableProducts.map(p => <option key={p.maHang} value={p.maHang}>{p.tenHang}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <input className="po-input-control text-center" type="number" min="1" value={item.quantity === undefined || isNaN(item.quantity) ? '' : item.quantity} onChange={(e) => { const val = parseInt(e.target.value); handleItemChange(index, 'quantity', isNaN(val) ? 1 : val); }} disabled={!item.productId} required />
                                        </td>
                                        <td>
                                            <input className="po-input-control" type="number" min="0" value={item.price === undefined || isNaN(item.price) ? '' : item.price} onChange={(e) => { const val = parseFloat(e.target.value); handleItemChange(index, 'price', isNaN(val) ? 0 : val); }} disabled={!item.productId} required />
                                        </td>
                                        <td className="po-col-subtotal text-right">{(item.quantity * item.price).toLocaleString()}</td>
                                        <td className="text-center">
                                            <button type="button" className="po-btn-remove" onClick={() => removeRow(index)}><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" className="po-btn-add-row" onClick={addRow} disabled={!supplierId}>
                        <FiPlus /> Thêm dòng sản phẩm
                    </button>
                </div>

                <div className="po-footer">
                    <div className="po-total">
                        <span>Tổng tiền thanh toán:</span>
                        <h3 className="po-amount">{totalAmount.toLocaleString()} đ</h3>
                    </div>
                    <button type="submit" className="po-btn-submit" disabled={!supplierId || !ngayDuKienGiao || items[0].productId === ''}>
                        <FiSave className="po-icon" /> XÁC NHẬN TẠO ĐƠN HÀNG
                    </button>
                </div>
            </form>
        </div>
    );
};

export default POForm;