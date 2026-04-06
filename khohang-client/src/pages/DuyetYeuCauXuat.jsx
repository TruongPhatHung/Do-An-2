import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiXCircle, FiEye, FiAlertTriangle, FiX, FiUser, FiCalendar, FiMapPin } from 'react-icons/fi';
import './DuyetYeuCauXuat.css';

const DuyetYeuCauXuat = () => {
    const [requests, setRequests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [lyDo, setLyDo] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/yeu-cau-xuat');
            // Chỉ lấy những đơn Chờ Duyệt
            setRequests(res.data.filter(i => i.trangThai === 'Chờ Duyệt'));
        } catch (e) { toast.error("Lỗi tải dữ liệu!"); }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleAction = async (maYeuCau, status) => {
        if (status === 'Từ Chối' && !lyDo.trim()) {
            setShowRejectInput(true);
            return toast.warn("Vui lòng nhập lý do từ chối!");
        }
        try {
            await api.put(`/yeu-cau-xuat/${maYeuCau}/duyet`, { trangThai: status, lyDoTuChoi: lyDo });
            toast.success(`Đã xử lý: ${status}`);
            setSelected(null); setLyDo(''); setShowRejectInput(false);
            fetchRequests();
        } catch (e) { toast.error("Thao tác thất bại!"); }
    };

    return (
        <div className="dyx-container">
            <div className="dyx-header">
                <h2>🚚 Duyệt Lệnh Xuất Kho <span className="badge-count">{requests.length} đơn</span></h2>
            </div>

            <div className="dyx-card">
                <table className="dyx-table">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>Mã Lệnh</th>
                            <th style={{ width: '15%' }}>Ngày Lập</th>
                            <th style={{ width: '25%' }}>Người Đề Xuất</th>
                            <th style={{ width: '25%' }}>Nơi Nhận</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? requests.map(r => (
                            <tr key={r.maYeuCau}>
                                <td className="fw-bold text-primary">{r.maYeuCau}</td>
                                <td>
                                    <div className="cell-with-icon"><FiCalendar /> {new Date(r.ngayTao).toLocaleDateString('vi-VN')}</div>
                                </td>
                                <td>
                                    <div className="cell-with-icon"><FiUser /> <b>{r.nguoiTao || 'Hệ thống'}</b></div>
                                </td>
                                <td>
                                    <div className="cell-with-icon"><FiMapPin /> {r.noiNhan}</div>
                                </td>
                                <td className="text-center">
                                    <button className="dyx-btn-view" onClick={() => setSelected(r)}>
                                        <FiEye /> So soát tồn & Duyệt
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center py-5">Hiện không có lệnh nào chờ duyệt.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal giữ nguyên logic nhưng sếp nhớ thêm CSS bên dưới nhé */}
            {selected && (
                <div className="dyx-modal-overlay">
                    <div className="dyx-modal-content">
                        <div className="dyx-modal-header">
                            <h3>Kiểm tra tồn kho: {selected.maYeuCau}</h3>
                            <button className="close-btn" onClick={() => { setSelected(null); setShowRejectInput(false); }}><FiX size={24} /></button>
                        </div>
                        <div className="dyx-modal-body">
                            <div className="modal-info-summary">
                                <p>📍 <b>Nơi nhận:</b> {selected.noiNhan}</p>
                                <p>👤 <b>Người lập:</b> {selected.nguoiTao}</p>
                            </div>
                            <table className="dyx-table-detail">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th className="text-center">Xuất</th>
                                        <th className="text-center">Tồn</th>
                                        <th>Kết quả</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selected.chiTiets.map((ct, idx) => {
                                        const thieu = ct.soLuongYeuCau > (ct.hangHoa?.soLuongTon || 0);
                                        return (
                                            <tr key={idx}>
                                                <td>{ct.hangHoa?.tenHang}</td>
                                                <td className="text-center fw-bold">{ct.soLuongYeuCau}</td>
                                                <td className="text-center">{ct.hangHoa?.soLuongTon || 0}</td>
                                                <td>
                                                    {thieu ? <span className="text-danger"><FiAlertTriangle /> Thiếu</span> : <span className="text-success">✅ Đủ</span>}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {showRejectInput && (
                                <textarea className="reject-textarea" placeholder="Nhập lý do từ chối..." value={lyDo} onChange={(e) => setLyDo(e.target.value)} />
                            )}
                        </div>
                        <div className="dyx-modal-footer">
                            {!showRejectInput ? (
                                <>
                                    <button className="btn-reject" onClick={() => setShowRejectInput(true)}>TỪ CHỐI</button>
                                    <button className="btn-approve" onClick={() => handleAction(selected.maYeuCau, 'Đã Duyệt')}>DUYỆT XUẤT</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn-cancel" onClick={() => setShowRejectInput(false)}>QUAY LẠI</button>
                                    <button className="btn-reject-confirm" onClick={() => handleAction(selected.maYeuCau, 'Từ Chối')}>XÁC NHẬN TỪ CHỐI</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DuyetYeuCauXuat;