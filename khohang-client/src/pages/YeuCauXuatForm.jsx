import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import './YeuCauXuatForm.css';

const YeuCauXuatForm = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    // State cho Thông tin chung
    const [noiNhan, setNoiNhan] = useState('');
    const [ngayCanXuat, setNgayCanXuat] = useState('');
    const [ghiChu, setGhiChu] = useState('');

    // State cho danh sách mặt hàng
    const [items, setItems] = useState([{ maHang: '', soLuongYeuCau: 1, tonKho: 0 }]);

    // Lấy danh sách hàng hóa trong kho để Quản lý chọn
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Tùy theo Controller của bạn, có thể là /products hoặc /hang-hoa
                const response = await api.get('/products');
                setProducts(response.data);
            } catch (error) {
                toast.error("Lỗi tải danh sách hàng hóa!");
            }
        };
        fetchProducts();
    }, []);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Nếu thay đổi Mặt hàng -> Tự động điền số lượng tồn kho hiện tại để đối chiếu
        if (field === 'maHang') {
            const selectedProduct = products.find(p => p.maHang === value);
            newItems[index].tonKho = selectedProduct ? selectedProduct.soLuongTon : 0;
            newItems[index].soLuongYeuCau = 1; // Reset lại số lượng
        }
        setItems(newItems);
    };

    const addRow = () => setItems([...items, { maHang: '', soLuongYeuCau: 1, tonKho: 0 }]);
    const removeRow = (index) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };

    // Kiểm tra xem có dòng nào nhập lố tồn kho không
    const isInvalidQuantity = items.some(item => item.soLuongYeuCau > item.tonKho || item.soLuongYeuCau <= 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isInvalidQuantity) {
            toast.error("Vui lòng kiểm tra lại! Số lượng yêu cầu không được vượt quá tồn kho.");
            return;
        }

        // Lấy tên người tạo từ LocalStorage (Lúc login đã lưu)
        const nguoiTao = localStorage.getItem('username') || "ADMIN";

        const payload = {
            maYeuCau: "YCX-" + Date.now(),
            noiNhan,
            ngayCanXuat,
            nguoiTao,
            ghiChu,
            chiTiets: items.map(item => ({
                maHang: item.maHang,
                soLuongYeuCau: item.soLuongYeuCau
            }))
        };

        try {
            await api.post('/yeu-cau-xuat', payload);
            toast.success("✅ Đã phát lệnh xuất kho thành công!");
            // Tạm thời quay lại trang chủ, sau này có Danh sách YCX thì chuyển hướng về đó
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || "❌ Lỗi: Không thể tạo Lệnh xuất kho!");
            console.error(error);
        }
    };

    return (
        <div className="ycx-wrapper">
            <div className="ycx-header">
                <button type="button" className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <h2>📤 Lập Lệnh Yêu Cầu Xuất Kho</h2>
            </div>

            <form onSubmit={handleSubmit} className="ycx-card">
                {/* PHẦN 1: THÔNG TIN LỆNH XUẤT */}
                <div className="ycx-section">
                    <h4 className="section-title">1. Thông tin lệnh xuất</h4>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Nơi nhận hàng (Đại lý/Xưởng) <span className="required">*</span></label>
                            <input
                                type="text" required placeholder="Nhập tên người nhận hoặc địa chỉ..."
                                value={noiNhan} onChange={e => setNoiNhan(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Hạn chót xuất kho <span className="required">*</span></label>
                            <input
                                type="datetime-local" required
                                value={ngayCanXuat} onChange={e => setNgayCanXuat(e.target.value)}
                            />
                        </div>
                        <div className="input-group full-width">
                            <label>Ghi chú lệnh xuất</label>
                            <input
                                type="text" placeholder="Giao gấp, bọc kỹ..."
                                value={ghiChu} onChange={e => setGhiChu(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* PHẦN 2: CHỌN MẶT HÀNG */}
                <div className="ycx-section">
                    <h4 className="section-title">2. Danh sách mặt hàng cần xuất</h4>
                    <div className="table-responsive">
                        <table className="ycx-modern-table">
                            <thead>
                                <tr>
                                    <th width="45%">Sản phẩm trong kho</th>
                                    <th width="20%" style={{ textAlign: 'center' }}>Tồn kho hiện tại</th>
                                    <th width="25%">SL Yêu cầu xuất</th>
                                    <th width="10%"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index} className={item.soLuongYeuCau > item.tonKho ? 'row-error' : ''}>
                                        <td>
                                            <select
                                                value={item.maHang}
                                                onChange={(e) => handleItemChange(index, 'maHang', e.target.value)}
                                                required
                                            >
                                                <option value="">-- Chọn mặt hàng --</option>
                                                {products.map(p => (
                                                    <option key={p.maHang} value={p.maHang} disabled={p.soLuongTon <= 0}>
                                                        {p.tenHang} {p.soLuongTon <= 0 ? '(Hết hàng)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {item.maHang ? item.tonKho : '-'}
                                        </td>
                                        <td>
                                            <input
                                                type="number" min="1" required
                                                value={item.soLuongYeuCau === '' ? '' : item.soLuongYeuCau}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    handleItemChange(index, 'soLuongYeuCau', isNaN(val) ? '' : val);
                                                }}
                                                disabled={!item.maHang}
                                                className={item.soLuongYeuCau > item.tonKho ? 'input-error' : ''}
                                            />
                                            {item.soLuongYeuCau > item.tonKho && (
                                                <div className="error-text"><FiAlertCircle /> Vượt quá tồn kho!</div>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button type="button" className="btn-remove" onClick={() => removeRow(index)}>
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" className="btn-add-row" onClick={addRow}>
                        <FiPlus /> Thêm sản phẩm
                    </button>
                </div>

                {/* PHẦN 3: XÁC NHẬN */}
                <div className="ycx-footer">
                    <button type="submit" className="btn-submit-ycx" disabled={isInvalidQuantity || items[0].maHang === ''}>
                        <FiSave style={{ marginRight: '8px' }} /> PHÁT LỆNH XUẤT KHO
                    </button>
                </div>
            </form>
        </div>
    );
};

export default YeuCauXuatForm;