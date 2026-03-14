import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import './EditNhaCungCap.css'; 

const EditNhaCungCap = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [supplier, setSupplier] = useState({ maNCC: '', tenNCC: '', email: '', diaChi: '' });
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get(`/suppliers/${id}`);
                setSupplier({
                    maNCC: res.data.maNCC,
                    tenNCC: res.data.tenNCC || res.data.tenNhaCungCap,
                    email: res.data.email,
                    diaChi: res.data.diaChi
                });
                setProducts(res.data.danhSachHangHoa || res.data.danhSachHang || res.data.products || []);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi chi tiết từ Backend:", err);
                alert("❌ Không thể tải thông tin! Hãy kiểm tra lại mã hoặc đăng nhập lại.");
                navigate('/suppliers');
            }
        };
        loadData();
    }, [id, navigate]);

     // --- CÁC HÀM XỬ LÝ HÀNG HÓA TRỰC TIẾP TRÊN BẢNG ---
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
            alert("✅ Cập nhật thành công!");
            navigate('/suppliers');
        } catch (err) {
            alert("❌ Lỗi cập nhật: " + (err.response?.data?.message || "Thất bại"));
        }
    };

    if (loading) return <div className="edit-container">⏳ Đang tải dữ liệu...</div>;

    return (
        <div className="edit-container">
            <div className="edit-card">
                <div className="edit-header">
                    <h2>🏢 Cập Nhật Nhà Cung Cấp & Hàng Hóa</h2>
                </div>

                <form onSubmit={handleSave}>
                    {/* --- PHẦN 1: NHÀ CUNG CẤP --- */}
                    <div className="form-section-title">📦 1. Thông tin Nhà cung cấp</div>
                    <div className="input-grid">
                        <div className="form-group">
                            <label>Mã Nhà Cung Cấp (*)</label>
                            <input className="form-control" value={supplier.maNCC} disabled />
                        </div>
                        <div className="form-group">
                            <label>Tên nhà cung cấp (*)</label>
                            <input 
                                className="form-control" 
                                value={supplier.tenNCC} 
                                onChange={(e) => setSupplier({...supplier, tenNCC: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Gmail liên hệ</label>
                            <input 
                                className="form-control" 
                                value={supplier.email}
                                onChange={(e) => setSupplier({...supplier, email: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Địa chỉ văn phòng / Kho</label>
                        <input 
                            className="form-control" 
                            value={supplier.diaChi}
                            onChange={(e) => setSupplier({...supplier, diaChi: e.target.value})} 
                        />
                    </div>

                    {/* --- PHẦN 2: HÀNG HÓA --- */}
                    <div className="section-header">
                        <div className="form-section-title">🛒 2. Danh mục hàng hóa</div>
                        <button type="button" className="btn-add" onClick={addProductRow}>
                            + Thêm Mặt Hàng
                        </button>
                    </div>
                    
                    <div className="table-responsive">
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Mã Hàng</th>
                                    <th>Tên Mặt Hàng</th>
                                    <th>Giá Bán (VNĐ)</th>
                                    <th style={{ width: '80px', textAlign: 'center' }}>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map((p, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className="form-control table-input" 
                                                    value={p.maHang || ''} 
                                                    onChange={(e) => handleProductChange(idx, 'maHang', e.target.value)} 
                                                    placeholder="Nhập mã..."
                                                    required 
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className="form-control table-input" 
                                                    value={p.tenHang || ''} 
                                                    onChange={(e) => handleProductChange(idx, 'tenHang', e.target.value)} 
                                                    placeholder="Nhập tên..."
                                                    required 
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    className="form-control table-input" 
                                                    value={p.giaBan || ''} 
                                                    onChange={(e) => handleProductChange(idx, 'giaBan', e.target.value ? Number(e.target.value) : '')} 
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button 
                                                    type="button" 
                                                    className="btn-delete"
                                                    onClick={() => removeProductRow(idx)}
                                                    title="Xóa dòng này"
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="empty-table-msg">
                                            Chưa có hàng hóa nào. Bấm "+ Thêm Mặt Hàng" để bắt đầu.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- NÚT LƯU --- */}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/suppliers')}>Hủy bỏ</button>
                        <button type="submit" className="btn-save">💾 Lưu Thông Tin</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditNhaCungCap;