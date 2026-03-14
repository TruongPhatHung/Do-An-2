import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/axiosConfig';
import './NhaCungCapForm.css';

const NhaCungCapForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isEditMode = !!location.state?.editData; // Kiểm tra xem có đang ở chế độ sửa không
    
    // Khởi tạo state. Nếu là sửa, lấy data cũ. Nếu thêm mới, để trống.
    const [formData, setFormData] = useState(
        location.state?.editData || {
            maNCC: '',
            tenNCC: '',
            diaChi: '',
            email: '',
            danhSachHangHoa: [{ maHang: '', tenHang: '', giaBan: '' }] // Giá bán để rỗng ban đầu thay vì 0
        }
    );

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
        // Đảm bảo luôn còn ít nhất 1 dòng
        if (formData.danhSachHangHoa.length === 1) return;
        
        const updatedHangHoas = formData.danhSachHangHoa.filter((_, i) => i !== index);
        setFormData({ ...formData, danhSachHangHoa: updatedHangHoas });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            if (isEditMode) {
                // NẾU LÀ SỬA (Gọi API PUT)
                await api.put(`/suppliers/${formData.id}`, formData);
                alert('✅ Đã cập nhật thông tin Nhà cung cấp!');
            } else {
                // NẾU LÀ THÊM MỚI (Gọi API POST)
                await api.post('/suppliers', formData);
                alert('✅ Đã lưu Nhà cung cấp và Danh mục hàng hóa!');
            }
            navigate('/suppliers'); // Chuyển hướng
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
                {/* --- PHẦN 1: THÔNG TIN CÔNG TY --- */}
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
                {/* Ẩn bảng hàng hóa nếu đang ở chế độ Sửa (để tránh phức tạp hóa logic update danh sách) */}
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
                                            <td>
                                                <input placeholder="Mã" value={item.maHang} onChange={(e) => handleHangHoaChange(index, 'maHang', e.target.value)} />
                                            </td>
                                            <td>
                                                <input placeholder="Tên sản phẩm" value={item.tenHang} onChange={(e) => handleHangHoaChange(index, 'tenHang', e.target.value)} />
                                            </td>
                                            <td>
                                                <input type="number" placeholder="0" min="0" value={item.giaBan} onChange={(e) => handleHangHoaChange(index, 'giaBan', e.target.value)} />
                                            </td>
                                            <td>
                                                <button 
                                                    type="button" 
                                                    className="btn-remove-row" 
                                                    onClick={() => removeRow(index)} 
                                                    style={{background: '#ff7675', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}
                                                    disabled={formData.danhSachHangHoa.length === 1} // Khóa nút xóa nếu chỉ còn 1 dòng
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