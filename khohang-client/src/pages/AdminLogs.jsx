import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './AdminLogs.css';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null); // State quản lý việc mở Popup

    // --- STATE CHO BỘ LỌC ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');

    // --- STATE CHO PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('/logs');
                setLogs(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi tải nhật ký:", error);
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

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

    // --- HÀM RENDER CHI TIẾT (Bên trong Popup) ---
    const renderLogDetail = (log) => {
        if (!log.duLieuCu && !log.duLieuMoi) {
            return <div style={{ color: '#7f8c8d', fontStyle: 'italic', padding: '10px' }}>Không có chi tiết dữ liệu thay đổi.</div>;
        }

        if (log.hanhDong === 'THÊM' || log.hanhDong === 'NHẬP KHO') {
            return (
                <div className="diff-added">
                    <strong>Dữ liệu mới:</strong><br />
                    {log.duLieuMoi}
                </div>
            );
        }
        if (log.hanhDong === 'XÓA' || log.hanhDong === 'XUẤT KHO') {
            return (
                <div className="diff-removed">
                    <strong>Dữ liệu đã xóa/xuất:</strong><br />
                    {log.duLieuCu}
                </div>
            );
        }

        // Trường hợp SỬA
        return (
            <div className="diff-changed">
                <div className="old">
                    <strong>Dữ liệu cũ:</strong><br />
                    {log.duLieuCu || 'Trống'}
                </div>
                <div className="arrow">⬇️ ĐƯỢC THAY ĐỔI THÀNH ⬇️</div>
                <div className="new">
                    <strong>Dữ liệu mới:</strong><br />
                    {log.duLieuMoi || 'Trống'}
                </div>
            </div>
        );
    };

    // --- LỌC & PHÂN TRANG ---
    const filteredLogs = logs.filter(log => {
        const matchesSearch = (log.nguoiThaoTac?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.bangDuLieu?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.idBanGhi?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'ALL' || log.hanhDong === filterAction;
        return matchesSearch && matchesAction;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterAction]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const handleClearFilter = () => {
        setSearchTerm('');
        setFilterAction('ALL');
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Đang tải lịch sử hệ thống...</div>;

    return (
        <div className="logs-container">
            <div className="logs-header">
                <h2>📜 Nhật Ký Hoạt Động Hệ Thống</h2>
                <p>Theo dõi mọi thay đổi dữ liệu từ nhân viên ({filteredLogs.length} kết quả)</p>
            </div>

            {/* THANH CÔNG CỤ TÌM KIẾM VÀ LỌC */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="🔍 Tìm nhân viên, đối tượng, mã ID..."
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
                    <option value="THÊM">Chỉ xem THÊM mới</option>
                    <option value="SỬA">Chỉ xem SỬA đổi</option>
                    <option value="XÓA">Chỉ xem XÓA</option>
                    <option value="NHẬP KHO">Chỉ xem NHẬP KHO</option>
                    <option value="XUẤT KHO">Chỉ xem XUẤT KHO</option>
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
                        {currentLogs.length > 0 ? currentLogs.map((log) => (
                            <tr key={log.id}>
                                <td style={{ color: '#7f8c8d', fontSize: '14px' }}>
                                    {formatDateTime(log.thoiGian)}
                                </td>
                                <td>
                                    <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>👤 {log.nguoiThaoTac}</span>
                                </td>
                                <td>
                                    <span className={`action-badge ${getActionClass(log.hanhDong)}`}>
                                        {log.hanhDong}
                                    </span>
                                </td>
                                <td>
                                    <strong>{log.bangDuLieu}</strong>
                                    <span style={{ fontSize: '12px', color: '#95a5a6', marginLeft: '8px', backgroundColor: '#f1f2f6', padding: '2px 6px', borderRadius: '4px' }}>
                                        #{log.idBanGhi}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {/* BẤM NÚT NÀY SẼ MỞ POPUP */}
                                    <button
                                        className="btn-view-detail"
                                        onClick={() => setSelectedLog(log)}
                                        style={{ margin: '0 auto' }}
                                    >
                                        👁️ Xem
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                                    Không tìm thấy dữ liệu thao tác nào phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            
            {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
            {totalPages > 1 && (
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>

                    {/* 1. Nút Trang Đầu */}
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                        style={{ padding: '8px 15px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: '1px solid #dcdde1', backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white', borderRadius: '4px', fontWeight: 'bold', color: currentPage === 1 ? '#bdc3c7' : '#2c3e50' }}
                        title="Về trang đầu tiên"
                    >
                        ⏮ Trang Đầu
                    </button>

                    {/* 2. Nút Trước */}
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        style={{ padding: '8px 15px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: '1px solid #dcdde1', backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white', borderRadius: '4px', fontWeight: 'bold', color: currentPage === 1 ? '#bdc3c7' : '#2c3e50' }}
                    >
                        ◀ Trước
                    </button>

                    {/* 3. Hiển thị số trang hiện tại */}
                    <span style={{ padding: '8px 15px', fontWeight: 'bold', backgroundColor: '#e8f4f8', color: '#2980b9', borderRadius: '4px', border: '1px solid #3498db' }}>
                        Trang {currentPage} / {totalPages}
                    </span>

                    {/* 4. Nút Sau */}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        style={{ padding: '8px 15px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', border: '1px solid #dcdde1', backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white', borderRadius: '4px', fontWeight: 'bold', color: currentPage === totalPages ? '#bdc3c7' : '#2c3e50' }}
                    >
                        Sau ▶
                    </button>

                    {/* 5. Nút Trang Cuối */}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        style={{ padding: '8px 15px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', border: '1px solid #dcdde1', backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white', borderRadius: '4px', fontWeight: 'bold', color: currentPage === totalPages ? '#bdc3c7' : '#2c3e50' }}
                        title="Tới trang cuối cùng"
                    >
                        Trang Cuối ⏭
                    </button>
                </div>
            )}
            {/* ========================================= */}
            {/* POPUP MODAL (Chỉ hiện khi selectedLog có giá trị) */}
            {/* ========================================= */}
            {selectedLog && (
                <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>🔍 Chi Tiết Thao Tác</h3>
                            <button className="modal-close" onClick={() => setSelectedLog(null)}>✖</button>
                        </div>

                        <div className="modal-body">
                            {/* Thông tin chung */}
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Nhân viên thực hiện</span>
                                    <span className="info-value">👤 {selectedLog.nguoiThaoTac}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Thời gian</span>
                                    <span className="info-value">{formatDateTime(selectedLog.thoiGian)}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Đối tượng thao tác</span>
                                    <span className="info-value">{selectedLog.bangDuLieu} (ID: #{selectedLog.idBanGhi})</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Hành động</span>
                                    <span className="info-value">
                                        <span className={`action-badge ${getActionClass(selectedLog.hanhDong)}`}>
                                            {selectedLog.hanhDong}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Khung khác biệt dữ liệu do bạn viết nè */}
                            <div className="diff-container">
                                <div className="diff-header">Nội dung thay đổi:</div>
                                <div className="diff-content">
                                    {renderLogDetail(selectedLog)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLogs;