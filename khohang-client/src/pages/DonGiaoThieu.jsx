import React, { useState, useEffect, useRef } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiMessageSquare, FiClock, FiAlertCircle, FiSend, FiX, FiTruck, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './DonGiaoThieu.css';

const DonGiaoThieu = () => {
    const navigate = useNavigate();
    const [donThiets, setDonThiets] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatBodyRef = useRef(null);

    // Tải danh sách đơn giao thiếu
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

    // ========================================================
    // 🤖 1. HÀM BOT TỰ ĐỘNG PHẢN HỒI (KHÁCH HÀNG)
    // ========================================================
    const autoReplyCustomer = async (orderInfo) => {
        // Tạo ngân hàng câu trả lời cho tự nhiên
        const danhSachCauTraLoi = [
            "Ok shop, giao sớm giúp mình nhé!",
            "Đã ghi nhận. Nhớ giao đủ phần còn thiếu nha.",
            "Mình đang cần gấp đó, mai có hàng giao luôn nhé!",
            "Ok bạn, phần còn lại khi nào có báo mình liền nha."
        ];
        // Bốc ngẫu nhiên 1 câu
        const cauTraLoiNgauNhien = danhSachCauTraLoi[Math.floor(Math.random() * danhSachCauTraLoi.length)];

        const payload = {
            maYeuCau: orderInfo.maYeuCau,
            nguoiGui: orderInfo.noiNhan || "Khách Hàng",
            vaiTro: "EXTERNAL",
            noiDung: cauTraLoiNgauNhien
        };

        try {
            const res = await api.post('/trao-doi', payload);
            // 🎯 LƯU Ý: Phải dùng (prev) để đảm bảo không bị ghi đè state cũ khi setTimeout chạy
            setChatHistory(prevHistory => [...prevHistory, res.data]);
        } catch (error) {
            console.error("Lỗi bot tự động trả lời", error);
        }
    };

    // ========================================================
    // 👤 2. NHÂN VIÊN GỬI TIN NHẮN
    // ========================================================
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const payload = {
            maYeuCau: selectedOrder.maYeuCau,
            nguoiGui: "Nhân viên Kho",
            vaiTro: "INTERNAL",
            noiDung: newMessage
        };

        // Lưu tạm thông tin đơn để bot còn biết đường mà trả lời
        const currentOrder = selectedOrder;

        try {
            const res = await api.post('/trao-doi', payload);
            setChatHistory(prev => [...prev, res.data]);
            setNewMessage('');

            // 🎯 GỌI BOT: Sau khi mình gửi 1.5 giây, khách hàng sẽ tự động rep lại!
            setTimeout(() => {
                autoReplyCustomer(currentOrder);
            }, 1500);

        } catch (error) {
            toast.error("Không gửi được tin nhắn!");
        }
    };

    // Hàm Reset Chat
    const handleResetChat = async () => {
        if (!window.confirm("⚠️ Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện của đơn này?")) return;
        try {
            await api.delete(`/trao-doi/${selectedOrder.maYeuCau}`);
            setChatHistory([]);
            toast.success("Đã xóa sạch lịch sử chat!");
        } catch (error) {
            toast.error("Lỗi: Không xóa được chat!");
        }
    };

    const renderDeadline = (ngayHen) => {
        if (!ngayHen) return <span className="status-unknown">Chưa hẹn ngày</span>;
        const deadline = new Date(ngayHen).getTime();
        const now = new Date().getTime();
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) return <span className="status-overdue"><FiAlertCircle /> Trễ {Math.abs(daysLeft)} ngày</span>;
        if (daysLeft === 0) return <span className="status-warning"><FiClock /> Giao trong hôm nay</span>;
        return <span className="status-safe">Còn {daysLeft} ngày</span>;
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
                                <td className="text-center fw-bold">{renderDeadline(don.ngayHenGiaoBu)}</td>
                                <td className="text-center" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button className="btn-chat" onClick={() => openChat(don)} title="Nhắn tin với khách">
                                        <FiMessageSquare /> Chat
                                    </button>
                                    <button
                                        className="btn-export-bu"
                                        onClick={() => navigate('/xuat-kho', { state: { maYeuCauTuDong: don.maYeuCau } })}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                                    >
                                        <FiTruck /> Giao Bù
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted" style={{ padding: '30px' }}>
                                    🎉 Tuyệt vời! Hiện tại kho không nợ đơn nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ================= MODAL KHUNG CHAT ================= */}
            {selectedOrder && (
                <div className="chat-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>

                        <div className="chat-header">
                            <div>
                                <h3>Trao đổi Lệnh: {selectedOrder.maYeuCau}</h3>
                                <p className="chat-subtitle">Khách hàng: {selectedOrder.noiNhan}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <button
                                    onClick={handleResetChat}
                                    title="Xóa lịch sử trò chuyện"
                                    style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer' }}
                                >
                                    <FiTrash2 size={20} />
                                </button>
                                <button className="btn-close-chat" onClick={() => setSelectedOrder(null)}>
                                    <FiX size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="chat-body" ref={chatBodyRef}>
                            {chatHistory.length === 0 ? (
                                <div className="chat-empty">Chưa có trao đổi nào. Hãy gửi tin nhắn cho khách hàng để bắt đầu.</div>
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

                        <form className="chat-footer" onSubmit={handleSendMessage} style={{ borderTop: 'none' }}>
                            <input
                                type="text"
                                placeholder="Nhắn tin cho khách..."
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