import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiXCircle, FiEye, FiAlertTriangle, FiX, FiUser, FiCalendar, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import './DuyetYeuCauXuat.css';

const DuyetYeuCauXuat = () => {
    const [requests, setRequests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [lyDo, setLyDo] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/yeu-cau-xuat');
            // Chỉ hiện những đơn Chờ Duyệt và sắp xếp mới nhất lên đầu
            const pendingRequests = res.data
                .filter(i => i.trangThai === 'Chờ Duyệt')
                .sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
            setRequests(pendingRequests);
        } catch (e) { toast.error("Lỗi tải dữ liệu!"); }
    };

    useEffect(() => { fetchRequests(); }, []);

    // 🎯 Hàm tính tổng doanh thu dự kiến (Giá Bán)
    const calculateTotalRevenue = (chiTiets) => {
        if (!chiTiets) return 0;
        return chiTiets.reduce((sum, item) => {
            const price = item.hangHoa?.giaBan || 0;
            return sum + (item.soLuongYeuCau * price);
        }, 0);
    };

    const handleAction = async (maYeuCau, status) => {
        if (status === 'Từ Chối' && !lyDo.trim()) {
            setShowRejectInput(true);
            return toast.warn("Vui lòng nhập lý do từ chối!");
        }
        if (status === 'Đã Duyệt' && !window.confirm(`Xác nhận DUYỆT XUẤT cho lệnh ${maYeuCau}?`)) return;

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
                <div>
                    <h2>🚚 Duyệt Lệnh Xuất Kho <span className="badge-count">{requests.length} đơn</span></h2>
                    <p>So soát tồn kho và phê duyệt giá trị xuất hàng cho đại lý</p>
                </div>
            </div>

            <div className="dyx-card">
                <table className="dyx-table">
                    <thead>
                        <tr>
                            <th>Mã Lệnh</th>
                            <th>Ngày Lập</th>
                            <th>Nơi Nhận</th>
                            <th className="text-right">Giá Trị Xuất</th>
                            <th className="text-center">Thao Tác</th>
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
                                    <div className="cell-with-icon"><FiMapPin /> <b>{r.noiNhan}</b></div>
                                </td>
                                {/* 💰 Hiển thị doanh thu dự kiến ngay bên ngoài */}
                                <td className="text-right fw-bold text-success">
                                    {calculateTotalRevenue(r.chiTiets).toLocaleString('vi-VN')} đ
                                </td>
                                <td className="text-center">
                                    <button className="dyx-btn-view" onClick={() => setSelected(r)}>
                                        <FiEye /> So soát & Duyệt
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center py-5">Hiện không có lệnh nào chờ duyệt. Sếp có thể nghỉ ngơi!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div className="dyx-modal-overlay">
                    <div className="dyx-modal-content">
                        <div className="dyx-modal-header">
                            <h3>Kiểm tra lô hàng: {selected.maYeuCau}</h3>
                            <button className="close-btn" onClick={() => { setSelected(null); setShowRejectInput(false); }}><FiX size={24} /></button>
                        </div>
                        <div className="dyx-modal-body">
                            <div className="modal-info-summary">
                                <p>📍 <b>Nơi nhận:</b> {selected.noiNhan}</p>
                                <p>👤 <b>Người lập:</b> {selected.nguoiTao}</p>
                            </div>

                            {/* 💰 BANNER DOANH THU XANH LÁ TRONG MODAL */}
                            <div className="dyx-revenue-banner">
                                <FiTrendingUp /> Tổng giá trị xuất hàng (Dự kiến thu):
                                <span> {calculateTotalRevenue(selected.chiTiets).toLocaleString('vi-VN')} VNĐ</span>
                            </div>

                            <table className="dyx-table-detail">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th className="text-right">Đơn giá bán</th>
                                        <th className="text-center">SL Xuất</th>
                                        <th className="text-center">Tồn Kho</th>
                                        <th>Trạng thái tồn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selected.chiTiets.map((ct, idx) => {
                                        const thieu = ct.soLuongYeuCau > (ct.hangHoa?.soLuongTon || 0);
                                        return (
                                            <tr key={idx}>
                                                <td>{ct.hangHoa?.tenHang}</td>
                                                <td className="text-right">{ct.hangHoa?.giaBan?.toLocaleString('vi-VN')}</td>
                                                <td className="text-center fw-bold">{ct.soLuongYeuCau}</td>
                                                <td className="text-center">{ct.hangHoa?.soLuongTon || 0}</td>
                                                <td>
                                                    {thieu ?
                                                        <span className="badge-alert"><FiAlertTriangle /> Thiếu hàng</span> :
                                                        <span className="badge-ok">✅ Đủ hàng</span>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {showRejectInput && (
                                <div className="reject-area">
                                    <label>Lý do từ chối đơn hàng này:</label>
                                    <textarea className="reject-textarea" placeholder="Nhập lý do gửi nhân viên..." value={lyDo} onChange={(e) => setLyDo(e.target.value)} />
                                </div>
                            )}
                        </div>
                        <div className="dyx-modal-footer">
                            {!showRejectInput ? (
                                <>
                                    <button className="btn-reject" onClick={() => setShowRejectInput(true)}>TỪ CHỐI</button>
                                    <button className="btn-approve" onClick={() => handleAction(selected.maYeuCau, 'Đã Duyệt')}>PHÊ DUYỆT XUẤT</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn-cancel" onClick={() => setShowRejectInput(false)}>QUAY LẠI</button>
                                    <button className="btn-reject-confirm" onClick={() => handleAction(selected.maYeuCau, 'Từ Chối')}>XÁC NHẬN BÁC BỎ</button>
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