import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import './NhaCungCapForm.css'; // Dùng chung CSS form cho đẹp
import { toast } from 'react-toastify';
const SuaHangHoa = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        maHang: '',
        tenHang: '',
        donViTinh: '',
        soLuongTon: 0,
        soLuongToiThieu: 0,
        giaNhap: 0,
        loaiHangId: '' // ID để gửi về Backend
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gọi song song: Lấy chi tiết hàng hóa và danh sách loại hàng
                const [resProduct, resCategories] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get('/categories')
                ]);

                setCategories(resCategories.data);

                // Đổ dữ liệu cũ vào form
                const p = resProduct.data;
                setFormData({
                    maHang: p.maHang,
                    tenHang: p.tenHang,
                    donViTinh: p.donViTinh,
                    soLuongTon: p.soLuongTon,
                    soLuongToiThieu: p.soLuongToiThieu,
                    giaNhap: p.giaNhap,
                    loaiHangId: p.loaiHang ? p.loaiHang.id : '' // Lấy ID loại hàng hiện tại
                });
                setLoading(false);
            } catch (error) {
                console.error("Lỗi:", error);
                toast.error("❌ Không thể tải dữ liệu hàng hóa!");
                navigate('/products');
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/products/${id}`, formData);
            toast.success("✅ Cập nhật thông tin hàng hóa thành công!");
            navigate('/products');
        } catch (error) {
            toast.error("❌ Lỗi cập nhật: " + (error.response?.data?.message || "Thất bại"));
        }
    };

    if (loading) return <div className="po-container">⏳ Đang tải...</div>;

    return (
        <div className="po-container">
            <h2 className="ncc-title">🛠 Chỉnh Sửa Thông Tin Hàng Hóa</h2>
            <form onSubmit={handleSubmit} className="ncc-form-card">
                <div className="ncc-section">
                    <div className="info-grid">
                        <div className="ncc-input-group">
                            <label>Mã Hàng (Không được sửa)</label>
                            <input value={formData.maHang} disabled style={{ backgroundColor: '#f0f0f0' }} />
                        </div>
                        <div className="ncc-input-group">
                            <label>Tên Mặt Hàng (*)</label>
                            <input
                                value={formData.tenHang}
                                onChange={e => setFormData({ ...formData, tenHang: e.target.value })}
                                required
                            />
                        </div>
                        <div className="ncc-input-group">
                            <label>Phân Loại / Ngành Hàng (*)</label>
                            <select
                                value={formData.loaiHangId}
                                onChange={e => setFormData({ ...formData, loaiHangId: e.target.value })}
                                required
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">-- Chọn Loại Hàng --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.tenLoai}</option>
                                ))}
                            </select>
                        </div>
                        <div className="ncc-input-group">
                            <label>Đơn Vị Tính</label>
                            <input
                                value={formData.donViTinh}
                                onChange={e => setFormData({ ...formData, donViTinh: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="ncc-btn-group">
                    <button type="button" className="btn-cancel" onClick={() => navigate('/products')}>Hủy bỏ</button>
                    <button type="submit" className="btn-save">💾 Lưu Thay Đổi</button>
                </div>
            </form>
        </div>
    );
};

export default SuaHangHoa;