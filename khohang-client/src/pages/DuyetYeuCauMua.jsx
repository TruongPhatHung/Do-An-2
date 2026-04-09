import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiXCircle, FiEye, FiFilter, FiX, FiUser, FiCalendar, FiShoppingCart } from 'react-icons/fi';
import './DuyetYeuCauMua.css';

const DuyetYeuCauMua = () => {
    const [yeuCaus, setYeuCaus] = useState([]);
    const [filterStatus, setFilterStatus] = useState('Chờ Duyệt');
    const [selectedYeuCau, setSelectedYeuCau] = useState(null);
    const [lyDoTuChoi, setLyDoTuChoi] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    const fetchYeuCaus = async () => {
        try {
            const url = filterStatus ? `/yeu-cau-mua?trangThai=${filterStatus}` : '/yeu-cau-mua';
            const response = await api.get(url);
            setYeuCaus(response.data);
        } catch (error) {
            toast.error("Lỗi tải danh sách yêu cầu mua hàng!");
        }
    };

    useEffect(() => { fetchYeuCaus(); }, [filterStatus]);

    const handleApprove = async (maYeuCau) => {
        if (!window.confirm(`Sếp xác nhận DUYỆT yêu cầu ${maYeuCau}?`)) return;
        try {
            await api.put(`/yeu-cau-mua/${maYeuCau}/duyet`, {
                trangThai: "Đã Duyệt", // 🎯 Đồng bộ đúng chữ này để lọt qua trang Lên Đơn PO
                lyDoTuChoi: ""
            });
            toast.success("✅ Đã phê duyệt đề xuất chi mua hàng!");
            setSelectedYeuCau(null);
            fetchYeuCaus();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi duyệt đơn!");
        }
    };

    const handleReject = async (e) => {
        e.preventDefault();
        if (!lyDoTuChoi.trim()) return toast.warn("Vui lòng cho biết lý do từ chối!");

        try {
            await api.put(`/yeu-cau-mua/${selectedYeuCau.maYeuCau}/duyet`, {
                trangThai: "Từ Chối",
                lyDoTuChoi: lyDoTuChoi
            });
            toast.success("❌ Đã bác bỏ yêu cầu mua hàng!");
            setShowRejectModal(false);
            setLyDoTuChoi('');
            setSelectedYeuCau(null);
            fetchYeuCaus();
        } catch (error) {
            toast.error("Lỗi khi thực hiện thao tác!");
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Chờ Duyệt': 'warning', 'Đã Duyệt': 'success', 'Từ Chối': 'danger', 'Đã Lên PO': 'info'
        };
        return <span className={`dyc-badge dyc-badge-${badges[status] || 'secondary'}`}>{status}</span>;
    };

    return (
        <div className="dyc-container">
            <div className="dyc-header">
                <div>
                    <h2>💰 Duyệt Đề Xuất Mua Hàng</h2>
                    <p>Sếp đang có <b>{yeuCaus.length}</b> đề xuất cần xem xét</p>
                </div>
                <div className="dyc-filter-box">
                    <FiFilter />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="Chờ Duyệt">🟡 Đang chờ duyệt</option>
                        <option value="Đã Duyệt">🟢 Đã phê duyệt</option>
                        <option value="Từ Chối">🔴 Đã từ chối</option>
                        <option value="">Tất cả</option>
                    </select>
                </div>
            </div>

            <div className="dyc-card">
                <table className="dyc-table">
                    <thead>
                        <tr>
                            <th>Mã Yêu Cầu</th>
                            <th>Ngày Gửi</th>
                            <th>Người Đề Xuất</th>
                            <th>Nhà Cung Cấp</th>
                            <th className="text-center">Trạng Thái</th>
                            <th className="text-center">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {yeuCaus.map((yc) => (
                            <tr key={yc.maYeuCau}>
                                <td className="fw-bold">{yc.maYeuCau}</td>
                                <td><FiCalendar /> {new Date(yc.ngayYeuCau).toLocaleDateString('vi-VN')}</td>
                                <td><FiUser /> <b>{yc.nguoiTao || 'Hệ thống'}</b></td>
                                <td>{yc.nhaCungCap?.tenNCC}</td>
                                <td className="text-center">{getStatusBadge(yc.trangThai)}</td>
                                <td className="text-center">
                                    <button className="dyc-btn-view" onClick={() => setSelectedYeuCau(yc)}>
                                        <FiEye /> Kiểm tra & Ký
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedYeuCau && (
                <div className="dyc-modal-overlay">
                    <div className="dyc-modal-content">
                        <div className="dyc-modal-header">
                            <h3>Chi tiết phiếu: {selectedYeuCau.maYeuCau}</h3>
                            <button onClick={() => { setSelectedYeuCau(null); setShowRejectModal(false); }}><FiX size={24} /></button>
                        </div>
                        <div className="dyc-modal-body">
                            <div className="info-grid-2">
                                <p><strong>👤 Người lập:</strong> {selectedYeuCau.nguoiTao}</p>
                                <p><strong>🏢 Nhà cung cấp:</strong> {selectedYeuCau.nhaCungCap?.tenNCC}</p>
                            </div>
                            <table className="dyc-table-detail">
                                <thead>
                                    <tr>
                                        <th>Sản Phẩm</th>
                                        <th className="text-center">Số Lượng Đề Xuất</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedYeuCau.chiTiets?.map((ct, idx) => (
                                        <tr key={idx}>
                                            <td>{ct.hangHoa?.tenHang}</td>
                                            <td className="text-center fw-bold">{ct.soLuongCanMua}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {showRejectModal && (
                                <textarea
                                    className="reject-textarea"
                                    placeholder="Lý do không duyệt..."
                                    value={lyDoTuChoi}
                                    onChange={(e) => setLyDoTuChoi(e.target.value)}
                                />
                            )}
                        </div>
                        <div className="dyc-modal-footer">
                            {!showRejectModal ? (
                                <>
                                    <button className="btn-reject" onClick={() => setShowRejectModal(true)}>TỪ CHỐI</button>
                                    <button className="btn-approve" onClick={() => handleApprove(selectedYeuCau.maYeuCau)}>DUYỆT CHI</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn-cancel" onClick={() => setShowRejectModal(false)}>QUAY LẠI</button>
                                    <button className="btn-reject-confirm" onClick={handleReject}>XÁC NHẬN TỪ CHỐI</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DuyetYeuCauMua;