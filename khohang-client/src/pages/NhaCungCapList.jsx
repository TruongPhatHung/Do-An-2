
import React, { useState, useEffect } from 'react';
import './NhaCungCapList.css';
import api from '../services/axiosConfig'; 
import { useNavigate } from 'react-router-dom';

const NhaCungCapList = () => {
    const [nhaCungCap, setNhaCungCap] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate(); // Khởi tạo điều hướng

    useEffect(() => {
       const fetchNCC = async () => {
            try {
                const response = await api.get('/nha-cung-cap');
                setNhaCungCap(response.data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách NCC:", error);
                alert("Không thể kết nối đến máy chủ để lấy dữ liệu Nhà cung cấp!");
            }
        };
        fetchNCC();
    }, []);
    // 2. ĐỊNH NGHĨA HÀM handleAdd (Để sửa lỗi bạn đang gặp)
    const handleAdd = () => {
        navigate('/add-supplier'); // Chuyển sang trang form thêm mới
    };

    // Chuyển sang trang form và truyền kèm dữ liệu của NCC đó để sửa
    const handleEdit = (ncc) => {
        navigate('/add-supplier', { state: { editData: ncc } });
    };
    // Xử lý xóa NCC
    const handleDelete = async (maNCC) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp mã ${maNCC}?`)) {
            try {
                // Giả sử endpoint xóa là /nha-cung-cap/:id hoặc /suppliers/:id
                await api.delete(`/nha-cung-cap/${maNCC}`); 
                alert("Xóa thành công!");
                fetchNCC(); // Tải lại danh sách sau khi xóa
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
                alert("Xóa thất bại! Vui lòng thử lại.");
            }
        }
    };


        // Logic tìm kiếm
        const filteredNCC = nhaCungCap.filter(ncc => 
            ncc.tenNCC.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ncc.maNCC.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Logic phân trang
        const totalPages = Math.ceil(filteredNCC.length / itemsPerPage);
        const currentItems = filteredNCC.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    return (
        <div className="ncc-container">
            <div className="ncc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Quản Lý Danh Mục Nhà Cung Cấp</h2>
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
                        // ĐỔI ncc.maNCC thành ncc.id để làm key cho chuẩn
                        <tr key={ncc.id}> 
                            <td className="text-bold">{ncc.maNCC}</td>
                            <td>{ncc.tenNCC}</td>
                            <td>{ncc.diaChi}</td>
                            <td style={{ textAlign: 'center' }}>
                                <button className="btn-edit" onClick={() => handleEdit(ncc)}>Sửa</button>
                                <button className="btn-delete" onClick={() => handleDelete(ncc.maNCC)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                    {currentItems.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy nhà cung cấp nào.</td>
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