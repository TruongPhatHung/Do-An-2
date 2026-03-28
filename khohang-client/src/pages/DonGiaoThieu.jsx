import React, { useState, useEffect, useRef } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiMessageSquare, FiClock, FiAlertCircle, FiSend, FiX, FiTruck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // 🎯 FIX LỖI 1: Đã import useNavigate
import './DonGiaoThieu.css';

const DonGiaoThieu = () => {
    const navigate = useNavigate();
    const [donThiets, setDonThiets] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatBodyRef = useRef(null);

    // Tải danh sách các Yêu Cầu Xuất Kho có trạng thái "Giao Thiếu"
    useEffect(() => {
        fetchDonGiaoThieu();
    }, []);

    const fetchDonGiaoThieu = async () => {
        try {
            const response = await api.get('/yeu-cau-xuat');
            const thieuList = response.data.filter(req => req.trangThai === 'Giao Thiếu');
            setDonThiets(thieuList);
        } catch (error) {
            toast.error("Lỗi tải danh sách đơn giao thiếu!");
        }
    };

    // Mở khung Chat và tải lịch sử
    const openChat = async (order) => {
        setSelectedOrder(order);
        try {
            const res = await api.get(`/trao-doi/${order.maYeuCau}`);
            setChatHistory(res.data);
        } catch (error) {
            toast.error("Lỗi tải lịch sử trò chuyện!");
        }
    };

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chatHistory]);

    // Gửi tin nhắn mới
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const payload = {
            maYeuCau: selectedOrder.maYeuCau,
            nguoiGui: "Nhân viên Kho",
            vaiTro: "INTERNAL",
            noiDung: newMessage
        };

        try {
            const res = await api.post('/trao-doi', payload);
            setChatHistory([...chatHistory, res.data]);
            setNewMessage('');
        } catch (error) {
            toast.error("Không gửi được tin nhắn!");
        }
    };

    // Hàm kiểm tra Deadline
    const renderDeadline = (ngayHen) => {
        if (!ngayHen) return <span className="status-unknown">Chưa hẹn ngày</span>;

        const deadline = new Date(ngayHen).getTime();
        const now = new Date().getTime();
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
            return <span className="status-overdue"><FiAlertCircle /> Trễ {Math.abs(daysLeft)} ngày</span>;
        } else if (daysLeft === 0) {
            return <span className="status-warning"><FiClock /> Giao trong hôm nay</span>;
        } else {
            return <span className="status-safe">Còn {daysLeft} ngày</span>;
        }
    };

    return (
        <div className="backorder-container">
            <div className="backorder-header">
                <h2>⚠️ Quản Lý Đơn Giao Thiếu (Nợ Khách)</h2>
                <p>Theo dõi và đàm phán với khách hàng về các đơn hàng chưa xuất đủ</p>
            </div>

            <div className="backorder-card">
                <table className="backorder-table">
                    <thead>
                        <tr>
                            <th>Mã Lệnh</th>
                            <th>Nơi Nhận</th>
                            <th>Ngày Tạo Lệnh</th>
                            <th>Trạng Thái</th>
                            <th className="text-center">Hẹn Giao Bù</th>
                            <th className="text-center">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donThiets.length > 0 ? donThiets.map((don) => (
                            <tr key={don.maYeuCau}>
                                <td className="fw-bold text-primary">{don.maYeuCau}</td>
                                <td className="fw-bold">{don.noiNhan}</td>
                                <td>{new Date(don.ngayCanXuat).toLocaleDateString('vi-VN')}</td>
                                <td><span className="badge-missing">Giao Thiếu</span></td>
                                <td className="text-center fw-bold">
                                    {renderDeadline(don.ngayHenGiaoBu)}
                                </td>

                                {/* 🎯 FIX LỖI 2: Đưa 2 nút bấm này VÀO TRONG vòng lặp map */}
                                <td className="text-center" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button className="btn-chat" onClick={() => openChat(don)} title="Nhắn tin với khách">
                                        <FiMessageSquare /> Chat
                                    </button>

                                    <button
                                        className="btn-export-bu"
                                        onClick={() => navigate('/xuat-kho', { state: { maYeuCauTuDong: don.maYeuCau } })}
                                        title="Tiến hành xuất kho phần còn thiếu"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                                    >
                                        <FiTruck /> Giao Bù
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            /* Khu vực này chỉ hiện khi không có đơn nợ nào */
                            <tr>
                                <td colSpan="6" className="text-center text-muted" style={{ padding: '30px' }}>
                                    🎉 Tuyệt vời! Hiện tại kho không nợ đơn nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL KHUNG CHAT (Giữ nguyên) */}
            {selectedOrder && (
                <div className="chat-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>

                        <div className="chat-header">
                            <div>
                                <h3>Trao đổi Lệnh: {selectedOrder.maYeuCau}</h3>
                                <p className="chat-subtitle">Khách hàng: {selectedOrder.noiNhan}</p>
                            </div>
                            <button className="btn-close-chat" onClick={() => setSelectedOrder(null)}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="chat-body" ref={chatBodyRef}>
                            {chatHistory.length === 0 ? (
                                <div className="chat-empty">Chưa có trao đổi nào. Hãy bắt đầu nhắn tin cho khách hàng.</div>
                            ) : (
                                chatHistory.map((msg, index) => {
                                    const isInternal = msg.vaiTro === 'INTERNAL';
                                    return (
                                        <div key={index} className={`chat-message-wrapper ${isInternal ? 'chat-right' : 'chat-left'}`}>
                                            <div className="chat-sender">{msg.nguoiGui} • {new Date(msg.thoiGian).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                            <div className={`chat-bubble ${isInternal ? 'bubble-internal' : 'bubble-external'}`}>
                                                {msg.noiDung}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <form className="chat-footer" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="btn-send" disabled={!newMessage.trim()}>
                                <FiSend size={18} /> Gửi
                            </button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
};

export default DonGiaoThieu;