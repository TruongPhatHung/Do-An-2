import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiXCircle, FiEye, FiFilter, FiX } from 'react-icons/fi';
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

    useEffect(() => {
        fetchYeuCaus();
    }, [filterStatus]);

    const handleApprove = async (maYeuCau) => {
        if (!window.confirm(`Xác nhận DUYỆT yêu cầu ${maYeuCau}?`)) return;

        try {
            await api.put(`/yeu-cau-mua/${maYeuCau}/duyet`, {
                trangThai: "Đã Duyệt",
                lyDoTuChoi: ""
            });
            toast.success("✅ Đã duyệt yêu cầu thành công!");
            setSelectedYeuCau(null);
            fetchYeuCaus();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi duyệt đơn!");
        }
    };

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
            fetchYeuCaus();
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
                    <h2 style={{ display: 'flex', alignItems: 'center' }}>
                          Duyệt Yêu Cầu Mua Hàng (Sếp)
                        {filterStatus === 'Chờ Duyệt' && yeuCaus.length > 0 && (
                            <span style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                fontSize: '1rem',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                marginLeft: '12px',
                                fontWeight: 'bold'
                            }}>
                                {yeuCaus.length} đơn
                            </span>
                        )}
                    </h2>
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
                            <th className="text-center">Thao Tác</th>
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
                                        <FiEye /> Xem chi tiết
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
                            <button className="btn-close" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedYeuCau(null)}>
                                <FiX size={24} color="#94a3b8" />
                            </button>
                        </div>
                        <div className="dyc-modal-body">

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <p><strong>🏢 Nhà cung cấp:</strong> {selectedYeuCau.nhaCungCap?.tenNCC}</p>
                                <p><strong>👤 Người tạo:</strong> {selectedYeuCau.nguoiYeuCau}</p>
                                <p><strong>📌 Trạng thái:</strong> {getStatusBadge(selectedYeuCau.trangThai)}</p>
                                <p><strong>📝 Ghi chú từ Kho:</strong> <span style={{ color: '#3b82f6', fontStyle: 'italic' }}>{selectedYeuCau.ghiChu || 'Không có'}</span></p>
                            </div>

                            {selectedYeuCau.trangThai === 'Từ Chối' && (
                                <div className="reject-reason-box" style={{ backgroundColor: '#fef2f2', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginBottom: '20px' }}>
                                    <strong style={{ color: '#991b1b' }}>🚫 Lý do từ chối:</strong>
                                    <p style={{ margin: '5px 0 0 0', color: '#b91c1c' }}>{selectedYeuCau.lyDoTuChoi}</p>
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

                        {selectedYeuCau.trangThai === 'Chờ Duyệt' && (
                            <div className="dyc-modal-footer">
                                <button className="btn-reject" onClick={() => setShowRejectModal(true)}>
                                    <FiXCircle style={{ marginRight: '5px' }} /> TỪ CHỐI
                                </button>
                                <button className="btn-approve" onClick={() => handleApprove(selectedYeuCau.maYeuCau)}>
                                    <FiCheckCircle style={{ marginRight: '5px' }} /> PHÊ DUYỆT
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL NHẬP LÝ DO TỪ CHỐI */}
            {showRejectModal && (
                <div className="dyc-modal-overlay">
                    <div className="dyc-modal-content reject-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="dyc-modal-header">
                            <h3 style={{ color: '#ef4444', margin: 0 }}>Từ chối yêu cầu {selectedYeuCau?.maYeuCau}</h3>
                            <button className="btn-close" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowRejectModal(false)}>
                                <FiX size={24} color="#94a3b8" />
                            </button>
                        </div>
                        <form onSubmit={handleReject} className="dyc-modal-body">
                            <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block', color: '#334155' }}>
                                Vui lòng nhập lý do từ chối để Kho rút kinh nghiệm:
                            </label>
                            <textarea
                                rows="4"
                                className="reject-textarea"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ef4444', outline: 'none' }}
                                placeholder="VD: Ngân sách tháng này đã hết, Tồn kho Tivi còn nhiều..."
                                value={lyDoTuChoi}
                                onChange={(e) => setLyDoTuChoi(e.target.value)}
                                autoFocus
                            ></textarea>
                            <div className="dyc-modal-footer" style={{ marginTop: '20px', padding: '0', background: 'transparent', border: 'none' }}>
                                <button type="button" className="btn-cancel" style={{ background: '#94a3b8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setShowRejectModal(false)}>
                                    QUAY LẠI
                                </button>
                                <button type="submit" className="btn-reject-confirm" style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    XÁC NHẬN TỪ CHỐI
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DuyetYeuCauMua;