import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './CategoryManager.css';
import { toast } from 'react-toastify';
import { FiLayers, FiTag, FiAlignLeft, FiPlus, FiSave, FiX, FiEdit2, FiTrash2, FiBox } from 'react-icons/fi';

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
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
            toast.error('Không thể tải dữ liệu danh mục!');
        } finally {
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
                toast.success('✅ Cập nhật danh mục thành công!');
            } else {
                await api.post('/categories', formData);
                toast.success('✅ Thêm danh mục mới thành công!');
            }
            // Reset form và tải lại danh sách
            setFormData({ id: null, maLoai: '', tenLoai: '', moTa: '' });
            setIsEditing(false);
            fetchCategories();
        } catch (error) {
            console.error("Lỗi lưu danh mục:", error);
            toast.error('❌ Có lỗi xảy ra, vui lòng kiểm tra lại!');
        }
    };

    // Bấm nút Sửa trên bảng
    const handleEdit = (category) => {
        setFormData(category);
        setIsEditing(true);
        // Cuộn mượt lên trên cùng form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Bấm nút Xóa trên bảng
    const handleDelete = async (id, tenLoai) => {
        if (window.confirm(`⚠️ CẢNH BÁO: Bạn có chắc muốn xóa danh mục [${tenLoai}]?\n\nHành động này không thể hoàn tác!`)) {
            try {
                await api.delete(`/categories/${id}`);
                toast.success('✅ Đã xóa thành công!');
                fetchCategories();
            } catch (error) {
                console.error("Lỗi xóa:", error);
                toast.error('❌ Không thể xóa! Có thể danh mục này đang chứa hàng hóa hoặc nhà cung cấp.');
            }
        }
    };

    return (
        <div className="cm-container">
            <div className="cm-header">
                <div className="cm-title-box">
                    <h2><FiLayers className="cm-title-icon" /> Quản Lý Danh Mục & Ngành Hàng</h2>
                    <p>Phân loại và tổ chức hệ thống hàng hóa chuyên nghiệp</p>
                </div>
            </div>

            {/* FORM THÊM / SỬA */}
            <div className="cm-form-card">
                <div className="cm-card-header">
                    <h3>{isEditing ? 'Sửa Thông Tin Danh Mục' : 'Thêm Danh Mục Mới'}</h3>
                </div>
                <form onSubmit={handleSubmit} className="cm-form">
                    <div className="cm-form-grid">
                        <div className="cm-input-group">
                            <label><FiTag /> Mã Loại</label>
                            <input
                                type="text"
                                name="maLoai"
                                placeholder="VD: AUTO, FOOD..."
                                value={formData.maLoai}
                                onChange={handleChange}
                                required
                                className="cm-input"
                                disabled={isEditing} // Không cho sửa mã khi đang edit
                            />
                        </div>
                        <div className="cm-input-group">
                            <label><FiBox /> Tên Ngành Hàng</label>
                            <input
                                type="text"
                                name="tenLoai"
                                placeholder="VD: Phụ tùng ô tô..."
                                value={formData.tenLoai}
                                onChange={handleChange}
                                required
                                className="cm-input"
                            />
                        </div>
                        <div className="cm-input-group full-width">
                            <label><FiAlignLeft /> Mô Tả Chi Tiết</label>
                            <input
                                type="text"
                                name="moTa"
                                placeholder="Nhập mô tả ngắn gọn cho ngành hàng này..."
                                value={formData.moTa}
                                onChange={handleChange}
                                className="cm-input"
                            />
                        </div>
                    </div>

                    <div className="cm-form-actions">
                        <button type="submit" className={`cm-btn ${isEditing ? 'cm-btn-update' : 'cm-btn-add'}`}>
                            {isEditing ? <><FiSave /> Cập Nhật Dữ Liệu</> : <><FiPlus /> Thêm Danh Mục</>}
                        </button>

                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setFormData({ id: null, maLoai: '', tenLoai: '', moTa: '' }); }}
                                className="cm-btn cm-btn-cancel"
                            >
                                <FiX /> Hủy Bỏ
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* BẢNG DANH SÁCH */}
            <div className="cm-table-wrapper">
                <table className="cm-table">
                    <thead>
                        <tr>
                            <th width="15%">Mã Loại</th>
                            <th width="30%">Tên Ngành Hàng</th>
                            <th width="40%">Mô Tả</th>
                            <th width="15%" className="text-center">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="cm-loading">⏳ Đang tải dữ liệu...</td></tr>
                        ) : categories.length > 0 ? (
                            categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td>
                                        <span className="cm-badge-id">{cat.maLoai}</span>
                                    </td>
                                    <td className="cm-highlight-text">{cat.tenLoai}</td>
                                    <td className="cm-desc-text">{cat.moTa || <span className="text-muted">Chưa có mô tả</span>}</td>
                                    <td>
                                        <div className="cm-action-buttons">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="cm-btn-icon btn-edit"
                                                title="Sửa danh mục"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id, cat.tenLoai)}
                                                className="cm-btn-icon btn-delete"
                                                title="Xóa danh mục"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="cm-empty-state">
                                    <FiBox className="cm-empty-icon" />
                                    <p>Chưa có danh mục nào. Hãy thêm mới ở form phía trên!</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryManager;