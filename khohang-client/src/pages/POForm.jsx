import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import './POForm.css';

const POForm = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [suppliers, setSuppliers] = useState([]);
    const [approvedPRs, setApprovedPRs] = useState([]);

    const [selectedPR, setSelectedPR] = useState('');
    const [supplierId, setSupplierId] = useState('');
    // 🎯 Thêm productName vào state để lưu cứng tên SP lúc tự động điền
    const [items, setItems] = useState([{ productId: '', productName: '', quantity: 1, price: 0 }]);

    const suggestedMaHang = location.state?.suggestProduct;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Chỉ cần lấy NCC và Yêu Cầu Mua, không cần móc vào Kho Hàng Hóa nữa
                const [resSupp, resPR] = await Promise.all([
                    api.get('/suppliers'),
                    api.get('/yeu-cau-mua?trangThai=Đã Duyệt')
                ]);

                setSuppliers(resSupp.data);
                setApprovedPRs(resPR.data);

            } catch (error) {
                toast.error("Lỗi tải dữ liệu hệ thống!");
            }
        };
        fetchData();
    }, [suggestedMaHang]);

    // ==========================================================
    // 🎯 LOGIC MA THUẬT: TỰ ĐỘNG ĐIỀN FORM TỪ PHIẾU YCM
    // ==========================================================
    const handleSelectPR = (maYeuCau) => {
        setSelectedPR(maYeuCau);
        if (!maYeuCau) {
            setSupplierId('');
            setItems([{ productId: '', productName: '', quantity: 1, price: 0 }]);
            return;
        }

        // Tìm phiếu YCM tương ứng
        const pr = approvedPRs.find(req => req.maYeuCau === maYeuCau);
        if (pr) {
            // 1. Tự động set Nhà cung cấp
            setSupplierId(pr.nhaCungCap.maNCC);

            // 2. Lấy danh mục hàng hóa của CHÍNH NHÀ CUNG CẤP ĐÓ (Bảng SanPhamNCC)
            const fullSupplier = suppliers.find(s => s.maNCC === pr.nhaCungCap.maNCC);
            const productsOfSupplier = fullSupplier ? fullSupplier.danhSachHangHoa : [];

            const mappedItems = pr.chiTiets.map(ct => {
                // 🔍 Tìm mặt hàng này trong Bảng Báo Giá của NCC
                const spNcc = productsOfSupplier.find(p => p.maHang === ct.hangHoa.maHang);

                return {
                    productId: ct.hangHoa.maHang,
                    productName: spNcc ? spNcc.tenHang : ct.hangHoa.tenHang, // Lưu luôn tên hàng
                    quantity: ct.soLuongCanMua,
                    // 🎯 BỐC CHÍNH XÁC GIÁ TỪ BẢNG NHÀ CUNG CẤP (SanPhamNCC)
                    price: spNcc ? (spNcc.giaBan || 0) : 0
                };
            });
            setItems(mappedItems);
            toast.info(`Tự động điền dữ liệu và giá từ Nhà cung cấp thành công!`);
        }
    };

    // Lấy danh sách hàng hóa của NHÀ CUNG CẤP đang chọn (khi Lên đơn tự do)
    const currentSupplier = suppliers.find(s => s.maNCC === supplierId);
    const availableProducts = currentSupplier?.danhSachHangHoa || [];

    const handleSupplierChange = (e) => {
        setSupplierId(e.target.value);
        setItems([{ productId: '', productName: '', quantity: 1, price: 0 }]);
        setSelectedPR(''); // Nếu đổi tay NCC thì hủy chế độ tự động
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Nếu người dùng đổi Mặt Hàng -> Tự động điền Giá từ Báo giá NCC
        if (field === 'productId') {
            const product = availableProducts.find(p => p.maHang === value);
            newItems[index].price = product ? (product.giaBan || 0) : 0;
            newItems[index].productName = product ? product.tenHang : '';
        }
        setItems(newItems);
    };

    const addRow = () => setItems([...items, { productId: '', productName: '', quantity: 1, price: 0 }]);
    const removeRow = (index) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const maDonTuSinh = "PO-" + Date.now().toString().slice(-6);
        const noteForBackend = selectedPR ? `Lên đơn từ đề xuất: ${selectedPR}` : '';

        const payload = {
            maDon: maDonTuSinh,
            nhaCungCap: { maNCC: supplierId },
            ghiChu: noteForBackend,
            chiTiets: items.map(item => ({
                hangHoa: { maHang: item.productId },
                soLuongDat: item.quantity,
                donGia: item.price
            }))
        };

        try {
            await api.post('/orders', payload);

            if (selectedPR) {
                await api.put(`/yeu-cau-mua/${selectedPR}/hoan-thanh`);
            }

            toast.success("✅ Đã tạo Đơn đặt hàng (PO) thành công!");
            navigate('/danh-sach-po');
        } catch (error) {
            toast.error("❌ Lưu đơn hàng thất bại!");
        }
    };

    const isAutoFilled = selectedPR !== '';

    return (
        <div className="po-wrapper">
            <div className="po-header">
                <button type="button" className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <h2>📝 Lên Đơn Đặt Hàng (PO)</h2>
            </div>

            <div className="po-card" style={{ marginBottom: '20px', background: '#e0f2fe', borderColor: '#bae6fd' }}>
                <h4 className="po-section-title" style={{ color: '#0284c7', borderBottom: 'none' }}>
                    <FiShoppingCart style={{ marginRight: '8px' }} />
                    Chế độ thông minh: Lên đơn từ Yêu Cầu Đã Duyệt
                </h4>
                <select
                    className="po-input-control"
                    value={selectedPR}
                    onChange={(e) => handleSelectPR(e.target.value)}
                    style={{ maxWidth: '500px', borderColor: '#7dd3fc', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.1)' }}
                >
                    <option value="">-- Lên đơn tự do hoặc Chọn đề xuất Sếp đã duyệt --</option>
                    {approvedPRs.map(pr => (
                        <option key={pr.maYeuCau} value={pr.maYeuCau}>
                            🟢 {pr.maYeuCau} - Nhà CC: {pr.nhaCungCap?.tenNCC} (Sếp đã duyệt)
                        </option>
                    ))}
                </select>
            </div>

            <form onSubmit={handleSubmit} className="po-card">
                <div className="po-section">
                    <h4 className="po-section-title">1. Thông tin đơn hàng & Nhà cung cấp</h4>
                    <div className="po-form-grid">
                        <div className="po-form-group">
                            <label>Chọn nhà cung cấp <span className="po-required">*</span></label>
                            <select
                                style={{ maxWidth: '400px' }}
                                className="po-input-control"
                                value={supplierId}
                                onChange={handleSupplierChange}
                                required
                                disabled={isAutoFilled}
                            >
                                <option value="">-- Click để chọn nhà cung cấp --</option>
                                {suppliers.map(s => <option key={s.maNCC} value={s.maNCC}>{s.tenNCC} ({s.maNCC})</option>)}
                            </select>
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
                                    <th width="20%">Đơn giá nhập (VNĐ)</th>
                                    <th width="20%" className="text-right">Thành tiền</th>
                                    <th width="5%" className="text-center">Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                {isAutoFilled ? (
                                                    <div style={{ padding: '8px 12px', background: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#475569', fontWeight: '500' }}>
                                                        {item.productName || item.productId}
                                                    </div>
                                                ) : (
                                                    <select
                                                        className="po-input-control"
                                                        value={item.productId}
                                                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">-- Chọn hàng --</option>
                                                        {availableProducts.map(p => <option key={p.maHang} value={p.maHang}>{p.tenHang}</option>)}
                                                    </select>
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    className="po-input-control text-center"
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity === '' ? '' : item.quantity}
                                                    onChange={(e) => { const val = parseInt(e.target.value); handleItemChange(index, 'quantity', isNaN(val) ? '' : val); }}
                                                    disabled={!item.productId || isAutoFilled}
                                                    required
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    className="po-input-control"
                                                    type="number"
                                                    min="0"
                                                    value={item.price === '' ? '' : item.price}
                                                    onChange={(e) => { const val = parseFloat(e.target.value); handleItemChange(index, 'price', isNaN(val) ? '' : val); }}
                                                    disabled={!item.productId || isAutoFilled}
                                                    required
                                                />
                                            </td>
                                            <td className="po-col-subtotal text-right">{(item.quantity * item.price).toLocaleString()}</td>
                                            <td className="text-center">
                                                <button
                                                    type="button"
                                                    className="po-btn-remove"
                                                    onClick={() => removeRow(index)}
                                                    disabled={isAutoFilled}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {!isAutoFilled && (
                        <button
                            type="button"
                            className="po-btn-add-row"
                            onClick={addRow}
                            disabled={!supplierId}
                        >
                            <FiPlus /> Thêm dòng sản phẩm
                        </button>
                    )}
                </div>

                <div className="po-footer">
                    <div className="po-total">
                        <span>Tổng tiền thanh toán:</span>
                        <h3 className="po-amount">{totalAmount.toLocaleString()} đ</h3>
                    </div>
                    <button type="submit" className="po-btn-submit" disabled={!supplierId || items[0].productId === ''}>
                        <FiSave className="po-icon" /> XÁC NHẬN TẠO ĐƠN HÀNG
                    </button>
                </div>
            </form>
        </div>
    );
};

export default POForm;