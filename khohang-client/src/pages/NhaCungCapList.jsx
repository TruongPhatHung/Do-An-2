import React, { useState, useEffect, useCallback } from 'react';
import './NhaCungCapList.css';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';

const NhaCungCapList = () => {
    const [nhaCungCap, setNhaCungCap] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRowId, setExpandedRowId] = useState(null); // State quản lý dòng đang mở rộng
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

    const handleEdit = (ncc) => {
        navigate(`/edit-supplier/${ncc.id}`);
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

    // Hàm bật/tắt hiển thị hàng hóa con
    const toggleRow = (id) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    const filteredNCC = nhaCungCap.filter(ncc => {
        const term = searchTerm.toLowerCase();
        return (
            (ncc.tenNCC?.toLowerCase() || "").includes(term) ||
            (ncc.maNCC?.toLowerCase() || "").includes(term) ||
            (ncc.email?.toLowerCase() || "").includes(term) ||
            (ncc.loaiHang?.tenLoai?.toLowerCase() || "").includes(term)
        );
    });

    const totalPages = Math.ceil(filteredNCC.length / itemsPerPage);
    const currentItems = filteredNCC.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="ncc-container">
            <div className="ncc-header-section">
                <h2>🏢 Quản Lý Danh Mục Nhà Cung Cấp</h2>
                <button className="btn-add-main" onClick={handleAdd}>
                    + Thêm NCC Mới
                </button>
            </div>

            <div className="search-wrapper">
                <input
                    type="text"
                    className="search-bar"
                    placeholder="🔍 Tìm theo mã, tên, email hoặc ngành hàng..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>

            <div className="table-responsive">
                <table className="ncc-table">
                    <thead>
                        <tr>
                            <th>Mã NCC</th>
                            <th>Tên Nhà Cung Cấp</th>
                            <th>Lĩnh Vực / Loại Hàng</th>
                            <th>Địa Chỉ</th>
                            <th>Gmail</th>
                            <th style={{ textAlign: 'center' }}>Số Lượng Mặt Hàng</th>
                            <th style={{ textAlign: 'center' }}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((ncc) => (
                            <React.Fragment key={ncc.id}>
                                <tr>
                                    <td className="text-bold">{ncc.maNCC}</td>
                                    <td>{ncc.tenNCC}</td>
                                    <td>
                                        <span className="badge-category">
                                            {ncc.loaiHang ? ncc.loaiHang.tenLoai : 'Chưa phân loại'}
                                        </span>
                                    </td>
                                    <td>{ncc.diaChi}</td>
                                    <td className="email-cell">{ncc.email || 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="item-count-wrapper">
                                            <span className="badge-count">
                                                {ncc.danhSachHangHoa ? ncc.danhSachHangHoa.length : 0} món
                                            </span>
                                            {ncc.danhSachHangHoa && ncc.danhSachHangHoa.length > 0 && (
                                                <button 
                                                    className="btn-toggle-items" 
                                                    onClick={() => toggleRow(ncc.id)}
                                                    title="Xem các mặt hàng"
                                                >
                                                    {expandedRowId === ncc.id ? '▲ Đóng' : '▼ Xem'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                        <button className="btn-edit" onClick={() => handleEdit(ncc)}>Sửa</button>
                                        <button className="btn-delete" onClick={() => handleDelete(ncc.id, ncc.maNCC)}>Xóa</button>
                                    </td>
                                </tr>

                                {/* Dòng Mở Rộng Để Hiển Thị Danh Sách Mặt Hàng */}
                                {expandedRowId === ncc.id && (
                                    <tr className="expanded-row">
                                        <td colSpan="7">
                                            <div className="sub-table-container">
                                                <h4>📦 Chi tiết mặt hàng của {ncc.tenNCC}</h4>
                                                <table className="sub-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Mã Hàng</th>
                                                            <th>Tên Mặt Hàng</th>
                                                            <th>Đơn Giá / Giá Bán</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {ncc.danhSachHangHoa.map((hangHoa, index) => (
                                                            <tr key={hangHoa.id || index}>
                                                                <td className="text-bold">{hangHoa.maHang}</td>
                                                                <td>{hangHoa.tenHang || hangHoa.tenMatHang}</td>
                                                                <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                                                                    {hangHoa.giaBan || hangHoa.giaGoc ? `${(hangHoa.giaBan || hangHoa.giaGoc).toLocaleString('vi-VN')} VNĐ` : 'N/A'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {currentItems.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
                                    Không tìm thấy nhà cung cấp nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button className="page-btn" onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>Trước</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                        </button>
                    ))}
                    <button className="page-btn" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>Sau</button>
                </div>
            )}
        </div>
    );
};

export default NhaCungCapList;