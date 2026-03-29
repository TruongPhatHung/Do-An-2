import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiArrowLeft, FiEdit3 } from 'react-icons/fi';
import './LapYeuCauMuaForm.css'; // 🎯 Đã đổi sang file CSS riêng

const LapYeuCauMuaForm = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [supplierId, setSupplierId] = useState('');
    const [ghiChu, setGhiChu] = useState('');
    const [items, setItems] = useState([{ maHang: '', soLuongCanMua: 1 }]);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await api.get('/suppliers');
                setSuppliers(response.data);
            } catch (error) {
                toast.error("Lỗi tải danh sách nhà cung cấp!");
            }
        };
        fetchSuppliers();
    }, []);

    const currentSupplier = suppliers.find(s => s.maNCC === supplierId);
    const availableProducts = currentSupplier?.danhSachHangHoa || [];

    const handleSupplierChange = (e) => {
        setSupplierId(e.target.value);
        setItems([{ maHang: '', soLuongCanMua: 1 }]);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addRow = () => setItems([...items, { maHang: '', soLuongCanMua: 1 }]);
    const removeRow = (index) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nguoiTao = localStorage.getItem('username') || "Quản lý Kho";

        const payload = {
            maYeuCau: "YCM-" + Date.now().toString().slice(-6),
            maNhaCungCap: supplierId,
            nguoiYeuCau: nguoiTao,
            ghiChu: ghiChu,
            chiTiets: items.map(item => ({
                maHang: item.maHang,
                soLuongCanMua: item.soLuongCanMua
            }))
        };

        try {
            await api.post('/yeu-cau-mua', payload);
            toast.success("✅ Đã gửi Yêu Cầu Mua Hàng lên cho Sếp duyệt!");
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || "❌ Lỗi: Không thể tạo Yêu cầu!");
            console.error(error);
        }
    };

    return (
        <div className="ycm-wrapper">
            <div className="ycm-header">
                <button type="button" className="ycm-btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="ycm-header-titles">
                    <h2>📝 Lập Yêu Cầu Mua Hàng (Gửi Giám Đốc)</h2>
                    <p className="ycm-subtitle">Đề xuất danh sách hàng hóa sắp hết để phòng Mua hàng tiến hành nhập kho</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="ycm-card">
                {/* PHẦN 1: THÔNG TIN CHUNG */}
                <div className="ycm-section">
                    <h4 className="ycm-section-title">1. Thông tin Yêu cầu & Nhà cung cấp</h4>
                    <div className="ycm-form-grid">
                        <div className="ycm-form-group">
                            <label>Chọn Nhà Cung Cấp đề xuất <span className="ycm-required">*</span></label>
                            <select className="ycm-input-control" value={supplierId} onChange={handleSupplierChange} required>
                                <option value="">-- Click để chọn nhà cung cấp --</option>
                                {suppliers.map(s => (
                                    <option key={s.maNCC} value={s.maNCC}>{s.tenNCC}</option>
                                ))}
                            </select>
                            {!supplierId && <p className="ycm-hint-text">Chọn NCC để xem danh sách mặt hàng</p>}
                        </div>

                        <div className="ycm-form-group">
                            <label>Lý do / Ghi chú cho Sếp <span className="ycm-required">*</span></label>
                            <input
                                type="text"
                                className="ycm-input-control"
                                placeholder="VD: Hàng bán chạy cần nhập gấp dịp lễ..."
                                value={ghiChu}
                                onChange={(e) => setGhiChu(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* PHẦN 2: CHI TIẾT SẢN PHẨM */}
                <div className="ycm-section">
                    <h4 className="ycm-section-title">2. Danh sách mặt hàng cần bổ sung</h4>
                    <div className="ycm-table-responsive">
                        <table className="ycm-modern-table">
                            <thead>
                                <tr>
                                    <th width="60%">Sản phẩm cần mua</th>
                                    <th width="25%" className="text-center">Số lượng đề xuất</th>
                                    <th width="15%" className="text-center">Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <select
                                                className="ycm-input-control"
                                                value={item.maHang}
                                                onChange={(e) => handleItemChange(index, 'maHang', e.target.value)}
                                                required
                                                disabled={!supplierId}
                                            >
                                                <option value="">-- Chọn mặt hàng --</option>
                                                {availableProducts.map(p => (
                                                    <option key={p.maHang} value={p.maHang}>
                                                        {p.tenHang} (Tồn: {p.soLuongTon || 0})
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                className="ycm-input-control text-center"
                                                type="number"
                                                min="1"
                                                value={item.soLuongCanMua === '' ? '' : item.soLuongCanMua}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    handleItemChange(index, 'soLuongCanMua', isNaN(val) ? '' : val);
                                                }}
                                                disabled={!item.maHang}
                                                required
                                            />
                                        </td>
                                        <td className="text-center">
                                            <button type="button" className="ycm-btn-remove" onClick={() => removeRow(index)}>
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" className="ycm-btn-add-row" onClick={addRow} disabled={!supplierId}>
                        <FiPlus /> Thêm sản phẩm
                    </button>
                </div>

                {/* PHẦN 3: FOOTER */}
                <div className="ycm-footer">
                    <button type="submit" className="ycm-btn-submit" disabled={!supplierId || items[0].maHang === ''}>
                        <FiEdit3 className="ycm-icon" /> TRÌNH SẾP DUYỆT
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LapYeuCauMuaForm;