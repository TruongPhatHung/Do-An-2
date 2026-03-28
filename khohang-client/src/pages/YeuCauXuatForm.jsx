import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi'; // Đổi icon sang AlertTriangle
import './YeuCauXuatForm.css';

const YeuCauXuatForm = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    const [noiNhan, setNoiNhan] = useState('');
    const [ngayCanXuat, setNgayCanXuat] = useState('');
    const [ghiChu, setGhiChu] = useState('');
    const [items, setItems] = useState([{ maHang: '', soLuongYeuCau: 1, tonKho: 0 }]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
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

        if (field === 'maHang') {
            const selectedProduct = products.find(p => p.maHang === value);
            newItems[index].tonKho = selectedProduct ? selectedProduct.soLuongTon : 0;
            newItems[index].soLuongYeuCau = 1;
        }
        setItems(newItems);
    };

    const addRow = () => setItems([...items, { maHang: '', soLuongYeuCau: 1, tonKho: 0 }]);
    const removeRow = (index) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };

    // 🎯 ĐÃ SỬA: Chỉ chặn submit nếu số lượng <= 0. KHÔNG CHẶN nếu số lượng > tồn kho nữa.
    const isInvalidQuantity = items.some(item => item.soLuongYeuCau <= 0);

    // 🎯 THÊM MỚI: Biến này dùng để hiện cảnh báo màu vàng cho Sếp biết kho đang thiếu hàng
    const isWarningQuantity = items.some(item => item.soLuongYeuCau > item.tonKho);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Chỉ chặn nếu nhập số âm hoặc số 0
        if (isInvalidQuantity) {
            toast.error("Vui lòng kiểm tra lại! Số lượng yêu cầu phải lớn hơn 0.");
            return;
        }

        const nguoiTao = localStorage.getItem('username') || "ADMIN";

        const payload = {
            maYeuCau: "YCX-" + Date.now().toString().slice(-6), // Làm gọn mã YCX cho đẹp
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

            // 🎯 ĐÃ SỬA: Báo Toast khác nhau tùy việc có đặt lố hàng hay không
            if (isWarningQuantity) {
                toast.warning("Lệnh đã được phát! Lưu ý: Có mặt hàng đang vượt quá tồn kho (Sẽ giao thiếu).");
            } else {
                toast.success("✅ Đã phát lệnh xuất kho thành công!");
            }

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
                {/* PHẦN 1: THÔNG TIN LỆNH XUẤT (Giữ nguyên) */}
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
                                {items.map((item, index) => {
                                    // 🎯 ĐÃ SỬA: Đổi cảnh báo từ Lỗi (Đỏ) sang Cảnh báo (Vàng)
                                    const isShortage = item.soLuongYeuCau > item.tonKho;

                                    return (
                                        <tr key={index} className={isShortage ? 'row-warning' : ''}>
                                            <td>
                                                <select
                                                    value={item.maHang}
                                                    onChange={(e) => handleItemChange(index, 'maHang', e.target.value)}
                                                    required
                                                >
                                                    <option value="">-- Chọn mặt hàng --</option>
                                                    {products.map(p => (
                                                        // 🎯 ĐÃ SỬA: Không disable mặt hàng hết tồn kho nữa, cứ cho Sếp chọn để nợ!
                                                        <option key={p.maHang} value={p.maHang}>
                                                            {p.tenHang} {p.soLuongTon <= 0 ? '(Kho đang hết)' : ''}
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
                                                    style={isShortage ? { borderColor: '#f59e0b', outlineColor: '#f59e0b' } : {}}
                                                />
                                                {/* 🎯 ĐÃ SỬA: Chữ màu vàng báo hiệu thiếu hàng */}
                                                {isShortage && (
                                                    <div style={{ color: '#d97706', fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>
                                                        <FiAlertTriangle /> Kho không đủ (Sẽ giao thiếu)
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button type="button" className="btn-remove" onClick={() => removeRow(index)}>
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" className="btn-add-row" onClick={addRow}>
                        <FiPlus /> Thêm sản phẩm
                    </button>
                </div>

                {/* PHẦN 3: XÁC NHẬN */}
                <div className="ycx-footer">
                    {/* 🎯 ĐÃ SỬA: Bỏ isInvalidQuantity ở đây đi, nút luôn sáng nếu đã chọn mã hàng */}
                    <button type="submit" className="btn-submit-ycx" disabled={isInvalidQuantity || items[0].maHang === ''}>
                        <FiSave style={{ marginRight: '8px' }} /> PHÁT LỆNH XUẤT KHO
                    </button>
                </div>
            </form>
        </div>
    );
};

export default YeuCauXuatForm;