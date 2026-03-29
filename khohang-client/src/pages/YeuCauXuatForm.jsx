import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiArrowLeft, FiAlertTriangle, FiSend } from 'react-icons/fi';
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

    // Chặn submit nếu số lượng <= 0
    const isInvalidQuantity = items.some(item => item.soLuongYeuCau <= 0);

    // Cảnh báo màu vàng cho Kinh doanh biết kho đang thiếu hàng, Sếp sẽ thấy
    const isWarningQuantity = items.some(item => item.soLuongYeuCau > item.tonKho);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isInvalidQuantity) {
            toast.error("Vui lòng kiểm tra lại! Số lượng yêu cầu phải lớn hơn 0.");
            return;
        }

        const nguoiTao = localStorage.getItem('username') || "Kinh Doanh";

        const payload = {
            maYeuCau: "YCX-" + Date.now().toString().slice(-6),
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

            // 🎯 ĐÃ SỬA: Thông báo rõ ràng là đang chờ duyệt
            if (isWarningQuantity) {
                toast.warning("Đã gửi lệnh cho Sếp! Lưu ý: Kho đang thiếu hàng, lệnh có thể bị Sếp từ chối.");
            } else {
                toast.success("✅ Đã trình lệnh xuất kho. Vui lòng chờ Sếp phê duyệt!");
            }

            navigate('/dashboard'); // Hoặc điều hướng về trang Lịch sử của họ
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
                <div style={{ marginLeft: '15px' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>📤 Lập Lệnh Yêu Cầu Xuất Kho</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Lập danh sách hàng hóa cần xuất để trình Giám đốc phê duyệt</p>
                </div>
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
                            <label>Ghi chú lệnh xuất (Gửi Sếp)</label>
                            <input
                                type="text" placeholder="VD: Khách Vip giao gấp, đang nợ 2 cái chờ hàng về..."
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
                                                {isShortage && (
                                                    <div style={{ color: '#d97706', fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>
                                                        <FiAlertTriangle /> Kho không đủ (Sẽ nợ / Sếp có thể từ chối)
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
                <div className="ycx-footer" style={{ justifyContent: 'flex-end', display: 'flex', marginTop: '20px' }}>
                    {/* 🎯 ĐÃ SỬA: Tên nút rõ ràng mục đích */}
                    <button type="submit" className="btn-submit-ycx" disabled={isInvalidQuantity || items[0].maHang === ''} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                        <FiSend /> TRÌNH SẾP DUYỆT LỆNH
                    </button>
                </div>
            </form>
        </div>
    );
};

export default YeuCauXuatForm;