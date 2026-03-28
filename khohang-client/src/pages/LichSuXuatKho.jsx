import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiEye, FiSearch, FiCalendar, FiX, FiBox } from 'react-icons/fi';
import './LichSuXuatKho.css';

const LichSuXuatKho = () => {
    const [phieuXuats, setPhieuXuats] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPhieu, setSelectedPhieu] = useState(null); // Lưu phiếu đang được xem chi tiết

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

    // Lọc tìm kiếm theo Mã phiếu hoặc Lý do
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
                            <th>Mã Phiếu Xuất</th>
                            <th>Ngày Xuất</th>
                            <th>Người Xuất</th>
                            <th>Lý Do Xuất</th>
                            <th className="text-center">Số Loại Hàng</th>
                            <th className="text-center">Chi Tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPhieuXuats.length > 0 ? (
                            filteredPhieuXuats.map((px) => (
                                <tr key={px.maPhieuXuat}>
                                    <td className="fw-bold text-primary">{px.maPhieuXuat}</td>
                                    <td>
                                        <div className="date-badge">
                                            <FiCalendar /> {new Date(px.ngayXuat).toLocaleString('vi-VN')}
                                        </div>
                                    </td>
                                    <td>{px.nguoiDung ? px.nguoiDung.hoTen : 'Hệ thống'}</td>
                                    <td><span className="reason-badge">{px.lyDoXuat || 'Không có'}</span></td>
                                    <td className="text-center fw-bold">{px.chiTiets?.length || 0}</td>
                                    <td className="text-center">
                                        <button
                                            className="btn-view-detail"
                                            onClick={() => setSelectedPhieu(px)}
                                            title="Xem chi tiết"
                                        >
                                            <FiEye /> Xem
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted" style={{ padding: '30px' }}>
                                    Không tìm thấy dữ liệu xuất kho nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL HIỂN THỊ CHI TIẾT PHIẾU XUẤT */}
            {selectedPhieu && (
                <div className="lsxk-modal-overlay" onClick={() => setSelectedPhieu(null)}>
                    <div className="lsxk-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><FiBox style={{ marginRight: '8px' }} /> Chi Tiết {selectedPhieu.maPhieuXuat}</h3>
                            <button className="btn-close-modal" onClick={() => setSelectedPhieu(null)}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="modal-info">
                            <p><strong>Ngày xuất:</strong> {new Date(selectedPhieu.ngayXuat).toLocaleString('vi-VN')}</p>
                            <p><strong>Lý do:</strong> {selectedPhieu.lyDoXuat}</p>
                            <p><strong>Người xuất:</strong> {selectedPhieu.nguoiDung ? selectedPhieu.nguoiDung.hoTen : 'Không rõ'}</p>
                        </div>

                        <table className="modal-table">
                            <thead>
                                <tr>
                                    <th>Mã Hàng</th>
                                    <th>Tên Sản Phẩm</th>
                                    <th className="text-center">Số Lượng Xuất</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedPhieu.chiTiets?.map((ct, index) => (
                                    <tr key={index}>
                                        <td className="fw-bold">{ct.hangHoa?.maHang}</td>
                                        <td>{ct.hangHoa?.tenHang}</td>
                                        <td className="text-center fw-bold text-success">
                                            {ct.soLuongXuat}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="modal-footer">
                            <button className="btn-close-bottom" onClick={() => setSelectedPhieu(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LichSuXuatKho;