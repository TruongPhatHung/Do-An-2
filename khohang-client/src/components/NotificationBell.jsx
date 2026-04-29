import React, { useState, useEffect, useRef } from 'react';
import api from '../services/axiosConfig';
import { FiBell, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    // 🎯 Dùng useRef để bắt sự kiện click ra ngoài menu
    const dropdownRef = useRef(null);

    // Lấy thông tin user hiện tại (Ưu tiên lấy từ localStorage)
    const currentUser = localStorage.getItem('role') || localStorage.getItem('username') || "ADMIN";

    const fetchNotifications = async () => {
        try {
            const res = await api.get(`/thong-bao/${currentUser}`);
            setNotifications(res.data);
        } catch (error) {
            console.error("Lỗi tải thông báo:", error);
        }
    };

    // 🎯 Xử lý lấy thông báo định kỳ
    useEffect(() => {
        fetchNotifications();

        // Polling: Cứ 15 giây gọi API một lần
        const interval = setInterval(fetchNotifications, 15000);

        // Cleanup: Xóa interval khi component unmount để tránh rò rỉ bộ nhớ
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    // 🎯 Xử lý click ra ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const unreadCount = notifications.filter(n => !n.daDoc).length;

    const handleRead = async (tb) => {
        if (!tb.daDoc) {
            try {
                await api.put(`/thong-bao/doc/${tb.id}`);
                // Cập nhật state nội bộ ngay lập tức cho mượt, không cần đợi API load lại toàn bộ
                setNotifications(prev => prev.map(n => n.id === tb.id ? { ...n, daDoc: true } : n));
            } catch (error) {
                console.error("Lỗi khi đánh dấu đã đọc:", error);
            }
        }
        setIsOpen(false);
        if (tb.duongDan) navigate(tb.duongDan);
    };

    const handleReadAll = async () => {
        try {
            await api.put(`/thong-bao/doc-het/${currentUser}`);
            // Đánh dấu tất cả đã đọc ngay trên giao diện
            setNotifications(prev => prev.map(n => ({ ...n, daDoc: true })));
            setIsOpen(false);
        } catch (error) {
            console.error("Lỗi khi đánh dấu đọc tất cả:", error);
        }
    };

    return (
        <div className="bell-container" ref={dropdownRef}>
            <div className="bell-icon-wrapper" onClick={() => setIsOpen(!isOpen)}>
                <FiBell className="bell-icon" />
                {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <h4>Thông báo</h4>
                        {unreadCount > 0 && (
                            <span className="mark-all" onClick={handleReadAll}>
                                <FiCheck style={{ marginRight: '4px' }} /> Đánh dấu đọc hết
                            </span>
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