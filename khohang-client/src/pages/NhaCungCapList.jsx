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

    // Truyền dữ liệu sang trang Sửa
    const handleEdit = (ncc) => {
        navigate('/add-supplier', { state: { editData: ncc } });
    };

    const handleDelete = async (id, ma) => {
        if (window.confirm(`❗ Bạn có chắc chắn muốn xóa nhà cung cấp mã ${ma} và toàn bộ hàng hóa liên quan không?`)) {
            try {
                await api.delete(`/suppliers/${id}`); 
                alert("✅ Xóa thành công!");
                fetchNCC(); 
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
                alert("❌ Xóa thất bại! Có thể NCC này đang có đơn hàng liên kết.");
            }
        }
    };

    const filteredNCC = nhaCungCap.filter(ncc => 
        (ncc.tenNCC?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (ncc.maNCC?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (ncc.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

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
                placeholder="Tìm theo mã, tên hoặc gmail..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />

            <table className="ncc-table">
                <thead>
                    <tr>
                        <th>Mã NCC</th>
                        <th>Tên Nhà Cung Cấp</th>
                        <th>Địa Chỉ</th>
                        <th>Gmail</th>
                        <th style={{ textAlign: 'center' }}>Số Lượng Mặt Hàng</th> {/* Báo hiệu NCC đó có bao nhiêu món */}
                        <th style={{ textAlign: 'center' }}>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((ncc) => (
                        <tr key={ncc.id}> 
                            <td className="text-bold">{ncc.maNCC}</td>
                            <td>{ncc.tenNCC}</td>
                            <td>{ncc.diaChi}</td>
                            <td style={{ color: '#2980b9' }}>{ncc.email || 'N/A'}</td>
                            
                            {/* Hiển thị số lượng hàng hóa con */}
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                <span style={{ background: '#ecf0f1', padding: '5px 10px', borderRadius: '15px' }}>
                                    {ncc.danhSachHangHoa ? ncc.danhSachHangHoa.length : 0} món
                                </span>
                            </td>

                            <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <button className="btn-edit" onClick={() => handleEdit(ncc)}>Sửa</button>
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
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
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