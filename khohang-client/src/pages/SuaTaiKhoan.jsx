import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave, FiUser, FiInfo, FiMail, FiPhone, FiMapPin, FiCalendar } from 'react-icons/fi';
import './SuaTaiKhoan.css';

const SuaTaiKhoan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // State lưu trữ dữ liệu (Tên biến khớp 100% với Entity Java)
    const [formData, setFormData] = useState({
        tenDangNhap: '',
        hoTen: '',
        email: '',
        so_dt: '', // 🎯 Khớp soDT bên Java
        diaChi: '',
        gioiTinh: 'Khác',
        ngaySinh: '',
        vaiTro: 'KHO'
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get(`/users`);
                const user = res.data.find(u => u.maND === id);

                if (user) {
                    setFormData({
                        tenDangNhap: user.tenDangNhap || '',
                        hoTen: user.hoTen || '',
                        email: user.email || '',
                        // 🎯 Vét cạn: Thử lấy so_dt, nếu ko có thì thử soDT (phòng hờ)
                        so_dt: user.so_dt || user.soDT || '',
                        diaChi: user.diaChi || '',
                        gioiTinh: user.gioiTinh || 'Khác',
                        ngaySinh: user.ngaySinh ? user.ngaySinh.split('T')[0] : '',
                        vaiTro: user.vaiTro || 'KHO'
                    });
                } else {
                    toast.error("Không tìm thấy nhân viên!");
                }
            } catch (error) {
                toast.error("Lỗi kết nối dữ liệu!");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 🎯 Dùng PUT để khớp @PutMapping bên Controller
            await api.put(`/users/${id}`, formData);
            toast.success("✅ Lưu thay đổi thành công!");
            setTimeout(() => navigate('/tai-khoan'), 1000);
        } catch (error) {
            toast.error("❌ Cập nhật thất bại!");
        }
    };

    if (loading) return <div className="stk-loading">⏳ Đang lấy thông tin...</div>;

    return (
        <div className="stk-container">
            <div className="stk-header">
                <button className="btn-back" onClick={() => navigate('/tai-khoan')}>
                    <FiArrowLeft /> Quay lại
                </button>
                <h2><FiInfo /> Cập Nhật Hồ Sơ Thành Viên</h2>
                <p>Mã nhân viên: <span className="id-badge">#{id}</span></p>
            </div>

            <div className="stk-card">
                <form onSubmit={handleSubmit}>
                    {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
                    <div className="stk-section">
                        <h3 className="stk-section-title"><FiUser /> Thông tin cơ bản</h3>
                        <div className="stk-form-grid">
                            <div className="stk-form-group">
                                <label>Tên đăng nhập</label>
                                <input type="text" name="tenDangNhap" value={formData.tenDangNhap} disabled className="input-disabled" />
                            </div>
                            <div className="stk-form-group">
                                <label>Họ và Tên</label>
                                <input type="text" name="hoTen" value={formData.hoTen} onChange={handleChange} required />
                            </div>
                            <div className="stk-form-group">
                                <label>Giới tính</label>
                                <select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange}>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div className="stk-form-group">
                                <label>Vai trò</label>
                                <select name="vaiTro" value={formData.vaiTro} onChange={handleChange}>
                                    <option value="QUANLYKHO">Quản lý Kho</option>
                                    <option value="MUAHANG">NV Mua Hàng</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="NV_KD">NV Kinh Doanh</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* PHẦN 2: LIÊN HỆ & CÁ NHÂN */}
                    <div className="stk-section" style={{ marginTop: '30px' }}>
                        <h3 className="stk-section-title"><FiPhone /> Liên hệ & Cá nhân</h3>
                        <div className="stk-form-grid">
                            <div className="stk-form-group">
                                <label><FiMail /> Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="stk-form-group">
                                <label><FiPhone /> Số điện thoại</label>
                                <input
                                    type="text"
                                    name="so_dt" // 🎯 Phải khớp với tên trong formData
                                    value={formData.so_dt}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="stk-form-group">
                                <label><FiCalendar /> Ngày sinh</label>
                                <input type="date" name="ngaySinh" value={formData.ngaySinh} onChange={handleChange} />
                            </div>
                            <div className="stk-form-group stk-full-width">
                                <label><FiMapPin /> Địa chỉ</label>
                                <input type="text" name="diaChi" value={formData.diaChi} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="stk-form-actions">
                        <button type="button" className="stk-btn-cancel" onClick={() => navigate('/tai-khoan')}>Hủy</button>
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