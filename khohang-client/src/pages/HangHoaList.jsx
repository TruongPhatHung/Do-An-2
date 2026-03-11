import React, { useState, useEffect, useContext } from 'react';
import api from '../services/axiosConfig'; 
import { AuthContext } from '../Context/AuthContext';
import './HangHoaList.css';
import {useNavigate} from 'react-router-dom';

const HangHoaList = () => {
    const [hangHoa, setHangHoa] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- LOGIC PHÂN TRANG: Khai báo State ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Giới hạn 5 sản phẩm 1 trang để test

    useEffect(() => {
        
        // --- SAU NÀY DEV A LÀM XONG API THÌ BẠN MỞ COMMENT ĐOẠN NÀY ---
        
        const fetchHangHoa = async () => {
            try {
                const response = await api.get('/hang-hoa'); // Đảm bảo endpoint đúng với backend
                setHangHoa(response.data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách hàng hóa:", error);
                alert("Không thể kết nối đến máy chủ để lấy dữ liệu Hàng hóa!");
            }
        };
        fetchHangHoa();
        
    }, []);

    // 1. Lọc dữ liệu theo từ khóa tìm kiếm
    const filteredHangHoa = hangHoa.filter(item => 
        item.tenHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.maHang.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Tính toán phân trang dựa trên mảng đã lọc
    const totalPages = Math.ceil(filteredHangHoa.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    // Cắt mảng để chỉ lấy các sản phẩm của trang hiện tại
    const currentItems = filteredHangHoa.slice(indexOfFirstItem, indexOfLastItem);

    // Hàm chuyển trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Reset về trang 1 nếu người dùng gõ tìm kiếm
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="hanghoa-container">
            <h2>Quản Lý Danh Mục Hàng Hóa</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <input 
                type="text" 
                className="search-bar"
                placeholder="Tìm theo mã hoặc tên hàng..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ margin: 0, width: '300px' }} // Tùy chỉnh CSS chút cho đẹp
            />
            {/* NÚT THÊM HÀNG HÓA */}
                {(user?.role === 'ADMIN' || user?.role === 'MUAHANG') && (
                    <button 
                        style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => navigate('/them-hang-hoa')}
                    >
                        + Thêm Hàng Hóa
                    </button>
                )}
            </div>

            <table className="hanghoa-table">
                <thead>
                    <tr>
                        <th>Mã Hàng</th>
                        <th>Tên Hàng</th>
                        <th>Đơn Vị Tính</th>
                        <th>Số Lượng Tồn</th>
                        <th>Định Mức Tối Thiểu</th>
                        {(user?.role === 'ADMIN' || user?.role === 'MUAHANG') && (
                            <th>Giá Nhập</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {/* Render currentItems thay vì toàn bộ filteredHangHoa */}
                    {currentItems.map((item) => (
                        <tr 
                            key={item.maHang} 
                            className={item.soLuongTon < item.soLuongToiThieu ? 'row-warning' : 'row-normal'}
                        >
                            <td>{item.maHang}</td>
                            <td>{item.tenHang}</td>
                            <td>{item.donViTinh}</td>
                            <td className="text-bold">{item.soLuongTon}</td>
                            <td>{item.soLuongToiThieu}</td>
                            {(user?.role === 'ADMIN' || user?.role === 'MUAHANG') && (
                                <td>{item.giaNhap.toLocaleString()} VNĐ</td>
                            )}
                        </tr>
                    ))}
                    
                    {currentItems.length === 0 && (
                        <tr>
                            <td colSpan="6" className="empty-message">Không tìm thấy hàng hóa nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* --- GIAO DIỆN NÚT PHÂN TRANG --- */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        className="page-btn" 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Trước
                    </button>
                    
                    {/* Tạo danh sách các nút số trang */}
                    {[...Array(totalPages)].map((_, index) => (
                        <button 
                            key={index + 1}
                            className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => paginate(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button 
                        className="page-btn" 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default HangHoaList;