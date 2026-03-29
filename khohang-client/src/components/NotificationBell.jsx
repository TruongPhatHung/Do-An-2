import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { FiBell, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    // Giả sử sếp lưu role hoặc username trong localStorage lúc đăng nhập
    const currentUser = localStorage.getItem('role') || localStorage.getItem('username') || "ADMIN";

    const fetchNotifications = async () => {
        try {
            const res = await api.get(`/thong-bao/${currentUser}`);
            setNotifications(res.data);
        } catch (error) { console.log(error); }
    };

    useEffect(() => {
        fetchNotifications();
        // Cứ 15 giây tự động hỏi thăm Backend 1 lần để xem có thông báo mới không
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.daDoc).length;

    const handleRead = async (tb) => {
        if (!tb.daDoc) {
            await api.put(`/thong-bao/doc/${tb.id}`);
            fetchNotifications(); // Render lại để mất chấm đỏ
        }
        setIsOpen(false);
        if (tb.duongDan) navigate(tb.duongDan); // Chuyển trang
    };

    const handleReadAll = async () => {
        await api.put(`/thong-bao/doc-het/${currentUser}`);
        fetchNotifications();
        setIsOpen(false);
    };

    return (
        <div className="bell-container">
            <div className="bell-icon-wrapper" onClick={() => setIsOpen(!isOpen)}>
                <FiBell className="bell-icon" />
                {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <h4>Thông báo</h4>
                        {unreadCount > 0 && (
                            <span className="mark-all" onClick={handleReadAll}>Đánh dấu đọc hết</span>
                        )}
                    </div>
                    <div className="dropdown-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notif">Không có thông báo nào.</div>
                        ) : (
                            notifications.slice(0, 10).map(tb => (
                                <div
                                    key={tb.id}
                                    className={`notif-item ${!tb.daDoc ? 'unread' : ''}`}
                                    onClick={() => handleRead(tb)}
                                >
                                    <div className="notif-content">
                                        <strong>{tb.tieuDe}</strong>
                                        <p>{tb.noiDung}</p>
                                        <small>{new Date(tb.ngayTao).toLocaleString('vi-VN')}</small>
                                    </div>
                                    {!tb.daDoc && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;