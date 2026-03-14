import React, { useState, useEffect, useCallback } from 'react';
import './NhaCungCapList.css';
import api from '../services/axiosConfig'; 
import { useNavigate } from 'react-router-dom';

const NhaCungCapList = () => {
    const [nhaCungCap, setNhaCungCap] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    // 1. ĐƯA HÀM fetchNCC RA NGOÀI useEffect
    // Sử dụng useCallback để tránh tạo lại hàm vô ích
    const fetchNCC = useCallback(async () => {
        try {
            const response = await api.get('/suppliers');
            setNhaCungCap(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách NCC:", error);
        }
    }, []);

    useEffect(() => {
        fetchNCC();
    }, [fetchNCC]);

    const handleAdd = () => {
        navigate('/add-supplier'); 
    };

    const handleEdit = (ncc) => {
        navigate('/edit-supplier/:id', { state: { editData: ncc } });
    };

    // 2. SỬA HÀM DELETE: Nhận ID (số) để xóa và MA (chuỗi) để hiện thông báo
    const handleDelete = async (id, ma) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp mã ${ma}?`)) {
            try {

                // Backend nhận ID số: /api/suppliers/1
                await api.delete(`/suppliers/${id}`); 
                alert("✅ Xóa thành công!");
                fetchNCC(); // Gọi lại hàm lấy dữ liệu để cập nhật bảng

            } catch (error) {
                console.error("Lỗi khi xóa:", error);
                alert("❌ Xóa thất bại! Có thể NCC này đang có đơn hàng liên kết.");
            }
        }
    };

    // Logic tìm kiếm (thêm kiểm tra null để tránh crash)
    const filteredNCC = nhaCungCap.filter(ncc => 
        (ncc.tenNCC?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (ncc.maNCC?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    // Logic phân trang
    const totalPages = Math.ceil(filteredNCC.length / itemsPerPage);
    const currentItems = filteredNCC.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="ncc-container">
            <div className="ncc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>🏢 Quản Lý Danh Mục Nhà Cung Cấp</h2>
                <button className="btn-add-main" onClick={handleAdd}>
                    + Thêm NCC Mới
                </button>
            </div>
            
            <input 
                type="text" 
                className="search-bar"
                placeholder="Tìm theo mã hoặc tên nhà cung cấp..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />

            <table className="ncc-table">
                <thead>
                    <tr>
                        <th>Mã NCC</th>
                        <th>Tên Nhà Cung Cấp</th>
                        <th>Địa Chỉ</th>
                        <th style={{ textAlign: 'center' }}>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((ncc) => (
                        <tr key={ncc.id}> 
                            <td className="text-bold">{ncc.maNCC}</td>
                            <td>{ncc.tenNCC}</td>
                            <td>{ncc.diaChi}</td>
                            <td style={{ textAlign: 'center' }}>
                                <button className="btn-edit" onClick={() => handleEdit(ncc)}>Sửa</button>
                                {/* 3. TRUYỀN CẢ ID VÀ maNCC VÀO ĐÂY */}
                                <button 
                                    className="btn-delete" 
                                    onClick={() => handleDelete(ncc.id, ncc.maNCC)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                    {currentItems.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                Không tìm thấy nhà cung cấp nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>Trước</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>Sau</button>
                </div>
            )}
        </div>
    );
};

export default NhaCungCapList;