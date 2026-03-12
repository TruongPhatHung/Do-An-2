import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './QuanLyTaiKhoan.css';

const QuanLyTaiKhoan = () => {
    const [users, setUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // State khởi tạo chuẩn
    const initialFormState = {
        tenDangNhap: '',
        hoTen: '',
        matKhau: '',
        vaiTro: 'KHO',
        email: ''
    };

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
            setNewUser(initialFormState); // Sửa lỗi: Reset toàn bộ bao gồm cả email
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
                            onChange={(e) => setNewUser({...newUser, tenDangNhap: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="tk-input-group">
                        <label>Họ Tên:</label>
                        <input 
                            placeholder="VD: Nguyễn Văn A" 
                            value={newUser.hoTen}
                            onChange={(e) => setNewUser({...newUser, hoTen: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="tk-input-group">
                        <label>Mật khẩu:</label>
                        <input 
                            type="password" 
                            placeholder="******" 
                            value={newUser.matKhau}
                            onChange={(e) => setNewUser({...newUser, matKhau: e.target.value})}
                            required 
                        />
                    </div>
                    
                    {/* ĐÂY CHÍNH LÀ Ô GMAIL BẠN CẦN */}
                    <div className="tk-input-group">
                        <label>Gmail:</label>
                        <input 
                            type="email" 
                            placeholder="abc@gmail.com" 
                            value={newUser.email} 
                            onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="tk-input-group">
                        <label>Vai trò:</label>
                        <select 
                            value={newUser.vaiTro}
                            onChange={(e) => setNewUser({...newUser, vaiTro: e.target.value})}
                        >
                            <option value="KHO">Nhân viên Kho</option>
                            <option value="QUANLYKHO">Quản lý Kho</option>
                            <option value="MUAHANG">Nhân viên Mua hàng</option>
                            <option value="ADMIN">Quản trị viên (Admin)</option>
                        </select>
                    </div>
                    
                    <div className="tk-input-group">
                        <label>&nbsp;</label> {/* Để trống label cho cân bằng nút bấm */}
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
                    {users.map((u) => (
                        <tr key={u.maND}>
                            <td className="ma-nd-text">{u.maND}</td>
                            <td><strong>{u.tenDangNhap}</strong></td>
                            <td>{u.hoTen}</td>
                            <td className="email-text">{u.email || 'Chưa có'}</td>
                            <td>
                                <select 
                                    className={`tk-select-role ${u.vaiTro}`}
                                    value={u.vaiTro}
                                    onChange={(e) => handleUpdateRole(u.maND, e.target.value)}
                                >
                                    <option value="KHO">KHO</option>
                                    <option value="MUAHANG">MUAHANG</option>
                                    <option value="QUANLYKHO">QUẢN LÝ KHO</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </td>
                            <td className="actions-cell">
                                <button onClick={() => handleUpdatePassword(u.maND)} className="tk-btn-password">
                                    Đổi MK
                                </button>
                                <button onClick={() => handleDelete(u.maND)} className="tk-btn-delete">
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default QuanLyTaiKhoan;