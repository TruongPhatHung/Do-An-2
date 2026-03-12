    import React, { useState, useEffect } from 'react';
    import './NhaCungCapList.css';
    import api from '../services/axiosConfig'; 

    const NhaCungCapList = () => {
        const [nhaCungCap, setNhaCungCap] = useState([]);
        const [searchTerm, setSearchTerm] = useState('');
        const [currentPage, setCurrentPage] = useState(1);
        const itemsPerPage = 5;

        useEffect(() => {
        const fetchNCC = async () => {
                try {
                    const response = await api.get('/suppliers');
                    setNhaCungCap(response.data);
                } catch (error) {
                    console.error("Lỗi khi tải danh sách NCC:", error);
                    alert("Không thể kết nối đến máy chủ để lấy dữ liệu Nhà cung cấp!");
                }
            };
            fetchNCC();
        }, []);

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
                <h2>Quản Lý Danh Mục Nhà Cung Cấp</h2>
                
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
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((ncc) => (
                        // ĐỔI ncc.maNCC thành ncc.id để làm key cho chuẩn
                        <tr key={ncc.id}> 
                            <td className="text-bold">{ncc.maNCC}</td>
                            <td>{ncc.tenNCC}</td>
                            <td>{ncc.diaChi}</td>
                        </tr>
                    ))}
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