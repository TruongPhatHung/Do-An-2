import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiSearch } from 'react-icons/fi';
import './LichSuXuatKho.css';

const LichSuXuatKho = () => {
    const [phieuXuats, setPhieuXuats] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Sử dụng hook navigate để chuyển trang
    const navigate = useNavigate();

    useEffect(() => {
        fetchPhieuXuats();
    }, []);

    const fetchPhieuXuats = async () => {
        try {
            const response = await api.get('/phieu-xuat');
            setPhieuXuats(response.data);
        } catch (error) {
            toast.error("Lỗi tải lịch sử xuất kho!");
        }
    };

    const filteredPhieuXuats = phieuXuats.filter(px =>
        px.maPhieuXuat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (px.lyDoXuat && px.lyDoXuat.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="lsxk-container">
            <div className="lsxk-header">
                <h2>📦 Lịch Sử Xuất Kho (Chứng Từ)</h2>
                <div className="lsxk-search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm mã phiếu hoặc lý do..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="lsxk-card">
                <table className="lsxk-table">
                    <thead>
                        <tr>
                            <th>Mã Phiếu</th>
                            <th>Ngày Xuất</th>
                            <th>Người Xuất</th>
                            <th>Nơi Nhận / Khách Hàng</th>
                            <th>Lý Do</th>
                            <th className="text-right">Tổng Giá Trị</th>
                            <th className="text-center">Chi Tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPhieuXuats.map((px) => {
                            const displayTotal = px.tongTien || px.chiTiets?.reduce((sum, ct) => {
                                const giaChuan = ct.donGia || ct.hangHoa?.giaBan || ct.hangHoa?.giaNhap || 0;
                                return sum + (giaChuan * ct.soLuongXuat);
                            }, 0) || 0;

                            return (
                                <tr key={px.maPhieuXuat}>
                                    <td className="fw-bold text-primary">{px.maPhieuXuat}</td>
                                    <td><div className="date-badge">{new Date(px.ngayXuat).toLocaleDateString('vi-VN')}</div></td>
                                    <td>{px.nguoiDung ? px.nguoiDung.hoTen : 'Hệ thống'}</td>
                                    <td className="fw-bold">{px.tenNguoiNhan || 'Khách lẻ'}</td>
                                    <td><span className="reason-badge">{px.lyDoXuat}</span></td>
                                    <td className="text-right fw-bold text-orange-dark">
                                        {displayTotal.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td className="text-center">
                                        {/* Chuyển hướng kèm theo dữ liệu px qua state */}
                                        <button 
                                            className="btn-view-detail" 
                                            onClick={() => navigate(`/chi-tiet-phieu-xuat/${px.maPhieuXuat}`, { state: { phieu: px } })}
                                        >
                                            Xem
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LichSuXuatKho;