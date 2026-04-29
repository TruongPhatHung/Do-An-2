import React, { useState, useEffect, useContext } from 'react';
import api from '../services/axiosConfig';
import { AuthContext } from '../Context/AuthContext';
import { toast } from 'react-toastify';
import { FiCheck, FiAlertCircle, FiCamera, FiUpload, FiSearch, FiSave } from 'react-icons/fi';
import './KiemKeKho.css';

const KiemKeKho = () => {
    const { user } = useContext(AuthContext);
    const [hangHoa, setHangHoa] = useState([]);
    const [auditData, setAuditData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { fetchHangHoa(); }, []);

    const fetchHangHoa = async () => {
        try {
            const res = await api.get('/products');
            setHangHoa(res.data);
            const initial = {};
            res.data.forEach(h => {
                initial[h.maHang] = { tonPhanMem: h.soLuongTon, tonThucTe: '', ghiChu: '', status: 'none' };
            });
            setAuditData(initial);
        } catch (e) { toast.error("Lỗi tải kho!"); }
    };

    // 🎯 HÀM "KIỂM NHANH": Khớp luôn số lượng
    const markAsMatch = (maHang) => {
        setAuditData(prev => ({
            ...prev,
            [maHang]: { ...prev[maHang], tonThucTe: prev[maHang].tonPhanMem, status: 'match', ghiChu: 'Khớp số lượng' }
        }));
    };

    // 🎯 ĐÃ FIX: Tự động điền số Tồn Máy vào ô Thực Tế để sếp khỏi gõ lại nếu chỉ muốn báo hỏng
    const markAsIssue = (maHang) => {
        setAuditData(prev => ({
            ...prev,
            [maHang]: {
                ...prev[maHang],
                status: 'issue',
                tonThucTe: prev[maHang].tonPhanMem // Tự động lấy số máy bỏ xuống đây
            }
        }));
    };

    const handleInputChange = (maHang, field, val) => {
        setAuditData(prev => ({
            ...prev,
            [maHang]: { ...prev[maHang], [field]: val }
        }));
    };

    // 🎯 HÀM LƯU VÀO DATABASE (ĐÃ FIX LOGIC CHỈ GỬI HÀNG LỆCH/HỎNG)
    const handleSubmit = async () => {
        // 1. CHỈ LỌC NHỮNG MÓN CÓ TRẠNG THÁI 'issue' (Lệch/Hỏng)
        const itemsToReport = hangHoa.filter(h => auditData[h.maHang].status === 'issue');

        // 2. Nếu tất cả đều khớp (match) hoặc chưa đếm (none) thì báo cho sếp biết
        const itemsMatched = hangHoa.filter(h => auditData[h.maHang].status === 'match');
        if (itemsToReport.length === 0 && itemsMatched.length > 0) {
            toast.success("🎉 Mọi thứ đều khớp hoàn hảo! Không có hàng lỗi nào cần báo cáo sếp.");
            // Có thể reset lại form ở đây nếu muốn
            return;
        }

        if (itemsToReport.length === 0) {
            return toast.warn("⚠️ Sếp chưa báo cáo Lệch/Hỏng món nào cả!");
        }

        // Validate: Chặn nếu quên nhập số
        const invalidItems = itemsToReport.filter(h => auditData[h.maHang].tonThucTe === '' || auditData[h.maHang].tonThucTe === null);
        if (invalidItems.length > 0) {
            return toast.error("❌ Có món báo 'Lệch/Hỏng' nhưng sếp đang để trống số lượng thực tế kìa!");
        }

        if (!window.confirm(`Xác nhận gửi báo cáo CẦN XỬ LÝ cho ${itemsToReport.length} món hàng?`)) return;

        setIsSubmitting(true);
        try {
            const payload = itemsToReport.map(h => {
                const data = auditData[h.maHang];
                const thucTe = Number(data.tonThucTe);
                return {
                    maHang: h.maHang,
                    tenHang: h.tenHang,
                    tonPhanMem: data.tonPhanMem,
                    tonThucTe: thucTe,
                    chenhLech: thucTe - data.tonPhanMem,
                    ghiChu: data.ghiChu || 'Cần kiểm tra lại',
                    nguoiKiemKe: user?.hoTen || user?.tenDangNhap || 'Nhân viên kho'
                };
            });

            await api.post('/kiem-ke/gui-bao-cao', payload);
            toast.success(`✅ Đã gửi báo cáo ${itemsToReport.length} món hàng cần xử lý lên Sếp!`);

            fetchHangHoa(); // Reload lại bảng
            setSearchTerm('');
        } catch (error) {
            toast.error("❌ Lỗi khi gửi báo cáo lên server!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const progress = Object.values(auditData).filter(i => i.status !== 'none').length;

    return (
        <div className="kiemke-smart-container">
            {/* Header: Thanh tiến độ */}
            <div className="kiemke-top-bar">
                <div className="progress-section">
                    <h3>Tiến độ kiểm kê: {progress}/{hangHoa.length} món</h3>
                    <div className="progress-bg"><div className="progress-fill" style={{ width: `${(progress / hangHoa.length) * 100}%` }}></div></div>
                </div>
                <div className="action-btns">
                    <button className="btn-excel"><FiUpload /> Nhập file Excel</button>
                    <button
                        className="btn-save-all"
                        onClick={handleSubmit}
                        disabled={isSubmitting || progress === 0}
                        style={{ opacity: (isSubmitting || progress === 0) ? 0.5 : 1 }}
                    >
                        <FiSave /> {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                    </button>
                </div>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="search-bar-audit">
                <FiSearch />
                <input
                    placeholder="Tìm mã hoặc tên để kiểm nhanh..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Danh sách kiểm kê */}
            <div className="audit-list-v2">
                {hangHoa.filter(h => h.tenHang.toLowerCase().includes(searchTerm.toLowerCase())).map(h => {
                    const data = auditData[h.maHang];
                    return (
                        <div key={h.maHang} className={`audit-item-card ${data.status}`}>
                            <div className="item-info">
                                <strong>{h.tenHang}</strong>
                                <span>Mã: {h.maHang} | Tồn máy: {h.soLuongTon}</span>
                            </div>

                            <div className="item-actions">
                                {data.status === 'none' && (
                                    <>
                                        <button className="btn-match" onClick={() => markAsMatch(h.maHang)}><FiCheck /> Khớp</button>
                                        <button className="btn-issue" onClick={() => markAsIssue(h.maHang)}><FiAlertCircle /> Lệch/Hỏng</button>
                                    </>
                                )}

                                {data.status === 'match' && (
                                    <span className="badge-match" onClick={() => markAsIssue(h.maHang)}>✅ Đã khớp (Bấm để sửa)</span>
                                )}

                                {data.status === 'issue' && (
                                    <div className="issue-input-group">
                                        <input
                                            type="number"
                                            placeholder="Số thực tế..."
                                            value={data.tonThucTe}
                                            onChange={(e) => handleInputChange(h.maHang, 'tonThucTe', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Lý do hỏng/thiếu..."
                                            value={data.ghiChu}
                                            onChange={(e) => handleInputChange(h.maHang, 'ghiChu', e.target.value)}
                                        />
                                        <button className="btn-camera" title="Chụp ảnh minh chứng"><FiCamera /></button>
                                        <button className="btn-undo" title="Hủy, chuyển về khớp" onClick={() => markAsMatch(h.maHang)}>🏠 Khớp</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default KiemKeKho;