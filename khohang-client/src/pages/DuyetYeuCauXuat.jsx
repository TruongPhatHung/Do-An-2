import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiXCircle, FiEye, FiAlertTriangle, FiX } from 'react-icons/fi';
import './DuyetYeuCauXuat.css';

const DuyetYeuCauXuat = () => {
    const [requests, setRequests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [lyDo, setLyDo] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/yeu-cau-xuat');
            const choDuyet = res.data.filter(i => i.trangThai === 'Chờ Duyệt');
            setRequests(choDuyet);
        } catch (e) { toast.error("Lỗi tải dữ liệu!"); }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleAction = async (maYeuCau, status) => {
        if (status === 'Từ Chối' && !lyDo.trim()) {
            setShowRejectInput(true);
            toast.warn("Vui lòng nhập lý do từ chối!");
            return;
        }

        try {
            await api.put(`/yeu-cau-xuat/${maYeuCau}/duyet`, {
                trangThai: status,
                lyDoTuChoi: lyDo
            });
            toast.success(`Đã ${status} lệnh xuất thành công!`);
            setSelected(null);
            setLyDo('');
            setShowRejectInput(false);
            fetchRequests();
        } catch (e) { toast.error("Thao tác thất bại!"); }
    };

    return (
        <div className="dyx-container">
            <div className="dyx-header">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', margin: '0 0 5px 0' }}>
                         Duyệt Lệnh Xuất Kho
                        {/* 🎯 ĐÂY LÀ CHỖ HIỂN THỊ SỐ LƯỢNG LỆNH CẦN DUYỆT */}
                        {requests.length > 0 && (
                            <span style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                fontSize: '1rem',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                marginLeft: '12px',
                                fontWeight: 'bold'
                            }}>
                                {requests.length} lệnh
                            </span>
                        )}
                    </h2>
                    <p style={{ margin: 0 }}>Kiểm tra tồn kho và phê duyệt lệnh xuất hàng ra khỏi kho</p>
                </div>
            </div>

            <div className="dyx-card">
                <table className="dyx-table">
                    <thead>
                        <tr>
                            <th>Mã Lệnh</th>
                            <th>Nơi Nhận</th>
                            <th>Ngày Cần Xuất</th>
                            <th>Người Lập</th>
                            <th className="text-center">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? requests.map(r => (
                            <tr key={r.maYeuCau}>
                                <td className="fw-bold text-primary">{r.maYeuCau}</td>
                                <td>{r.noiNhan}</td>
                                <td>{new Date(r.ngayCanXuat).toLocaleDateString('vi-VN')}</td>
                                <td>{r.nguoiTao}</td>
                                <td className="text-center">
                                    <button className="dyx-btn-view" onClick={() => setSelected(r)}>
                                        <FiEye /> Kiểm tra & Duyệt
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center" style={{ padding: '30px' }}>Hiện không có lệnh nào chờ duyệt.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div className="dyx-modal-overlay">
                    <div className="dyx-modal-content">
                        <div className="dyx-modal-header">
                            <h3>Chi tiết lệnh xuất: {selected.maYeuCau}</h3>
                            <button className="btn-close" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelected(null)}>
                                <FiX size={24} color="#94a3b8" />
                            </button>
                        </div>
                        <div className="dyx-modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <p><strong>📍 Nơi nhận:</strong> {selected.noiNhan}</p>
                                <p><strong>📝 Ghi chú:</strong> <i>{selected.ghiChu || 'Không có'}</i></p>
                            </div>

                            <table className="dyx-table-detail">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th className="text-center">Số lượng xuất</th>
                                        <th className="text-center">Tồn hiện tại</th>
                                        <th>Trạng thái kho</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selected.chiTiets.map((ct, idx) => {
                                        const thieuHang = ct.soLuongYeuCau > ct.hangHoa?.soLuongTon;
                                        return (
                                            <tr key={idx} className={thieuHang ? 'shortage-warning' : ''}>
                                                <td>{ct.hangHoa?.tenHang}</td>
                                                <td className="text-center fw-bold">{ct.soLuongYeuCau}</td>
                                                <td className="text-center">{ct.hangHoa?.soLuongTon}</td>
                                                <td>
                                                    {thieuHang ?
                                                        <span style={{ color: '#d97706', fontWeight: '600' }}><FiAlertTriangle /> Thiếu hàng (Sẽ nợ)</span> :
                                                        <span style={{ color: '#16a34a' }}>✅ Đủ hàng</span>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            {showRejectInput && (
                                <textarea
                                    className="reject-textarea"
                                    placeholder="Vui lòng nhập lý do không duyệt đơn này để nhân viên được biết..."
                                    value={lyDo}
                                    onChange={(e) => setLyDo(e.target.value)}
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="dyx-modal-footer">
                            {!showRejectInput ? (
                                <>
                                    <button className="btn-reject" onClick={() => setShowRejectInput(true)}>TỪ CHỐI</button>
                                    <button className="btn-approve" onClick={() => handleAction(selected.maYeuCau, 'Đã Duyệt')}>DUYỆT LỆNH</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn-cancel" onClick={() => setShowRejectInput(false)}>QUAY LẠI</button>
                                    <button className="btn-reject-confirm" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleAction(selected.maYeuCau, 'Từ Chối')}>
                                        XÁC NHẬN TỪ CHỐI
                                    </button>
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