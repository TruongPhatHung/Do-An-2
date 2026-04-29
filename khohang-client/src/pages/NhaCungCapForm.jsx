import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/axiosConfig';
import './NhaCungCapForm.css';
import { toast } from 'react-toastify';

// Import các icon từ thư viện react-icons (bộ Feather)
import { 
    FiEdit, FiPlusCircle, FiInfo, FiHash, FiBriefcase, 
    FiGrid, FiMail, FiMapPin, FiPlus, FiX, FiCheck, 
    FiBox, FiTrash2, FiXCircle, FiSave 
} from 'react-icons/fi';

const NhaCungCapForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isEditMode = !!location.state?.editData;

    const [categories, setCategories] = useState([]);
    const initialData = location.state?.editData;
    const [formData, setFormData] = useState(
        initialData ? {
            ...initialData,
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

    const handleQuickAddCategory = async () => {
        if (!newCategory.maLoai || !newCategory.tenLoai) {
            toast.warning("⚠️ Vui lòng nhập Mã và Tên lĩnh vực mới!");
            return;
        }
        try {
            const res = await api.post('/categories', newCategory);
            setCategories([...categories, res.data]);
            setFormData({ ...formData, loaiHangId: res.data.id });
            setShowQuickAdd(false);
            setNewCategory({ maLoai: '', tenLoai: '', moTa: 'Thêm nhanh từ form' });
            toast.success("✅ Đã thêm Lĩnh vực mới thành công!");
        } catch (error) {
            toast.error("❌ Lỗi! Có thể Mã loại này đã tồn tại trong hệ thống.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.loaiHangId) {
            setErrorMessage('❌ Vui lòng chọn Lĩnh Vực / Loại Hàng cho công ty này!');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            if (isEditMode) {
                await api.put(`/suppliers/${formData.id}`, formData);
                toast.success('✅ Đã cập nhật thông tin Nhà cung cấp!');
            } else {
                await api.post('/suppliers', formData);
                toast.success('✅ Đã lưu Nhà cung cấp và Danh mục hàng hóa!');
            }
            navigate('/suppliers');
        } catch (error) {
            console.error('Lỗi lưu NCC:', error);
            toast.error('❌ Không thể lưu. Vui lòng kiểm tra lại dữ liệu!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ncc-container">
            <div className="ncc-header">
                <h2 className="ncc-title">
                    {isEditMode ? <><FiEdit className="heading-icon"/> Cập Nhật Nhà Cung Cấp</> : <><FiPlusCircle className="heading-icon"/> Thêm Mới Nhà Cung Cấp</>}
                </h2>
                <p className="ncc-subtitle">
                    {isEditMode ? 'Chỉnh sửa thông tin đối tác cung cấp hàng hóa.' : 'Điền thông tin chi tiết để thêm đối tác mới vào hệ thống.'}
                </p>
            </div>

            {errorMessage && <div className="error-alert">{errorMessage}</div>}

            <form onSubmit={handleSubmit} className="ncc-form-card">
                <div className="ncc-section">
                    <h3 className="section-title">
                        <span>1</span> <FiInfo className="section-title-icon"/> Thông tin Nhà cung cấp
                    </h3>
                    <div className="info-grid">
                        <div className="ncc-input-group">
                            <label><FiHash /> Mã Nhà Cung Cấp <span className="required">*</span></label>
                            <input name="maNCC" value={formData.maNCC} onChange={handleChangeNCC} required disabled={isEditMode} placeholder="VD: NCC001" />
                        </div>

                        <div className="ncc-input-group">
                            <label><FiBriefcase /> Tên nhà cung cấp <span className="required">*</span></label>
                            <input name="tenNCC" value={formData.tenNCC} onChange={handleChangeNCC} required placeholder="Công ty TNHH..." />
                        </div>

                        <div className="ncc-input-group full-width">
                            <label><FiGrid /> Lĩnh Vực / Loại Hàng <span className="required">*</span></label>
                            <div className="category-select-wrapper">
                                <select name="loaiHangId" value={formData.loaiHangId} onChange={handleChangeNCC}>
                                    <option value="">-- Chọn lĩnh vực có sẵn --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.tenLoai}</option>
                                    ))}
                                </select>
                                <button type="button" className={`btn-toggle-quick ${showQuickAdd ? 'active' : ''}`} onClick={() => setShowQuickAdd(!showQuickAdd)}>
                                    {showQuickAdd ? <><FiX /> Hủy</> : <><FiPlus /> Thêm Mới</>}
                                </button>
                            </div>

                            {showQuickAdd && (
                                <div className="quick-add-box animate-fade-in">
                                    <p className="quick-add-note">* Nhập thông tin để tạo nhanh lĩnh vực mới:</p>
                                    <div className="quick-add-inputs">
                                        <input 
                                            type="text" placeholder="Mã (VD: YTE)" 
                                            value={newCategory.maLoai} 
                                            onChange={e => setNewCategory({ ...newCategory, maLoai: e.target.value })} 
                                            className="input-small"
                                        />
                                        <input 
                                            type="text" placeholder="Tên lĩnh vực (VD: Thiết bị y tế)..." 
                                            value={newCategory.tenLoai} 
                                            onChange={e => setNewCategory({ ...newCategory, tenLoai: e.target.value })} 
                                            className="input-flex"
                                        />
                                        <button type="button" className="btn-quick-save" onClick={handleQuickAddCategory}>
                                            <FiCheck size={16} /> Lưu
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="ncc-input-group">
                            <label><FiMail /> Email liên hệ</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChangeNCC} placeholder="example@domain.com" />
                        </div>

                        <div className="ncc-input-group full-width">
                            <label><FiMapPin /> Địa chỉ văn phòng / Kho</label>
                            <input name="diaChi" value={formData.diaChi} onChange={handleChangeNCC} placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện..." />
                        </div>
                    </div>
                </div>

                {!isEditMode && (
                    <div className="ncc-section">
                        <div className="section-header-flex">
                            <h3 className="section-title">
                                <span>2</span> <FiBox className="section-title-icon"/> Danh mục hàng hóa (Tùy chọn)
                            </h3>
                            <button type="button" className="btn-add-row" onClick={addRow}>
                                <FiPlusCircle size={16} /> Thêm mặt hàng
                            </button>
                        </div>

                        <div className="table-container">
                            <table className="hang-hoa-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '20%' }}>Mã Hàng</th>
                                        <th style={{ width: '45%' }}>Tên Mặt Hàng</th>
                                        <th style={{ width: '25%' }}>Đơn Giá Gốc (VNĐ)</th>
                                        <th style={{ width: '10%', textAlign: 'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.danhSachHangHoa.map((item, index) => (
                                        <tr key={index}>
                                            <td><input placeholder="VD: SP01" value={item.maHang} onChange={(e) => handleHangHoaChange(index, 'maHang', e.target.value)} /></td>
                                            <td><input placeholder="Tên sản phẩm..." value={item.tenHang} onChange={(e) => handleHangHoaChange(index, 'tenHang', e.target.value)} /></td>
                                            <td><input type="number" placeholder="0" min="0" value={item.giaBan} onChange={(e) => handleHangHoaChange(index, 'giaBan', e.target.value)} /></td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    className="btn-remove-row"
                                                    onClick={() => removeRow(index)}
                                                    disabled={formData.danhSachHangHoa.length === 1}
                                                    title="Xóa mặt hàng này"
                                                >
                                                    <FiTrash2 size={18} />
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
                    <button type="button" className="btn-cancel" onClick={() => navigate('/suppliers')}>
                        <FiXCircle size={16} /> Hủy bỏ
                    </button>
                    <button type="submit" className="btn-save" disabled={isLoading}>
                        {isLoading ? '⏳ Đang xử lý...' : <><FiSave size={16} /> Lưu Thông Tin</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NhaCungCapForm;