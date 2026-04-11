import React, { useState, useEffect, useRef } from 'react';
import api from '../services/axiosConfig';
import { toast } from 'react-toastify';
import { FiMessageSquare, FiClock, FiAlertCircle, FiSend, FiX, FiTruck, FiTrash2, FiUser, FiInfo, FiPackage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './DonGiaoThieu.css';

const DonGiaoThieu = () => {
    const navigate = useNavigate();
    const [donThiets, setDonThiets] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [ngayHen, setNgayHen] = useState(''); // 🎯 Thêm state để chọn ngày hẹn trong Chat
    const chatBodyRef = useRef(null);

    useEffect(() => {
        fetchDonGiaoThieu();
    }, []);

    // 🎯 Đã nâng cấp: Giữ nguyên việc lấy danh sách, cộng thêm Quét tồn kho ẩn bên dưới
    const fetchDonGiaoThieu = async () => {
        try {
            const response = await api.get('/yeu-cau-xuat');
            const thieuList = response.data.filter(req => req.trangThai === 'Giao Thiếu');

            // Quét xem đơn nào đang có hàng trong kho để làm sáng nút Giao Bù
            const enrichedList = thieuList.map(don => {
                let tongThieu = 0;
                let coTheGiaoBu = false;
                don.chiTiets?.forEach(ct => {
                    const conThieu = ct.soLuongYeuCau - (ct.soLuongDaXuat || 0);
                    if (conThieu > 0) {
                        tongThieu += conThieu;
                        if ((ct.hangHoa?.soLuongTon || 0) > 0) coTheGiaoBu = true;
                    }
                });
                return { ...don, tongThieu, coTheGiaoBu };
            });
            setDonThiets(enrichedList);
        } catch (error) {
            toast.error("Lỗi tải danh sách đơn giao thiếu!");
        }
    };

    const openChat = async (order) => {
        setSelectedOrder(order);
        setNgayHen(''); // Reset ngày hẹn mỗi khi mở chat mới
        try {
            const res = await api.get(`/trao-doi/${order.maYeuCau}`);
            setChatHistory(res.data);
        } catch (error) {
            toast.error("Lỗi tải lịch sử trò chuyện!");
        }
    };

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chatHistory]);

    // ========================================================
    // 🤖 1. HÀM BOT TỰ ĐỘNG PHẢN HỒI (Giữ nguyên 100%)
    // ========================================================
    const autoReplyCustomer = async (orderInfo) => {
        const danhSachCauTraLoi = [
            "Ok shop, giao sớm giúp mình nhé!",
            "Đã ghi nhận. Nhớ giao đủ phần còn thiếu nha.",
            "Mình đang cần gấp đó, mai có hàng giao luôn nhé!",
            "Ok bạn, phần còn lại khi nào có báo mình liền nha."
        ];
        const cauTraLoiNgauNhien = danhSachCauTraLoi[Math.floor(Math.random() * danhSachCauTraLoi.length)];

        const payload = {
            maYeuCau: orderInfo.maYeuCau,
            nguoiGui: orderInfo.noiNhan || "Khách Hàng",
            vaiTro: "EXTERNAL",
            noiDung: cauTraLoiNgauNhien
        };

        try {
            const res = await api.post('/trao-doi', payload);
            setChatHistory(prevHistory => [...prevHistory, res.data]);
        } catch (error) {
            console.error("Lỗi bot tự động trả lời", error);
        }
    };

    // ========================================================
    // 👤 2. NHÂN VIÊN GỬI TIN NHẮN (Giữ nguyên 100%)
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

        const currentOrder = selectedOrder;

        try {
            const res = await api.post('/trao-doi', payload);
            setChatHistory(prev => [...prev, res.data]);
            setNewMessage('');

            setTimeout(() => {
                autoReplyCustomer(currentOrder);
            }, 1500);
        } catch (error) {
            toast.error("Không gửi được tin nhắn!");
        }
    };

    // ========================================================
    // 📅 3. HÀM CHỐT LỊCH HẸN MỚI
    // ========================================================
    const handleChotNgayHen = async () => {
        if (!ngayHen) return toast.warn("Vui lòng chọn ngày hẹn!");
        try {
            await api.put(`/yeu-cau-xuat/${selectedOrder.maYeuCau}/hen-giao-bu`, { ngayHenGiaoBu: ngayHen });
            toast.success("Đã chốt lịch hẹn giao bù với khách!");
            fetchDonGiaoThieu(); // Refresh bảng ngoài

            // Bắn tin nhắn hệ thống vào Chat
            const msgRes = await api.post('/trao-doi', {
                maYeuCau: selectedOrder.maYeuCau,
                nguoiGui: "Hệ Thống",
                vaiTro: "INTERNAL",
                noiDung: `🔔 Đã chốt lịch giao bù vào ngày: ${new Date(ngayHen).toLocaleDateString('vi-VN')}`
            });
            setChatHistory(prev => [...prev, msgRes.data]);
            setNgayHen('');
        } catch (error) {
            toast.error("Vui lòng báo Backend thêm API hẹn ngày hoặc bỏ qua lỗi này!");
        }
    };

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

    // (Giữ nguyên 100%)
    const renderDeadline = (ngayHen) => {
        if (!ngayHen) return <span className="status-badge status-unknown"><FiInfo /> Chưa hẹn ngày</span>;
        const deadline = new Date(ngayHen).getTime();
        const now = new Date().getTime();
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) return <span className="status-badge status-overdue"><FiAlertCircle /> Trễ {Math.abs(daysLeft)} ngày</span>;
        if (daysLeft === 0) return <span className="status-badge status-warning"><FiClock /> Giao trong hôm nay</span>;
        return <span className="status-badge status-safe"><FiClock /> Còn {daysLeft} ngày</span>;
    };

    return (
        <div className="backorder-container">
            <div className="backorder-header">
                <div className="header-title">
                    <div className="icon-wrapper">
                        <FiAlertCircle size={28} />
                    </div>
                    <div>
                        <h2>Quản Lý Đơn Giao Thiếu</h2>
                        <p>Theo dõi và đàm phán với khách hàng về các đơn hàng chưa xuất đủ</p>
                    </div>
                </div>
            </div>

            <div className="backorder-card">
                <div className="table-responsive">
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
                                    <td className="fw-bold text-primary">#{don.maYeuCau}</td>
                                    <td className="fw-bold text-dark">{don.noiNhan}</td>
                                    <td className="text-muted">{new Date(don.ngayCanXuat).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <span className="badge-missing">Nợ {don.tongThieu || '?'} món</span>
                                    </td>
                                    <td className="text-center">{renderDeadline(don.ngayHenGiaoBu)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-action btn-chat" onClick={() => openChat(don)} title="Nhắn tin với khách">
                                                <FiMessageSquare /> Chat
                                            </button>

                                            {/* 🎯 Nút Giao bù thông minh: Sáng khi có hàng, xám khi hết hàng */}
                                            <button
                                                className={`btn-action ${don.coTheGiaoBu ? 'btn-export-bu active' : 'btn-export-bu disabled'}`}
                                                onClick={() => don.coTheGiaoBu ? navigate('/xuat-kho', { state: { maYeuCauTuDong: don.maYeuCau } }) : toast.info("Kho chưa có hàng để giao bù!")}
                                                title={don.coTheGiaoBu ? "Kho đã có hàng, giao ngay!" : "Đang chờ hàng về"}
                                            >
                                                {don.coTheGiaoBu ? <FiTruck /> : <FiPackage />} Giao Bù
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        <div className="empty-state-content">
                                            <span className="empty-icon">🎉</span>
                                            <h4>Tuyệt vời!</h4>
                                            <p>Hiện tại kho không nợ đơn nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= MODAL KHUNG CHAT ================= */}
            {selectedOrder && (
                <div className="chat-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>

                        <div className="chat-header">
                            <div className="chat-header-info">
                                <div className="chat-avatar"><FiUser size={24} /></div>
                                <div>
                                    <h3>{selectedOrder.noiNhan}</h3>
                                    <p className="chat-subtitle">Mã lệnh: #{selectedOrder.maYeuCau}</p>
                                </div>
                            </div>

                            {/* 🎯 Đã chèn bộ hẹn lịch vào đây */}
                            <div className="chat-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '6px', padding: '4px', border: '1px solid #cbd5e1' }}>
                                    <input
                                        type="date"
                                        value={ngayHen}
                                        onChange={(e) => setNgayHen(e.target.value)}
                                        style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0 5px' }}
                                    />
                                    <button
                                        onClick={handleChotNgayHen}
                                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                                    >
                                        Chốt
                                    </button>
                                </div>

                                <button onClick={handleResetChat} className="btn-header-action btn-trash" title="Xóa lịch sử"><FiTrash2 size={20} /></button>
                                <button className="btn-header-action btn-close" onClick={() => setSelectedOrder(null)}><FiX size={24} /></button>
                            </div>
                        </div>

                        <div className="chat-body" ref={chatBodyRef}>
                            {chatHistory.length === 0 ? (
                                <div className="chat-empty">
                                    <div className="empty-bubble">👋</div>
                                    <p>Chưa có trao đổi nào. Hãy gửi tin nhắn cho khách hàng để bắt đầu.</p>
                                </div>
                            ) : (
                                chatHistory.map((msg, index) => {
                                    const isInternal = msg.vaiTro === 'INTERNAL';
                                    const isSystem = msg.nguoiGui === 'Hệ Thống'; // 🎯 Style riêng cho tin nhắn hệ thống

                                    if (isSystem) {
                                        return (
                                            <div key={index} style={{ textAlign: 'center', margin: '10px 0', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                                                {msg.noiDung}
                                            </div>
                                        )
                                    }

                                    return (
                                        <div key={index} className={`chat-message-wrapper ${isInternal ? 'chat-right' : 'chat-left'}`}>
                                            {!isInternal && (
                                                <div className="chat-bubble-avatar"><FiUser size={14} /></div>
                                            )}
                                            <div className="chat-message-content">
                                                <div className="chat-sender">{msg.nguoiGui} • {new Date(msg.thoiGian).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                                <div className={`chat-bubble ${isInternal ? 'bubble-internal' : 'bubble-external'}`}>
                                                    {msg.noiDung}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <form className="chat-footer" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Nhắn nhủ với khách hàng..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="btn-send" disabled={!newMessage.trim()}>
                                <FiSend size={18} />
                            </button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
};

export default DonGiaoThieu;