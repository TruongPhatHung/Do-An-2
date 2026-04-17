import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './QuanLyTaiKhoan.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import adminAvatar from "../components/avarta/Screenshot 2026-03-21 185323 copy.png";
import khoAvatar from "../components/avarta/Screenshot 2026-03-21 185359.png";
import { FiUserPlus, FiX, FiKey, FiTrash2, FiEye, FiEdit, FiLock, FiUnlock } from 'react-icons/fi';

const QuanLyTaiKhoan = () => {
    const [users, setUsers] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(() => {
            fetchUsers();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get(`/users?t=${new Date().getTime()}`);
            console.log("Dữ liệu Users mới nhất:", res.data);
            setUsers(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
        }
    };

    const handleUpdateRole = async (maND, newRole) => {
        if (!window.confirm(`Xác nhận nâng chức/đổi quyền thành ${newRole}?`)) return;
        try {
            await api.put(`/users/${maND}/role`, { role: newRole }, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success(`✅ Đã đổi quyền thành ${newRole}`);
            fetchUsers();
        } catch (error) {
            toast.error("❌ Cập nhật quyền thất bại!");
        }
    };

    const handleUpdatePassword = async (maND) => {
        const newPw = window.prompt("🔑 Nhập mật khẩu mới cho nhân viên này:");
        if (newPw === null || newPw.trim() === "") return;
        if (newPw.length < 6) {
            toast.warning("⚠️ Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }

        try {
            await api.patch(`/users/${maND}/password`, { matKhau: newPw }, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success("✅ Đã cập nhật mật khẩu mới thành công!");
        } catch (error) {
            toast.error("❌ Lỗi khi đổi mật khẩu!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("❗ Bạn có chắc muốn xóa tài khoản này?")) {
            try {
                await api.delete(`/users/${id}`);
                toast.success("✅ Xóa thành công!");
                fetchUsers();
            } catch (error) {
                toast.error("❌ Xóa thất bại! Có thể tài khoản này đang dính dữ liệu.");
            }
        }
    };

    const handleToggleLock = async (id, isCurrentlyLocked) => {
        const actionText = isCurrentlyLocked ? "mở khóa" : "khóa";
        if (window.confirm(`❗ Bạn có chắc muốn ${actionText} tài khoản này?`)) {
            try {
                await api.patch(`/users/${id}/status`, { trangThai: !isCurrentlyLocked }, {
                    headers: { 'Content-Type': 'application/json' }
                });
                toast.success(`✅ Đã ${actionText} tài khoản!`);
                fetchUsers();
            } catch (error) {
                toast.error(`❌ Lỗi khi ${actionText} tài khoản!`);
            }
        }
    };

    const handleViewDetails = (id) => {
        navigate(`/chi-tiet-tai-khoan/${id}`);
    };

    const handleEdit = (id) => {
        navigate(`/sua-tai-khoan/${id}`);
    };

    const getRoleAvatar = (avatarDb, vaiTro) => {
        if (avatarDb) return avatarDb;
        const role = vaiTro?.toUpperCase();
        if (role === 'ADMIN') return adminAvatar;
        if (role === 'KHO' || role === 'QUANLYKHO') return khoAvatar;
        if (role === 'MUAHANG') return 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        return 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    };

    return (
        <div className="tk-container">
            {/* Header Area */}
            <div className="tk-header-card">
                <div className="tk-title-area">
                    <h2 className="tk-title">Quản Lý Tài Khoản</h2>
                    <p className="tk-subtitle">Kiểm soát phân quyền và nhân sự hệ thống</p>
                </div>
                <button
                    className="tk-btn-toggle"
                    onClick={() => navigate('/them-tai-khoan')}
                >
                    <FiUserPlus /> Thêm Nhân Viên Mới
                </button>
            </div>

            {/* Table Card */}
            <div className="tk-table-wrapper">
                <table className="tk-table">
                    <thead>
                        <tr>
                            <th>Mã ND</th>
                            <th>Tài khoản</th>
                            <th>Họ Tên</th>
                            <th>Liên hệ</th>
                            <th>Cấp quyền</th>
                            <th className="align-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((acc) => {
                            const isUserOnline = acc.isOnline === true; 
                            const isLocked = acc.isLocked || acc.trangThai === false;
                            
                            // 🎯 ĐÃ THÊM: Biến kiểm tra xem user này có phải ADMIN không
                            const isAdmin = acc.vaiTro?.toUpperCase() === 'ADMIN';

                            return (
                                <tr key={acc.id || acc.maND} className={isLocked ? 'tk-row-locked' : ''}>
                                    <td className="tk-id-col">#{acc.id || acc.maND}</td>

                                    <td>
                                        <div className="tk-profile-cell">
                                            <div className="tk-avatar-wrapper">
                                                <img
                                                    src={getRoleAvatar(acc.avatar, acc.vaiTro)}
                                                    alt="avatar"
                                                    className={`tk-avatar ${isLocked ? 'grayscale' : ''}`}
                                                    onClick={() => setSelectedImage(getRoleAvatar(acc.avatar, acc.vaiTro))}
                                                />
                                                {!isLocked && <span className={`tk-status-dot ${isUserOnline ? 'online' : 'offline'}`}></span>}
                                            </div>
                                            <div className="tk-profile-info">
                                                <span className="tk-username">{acc.tenDangNhap}</span>
                                                <span className="tk-status-text">
                                                    {isLocked ? <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Bị Khóa</span> : (isUserOnline ? 'Online' : 'Offline')}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="tk-name-col">{acc.hoTen || 'N/A'}</td>

                                    <td className="tk-email-col">{acc.email || '---'}</td>

                                    <td>
                                        <select
                                            value={acc.vaiTro}
                                            disabled={isLocked} // Nếu bị khóa thì không cho đổi quyền
                                            onChange={(e) => handleUpdateRole(acc.maND || acc.id, e.target.value)}
                                            className={`tk-role-badge role-${acc.vaiTro?.toLowerCase()}`}
                                        >
                                            <option value="KHO">NV Kho</option>
                                            <option value="QUANLYKHO">Quản lý Kho</option>
                                            <option value="MUAHANG">NV Mua Hàng</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="NV_KD">NV Kinh Doanh</option>
                                        </select>
                                    </td>

                                    <td className="tk-actions-col">
                                        <div className="tk-action-buttons">
                                            {/* Nút Xem chi tiết (Ai cũng được xem) */}
                                            <button
                                                className="tk-btn-icon btn-eye"
                                                title="Xem chi tiết"
                                                onClick={() => handleViewDetails(acc.maND || acc.id)}
                                            >
                                                <FiEye />
                                            </button>

                                            {/* Nút Sửa (Ai cũng được sửa) */}
                                            <button
                                                className="tk-btn-icon btn-edit"
                                                title="Sửa thông tin"
                                                disabled={isLocked}
                                                onClick={() => handleEdit(acc.maND || acc.id)}
                                            >
                                                <FiEdit />
                                            </button>

                                            {/* Nút Đổi mật khẩu (Ai cũng được đổi) */}
                                            <button
                                                className="tk-btn-icon btn-key"
                                                title="Đổi mật khẩu"
                                                disabled={isLocked}
                                                onClick={() => handleUpdatePassword(acc.maND || acc.id)}
                                            >
                                                <FiKey />
                                            </button>

                                            {/* 🎯 ĐÃ SỬA: Chỉ hiển thị nút Khóa và nút Xóa nếu KHÔNG phải là ADMIN */}
                                            {!isAdmin && (
                                                <>
                                                    <button
                                                        className={`tk-btn-icon ${isLocked ? 'btn-unlock' : 'btn-lock'}`}
                                                        title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                                        onClick={() => handleToggleLock(acc.maND || acc.id, isLocked)}
                                                    >
                                                        {isLocked ? <FiUnlock /> : <FiLock />}
                                                    </button>

                                                    <button
                                                        className="tk-btn-icon btn-trash"
                                                        title="Xóa tài khoản"
                                                        onClick={() => handleDelete(acc.maND || acc.id)}
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="6" className="tk-empty-state">
                                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" alt="No data" width="60" />
                                    <p>Chưa có dữ liệu tài khoản nào!</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Image Zoom */}
            {selectedImage && (
                <div className="tk-modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="tk-modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="tk-modal-close" onClick={() => setSelectedImage(null)}><FiX /></span>
                        <img src={selectedImage} alt="Enlarged" className="tk-enlarged-img" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuanLyTaiKhoan;