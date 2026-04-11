import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    FiPlus, FiTrash2, FiArrowLeft, FiAlertTriangle, 
    FiSend, FiUploadCloud, FiTruck, FiBox, FiFileText 
} from 'react-icons/fi';
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
    const isWarningQuantity = items.some(item => item.maHang && item.soLuongYeuCau > item.tonKho);

    // Tổng số lượng
    const totalQuantity = items.reduce((sum, item) => sum + (Number(item.soLuongYeuCau) || 0), 0);

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

            if (isWarningQuantity) {
                toast.warning("Đã gửi lệnh cho Sếp! Lưu ý: Kho đang thiếu hàng, lệnh có thể bị Sếp từ chối.");
            } else {
                toast.success("✅ Đã trình lệnh xuất kho. Vui lòng chờ Sếp phê duyệt!");
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
                <button type="button" className="ycx-btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="ycx-header-titles">
                    <div className="title-with-icon">
                        <div className="title-icon-box"><FiUploadCloud /></div>
                        <h2>Lập Lệnh Yêu Cầu Xuất Kho</h2>
                    </div>
                    <p className="ycx-subtitle">Đề xuất danh sách hàng hóa cần xuất để trình Giám đốc phê duyệt</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="ycx-form-container">
                {/* PHẦN 1: THÔNG TIN LỆNH XUẤT */}
                <div className="ycx-card">
                    <div className="ycx-card-header">
                        <FiTruck className="ycx-card-icon" />
                        <h4 className="ycx-card-title">Thông tin giao nhận</h4>
                    </div>
                    <div className="ycx-card-body">
                        <div className="ycx-form-grid">
                            <div className="ycx-form-group">
                                <label>Nơi nhận hàng (Đại lý/Xưởng) <span className="ycx-required">*</span></label>
                                <input
                                    type="text" 
                                    className="ycx-input-control"
                                    required 
                                    placeholder="Nhập tên người nhận hoặc địa chỉ..."
                                    value={noiNhan} 
                                    onChange={e => setNoiNhan(e.target.value)}
                                />
                            </div>
                            <div className="ycx-form-group">
                                <label>Hạn chót xuất kho <span className="ycx-required">*</span></label>
                                <input
                                    type="datetime-local" 
                                    className="ycx-input-control"
                                    required
                                    value={ngayCanXuat} 
                                    onChange={e => setNgayCanXuat(e.target.value)}
                                />
                            </div>
                            <div className="ycx-form-group full-width">
                                <label><FiFileText style={{marginRight: '5px'}}/>Ghi chú lệnh xuất (Gửi Sếp)</label>
                                <input
                                    type="text" 
                                    className="ycx-input-control"
                                    placeholder="VD: Khách Vip giao gấp, đang nợ 2 cái chờ hàng về..."
                                    value={ghiChu} 
                                    onChange={e => setGhiChu(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* PHẦN 2: CHỌN MẶT HÀNG */}
                <div className="ycx-card">
                    <div className="ycx-card-header">
                        <FiBox className="ycx-card-icon" />
                        <h4 className="ycx-card-title">Danh sách mặt hàng cần xuất</h4>
                    </div>
                    <div className="ycx-card-body">
                        <div className="ycx-table-responsive">
                            <table className="ycx-modern-table">
                                <thead>
                                    <tr>
                                        <th width="5%" className="text-center">STT</th>
                                        <th width="45%">Sản phẩm trong kho</th>
                                        <th width="15%" className="text-center">Tồn kho</th>
                                        <th width="25%" className="text-center">SL Yêu cầu xuất</th>
                                        <th width="10%" className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const isShortage = item.maHang && item.soLuongYeuCau > item.tonKho;

                                        return (
                                            <tr key={index} className={isShortage ? 'row-warning' : ''}>
                                                <td className="text-center text-muted fw-bold">{index + 1}</td>
                                                <td>
                                                    <select
                                                        className="ycx-input-control"
                                                        value={item.maHang}
                                                        onChange={(e) => handleItemChange(index, 'maHang', e.target.value)}
                                                        required
                                                    >
                                                        <option value="" disabled>-- Chọn mặt hàng --</option>
                                                        {products.map(p => (
                                                            // 🎯 ĐÃ SỬA: CHỈ HIỂN THỊ MÃ SP VÀ TÊN SP
                                                            <option key={p.maHang} value={p.maHang}>
                                                                [{p.maHang}] - {p.tenHang}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="text-center fw-bold text-primary">
                                                    {item.maHang ? item.tonKho : '-'}
                                                </td>
                                                <td>
                                                    <input
                                                        type="number" 
                                                        className={`ycx-input-control text-center fw-bold ${isShortage ? 'input-warning' : ''}`}
                                                        min="1" 
                                                        required
                                                        value={item.soLuongYeuCau === '' ? '' : item.soLuongYeuCau}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            handleItemChange(index, 'soLuongYeuCau', isNaN(val) ? '' : val);
                                                        }}
                                                        disabled={!item.maHang}
                                                        placeholder="0"
                                                    />
                                                    {isShortage && (
                                                        <div className="warning-text">
                                                            <FiAlertTriangle /> Vượt quá tồn kho
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <button 
                                                        type="button" 
                                                        className="ycx-btn-remove" 
                                                        onClick={() => removeRow(index)}
                                                        disabled={items.length === 1}
                                                        title={items.length === 1 ? "Phải có ít nhất 1 mặt hàng" : "Xóa dòng này"}
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
                        
                        <div className="ycx-table-footer">
                            <button type="button" className="ycx-btn-add-row" onClick={addRow}>
                                <FiPlus /> Thêm dòng mới
                            </button>
                            <div className="ycx-total-summary">
                                Tổng SL xuất: <span>{totalQuantity}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PHẦN 3: ACTION FOOTER */}
                <div className="ycx-action-footer">
                    <button type="submit" className="ycx-btn-submit" disabled={isInvalidQuantity || items[0].maHang === ''}>
                        <FiSend className="ycx-icon-lg" /> TRÌNH SẾP DUYỆT LỆNH
                    </button>
                </div>
            </form>
        </div>
    );
};

export default YeuCauXuatForm;