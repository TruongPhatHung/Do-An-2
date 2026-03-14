import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/axiosConfig';
import './EditNhaCungCap.css'; // Dùng chung CSS với form thêm mới cho đẹp

const EditNhaCungCap = () => {
    const { id } = useParams(); // Lấy mã NCC từ URL
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        maNCC: '',
        tenNCC: '', // Hoặc tenNhaCungCap tùy thuộc vào BE của bạn
        diaChi: '',
        soDienThoai: '',
        email: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // Gọi API lấy dữ liệu chi tiết của 1 Nhà Cung Cấp dựa vào ID
    useEffect(() => {
        const fetchSupplierDetails = async () => {
            try {
                // Lưu ý: Endpoint này phải khớp với backend (VD: /suppliers/NCC001)
                const response = await api.get(`/suppliers/${id}`); 
                const data = response.data;
                
                setFormData({
                    maNCC: data.maNCC || id,
                    tenNCC: data.tenNCC || data.tenNhaCungCap || '',
                    diaChi: data.diaChi || '',
                    soDienThoai: data.soDienThoai || '',
                    email: data.email || ''
                });
            } catch (error) {
                console.error("Lỗi khi lấy thông tin nhà cung cấp:", error);
                setErrorMessage("❌ Không thể tải thông tin nhà cung cấp từ máy chủ.");
            } finally {
                setIsFetching(false);
            }
        };

        fetchSupplierDetails();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            // Gọi API cập nhật (PUT)
            await api.put(`/suppliers/${id}`, formData);
            alert('✅ Cập nhật nhà cung cấp thành công!');
            // Quay về danh sách nhà cung cấp (Lưu ý đường dẫn của bạn hiện tại là /suppliers hoặc /nha-cung-cap)
            navigate('/suppliers'); 
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            setErrorMessage('❌ Cập nhật thất bại. Vui lòng kiểm tra lại!');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang tải dữ liệu...</div>;
    }

    return (
        <div className="ncc-container">
            <h2>📝 Cập Nhật Thông Tin Nhà Cung Cấp</h2>
            
            {errorMessage && (
                <div style={{ backgroundColor: '#ff7675', color: 'white', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="ncc-form">
                <div className="ncc-input-group">
                    <label>Mã nhà cung cấp (*):</label>
                    <input 
                        type="text" 
                        name="maNCC" 
                        value={formData.maNCC} 
                        disabled // Không cho phép sửa mã định danh
                        className="ncc-input"
                        style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                    />
                </div>

                <div className="ncc-input-group">
                    <label>Tên nhà cung cấp (*):</label>
                    <input 
                        type="text" 
                        name="tenNCC" 
                        value={formData.tenNCC} 
                        onChange={handleChange} 
                        required 
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
                        className="ncc-input"
                    />
                </div>

                <div className="ncc-input-group">
                    <label>Số điện thoại:</label>
                    <input 
                        type="text" 
                        name="soDienThoai" 
                        value={formData.soDienThoai} 
                        onChange={handleChange} 
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
                        className="ncc-input"
                    />
                </div>

                <div className="ncc-btn-group">
                    <button 
                        type="submit" 
                        className="ncc-btn ncc-btn-submit" 
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳ Đang lưu...' : '💾 Lưu Cập Nhật'}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => navigate('/suppliers')} 
                        className="ncc-btn ncc-btn-cancel"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditNhaCungCap;