import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiEdit } from 'react-icons/fi';
import './ChiTietTaiKhoan.css';
import adminAvatar from "../components/avarta/Screenshot 2026-03-21 185323 copy.png";
import khoAvatar from "../components/avarta/Screenshot 2026-03-21 185359.png";

const ChiTietTaiKhoan = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                // Gọi API lấy chi tiết user (Nếu API của bạn không có đường dẫn này, 
                // bạn có thể gọi API lấy danh sách rồi dùng .find(u => u.id === id))
                const res = await api.get(`/users/${id}`); 
                setUser(res.data);
            } catch (error) {
                console.error("Lỗi khi tải thông tin chi tiết:", error);
                // Fallback: Nếu API /users/:id không tồn tại, thử tìm trong danh sách tổng
                try {
                    const listRes = await api.get('/users');
                    const foundUser = listRes.data.find(u => (u.id || u.maND).toString() === id);
                    if (foundUser) setUser(foundUser);
                } catch (err) {
                    console.error("Lỗi fallback:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [id]);

    const getRoleAvatar = (avatarDb, vaiTro) => {
        if (avatarDb) return avatarDb;
        const role = vaiTro?.toUpperCase();
        if (role === 'ADMIN') return adminAvatar;
        if (role === 'KHO' || role === 'QUANLYKHO') return khoAvatar;
        if (role === 'MUAHANG') return 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        return 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    };

    if (loading) return <div className="ct-loading">Đang tải thông tin...</div>;
    if (!user) return <div className="ct-error">Không tìm thấy thông tin tài khoản!</div>;

    const isUserOnline = user.isOnline !== undefined ? user.isOnline : (user.vaiTro === 'ADMIN');

    return (
        <div className="ct-container">
            <div className="ct-header">
                <button className="btn-back" onClick={() => navigate('/tai-khoan')}>
                    <FiArrowLeft /> Quay lại danh sách
                </button>
                <h2>Chi Tiết Hồ Sơ Nhân Viên</h2>
            </div>

            <div className="ct-card">
                <div className="ct-card-left">
                    <div className="ct-avatar-container">
                        <img src={getRoleAvatar(user.avatar, user.vaiTro)} alt="Avatar" className="ct-avatar-large" />
                        <span className={`ct-status-badge ${isUserOnline ? 'online' : 'offline'}`}>
                            {isUserOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
                        </span>
                    </div>
                    <h3 className="ct-name">{user.hoTen || "Chưa cập nhật tên"}</h3>
                    <p className="ct-username">@{user.tenDangNhap}</p>
                    <div className={`ct-role-tag role-${user.vaiTro?.toLowerCase()}`}>
                        {user.vaiTro}
                    </div>
                </div>

                <div className="ct-card-right">
                    <h4 className="ct-section-title">Thông Tin Cá Nhân</h4>
                    <div className="ct-info-grid">
                        <div className="ct-info-item">
                            <FiUser className="ct-icon" />
                            <div>
                                <label>Giới tính</label>
                                <p>{user.gioiTinh || '---'}</p>
                            </div>
                        </div>
                        <div className="ct-info-item">
                            <FiCalendar className="ct-icon" />
                            <div>
                                <label>Ngày sinh</label>
                                <p>{user.ngaySinh || '---'}</p>
                            </div>
                        </div>
                        <div className="ct-info-item">
                            <FiMail className="ct-icon" />
                            <div>
                                <label>Email</label>
                                <p>{user.email || '---'}</p>
                            </div>
                        </div>
                        <div className="ct-info-item">
                            <FiPhone className="ct-icon" />
                            <div>
                                <label>Số điện thoại</label>
                                <p>{user.soDienThoai || '---'}</p>
                            </div>
                        </div>
                        <div className="ct-info-item full-width">
                            <FiMapPin className="ct-icon" />
                            <div>
                                <label>Địa chỉ</label>
                                <p>{user.diaChi || 'Chưa cập nhật địa chỉ'}</p>
                            </div>
                        </div>
                        <div className="ct-info-item full-width">
                            <FiBriefcase className="ct-icon" />
                            <div>
                                <label>Mã nhân viên (ID Hệ thống)</label>
                                <p>#{user.id || user.maND}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChiTietTaiKhoan;