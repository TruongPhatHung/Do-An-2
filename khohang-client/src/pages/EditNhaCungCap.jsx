import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import './EditNhaCungCap.css';
import { toast } from 'react-toastify';

// Import thư viện icon đồng bộ với form Thêm Mới
import { 
    FiEdit, FiInfo, FiHash, FiBriefcase, FiGrid, 
    FiMail, FiMapPin, FiBox, FiPlusCircle, 
    FiTrash2, FiXCircle, FiSave, FiLoader
} from 'react-icons/fi';

const EditNhaCungCap = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [categories, setCategories] = useState([]);
    const [supplier, setSupplier] = useState({ maNCC: '', tenNCC: '', email: '', diaChi: '', loaiHangId: '' });
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [supplierRes, categoriesRes] = await Promise.all([
                    api.get(`/suppliers/${id}`),
                    api.get('/categories')
                ]);

                setCategories(categoriesRes.data);

                setSupplier({
                    maNCC: supplierRes.data.maNCC,
                    tenNCC: supplierRes.data.tenNCC || supplierRes.data.tenNhaCungCap,
                    email: supplierRes.data.email,
                    diaChi: supplierRes.data.diaChi,
                    loaiHangId: supplierRes.data.loaiHang ? supplierRes.data.loaiHang.id : ''
                });

                setProducts(supplierRes.data.danhSachHangHoa || supplierRes.data.danhSachHang || supplierRes.data.products || []);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi chi tiết từ Backend:", err);
                toast.error("❌ Không thể tải thông tin! Hãy kiểm tra lại mã hoặc đăng nhập lại.");
                navigate('/suppliers');
            }
        };
        loadData();
    }, [id, navigate]);

    const handleProductChange = (index, field, value) => {
        const newProducts = [...products];
        newProducts[index][field] = value;
        setProducts(newProducts);
    };

    const addProductRow = () => {
        setProducts([...products, { maHang: '', tenHang: '', giaBan: '' }]);
    };

    const removeProductRow = (index) => {
        const newProducts = products.filter((_, i) => i !== index);
        setProducts(newProducts);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/suppliers/${id}`, { ...supplier, danhSachHangHoa: products });
            toast.success("✅ Cập nhật thành công!");
            navigate('/suppliers');
        } catch (err) {
            toast.error("❌ Lỗi cập nhật: " + (err.response?.data?.message || "Thất bại"));
        }
    };

    if (loading) {
        return (
            <div className="edit-container loading-state">
                <FiLoader className="icon-spin" size={32} />
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="edit-container">
            <div className="edit-card">
                <div className="edit-header">
                    <h2><FiEdit className="heading-icon"/> Cập Nhật Nhà Cung Cấp</h2>
                    <p className="subtitle">Chỉnh sửa thông tin đối tác cung cấp và danh mục hàng hóa.</p>
                </div>

                <form onSubmit={handleSave}>
                    {/* Phần 1: Thông tin NCC */}
                    <div className="form-section">
                        <div className="form-section-title">
                            <span>1</span> <FiInfo className="section-icon"/> Thông tin Nhà cung cấp
                        </div>
                        <div className="input-grid">
                            <div className="form-group">
                                <label><FiHash className="label-icon"/> Mã Nhà Cung Cấp <span className="required">*</span></label>
                                <input className="form-control" value={supplier.maNCC} disabled />
                            </div>
                            
                            <div className="form-group">
                                <label><FiBriefcase className="label-icon"/> Tên nhà cung cấp <span className="required">*</span></label>
                                <input
                                    className="form-control"
                                    value={supplier.tenNCC}
                                    onChange={(e) => setSupplier({ ...supplier, tenNCC: e.target.value })}
                                    required
                                    placeholder="Ví dụ: Công ty TNHH..."
                                />
                            </div>

                            <div className="form-group">
                                <label><FiGrid className="label-icon"/> Lĩnh Vực / Loại Hàng <span className="required">*</span></label>
                                <select
                                    className="form-control"
                                    value={supplier.loaiHangId}
                                    onChange={(e) => setSupplier({ ...supplier, loaiHangId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Chọn lĩnh vực --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.tenLoai}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label><FiMail className="label-icon"/> Email liên hệ</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={supplier.email}
                                    onChange={(e) => setSupplier({ ...supplier, email: e.target.value })}
                                    placeholder="example@domain.com"
                                />
                            </div>
                            
                            <div className="form-group full-width">
                                <label><FiMapPin className="label-icon"/> Địa chỉ văn phòng / Kho</label>
                                <input
                                    className="form-control"
                                    value={supplier.diaChi}
                                    onChange={(e) => setSupplier({ ...supplier, diaChi: e.target.value })}
                                    placeholder="Số nhà, đường, Phường/Xã..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Phần 2: Hàng hóa */}
                    <div className="form-section">
                        <div className="section-header">
                            <div className="form-section-title">
                                <span>2</span> <FiBox className="section-icon"/> Danh mục hàng hóa
                            </div>
                            <button type="button" className="btn-add" onClick={addProductRow}>
                                <FiPlusCircle size={16}/> Thêm mặt hàng
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '25%' }}>Mã Hàng</th>
                                        <th style={{ width: '45%' }}>Tên Mặt Hàng</th>
                                        <th style={{ width: '20%' }}>Giá Bán (VNĐ)</th>
                                        <th style={{ width: '10%', textAlign: 'center' }}>Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? (
                                        products.map((p, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <input type="text" className="form-control table-input" value={p.maHang || ''} onChange={(e) => handleProductChange(idx, 'maHang', e.target.value)} placeholder="Mã SP..." required />
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control table-input" value={p.tenHang || ''} onChange={(e) => handleProductChange(idx, 'tenHang', e.target.value)} placeholder="Tên SP..." required />
                                                </td>
                                                <td>
                                                    <input type="number" min="0" className="form-control table-input" value={p.giaBan || ''} onChange={(e) => handleProductChange(idx, 'giaBan', e.target.value ? Number(e.target.value) : '')} placeholder="0" />
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button type="button" className="btn-delete" onClick={() => removeProductRow(idx)} title="Xóa dòng này">
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="empty-table-msg">
                                                Chưa có hàng hóa nào. Bấm "Thêm mặt hàng" để bắt đầu.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/suppliers')}>
                            <FiXCircle size={18}/> Hủy bỏ
                        </button>
                        <button type="submit" className="btn-save">
                            <FiSave size={18}/> Lưu Thay Đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditNhaCungCap;