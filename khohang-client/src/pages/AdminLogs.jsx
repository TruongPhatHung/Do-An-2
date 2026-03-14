import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './AdminLogs.css';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- STATE CHO BỘ LỌC ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');

    // --- STATE CHO PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Số dòng hiển thị trên mỗi trang

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
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', { hour12: false });
    };

    const getActionClass = (action) => {
        switch (action) {
            case 'THÊM': return 'badge-add';
            case 'SỬA': return 'badge-edit';
            case 'XÓA': return 'badge-delete';
            case 'NHẬP KHO': return 'badge-add'; // Dùng chung màu xanh
            case 'XUẤT KHO': return 'badge-delete'; // Dùng chung màu đỏ
            default: return 'badge-default';
        }
    };

    // Hàm render Chi tiết cực kỳ thông minh
    const renderLogDetail = (log) => {
        if (log.hanhDong === 'THÊM') {
            return (
                <div className="diff-view">
                    <span className="new-val">➕ {log.duLieuMoi}</span>
                </div>
            );
        }
        if (log.hanhDong === 'XÓA') {
            return (
                <div className="diff-view">
                    <span className="old-val">❌ {log.duLieuCu}</span>
                </div>
            );
        }
        // Trường hợp SỬA, NHẬP KHO, XUẤT KHO (Cần hiển thị mũi tên so sánh)
        return (
            <div className="diff-view">
                <span className="old-val">{log.duLieuCu || 'N/A'}</span>
                <span className="arrow">➔</span>
                <span className="new-val">{log.duLieuMoi || 'N/A'}</span>
            </div>
        );
    };

    // --- XỬ LÝ LỌC DỮ LIỆU ---
    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.nguoiThaoTac?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              log.bangDuLieu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              log.idBanGhi?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'ALL' || log.hanhDong === filterAction;
        
        return matchesSearch && matchesAction;
    });

    // Reset lại trang 1 nếu người dùng bắt đầu gõ tìm kiếm
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterAction]);

    // --- XỬ LÝ PHÂN TRANG ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const handleClearFilter = () => {
        setSearchTerm('');
        setFilterAction('ALL');
    };

    if (loading) return <div className="loader">⏳ Đang tải lịch sử hệ thống...</div>;

    return (
        <div className="logs-container">
            <div className="logs-header">
                <h2>📜 Nhật Ký Hoạt Động Hệ Thống</h2>
                <p>Theo dõi mọi thay đổi dữ liệu từ nhân viên ({filteredLogs.length} kết quả)</p>
            </div>

            {/* THANH CÔNG CỤ TÌM KIẾM VÀ LỌC */}
            <div className="logs-toolbar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Tìm nhân viên, đối tượng, mã ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '8px 12px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                
                <select 
                    value={filterAction} 
                    onChange={(e) => setFilterAction(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="ALL">Tất cả hành động</option>
                    <option value="THÊM">Chỉ xem THÊM mới</option>
                    <option value="SỬA">Chỉ xem SỬA đổi</option>
                    <option value="XÓA">Chỉ xem XÓA</option>
                    <option value="NHẬP KHO">Chỉ xem NHẬP KHO</option>
                    <option value="XUẤT KHO">Chỉ xem XUẤT KHO</option>
                </select>

                {(searchTerm || filterAction !== 'ALL') && (
                    <button onClick={handleClearFilter} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}>
                        ✖ Xóa Lọc
                    </button>
                )}
            </div>

            <div className="logs-table-wrapper">
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th width="15%">Thời Gian</th>
                            <th width="15%">Nhân Viên</th>
                            <th width="10%">Hành Động</th>
                            <th width="20%">Đối Tượng (ID)</th>
                            <th width="40%">Chi Tiết Thay Đổi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentLogs.length > 0 ? currentLogs.map((log) => (
                            <tr key={log.id}>
                                <td className="time-cell">{formatDateTime(log.thoiGian)}</td>
                                <td>
                                    <span className="user-name">👤 {log.nguoiThaoTac}</span>
                                </td>
                                <td>
                                    <span className={`action-badge ${getActionClass(log.hanhDong)}`}>
                                        {log.hanhDong}
                                    </span>
                                </td>
                                <td className="table-name">
                                    <strong>{log.bangDuLieu}</strong> <br/>
                                    <span style={{ fontSize: '12px', color: '#7f8c8d' }}>#{log.idBanGhi}</span>
                                </td>
                                <td className="detail-cell">
                                    {renderLogDetail(log)}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#7f8c8d'}}>
                                    Không tìm thấy dữ liệu thao tác nào phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
            {totalPages > 1 && (
                <div className="pagination" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        style={{ padding: '6px 12px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        ◀ Trước
                    </button>
                    <span style={{ padding: '6px 12px', fontWeight: 'bold' }}>
                        Trang {currentPage} / {totalPages}
                    </span>
                    <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        style={{ padding: '6px 12px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Sau ▶
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminLogs;