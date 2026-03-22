import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/axiosConfig';
import './AdminLogs.css';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]); // Sẽ chứa mảng lấy từ data.content
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);

    // --- STATE CHO BỘ LỌC ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');

    // --- STATE CHO PHÂN TRANG (Backend dùng 0-indexed, Frontend dùng 1-indexed) ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 20;

    // Tách hàm fetch ra để gọi lại khi đổi trang
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            // Spring Boot nhận page từ số 0, nên lấy currentPage - 1
            const response = await api.get(`/logs?page=${currentPage - 1}&size=${itemsPerPage}`);

            // 🎯 FIX LỖI: Lấy content từ đối tượng Page của Spring
            const pageData = response.data;
            setLogs(pageData.content || []);
            setTotalPages(pageData.totalPages || 1);

            setLoading(false);
        } catch (error) {
            console.error("Lỗi tải nhật ký:", error);
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '---';
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const getActionClass = (action) => {
        switch (action) {
            case 'THÊM': return 'badge-add';
            case 'SỬA': return 'badge-edit';
            case 'XÓA': return 'badge-delete';
            case 'NHẬP KHO': return 'badge-add';
            case 'XUẤT KHO': return 'badge-delete';
            default: return 'badge-default';
        }
    };

    const renderLogDetail = (log) => {
        if (!log.duLieuCu && !log.duLieuMoi) {
            return <div style={{ color: '#7f8c8d', fontStyle: 'italic', padding: '10px' }}>Không có chi tiết dữ liệu thay đổi.</div>;
        }
        if (log.hanhDong === 'THÊM' || log.hanhDong === 'NHẬP KHO') {
            return <div className="diff-added"><strong>Dữ liệu mới:</strong><br />{log.duLieuMoi}</div>;
        }
        if (log.hanhDong === 'XÓA' || log.hanhDong === 'XUẤT KHO') {
            return <div className="diff-removed"><strong>Dữ liệu đã xóa/xuất:</strong><br />{log.duLieuCu}</div>;
        }
        return (
            <div className="diff-changed">
                <div className="old"><strong>Dữ liệu cũ:</strong><br />{log.duLieuCu || 'Trống'}</div>
                <div className="arrow">⬇️ ĐƯỢC THAY ĐỔI THÀNH ⬇️</div>
                <div className="new"><strong>Dữ liệu mới:</strong><br />{log.duLieuMoi || 'Trống'}</div>
            </div>
        );
    };

    // --- LỌC DỮ LIỆU TRÊN TRANG HIỆN TẠI ---
    const filteredLogs = (Array.isArray(logs) ? logs : []).filter(log => {
        const matchesSearch = (log.nguoiThaoTac?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.bangDuLieu?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.idBanGhi?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'ALL' || log.hanhDong === filterAction;
        return matchesSearch && matchesAction;
    });

    const handleClearFilter = () => {
        setSearchTerm('');
        setFilterAction('ALL');
    };

    if (loading && currentPage === 1) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Đang tải lịch sử hệ thống...</div>;

    return (
        <div className="logs-container">
            <div className="logs-header">
                <h2>📜 Nhật Ký Hoạt Động Hệ Thống</h2>
                <p>Theo dõi mọi thay đổi dữ liệu từ nhân viên (Trang {currentPage} / {totalPages})</p>
            </div>

            {/* THANH CÔNG CỤ TÌM KIẾM VÀ LỌC */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="🔍 Tìm trong trang này..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px 15px', width: '300px', borderRadius: '6px', border: '1px solid #dcdde1', outline: 'none' }}
                />

                <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #dcdde1', outline: 'none', backgroundColor: 'white' }}
                >
                    <option value="ALL">Tất cả hành động</option>
                    <option value="THÊM">THÊM mới</option>
                    <option value="SỬA">SỬA đổi</option>
                    <option value="XÓA">XÓA</option>
                    <option value="NHẬP KHO">NHẬP KHO</option>
                    <option value="XUẤT KHO">XUẤT KHO</option>
                </select>

                {(searchTerm || filterAction !== 'ALL') && (
                    <button onClick={handleClearFilter} style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                        ✖ Xóa Lọc
                    </button>
                )}
            </div>

            {/* BẢNG RÚT GỌN BÊN NGOÀI */}
            <div className="logs-table-wrapper">
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th width="20%">Thời Gian</th>
                            <th width="20%">Nhân Viên</th>
                            <th width="15%">Hành Động</th>
                            <th width="30%">Đối Tượng (ID)</th>
                            <th width="15%" style={{ textAlign: 'center' }}>Chi Tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Đang cập nhật dữ liệu...</td></tr>
                        ) : filteredLogs.length > 0 ? filteredLogs.map((log) => (
                            <tr key={log.id}>
                                <td style={{ color: '#7f8c8d', fontSize: '14px' }}>{formatDateTime(log.thoiGian)}</td>
                                <td><span style={{ fontWeight: 'bold', color: '#2c3e50' }}>👤 {log.nguoiThaoTac}</span></td>
                                <td><span className={`action-badge ${getActionClass(log.hanhDong)}`}>{log.hanhDong}</span></td>
                                <td>
                                    <strong>{log.bangDuLieu}</strong>
                                    <span style={{ fontSize: '12px', color: '#95a5a6', marginLeft: '8px', backgroundColor: '#f1f2f6', padding: '2px 6px', borderRadius: '4px' }}>
                                        #{log.idBanGhi}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button className="btn-view-detail" onClick={() => setSelectedLog(log)} style={{ margin: '0 auto' }}>👁️ Xem</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Không có dữ liệu thao tác nào phù hợp.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* THANH ĐIỀU HƯỚNG PHÂN TRANG (MỚI) */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    style={{ padding: '8px 15px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: '1px solid #dcdde1', backgroundColor: 'white', borderRadius: '4px' }}
                >
                    ⏮ Trang Đầu
                </button>
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    style={{ padding: '8px 15px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: '1px solid #dcdde1', backgroundColor: 'white', borderRadius: '4px' }}
                >
                    ◀ Trước
                </button>
                <span style={{ padding: '8px 15px', fontWeight: 'bold', backgroundColor: '#e8f4f8', color: '#2980b9', borderRadius: '4px', border: '1px solid #3498db' }}>
                    Trang {currentPage} / {totalPages}
                </span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    style={{ padding: '8px 15px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', border: '1px solid #dcdde1', backgroundColor: 'white', borderRadius: '4px' }}
                >
                    Sau ▶
                </button>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    style={{ padding: '8px 15px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', border: '1px solid #dcdde1', backgroundColor: 'white', borderRadius: '4px' }}
                >
                    Trang Cuối ⏭
                </button>
            </div>

            {/* POPUP MODAL */}
            {selectedLog && (
                <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>🔍 Chi Tiết Thao Tác</h3>
                            <button className="modal-close" onClick={() => setSelectedLog(null)}>✖</button>
                        </div>
                        <div className="modal-body">
                            <div className="info-grid">
                                <div className="info-item"><span className="info-label">Nhân viên</span><span className="info-value">👤 {selectedLog.nguoiThaoTac}</span></div>
                                <div className="info-item"><span className="info-label">Thời gian</span><span className="info-value">{formatDateTime(selectedLog.thoiGian)}</span></div>
                                <div className="info-item"><span className="info-label">Đối tượng</span><span className="info-value">{selectedLog.bangDuLieu} (ID: #{selectedLog.idBanGhi})</span></div>
                                <div className="info-item"><span className="info-label">Hành động</span><span className="info-value"><span className={`action-badge ${getActionClass(selectedLog.hanhDong)}`}>{selectedLog.hanhDong}</span></span></div>
                            </div>
                            <div className="diff-container">
                                <div className="diff-header">Nội dung thay đổi:</div>
                                <div className="diff-content">{renderLogDetail(selectedLog)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLogs;