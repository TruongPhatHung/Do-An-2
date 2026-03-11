import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import './NhaCungCapForm.css';

const NhaCungCapForm = () => {
    const navigate = useNavigate();
    
    // State lưu dữ liệu form
    const [formData, setFormData] = useState({
        tenNhaCungCap: '',
        diaChi: '',
        soDienThoai: '',
        email: ''
    });

    // State quản lý hiệu ứng tải và lỗi
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Xử lý khi gõ vào ô input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMessage(''); // Xóa thông báo lỗi cũ khi người dùng bắt đầu sửa
    };

    // Xử lý khi bấm nút Lưu
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            await api.post('/suppliers', formData);
            alert('✅ Thêm nhà cung cấp thành công!');
            navigate('/nha-cung-cap'); // Đưa về trang danh sách
        } catch (error) {
            console.error('Lỗi khi thêm:', error);
            setErrorMessage('❌ Thêm thất bại. Vui lòng kiểm tra lại kết nối hoặc dữ liệu!');
        } finally {
            setIsLoading(false); // Tắt trạng thái loading dù thành công hay thất bại
        }
    };

    return (
        <div className="ncc-container">
            <h2>➕ Thêm Nhà Cung Cấp Mới</h2>
            
            {/* Vùng hiển thị lỗi */}
            {errorMessage && (
                <div style={{ backgroundColor: '#ff7675', color: 'white', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="ncc-form">
                <div className="ncc-input-group">
                    <label>Tên nhà cung cấp (*):</label>
                    <input 
                        type="text" 
                        name="tenNhaCungCap" 
                        value={formData.tenNhaCungCap} 
                        onChange={handleChange} 
                        required 
                        placeholder="Nhập tên công ty/đại lý..."
                        className="ncc-input"
                    />
                </div>

                <div className="ncc-input-group">
                    <label>Địa chỉ:</label>
                    <input 
                        type="text" 
                        name="diaChi" 
                        value={formData.diaChi} 
                        onChange={handleChange} 
                        placeholder="Số nhà, đường, quận, thành phố..."
                        className="ncc-input"
                    />
                </div>

            

                <div className="ncc-input-group">
                    <label>Email:</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="contact@nhacungcap.com"
                        className="ncc-input"
                    />
                </div>

                <div className="ncc-btn-group">
                    <button 
                        type="submit" 
                        className="ncc-btn ncc-btn-submit" 
                        disabled={isLoading} // Vô hiệu hóa nút khi đang tải
                        style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {isLoading ? '⏳ Đang lưu...' : '💾 Lưu Thông Tin'}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => navigate('/nha-cung-cap')} 
                        className="ncc-btn ncc-btn-cancel"
                        disabled={isLoading}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NhaCungCapForm;