import React, { useState, useEffect, useCallback } from 'react';
import './NhaCungCapList.css';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    Search, Plus, Building2, Package, 
    Edit, Trash2, ChevronDown, ChevronUp, Mail, MapPin 
} from 'lucide-react';

const NhaCungCapList = () => {
    const [nhaCungCap, setNhaCungCap] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const itemsPerPage = 20;
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
        if (window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp mã ${ma} và toàn bộ hàng hóa liên quan không?`)) {
            try {
                await api.delete(`/suppliers/${id}`);
                toast.success("Xóa thành công!");
                fetchNCC();
                if (currentItems.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                }
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
                toast.error("Xóa thất bại! Có thể NCC này đang có đơn hàng liên kết.");
            }
        }
    };

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
        <div className="ncc-page-wrapper">
            <div className="ncc-container">
                {/* Header */}
                <div className="ncc-header-section">
                    <div className="header-title">
                        <div className="icon-wrapper">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2>Quản Lý Nhà Cung Cấp</h2>
                            <p className="sub-title">Quản lý danh sách và thông tin đối tác cung cấp hàng hóa</p>
                        </div>
                    </div>
                    <button className="btn-add-main" onClick={handleAdd}>
                        <Plus size={18} /> Thêm Mới
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="toolbar-section">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="Tìm kiếm theo mã, tên, email hoặc ngành hàng..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                {/* Bảng Dữ Liệu */}
                <div className="table-card">
                    <div className="table-responsive">
                        <table className="ncc-table">
                            <thead>
                                <tr>
                                    <th>Mã NCC</th>
                                    <th>Tên Nhà Cung Cấp</th>
                                    <th>Lĩnh Vực</th>
                                    <th>Thông Tin Liên Hệ</th>
                                    <th style={{ textAlign: 'center' }}>Mặt Hàng</th>
                                    <th style={{ textAlign: 'right' }}>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((ncc) => (
                                    <React.Fragment key={ncc.id}>
                                        <tr className={`main-row ${expandedRowId === ncc.id ? 'is-expanded' : ''}`}>
                                            <td>
                                                <span className="ma-ncc-badge">{ncc.maNCC}</span>
                                            </td>
                                            <td className="font-medium text-dark">{ncc.tenNCC}</td>
                                            <td>
                                                <span className="badge-category">
                                                    {ncc.loaiHang ? ncc.loaiHang.tenLoai : 'Chưa phân loại'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="contact-info">
                                                    <div className="contact-item" title={ncc.email}>
                                                        <Mail size={14} /> <span>{ncc.email || 'N/A'}</span>
                                                    </div>
                                                    <div className="contact-item text-muted" title={ncc.diaChi}>
                                                        <MapPin size={14} /> <span>{ncc.diaChi}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div className="item-count-wrapper">
                                                    <div className="badge-count">
                                                        <Package size={14} />
                                                        <span>{ncc.danhSachHangHoa ? ncc.danhSachHangHoa.length : 0}</span>
                                                    </div>
                                                    {ncc.danhSachHangHoa && ncc.danhSachHangHoa.length > 0 && (
                                                        <button 
                                                            className={`btn-toggle-items ${expandedRowId === ncc.id ? 'active' : ''}`}
                                                            onClick={() => toggleRow(ncc.id)}
                                                            title="Xem chi tiết mặt hàng"
                                                        >
                                                            {expandedRowId === ncc.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="action-buttons">
                                                    <button className="btn-icon edit" onClick={() => handleEdit(ncc)} title="Sửa">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button className="btn-icon delete" onClick={() => handleDelete(ncc.id, ncc.maNCC)} title="Xóa">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Sub-table mở rộng */}
                                        {expandedRowId === ncc.id && (
                                            <tr className="expanded-row">
                                                <td colSpan="6">
                                                    <div className="sub-table-container">
                                                        <div className="sub-table-header">
                                                            <Package size={16} className="text-blue" />
                                                            <h4>Danh sách mặt hàng cung cấp</h4>
                                                        </div>
                                                        <table className="sub-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Mã Hàng</th>
                                                                    <th>Tên Mặt Hàng</th>
                                                                    <th style={{ textAlign: 'right' }}>Đơn Giá</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {ncc.danhSachHangHoa.map((hangHoa, index) => (
                                                                    <tr key={hangHoa.id || index}>
                                                                        <td className="text-gray-600 font-medium">{hangHoa.maHang}</td>
                                                                        <td className="text-dark">{hangHoa.tenHang || hangHoa.tenMatHang}</td>
                                                                        <td style={{ textAlign: 'right' }} className="price-text">
                                                                            {hangHoa.giaBan || hangHoa.giaGoc ? `${(hangHoa.giaBan || hangHoa.giaGoc).toLocaleString('vi-VN')} đ` : 'N/A'}
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
                                        <td colSpan="6" className="empty-state">
                                            <div className="empty-state-content">
                                                <Package size={48} className="empty-icon" />
                                                <p>Không tìm thấy nhà cung cấp nào.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button className="page-btn" onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>Trước</button>
                        <div className="page-numbers">
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} className={`page-btn num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button className="page-btn" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>Sau</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NhaCungCapList;