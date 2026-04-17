import React, { useState } from 'react';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave, FiUser } from 'react-icons/fi';
import './ThemTaiKhoan.css'; // File CSS mới

const ThemTaiKhoan = () => {
    const navigate = useNavigate();
    const initialFormState = {
        tenDangNhap: '',
        matKhau: '',
        hoTen: '',
        email: '',
        soDienThoai: '',
        diaChi: '',
        gioiTinh: 'Nam',
        ngaySinh: '',
        vaiTro: 'KHO'
    };

    const [newUser, setNewUser] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/users', newUser);
            toast.success("✅ Tạo tài khoản nhân viên thành công!");
            navigate('/quan-ly-tai-khoan'); // Trở về trang danh sách sau khi lưu
        } catch (error) {
            toast.error("❌ Lỗi: Tên đăng nhập đã tồn tại hoặc dữ liệu không hợp lệ!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="add-user-container">
            <div className="add-user-header">
                <button className="btn-back" onClick={() => navigate('/tai-khoan')}>
                    <FiArrowLeft /> Quay lại danh sách
                </button>
                <h2><FiUser /> Thêm Hồ Sơ Nhân Viên Mới</h2>
                <p>Điền đầy đủ thông tin để cấp tài khoản hệ thống cho nhân sự</p>
            </div>

            <div className="add-user-card">
                <form onSubmit={handleAddUser}>
                    <h3 className="section-title">Thông tin đăng nhập</h3>
                    <div className="form-grid-2">
                        <div className="input-box">
                            <label>Tên đăng nhập <span className="required">*</span></label>
                            <input type="text" name="tenDangNhap" placeholder="VD: staff01" value={newUser.tenDangNhap} onChange={handleChange} required />
                        </div>
                        <div className="input-box">
                            <label>Mật khẩu <span className="required">*</span></label>
                            <input type="password" name="matKhau" placeholder="******" value={newUser.matKhau} onChange={handleChange} required />
                        </div>
                        <div className="input-box">
                            <label>Phân quyền (Vai trò) <span className="required">*</span></label>
                            <select name="vaiTro" value={newUser.vaiTro} onChange={handleChange}>
                                <option value="KHO">Nhân viên Kho</option>
                                <option value="QUANLYKHO">Quản lý Kho</option>
                                <option value="MUAHANG">Nhân viên Mua hàng</option>
                                <option value="ADMIN">Quản trị viên (Admin)</option>
                                <option value="NV_KD">NV Kinh Doanh</option>
                            </select>
                        </div>
                    </div>

                    <h3 className="section-title mt-4">Thông tin cá nhân</h3>
                    <div className="form-grid-2">
                        <div className="input-box">
                            <label>Họ và Tên <span className="required">*</span></label>
                            <input type="text" name="hoTen" placeholder="Nguyễn Văn A" value={newUser.hoTen} onChange={handleChange} required />
                        </div>
                        <div className="input-box">
                            <label>Email liên hệ <span className="required">*</span></label>
                            <input type="email" name="email" placeholder="abc@gmail.com" value={newUser.email} onChange={handleChange} required />
                        </div>
                        <div className="input-box">
                            <label>Số điện thoại</label>
                            <input type="tel" name="soDienThoai" placeholder="0909xxxxxx" value={newUser.soDienThoai} onChange={handleChange} />
                        </div>
                        <div className="input-box">
                            <label>Ngày sinh</label>
                            <input type="date" name="ngaySinh" value={newUser.ngaySinh} onChange={handleChange} />
                        </div>
                        <div className="input-box">
                            <label>Giới tính</label>
                            <select name="gioiTinh" value={newUser.gioiTinh} onChange={handleChange}>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        <div className="input-box full-width">
                            <label>Địa chỉ thường trú</label>
                            <input type="text" name="diaChi" placeholder="Nhập địa chỉ đầy đủ..." value={newUser.diaChi} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/tai-khoan')}>
                            Hủy bỏ
                        </button>
                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            <FiSave /> {isLoading ? 'Đang lưu...' : 'Lưu Hồ Sơ Nhân Viên'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ThemTaiKhoan;