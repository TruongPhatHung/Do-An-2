import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import './ThemHangHoa.css';

const ThemHangHoa = () => {
    const navigate = useNavigate();
    
    // State lưu trữ dữ liệu form
    const [formData, setFormData] = useState({
        maHang: '',
        tenHang: '',
        donViTinh: '',
        soLuongToiThieu: 0,
        giaNhap: 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'soLuongToiThieu' || name === 'giaNhap' ? Number(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.maHang || !formData.tenHang || !formData.donViTinh) {
            alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
        }

        try {
            // Gọi API lưu dữ liệu (Dev A cần cung cấp endpoint POST /hang-hoa)
            await api.post('/hang-hoa', formData);
            alert("Thêm hàng hóa mới thành công!");
            navigate('/hang-hoa'); // Chuyển hướng về lại danh sách
        } catch (error) {
            console.error("Lỗi khi thêm hàng hóa:", error);
            alert("Thêm thất bại. Mã hàng có thể đã tồn tại hoặc lỗi Server.");
        }
    };

    return (
        <div className="add-product-container">
            <h2>📦 Thêm Hàng Hóa Mới</h2>
            
            <form onSubmit={handleSubmit} className="add-product-form">
                <div className="form-group">
                    <label>Mã Hàng (Bắt buộc):</label>
                    <input type="text" name="maHang" value={formData.maHang} onChange={handleChange} placeholder="VD: SP008" required />
                </div>
                
                <div className="form-group">
                    <label>Tên Hàng (Bắt buộc):</label>
                    <input type="text" name="tenHang" value={formData.tenHang} onChange={handleChange} placeholder="VD: Ốc vít 3cm" required />
                </div>
                
                <div className="form-group">
                    <label>Đơn Vị Tính:</label>
                    <input type="text" name="donViTinh" value={formData.donViTinh} onChange={handleChange} placeholder="VD: Hộp, Cái, Kg..." required />
                </div>
                
                <div className="form-group">
                    <label>Định Mức Tối Thiểu (Cảnh báo hết hàng):</label>
                    <input type="number" min="0" name="soLuongToiThieu" value={formData.soLuongToiThieu} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Giá Nhập (VNĐ):</label>
                    <input type="number" min="0" name="giaNhap" value={formData.giaNhap} onChange={handleChange} />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => navigate('/hang-hoa')}>Hủy bỏ</button>
                    <button type="submit" className="btn-save">💾 Lưu Hàng Hóa</button>
                </div>
            </form>
        </div>
    );
};

export default ThemHangHoa;