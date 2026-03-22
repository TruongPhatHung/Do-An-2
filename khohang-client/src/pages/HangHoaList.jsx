import React, { useState, useEffect, useContext } from 'react';
import api from '../services/axiosConfig';
import { AuthContext } from '../Context/AuthContext';
import './HangHoaList.css';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiEdit, FiAlertCircle } from 'react-icons/fi'; // Thêm icon

const HangHoaList = () => {
    const [hangHoa, setHangHoa] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchHangHoa = async () => {
            try {
                const response = await api.get('/products');
                setHangHoa(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Lỗi khi tải danh sách hàng hóa:", error);
                setHangHoa([]); 
            }
        };
        fetchHangHoa();
    }, []);

    const filteredHangHoa = hangHoa.filter(item => {
        if (!item) return false;
        const term = searchTerm.toLowerCase();
        const matchTen = (item.tenHang || "").toLowerCase().includes(term);
        const matchMa = (item.maHang || "").toLowerCase().includes(term);
        const matchLoai = (item.loaiHang?.tenLoai || "").toLowerCase().includes(term);
        return matchTen || matchMa || matchLoai;
    });

    const totalPages = Math.ceil(filteredHangHoa.length / itemsPerPage);
    const currentItems = filteredHangHoa.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="hanghoa-container">
            <div className="hanghoa-header">
                <h2>📦 Quản Lý Danh Mục Hàng Hóa</h2>
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Tìm theo mã, tên hoặc loại hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="hanghoa-table">
                    <thead>
                        <tr>
                            <th>Mã Hàng</th>
                            <th>Tên Hàng</th>
                            <th>Loại Hàng</th>
                            <th>Đơn Vị Tính</th>
                            <th>Số Lượng Tồn</th>
                            <th>Định Mức</th>
                            {(user?.role === 'ADMIN' || user?.role === 'MUAHANG') && (
                                <th>Giá Nhập</th>
                            )}
                            <th style={{ textAlign: 'center' }}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item) => {
                            // Kiểm tra cảnh báo tồn kho
                            const isLowStock = (item.soLuongTon || 0) < (item.soLuongToiThieu || 0);

                            return (
                                <tr key={item.maHang || Math.random()}>
                                    <td className="font-medium">{item.maHang || 'N/A'}</td>
                                    <td>{item.tenHang || 'Không tên'}</td>

                                    <td>
                                        <span className="badge-category">
                                            {item.loaiHang ? item.loaiHang.tenLoai : 'Chưa phân loại'}
                                        </span>
                                    </td>

                                    <td>{item.donViTinh || 'Cái'}</td>
                                    
                                    {/* Cột Số lượng tồn với Icon Cảnh báo */}
                                    <td>
                                        <div className={isLowStock ? "stock-warning" : "stock-normal"}>
                                            {item.soLuongTon ?? 0}
                                            {isLowStock && <FiAlertCircle className="warning-icon" title="Sắp hết hàng!" />}
                                        </div>
                                    </td>
                                    
                                    <td className="text-muted">{item.soLuongToiThieu ?? 0}</td>

                                    {(user?.role === 'ADMIN' || user?.role === 'MUAHANG') && (
                                        <td className="price-text">
                                            {item.giaNhap ? item.giaNhap.toLocaleString() : '0'} VNĐ
                                        </td>
                                    )}

                                    <td className="action-buttons">
                                        <button
                                            className="btn-action btn-view"
                                            onClick={() => navigate(`/product-detail/${item.maHang}`)}
                                            title="Xem chi tiết"
                                        >
                                            <FiEye /> Xem
                                        </button>
                                        <button
                                            className="btn-action btn-edit"
                                            onClick={() => navigate(`/edit-product/${item.maHang}`)}
                                            title="Chỉnh sửa"
                                        >
                                            <FiEdit /> Sửa
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {currentItems.length === 0 && (
                            <tr>
                                <td colSpan="8" className="empty-message">
                                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" alt="Empty" width="60" style={{opacity: 0.5, marginBottom: '10px'}}/>
                                    <p>Không tìm thấy hàng hóa nào phù hợp.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button className="page-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Trước</button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button key={index + 1} className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => paginate(index + 1)}>
                            {index + 1}
                        </button>
                    ))}
                    <button className="page-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Sau</button>
                </div>
            )}
        </div>
    );
};

export default HangHoaList;