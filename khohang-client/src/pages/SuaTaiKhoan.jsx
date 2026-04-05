import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import './SuaTaiKhoan.css';

const SuaTaiKhoan = () => {
    const { id } = useParams(); // Lấy ID nhân viên từ thanh địa chỉ
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // State lưu trữ dữ liệu form
    const [formData, setFormData] = useState({
        tenDangNhap: '',
        hoTen: '',
        email: '',
        soDienThoai: '',
        diaChi: '',
        gioiTinh: 'Khác',
        ngaySinh: '',
        vaiTro: 'KHO'
    });

// Lấy thông tin hiện tại của nhân viên khi mở trang
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Gọi API lấy TẤT CẢ danh sách tài khoản (Giống trang Quản lý tài khoản)
                // Lưu ý: Đổi '/users' thành đúng endpoint API lấy danh sách của bạn nếu cần
                const res = await api.get(`/users`); 
                const allUsers = res.data;
                
                // Lọc ra user có ID trùng với ID trên thanh URL (ví dụ: ND-1775375297213)
                // Lưu ý cực kỳ quan trọng: Thay chữ 'id', '_id' hoặc 'maND' cho đúng với tên cột trong Database của bạn
                const user = allUsers.find(u => u.id === id || u._id === id || u.maND === id);
                
                if (user) {
                    // Đổ dữ liệu cũ vào form
                    setFormData({
                        tenDangNhap: user.tenDangNhap || '',
                        hoTen: user.hoTen || '',
                        email: user.email || '',
                        soDienThoai: user.soDT || '',
                        diaChi: user.diaChi || '',
                        gioiTinh: user.gioiTinh || 'Khác',
                        ngaySinh: user.ngaySinh || '',
                        vaiTro: user.vaiTro || 'KHO'
                    });
                } else {
                     toast.error("Không tìm thấy dữ liệu nhân viên này!");
                }

            } catch (error) {
                console.error("Lỗi lấy thông tin:", error);
                toast.error("Không thể tải thông tin nhân viên!");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Gọi API cập nhật thông tin
            await api.patch(`/users/${id}`, formData);
            toast.success("✅ Cập nhật thông tin thành công!");
            navigate('/tai-khoan'); // Quay về danh sách
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            toast.error("❌ Cập nhật thất bại. Vui lòng kiểm tra lại!");
        }
    };

    if (loading) return <div className="stk-loading">Đang tải dữ liệu...</div>;

    return (
        <div className="stk-container">
            <div className="stk-header">
                <button className="btn-back" onClick={() => navigate('/tai-khoan')}>
                    <FiArrowLeft /> Quay lại danh sách
                </button>
                <h2>Cập Nhật Thông Tin Nhân Viên</h2>
                <p>Mã nhân viên: <strong>#{id}</strong></p>
            </div>

            <div className="stk-card">
                <form onSubmit={handleSubmit}>
                    <h3 className="stk-section-title">Thông tin cơ bản</h3>
                    <div className="stk-form-grid">
                        <div className="stk-form-group">
                            <label>Tên đăng nhập</label>
                            <input 
                                type="text" 
                                name="tenDangNhap" 
                                value={formData.tenDangNhap} 
                                onChange={handleChange}
                                placeholder="Nhập tên đăng nhập"
                                required
                            />
                        </div>
                        <div className="stk-form-group">
                            <label>Họ và Tên</label>
                            <input 
                                type="text" 
                                name="hoTen" 
                                value={formData.hoTen} 
                                onChange={handleChange} 
                                placeholder="Nhập họ tên đầy đủ"
                                required 
                            />
                        </div>
                        <div className="stk-form-group">
                            <label>Vai trò / Cấp quyền</label>
                            <select name="vaiTro" value={formData.vaiTro} onChange={handleChange}>
                                <option value="KHO">Nhân viên Kho</option>
                                <option value="QUANLYKHO">Quản lý Kho</option>
                                <option value="MUAHANG">Nhân viên Mua Hàng</option>
                                <option value="ADMIN">Quản trị viên (Admin)</option>
                            </select>
                        </div>
                        <div className="stk-form-group">
                            <label>Giới tính</label>
                            <select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange}>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                    </div>

                    <h3 className="stk-section-title" style={{ marginTop: '30px' }}>Thông tin liên hệ</h3>
                    <div className="stk-form-grid">
                        <div className="stk-form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                placeholder="example@gmail.com"
                            />
                        </div>
                        <div className="stk-form-group">
                            <label>Số điện thoại</label>
                            <input 
                                type="text" 
                                name="soDienThoai" 
                                value={formData.soDienThoai} 
                                onChange={handleChange} 
                                placeholder="09xxxxxxx"
                            />
                        </div>
                        <div className="stk-form-group">
                            <label>Ngày sinh</label>
                            <input 
                                type="date" 
                                name="ngaySinh" 
                                value={formData.ngaySinh} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="stk-form-group stk-full-width">
                            <label>Địa chỉ</label>
                            <input 
                                type="text" 
                                name="diaChi" 
                                value={formData.diaChi} 
                                onChange={handleChange} 
                                placeholder="Nhập địa chỉ cư trú"
                            />
                        </div>
                    </div>

                    <div className="stk-form-actions">
                        <button type="button" className="stk-btn-cancel" onClick={() => navigate('/tai-khoan')}>
                            Hủy bỏ
                        </button>
                        <button type="submit" className="stk-btn-submit">
                            <FiSave /> Lưu Cập Nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SuaTaiKhoan;