import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/axiosConfig';
import './AdminLogs.css';
import { FiSearch, FiFilter, FiX, FiClock, FiUser, FiDatabase, FiEye, FiChevronLeft, FiChevronRight, FiActivity, FiArrowRight } from 'react-icons/fi';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 20;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/logs?page=${currentPage - 1}&size=${itemsPerPage}`);
            const pageData = response.data;
            setLogs(pageData.content || []);
            setTotalPages(pageData.totalPages || 1);
        } catch (error) {
            console.error("Lỗi tải nhật ký:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '---';
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const getActionClass = (action) => {
        if (!action) return 'badge-default';
        if (action.includes('THÊM') || action.includes('NHẬP')) return 'badge-success';
        if (action.includes('XÓA') || action.includes('XUẤT')) return 'badge-danger';
        if (action.includes('SỬA') || action.includes('ĐỔI')) return 'badge-info';
        return 'badge-warning';
    };

    const renderLogDetail = (log) => {
        if (!log.duLieuCu && !log.duLieuMoi) {
            return <div className="diff-empty">Không có dữ liệu chi tiết cho thao tác này.</div>;
        }
        if (log.hanhDong === 'THÊM' || log.hanhDong === 'NHẬP KHO') {
            return (
                <div className="diff-card diff-new">
                    <div className="diff-header-new">✨ Dữ liệu vừa được tạo/nhập:</div>
                    <pre className="diff-pre">{log.duLieuMoi}</pre>
                </div>
            );
        }
        if (log.hanhDong === 'XÓA' || log.hanhDong === 'XUẤT KHO') {
            return (
                <div className="diff-card diff-old">
                    <div className="diff-header-old">🗑️ Dữ liệu đã bị xóa/xuất:</div>
                    <pre className="diff-pre">{log.duLieuCu}</pre>
                </div>
            );
        }
        return (
            <div className="diff-split-container">
                <div className="diff-card diff-old">
                    <div className="diff-header-old">🔴 Dữ liệu CŨ (Trước khi sửa)</div>
                    <pre className="diff-pre">{log.duLieuCu || '[Trống]'}</pre>
                </div>
                <div className="diff-center-icon"><FiArrowRight /></div>
                <div className="diff-card diff-new">
                    <div className="diff-header-new">🟢 Dữ liệu MỚI (Sau khi sửa)</div>
                    <pre className="diff-pre">{log.duLieuMoi || '[Trống]'}</pre>
                </div>
            </div>
        );
    };

    const filteredLogs = logs.filter(log => {
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

    return (
        <div className="admin-logs-wrapper">
            {/* HEADER */}
            <div className="al-header">
                <div>
                    <h2 className="al-title"><FiActivity className="al-title-icon" /> Nhật Ký Hệ Thống</h2>
                    <p className="al-subtitle">Giám sát và truy vết mọi thao tác thay đổi dữ liệu của nhân sự.</p>
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="al-toolbar">
                <div className="al-search-box">
                    <FiSearch className="al-icon" />
                    <input
                        type="text"
                        placeholder="Tìm nhân viên, module, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="al-filter-box">
                    <FiFilter className="al-icon" />
                    <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                        <option value="ALL">Tất cả thao tác</option>
                        <option value="THÊM">Tạo mới</option>
                        <option value="SỬA">Sửa đổi</option>
                        <option value="XÓA">Xóa / Hủy</option>
                        <option value="NHẬP KHO">Nhập kho</option>
                        <option value="XUẤT KHO">Xuất kho</option>
                    </select>
                </div>
                {(searchTerm || filterAction !== 'ALL') && (
                    <button className="al-btn-clear" onClick={handleClearFilter}>✖ Bỏ lọc</button>
                )}
            </div>

            {/* TABLE */}
            <div className="al-table-card">
                <table className="al-table">
                    <thead>
                        <tr>
                            <th width="20%"><FiClock /> Thời Gian</th>
                            <th width="20%"><FiUser /> Nhân Viên</th>
                            <th width="15%">Hành Động</th>
                            <th width="30%"><FiDatabase /> Đối Tượng Tác Động</th>
                            <th width="15%" className="text-center">Chi Tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && currentPage === 1 ? (
                            <tr><td colSpan="5" className="al-loading">⏳ Đang tải dữ liệu hệ thống...</td></tr>
                        ) : filteredLogs.length > 0 ? (
                            filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="al-time">{formatDateTime(log.thoiGian)}</td>
                                    <td>
                                        <div className="al-user-cell">
                                            <span className="al-avatar-placeholder">{log.nguoiThaoTac?.charAt(0).toUpperCase()}</span>
                                            <span className="al-username">@{log.nguoiThaoTac}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`al-badge ${getActionClass(log.hanhDong)}`}>{log.hanhDong}</span>
                                    </td>
                                    <td>
                                        <div className="al-module-cell">
                                            <span className="al-module-name">{log.bangDuLieu}</span>
                                            <span className="al-record-id">#{log.idBanGhi}</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <button className="al-btn-view" onClick={() => setSelectedLog(log)}>
                                            <FiEye /> Xem
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="al-empty">Không có thao tác nào phù hợp với bộ lọc.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="al-pagination">
                <span className="al-page-info">Đang xem trang <strong>{currentPage}</strong> trên <strong>{totalPages}</strong></span>
                <div className="al-page-controls">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="al-btn-page">
                        <FiChevronLeft />
                    </button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="al-btn-page">
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {/* MODAL CHI TIẾT */}
            {selectedLog && (
                <div className="al-modal-overlay" onClick={() => setSelectedLog(null)}>
                    <div className="al-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="al-modal-header">
                            <h3>🔍 Phân Tích Dữ Liệu Thay Đổi</h3>
                            <button className="al-modal-close" onClick={() => setSelectedLog(null)}><FiX /></button>
                        </div>
                        <div className="al-modal-body">
                            <div className="al-modal-meta">
                                <div className="al-meta-item"><strong>Nhân viên:</strong> @{selectedLog.nguoiThaoTac}</div>
                                <div className="al-meta-item"><strong>Thời gian:</strong> {formatDateTime(selectedLog.thoiGian)}</div>
                                <div className="al-meta-item"><strong>Mục:</strong> {selectedLog.bangDuLieu} (#{selectedLog.idBanGhi})</div>
                                <div className="al-meta-item"><strong>Thao tác:</strong> <span className={`al-badge ${getActionClass(selectedLog.hanhDong)}`}>{selectedLog.hanhDong}</span></div>
                            </div>
                            <div className="al-modal-diff-area">
                                {renderLogDetail(selectedLog)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLogs;