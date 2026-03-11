import React, { useState, useEffect } from 'react';
import './NhaCungCapList.css';
// import api from '../services/axiosConfig'; // Tạm thời bạn có thể chưa cần dòng này nếu chưa gọi API

const NhaCungCapList = () => {
    const [nhaCungCap, setNhaCungCap] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Dữ liệu giả Nhà cung cấp theo thiết kế hệ thống [cite: 45]
    const mockNCC = [
        { maNCC: 'NCC001', tenNCC: 'Công ty Thép Hòa Phát', diaChi: 'KCN Phố Nối, Hưng Yên' },
        { maNCC: 'NCC002', tenNCC: 'Nhà máy Nhựa Bình Minh', diaChi: 'Quận 6, TP.HCM' },
        { maNCC: 'NCC003', tenNCC: 'Tập đoàn Hóa chất Đức Giang', diaChi: 'Long Biên, Hà Nội' },
        { maNCC: 'NCC004', tenNCC: 'Công ty Cổ phần Vina-Tools', diaChi: 'Thanh Xuân, Hà Nội' },
        { maNCC: 'NCC005', tenNCC: 'Nhà cung cấp Ốc vít Miền Trung', diaChi: 'Hải Châu, Đà Nẵng' },
        { maNCC: 'NCC006', tenNCC: 'Xưởng cơ khí Hoàng Gia', diaChi: 'Dĩ An, Bình Dương' },
    ];

    useEffect(() => {
        setNhaCungCap(mockNCC);
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
                        <tr key={ncc.maNCC}>
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