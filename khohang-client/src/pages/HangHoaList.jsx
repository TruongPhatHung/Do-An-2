import React, { useState, useEffect, useContext } from 'react';
import api from '../services/axiosConfig';
import { AuthContext } from '../Context/AuthContext';
import './HangHoaList.css';
import { useNavigate } from 'react-router-dom';

const HangHoaList = () => {
    const [hangHoa, setHangHoa] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchHangHoa = async () => {
            try {
                const response = await api.get('/products');
                // Đảm bảo dữ liệu luôn là mảng để không bị lỗi .filter hoặc .map
                setHangHoa(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Lỗi khi tải danh sách hàng hóa:", error);
                setHangHoa([]); // Trả về mảng rỗng nếu lỗi API
            }
        };
        fetchHangHoa();
    }, []);

    // 1. Lọc dữ liệu kèm theo kiểm tra null (Null-safe filtering)
    const filteredHangHoa = hangHoa.filter(item => {
        if (!item) return false;
        const term = searchTerm.toLowerCase();

        // Dùng Optional Chaining (?.) và Default Value ("") để tránh lỗi toLowerCase() của null
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
            <h2>📦 Quản Lý Danh Mục Hàng Hóa</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Tìm theo mã, tên hoặc loại hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ margin: 0, width: '350px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

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
                    {currentItems.map((item) => (
                        <tr
                            key={item.maHang || Math.random()} // Đảm bảo luôn có key
                            className={(item.soLuongTon || 0) < (item.soLuongToiThieu || 0) ? 'row-warning' : 'row-normal'}
                        >
                            <td>{item.maHang || 'N/A'}</td>
                            <td>{item.tenHang || 'Không tên'}</td>

                            <td>
                                <span style={{ backgroundColor: '#e8f4f8', color: '#2980b9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                    {item.loaiHang ? item.loaiHang.tenLoai : 'Chưa phân loại'}
                                </span>
                            </td>

                            <td>{item.donViTinh || 'Cái'}</td>
                            <td style={{ fontWeight: 'bold' }}>{item.soLuongTon ?? 0}</td>
                            <td>{item.soLuongToiThieu ?? 0}</td>

                            {(user?.role === 'ADMIN' || user?.role === 'MUAHANG') && (
                                <td style={{ color: '#d35400', fontWeight: 'bold' }}>
                                    {/* SỬA LỖI Ở ĐÂY: Kiểm tra giaNhap trước khi toLocaleString */}
                                    {item.giaNhap ? item.giaNhap.toLocaleString() : '0'} VNĐ
                                </td>
                            )}

                            <td style={{ textAlign: 'center' }}>
                                <button
                                    onClick={() => navigate(`/product-detail/${item.maHang}`)} // Dấu huyền ``
                                    style={{ padding: '5px 10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Xem
                                </button>
                                <button
                                    onClick={() => navigate(`/edit-product/${item.maHang}`)}
                                    style={{ padding: '5px 8px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Sửa
                                </button>
                            </td>
                        </tr>
                    ))}

                    {currentItems.length === 0 && (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                                Không tìm thấy hàng hóa nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

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