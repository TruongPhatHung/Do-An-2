import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiXCircle, FiEye, FiFilter, FiX } from 'react-icons/fi';
import './DuyetYeuCauMua.css';

const DuyetYeuCauMua = () => {
    const [yeuCaus, setYeuCaus] = useState([]);
    const [filterStatus, setFilterStatus] = useState('Chờ Duyệt'); // Mặc định mở lên là thấy đơn cần duyệt
    const [selectedYeuCau, setSelectedYeuCau] = useState(null);
    const [lyDoTuChoi, setLyDoTuChoi] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Tải danh sách yêu cầu dựa theo bộ lọc
    const fetchYeuCaus = async () => {
        try {
            const url = filterStatus ? `/yeu-cau-mua?trangThai=${filterStatus}` : '/yeu-cau-mua';
            const response = await api.get(url);
            setYeuCaus(response.data);
        } catch (error) {
            toast.error("Lỗi tải danh sách yêu cầu mua hàng!");
        }
    };

    useEffect(() => {
        fetchYeuCaus();
    }, [filterStatus]);

    // Xử lý Duyệt đơn
    const handleApprove = async (maYeuCau) => {
        if (!window.confirm(`Xác nhận DUYỆT yêu cầu ${maYeuCau}?`)) return;

        try {
            await api.put(`/yeu-cau-mua/${maYeuCau}/duyet`, {
                trangThai: "Đã Duyệt",
                lyDoTuChoi: ""
            });
            toast.success("✅ Đã duyệt yêu cầu thành công!");
            setSelectedYeuCau(null);
            fetchYeuCaus(); // Tải lại danh sách
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi duyệt đơn!");
        }
    };

    // Xử lý Từ chối đơn
    const handleReject = async (e) => {
        e.preventDefault();
        if (!lyDoTuChoi.trim()) {
            toast.warn("Vui lòng nhập lý do từ chối!");
            return;
        }

        try {
            await api.put(`/yeu-cau-mua/${selectedYeuCau.maYeuCau}/duyet`, {
                trangThai: "Từ Chối",
                lyDoTuChoi: lyDoTuChoi
            });
            toast.success("❌ Đã từ chối yêu cầu!");
            setShowRejectModal(false);
            setLyDoTuChoi('');
            setSelectedYeuCau(null);
            fetchYeuCaus(); // Tải lại danh sách
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi từ chối đơn!");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Chờ Duyệt': return <span className="dyc-badge dyc-badge-warning">Chờ Duyệt</span>;
            case 'Đã Duyệt': return <span className="dyc-badge dyc-badge-success">Đã Duyệt</span>;
            case 'Từ Chối': return <span className="dyc-badge dyc-badge-danger">Từ Chối</span>;
            case 'Đã Lên PO': return <span className="dyc-badge dyc-badge-info">Đã Lên PO</span>;
            default: return <span className="dyc-badge">{status}</span>;
        }
    };

    return (
        <div className="dyc-container">
            <div className="dyc-header">
                <div>
                    <h2>👑 Duyệt Yêu Cầu Mua Hàng (Dành cho Sếp)</h2>
                    <p>Kiểm tra và phê duyệt các đề xuất mua vật tư từ Quản lý kho</p>
                </div>
                <div className="dyc-filter-box">
                    <FiFilter className="filter-icon" />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        <option value="Chờ Duyệt">🟡 Đang chờ duyệt</option>
                        <option value="Đã Duyệt">🟢 Đã duyệt</option>
                        <option value="Từ Chối">🔴 Bị từ chối</option>
                    </select>
                </div>
            </div>

            <div className="dyc-card">
                <table className="dyc-table">
                    <thead>
                        <tr>
                            <th>Mã Yêu Cầu</th>
                            <th>Ngày Đề Xuất</th>
                            <th>Người Đề Xuất</th>
                            <th>Nhà Cung Cấp</th>
                            <th className="text-center">Trạng Thái</th>
                            <th className="text-center">Chi Tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {yeuCaus.length > 0 ? yeuCaus.map((yc) => (
                            <tr key={yc.maYeuCau}>
                                <td className="fw-bold text-primary">{yc.maYeuCau}</td>
                                <td>{new Date(yc.ngayYeuCau).toLocaleString('vi-VN')}</td>
                                <td>{yc.nguoiYeuCau}</td>
                                <td>{yc.nhaCungCap?.tenNCC}</td>
                                <td className="text-center">{getStatusBadge(yc.trangThai)}</td>
                                <td className="text-center">
                                    <button className="dyc-btn-view" onClick={() => setSelectedYeuCau(yc)}>
                                        <FiEye /> Xem
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted" style={{ padding: '30px' }}>
                                    Không có phiếu yêu cầu nào ở trạng thái này.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL XEM CHI TIẾT */}
            {selectedYeuCau && !showRejectModal && (
                <div className="dyc-modal-overlay" onClick={() => setSelectedYeuCau(null)}>
                    <div className="dyc-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="dyc-modal-header">
                            <h3>Chi tiết Yêu cầu: {selectedYeuCau.maYeuCau}</h3>
                            <button className="btn-close" onClick={() => setSelectedYeuCau(null)}><FiX size={24} /></button>
                        </div>
                        <div className="dyc-modal-body">
                            <div className="info-grid">
                                <p><strong>Nhà cung cấp:</strong> {selectedYeuCau.nhaCungCap?.tenNCC}</p>
                                <p><strong>Người tạo:</strong> {selectedYeuCau.nguoiYeuCau}</p>
                                <p><strong>Trạng thái:</strong> {getStatusBadge(selectedYeuCau.trangThai)}</p>
                                <p><strong>Ghi chú từ Kho:</strong> <span className="text-highlight">{selectedYeuCau.ghiChu}</span></p>
                            </div>

                            {selectedYeuCau.trangThai === 'Từ Chối' && (
                                <div className="reject-reason-box">
                                    <strong>Lý do từ chối:</strong> {selectedYeuCau.lyDoTuChoi}
                                </div>
                            )}

                            <table className="dyc-table-detail">
                                <thead>
                                    <tr>
                                        <th>Mã Hàng</th>
                                        <th>Tên Sản Phẩm</th>
                                        <th className="text-center">Số Lượng Đề Xuất</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedYeuCau.chiTiets?.map((ct, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-bold">{ct.hangHoa?.maHang}</td>
                                            <td>{ct.hangHoa?.tenHang}</td>
                                            <td className="text-center fw-bold" style={{ fontSize: '1.1rem', color: '#0f172a' }}>
                                                {ct.soLuongCanMua}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* CHỈ HIỆN NÚT DUYỆT/TỪ CHỐI KHI TRẠNG THÁI LÀ CHỜ DUYỆT */}
                        {selectedYeuCau.trangThai === 'Chờ Duyệt' && (
                            <div className="dyc-modal-footer">
                                <button className="btn-reject" onClick={() => setShowRejectModal(true)}>
                                    <FiXCircle /> TỪ CHỐI
                                </button>
                                <button className="btn-approve" onClick={() => handleApprove(selectedYeuCau.maYeuCau)}>
                                    <FiCheckCircle /> PHÊ DUYỆT ĐƠN NÀY
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL NHẬP LÝ DO TỪ CHỐI */}
            {showRejectModal && (
                <div className="dyc-modal-overlay">
                    <div className="dyc-modal-content reject-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="dyc-modal-header">
                            <h3 style={{ color: '#ef4444' }}>Từ chối yêu cầu {selectedYeuCau?.maYeuCau}</h3>
                            <button className="btn-close" onClick={() => setShowRejectModal(false)}><FiX size={24} /></button>
                        </div>
                        <form onSubmit={handleReject} className="dyc-modal-body">
                            <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
                                Vui lòng nhập lý do từ chối để Kho rút kinh nghiệm:
                            </label>
                            <textarea
                                rows="4"
                                className="reject-textarea"
                                placeholder="VD: Ngân sách tháng này đã hết, Tồn kho Tivi còn nhiều..."
                                value={lyDoTuChoi}
                                onChange={(e) => setLyDoTuChoi(e.target.value)}
                                autoFocus
                            ></textarea>
                            <div className="dyc-modal-footer" style={{ marginTop: '20px' }}>
                                <button type="button" className="btn-cancel" onClick={() => setShowRejectModal(false)}>Hủy</button>
                                <button type="submit" className="btn-reject-confirm">Xác nhận Từ Chối</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DuyetYeuCauMua;