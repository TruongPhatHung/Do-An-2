import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/axiosConfig';
import './NhaCungCapForm.css';

const NhaCungCapForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isEditMode = !!location.state?.editData;

    const [categories, setCategories] = useState([]);
    const initialData = location.state?.editData;
    const [formData, setFormData] = useState(
        initialData ? {
            ...initialData,
            // 🎯 FIX LỖI: Dò tìm ID loại hàng từ dữ liệu cũ của Backend để hiển thị lên Dropdown
            loaiHangId: initialData.loaiHang?.id || initialData.loaiHangId || ''
        } : {
            maNCC: '',
            tenNCC: '',
            diaChi: '',
            email: '',
            loaiHangId: '',
            danhSachHangHoa: [{ maHang: '', tenHang: '', giaBan: '' }]
        }
    );
    
  

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // --- STATE CHO TÍNH NĂNG "THÊM NHANH LOẠI HÀNG" ---
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [newCategory, setNewCategory] = useState({ maLoai: '', tenLoai: '', moTa: 'Thêm nhanh từ form' });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                setCategories(res.data);
            } catch (err) {
                console.error("Lỗi lấy danh mục:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleChangeNCC = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleHangHoaChange = (index, field, value) => {
        const updatedHangHoas = [...formData.danhSachHangHoa];
        updatedHangHoas[index][field] = value;
        setFormData({ ...formData, danhSachHangHoa: updatedHangHoas });
    };

    const addRow = () => {
        setFormData({
            ...formData,
            danhSachHangHoa: [...formData.danhSachHangHoa, { maHang: '', tenHang: '', giaBan: '' }]
        });
    };

    const removeRow = (index) => {
        if (formData.danhSachHangHoa.length === 1) return;
        const updatedHangHoas = formData.danhSachHangHoa.filter((_, i) => i !== index);
        setFormData({ ...formData, danhSachHangHoa: updatedHangHoas });
    };

    // --- HÀM XỬ LÝ LƯU NHANH LOẠI HÀNG MỚI ---
    const handleQuickAddCategory = async () => {
        if (!newCategory.maLoai || !newCategory.tenLoai) {
            alert("Vui lòng nhập Mã và Tên lĩnh vực mới!");
            return;
        }
        try {
            const res = await api.post('/categories', newCategory); // Gửi API tạo mới

            // 1. Thêm cái vừa tạo vào danh sách Dropdown
            setCategories([...categories, res.data]);

            // 2. Tự động CHỌN LUÔN cái vừa tạo cho Form Nhà cung cấp
            setFormData({ ...formData, loaiHangId: res.data.id });

            // 3. Đóng form thêm nhanh và reset trắng chữ
            setShowQuickAdd(false);
            setNewCategory({ maLoai: '', tenLoai: '', moTa: 'Thêm nhanh từ form' });

            alert("Đã thêm Lĩnh vực mới thành công!");
        } catch (error) {
            alert("Lỗi! Có thể Mã loại này đã tồn tại trong hệ thống.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Bắt lỗi nếu người dùng chưa chọn Loại hàng
        if (!formData.loaiHangId) {
            setErrorMessage('❌ Vui lòng chọn Lĩnh Vực / Loại Hàng cho công ty này!');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            if (isEditMode) {
                await api.put(`/suppliers/${formData.id}`, formData);
                alert('✅ Đã cập nhật thông tin Nhà cung cấp!');
            } else {
                await api.post('/suppliers', formData);
                alert('✅ Đã lưu Nhà cung cấp và Danh mục hàng hóa!');
            }
            navigate('/suppliers');
        } catch (error) {
            console.error('Lỗi lưu NCC:', error);
            setErrorMessage('❌ Không thể lưu. Vui lòng kiểm tra lại dữ liệu!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ncc-container">
            <h2 className="ncc-title">
                {isEditMode ? '🏢 Cập Nhật Nhà Cung Cấp' : '🏢 Thêm Nhà Cung Cấp & Hàng Hóa'}
            </h2>

            {errorMessage && <div className="error-alert">{errorMessage}</div>}

            <form onSubmit={handleSubmit} className="ncc-form-card">
                <div className="ncc-section">
                    <h3>📦 1. Thông tin Nhà cung cấp</h3>
                    <div className="info-grid">
                        <div className="ncc-input-group">
                            <label>Mã Nhà Cung Cấp (*)</label>
                            <input name="maNCC" value={formData.maNCC} onChange={handleChangeNCC} required disabled={isEditMode} placeholder="VD: NCC001" />
                        </div>

                        <div className="ncc-input-group">
                            <label>Tên nhà cung cấp (*)</label>
                            <input name="tenNCC" value={formData.tenNCC} onChange={handleChangeNCC} required placeholder="Công ty TNHH..." />
                        </div>

                        {/* ========================================================= */}
                        {/* KHU VỰC CHỌN VÀ THÊM NHANH LOẠI HÀNG (CẬP NHẬT MỚI) */}
                        {/* ========================================================= */}
                        <div className="ncc-input-group" style={{ gridColumn: '1 / -1' }}> {/* Ép nó tràn ra một hàng rộng cho đẹp */}
                            <label>Lĩnh Vực / Loại Hàng (*)</label>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select
                                    name="loaiHangId"
                                    value={formData.loaiHangId}
                                    onChange={handleChangeNCC}
                                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="">-- Chọn lĩnh vực có sẵn --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.tenLoai}</option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={() => setShowQuickAdd(!showQuickAdd)}
                                    style={{ padding: '8px 15px', backgroundColor: showQuickAdd ? '#95a5a6' : '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    {showQuickAdd ? '✖ Hủy thêm' : '➕ Thêm Loại Mới'}
                                </button>
                            </div>

                            {/* Giao diện Thêm nhanh hiện ra khi bấm nút */}
                            {showQuickAdd && (
                                <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px dashed #3498db', borderRadius: '6px' }}>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#7f8c8d', fontStyle: 'italic' }}>* Nhập thông tin để tạo nhanh một lĩnh vực mới vào hệ thống:</p>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            placeholder="Mã (VD: YTE)"
                                            value={newCategory.maLoai}
                                            onChange={e => setNewCategory({ ...newCategory, maLoai: e.target.value })}
                                            style={{ width: '120px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Tên lĩnh vực (VD: Thiết bị y tế)..."
                                            value={newCategory.tenLoai}
                                            onChange={e => setNewCategory({ ...newCategory, tenLoai: e.target.value })}
                                            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleQuickAddCategory}
                                            style={{ padding: '8px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Lưu Lĩnh Vực
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* ========================================================= */}

                        <div className="ncc-input-group">
                            <label>Gmail liên hệ</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChangeNCC} placeholder="example@gmail.com" />
                        </div>

                        <div className="ncc-input-group full-width">
                            <label>Địa chỉ văn phòng / Kho</label>
                            <input name="diaChi" value={formData.diaChi} onChange={handleChangeNCC} placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện..." />
                        </div>
                    </div>
                </div>

                {/* --- PHẦN 2: DANH MỤC HÀNG HÓA --- */}
                {!isEditMode && (
                    <div className="ncc-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <h3>🛒 2. Danh mục hàng hóa cung cấp (Có thể để trống nếu chưa có)</h3>
                            <button type="button" className="btn-add-row" onClick={addRow}>+ Thêm dòng mặt hàng</button>
                        </div>

                        <div className="table-container">
                            <table className="hang-hoa-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '20%' }}>Mã Hàng</th>
                                        <th style={{ width: '45%' }}>Tên Mặt Hàng</th>
                                        <th style={{ width: '25%' }}>Đơn Giá Gốc (VNĐ)</th>
                                        <th style={{ width: '10%' }}>Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.danhSachHangHoa.map((item, index) => (
                                        <tr key={index}>
                                            <td><input placeholder="Mã" value={item.maHang} onChange={(e) => handleHangHoaChange(index, 'maHang', e.target.value)} /></td>
                                            <td><input placeholder="Tên sản phẩm" value={item.tenHang} onChange={(e) => handleHangHoaChange(index, 'tenHang', e.target.value)} /></td>
                                            <td><input type="number" placeholder="0" min="0" value={item.giaBan} onChange={(e) => handleHangHoaChange(index, 'giaBan', e.target.value)} /></td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn-remove-row"
                                                    onClick={() => removeRow(index)}
                                                    style={{ background: '#ff7675', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                                    disabled={formData.danhSachHangHoa.length === 1}
                                                >
                                                    ✖
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="ncc-btn-group">
                    <button type="button" className="btn-cancel" onClick={() => navigate('/suppliers')}>Hủy bỏ</button>
                    <button type="submit" className="btn-save" disabled={isLoading}>
                        {isLoading ? '⏳ Đang xử lý...' : '💾 Lưu Thông Tin'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NhaCungCapForm;