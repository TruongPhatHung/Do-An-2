import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './AdminLogs.css'; // Vẫn giữ để xài chung style cái Bảng (Table)
import './CategoryManager.css'; // Import file CSS mới tạo

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // State cho Form
    const [formData, setFormData] = useState({ id: null, maLoai: '', tenLoai: '', moTa: '' });
    const [isEditing, setIsEditing] = useState(false);

    // Lấy danh sách danh mục
    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Xử lý nhập liệu form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Bấm nút Lưu (Cho cả Thêm mới và Cập nhật)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/categories/${formData.id}`, formData);
                alert('Cập nhật thành công!');
            } else {
                await api.post('/categories', formData);
                alert('Thêm danh mục thành công!');
            }
            // Reset form và tải lại danh sách
            setFormData({ id: null, maLoai: '', tenLoai: '', moTa: '' });
            setIsEditing(false);
            fetchCategories();
        } catch (error) {
            console.error("Lỗi lưu danh mục:", error);
            alert('Có lỗi xảy ra, vui lòng thử lại!');
        }
    };

    // Bấm nút Sửa trên bảng
    const handleEdit = (category) => {
        setFormData(category);
        setIsEditing(true);
    };

    // Bấm nút Xóa trên bảng
    const handleDelete = async (id, tenLoai) => {
        if (window.confirm(`Bạn có chắc muốn xóa danh mục [${tenLoai}] không?`)) {
            try {
                await api.delete(`/categories/${id}`);
                alert('Đã xóa thành công!');
                fetchCategories();
            } catch (error) {
                console.error("Lỗi xóa:", error);
                alert('Không thể xóa! Có thể danh mục này đang chứa hàng hóa hoặc nhà cung cấp.');
            }
        }
    };

    if (loading) return <div className="loader">⏳ Đang tải...</div>;

    return (
        <div className="logs-container">
            <div className="logs-header">
                <h2>🏷️ Quản Lý Ngành Hàng / Danh Mục</h2>
                <p>Phân loại Hàng hóa và Nhà cung cấp theo từng lĩnh vực</p>
            </div>

            {/* FORM THÊM / SỬA */}
            <div className="category-form-container">
                <form onSubmit={handleSubmit} className="category-form">
                    <input
                        type="text"
                        name="maLoai"
                        placeholder="Mã Loại (VD: AUTO, FOOD)..."
                        value={formData.maLoai}
                        onChange={handleChange}
                        required
                        className="category-input"
                        disabled={isEditing}
                    />
                    <input
                        type="text"
                        name="tenLoai"
                        placeholder="Tên Ngành Hàng..."
                        value={formData.tenLoai}
                        onChange={handleChange}
                        required
                        className="category-input flex-1"
                    />
                    <input
                        type="text"
                        name="moTa"
                        placeholder="Mô tả ngắn gọn..."
                        value={formData.moTa}
                        onChange={handleChange}
                        className="category-input flex-1"
                    />

                    <button type="submit" className={`btn ${isEditing ? 'btn-update' : 'btn-add'}`}>
                        {isEditing ? '💾 Cập Nhật' : '➕ Thêm Mới'}
                    </button>

                    {isEditing && (
                        <button type="button" onClick={() => { setIsEditing(false); setFormData({ id: null, maLoai: '', tenLoai: '', moTa: '' }); }} className="btn btn-cancel">
                            Hủy
                        </button>
                    )}
                </form>
            </div>

            {/* BẢNG DANH SÁCH */}
            <div className="logs-table-wrapper">
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th>Mã Loại</th>
                            <th>Tên Ngành Hàng</th>
                            <th>Mô Tả</th>
                            <th width="150px">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id}>
                                <td><strong>{cat.maLoai}</strong></td>
                                <td className="text-highlight">{cat.tenLoai}</td>
                                <td>{cat.moTa}</td>
                                <td>
                                    <button onClick={() => handleEdit(cat)} className="btn btn-sm btn-edit">✏️ Sửa</button>
                                    <button onClick={() => handleDelete(cat.id, cat.tenLoai)} className="btn btn-sm btn-delete">🗑️ Xóa</button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan="4" className="empty-row">Chưa có danh mục nào. Hãy thêm mới ở phía trên!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryManager;