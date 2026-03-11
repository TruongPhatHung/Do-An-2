import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './QuanLyTaiKhoan.css'; // <--- Đã import CSS

const QuanLyTaiKhoan = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách user:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa tài khoản này?")) {
            try {
                await api.delete(`/users/${id}`);
                alert("Xóa thành công!");
                fetchUsers();
            } catch (error) {
                alert("Xóa thất bại!");
            }
        }
    };

    return (
        <div className="tk-container">
            <h2 className="tk-title">👥 Quản lý Thông tin Tài khoản</h2>
            
            <table className="tk-table">
                <thead>
                    <tr>
                        <th>Mã ND</th>
                        <th>Tên đăng nhập</th>
                        <th>Họ Tên</th>
                        <th>Vai trò</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.maND}>
                            <td>{u.maND}</td>
                            <td>{u.tenDangNhap}</td>
                            <td>{u.hoTen}</td>
                            <td>
                                {/* Tự động đổi màu dựa vào vai trò */}
                                <span className={`tk-role ${u.vaiTro === 'ADMIN' ? 'admin' : 'user'}`}>
                                    {u.vaiTro || 'USER'}
                                </span>
                            </td>
                            <td>
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