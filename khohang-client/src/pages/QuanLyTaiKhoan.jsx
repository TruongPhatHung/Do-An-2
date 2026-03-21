import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './QuanLyTaiKhoan.css';

const QuanLyTaiKhoan = () => {
    // 1. TÊN STATE LÀ 'users'
    const [users, setUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    const initialFormState = {
        tenDangNhap: '',
        hoTen: '',
        matKhau: '',
        vaiTro: 'KHO',
        email: ''
    };
    const [selectedImage, setSelectedImage] = useState(null);

    const [newUser, setNewUser] = useState(initialFormState);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            alert("✅ Tạo tài khoản nhân viên thành công!");
            setNewUser(initialFormState);
            setShowAddForm(false);
            fetchUsers();
        } catch (error) {
            alert("❌ Lỗi: Tên đăng nhập đã tồn tại hoặc dữ liệu không hợp lệ!");
        }
    };

    const handleUpdateRole = async (maND, newRole) => {
        if (!window.confirm(`Xác nhận nâng chức/đổi quyền thành ${newRole}?`)) return;
        try {
            await api.put(`/users/${maND}/role`, newRole, {
                headers: { 'Content-Type': 'application/json' }
            });
            alert(`✅ Đã đổi quyền thành ${newRole}`);
            fetchUsers();
        } catch (error) {
            alert("❌ Cập nhật quyền thất bại!");
        }
    };

    const handleUpdatePassword = async (maND) => {
        const newPw = window.prompt("🔑 Nhập mật khẩu mới cho nhân viên này:");
        if (newPw === null || newPw.trim() === "") return;

        if (newPw.length < 6) {
            alert("⚠️ Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }

        try {
            await api.put(`/users/${maND}/password`, newPw, {
                headers: { 'Content-Type': 'application/json' }
            });
            alert("✅ Đã cập nhật mật khẩu mới thành công!");
        } catch (error) {
            alert("❌ Lỗi khi đổi mật khẩu!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("❗ Bạn có chắc muốn xóa tài khoản này?")) {
            try {
                await api.delete(`/users/${id}`);
                alert("✅ Xóa thành công!");
                fetchUsers();
            } catch (error) {
                alert("❌ Xóa thất bại!");
            }
        }
    };
    const getRoleAvatar = (avatarDb, vaiTro) => {
        if (avatarDb) return avatarDb; // Nếu trong DB có ảnh thật thì ưu tiên dùng

        const role = vaiTro?.toUpperCase();
        if (role === 'ADMIN') return 'src/components/avarta/Screenshot 2026-03-21 185323 copy.png';
        if (role === 'KHO' || role === 'QUANLYKHO') return 'src/components/avarta/Screenshot 2026-03-21 185359.png';
        if (role === 'MUAHANG') return 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        return 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; // Mặc định
    };

    // FIX LỖI: Thêm hàm handleEdit tạm thời để không bị lỗi ReferenceError
    const handleEdit = (user) => {
        alert("Chức năng sửa thông tin đang được cập nhật!");
        // Nếu bạn muốn làm tính năng sửa, có thể set dữ liệu user vào form ở đây
    };

    return (
        <div className="tk-container">
            <div className="tk-header">
                <h2 className="tk-title">👥 Quản lý Thông tin Tài khoản</h2>
                <button
                    className={`tk-btn-add-toggle ${showAddForm ? 'close' : ''}`}
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? "✖ Đóng Form" : "➕ Thêm Nhân Viên Mới"}
                </button>
            </div>

            {showAddForm && (
                <div className="tk-add-card">
                    <h3>➕ Tạo Tài Khoản Mới</h3>
                    <form onSubmit={handleAddUser} className="tk-form-grid">
                        <div className="tk-input-group">
                            <label>Tên đăng nhập:</label>
                            <input
                                placeholder="VD: staff01"
                                value={newUser.tenDangNhap}
                                onChange={(e) => setNewUser({ ...newUser, tenDangNhap: e.target.value })}
                                required
                            />
                        </div>
                        <div className="tk-input-group">
                            <label>Họ Tên:</label>
                            <input
                                placeholder="VD: Nguyễn Văn A"
                                value={newUser.hoTen}
                                onChange={(e) => setNewUser({ ...newUser, hoTen: e.target.value })}
                                required
                            />
                        </div>
                        <div className="tk-input-group">
                            <label>Mật khẩu:</label>
                            <input
                                type="password"
                                placeholder="******"
                                value={newUser.matKhau}
                                onChange={(e) => setNewUser({ ...newUser, matKhau: e.target.value })}
                                required
                            />
                        </div>

                        <div className="tk-input-group">
                            <label>Gmail:</label>
                            <input
                                type="email"
                                placeholder="abc@gmail.com"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="tk-input-group">
                            <label>Vai trò:</label>
                            <select
                                value={newUser.vaiTro}
                                onChange={(e) => setNewUser({ ...newUser, vaiTro: e.target.value })}
                            >
                                <option value="KHO">Nhân viên Kho</option>
                                <option value="QUANLYKHO">Quản lý Kho</option>
                                <option value="MUAHANG">Nhân viên Mua hàng</option>
                                <option value="ADMIN">Quản trị viên (Admin)</option>
                            </select>
                        </div>

                        <div className="tk-input-group">
                            <label>&nbsp;</label>
                            <button type="submit" className="tk-btn-save">💾 Lưu tài khoản</button>
                        </div>
                    </form>
                </div>
            )}

            <table className="tk-table">
                <thead>
                    <tr>
                        <th>Mã ND</th>
                        <th>Tên đăng nhập</th>
                        <th>Họ Tên</th>
                        <th>Gmail</th>
                        <th>Vai trò (Cấp quyền)</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {/* FIX LỖI: Đổi taiKhoans thành users */}
                    {users.map((acc) => (
                        <tr key={acc.id || acc.maND}>
                            <td style={{ fontWeight: 'bold', color: '#7f8c8d' }}>
                                {acc.id || acc.maND}
                            </td>
                            <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* 🎯 SỬA LẠI THẺ IMG: Thêm onClick và cursor pointer */}
                                <img
                                    src={getRoleAvatar(acc.avatar, acc.vaiTro)}
                                    alt="avatar"
                                    className="avatar-circle"
                                    style={{ cursor: 'zoom-in' }} // Đổi con trỏ chuột thành kính lúp
                                    onClick={() => setSelectedImage(getRoleAvatar(acc.avatar, acc.vaiTro))}
                                />
                                <span style={{ fontWeight: 'bold', color: '#2980b9' }}>
                                    {acc.tenDangNhap}
                                </span>
                            </td>
                            <td>{acc.hoTen || 'N/A'}</td>
                            <td>{acc.email || '---'}</td>
                            <td>
                                <select
                                    value={acc.vaiTro}
                                    onChange={(e) => handleUpdateRole(acc.maND || acc.id, e.target.value)}
                                    className={`role-select role-${acc.vaiTro?.toLowerCase()}`}
                                >
                                    <option value="KHO">Nhân viên Kho</option>
                                    <option value="QUANLYKHO">Quản lý Kho</option>
                                    <option value="MUAHANG">Nhân viên Mua hàng</option>
                                    <option value="ADMIN">Quản trị viên (Admin)</option>
                                </select>
                            </td>
                            <td>
                                {/* GỌI ĐÚNG CÁC HÀM CÓ SẴN */}
                                <button className="btn-edit" onClick={() => handleUpdatePassword(acc.maND || acc.id)}>Đổi MK</button>
                                <button className="btn-delete" onClick={() => handleDelete(acc.maND || acc.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Không có tài khoản nào!</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {selectedImage && (
                <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-modal-btn" onClick={() => setSelectedImage(null)}>✖</span>
                        <img src={selectedImage} alt="Enlarged Avatar" className="enlarged-avatar" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuanLyTaiKhoan;