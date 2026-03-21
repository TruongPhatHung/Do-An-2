import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { AuthContext } from '../Context/AuthContext'; // 🎯 Thêm AuthContext để lấy quyền
import './NotificationBell.css';

const NotificationBell = () => {
    const [lowStockItems, setLowStockItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const { user } = useContext(AuthContext); // 🎯 Lấy thông tin user đang đăng nhập

    // Lấy dữ liệu kho và lọc ra các mặt hàng sắp hết
    useEffect(() => {
        const fetchInventoryAlerts = async () => {
            try {
                const response = await api.get('/products');
                const allProducts = response.data;

                // Lọc các món có Tồn kho <= Mức cảnh báo
                const warningItems = allProducts.filter(
                    item => item.soLuongTon <= item.soLuongToiThieu
                );
                setLowStockItems(warningItems);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu kiểm tra kho:", error);
            }
        };
        fetchInventoryAlerts();
    }, []);

    // Xử lý sự kiện click ra ngoài để đóng menu thông báo
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // 🎯 LOGIC XỬ LÝ CLICK THEO PHÂN QUYỀN
    const handleAlertClick = (item) => {
        setIsOpen(false);
        const role = user?.role?.toUpperCase();

        if (role === 'KHO') {
            // Nếu là thủ kho -> Giả lập hành động gửi yêu cầu mua hàng
            alert(`📩 Đã gửi yêu cầu bộ phận Mua Hàng bổ sung gấp mặt hàng: [${item.tenHang}]`);
            // Sau này bạn có thể gọi API ở đây: api.post('/notifications', { to: 'MUAHANG', message: ... })
        } else {
            // Nếu là MUAHANG hoặc ADMIN -> Chuyển sang trang tạo đơn (PO)
            // Truyền luôn mã hàng sang trang PO để tiện xử lý nếu cần
            navigate('/create-po', { state: { suggestProduct: item.maHang } });
        }
    };

    // Khi bấm vào nút "Lên đơn nhập hàng ngay" ở dưới cùng
    const handleFooterClick = () => {
        setIsOpen(false);
        const role = user?.role?.toUpperCase();
        if (role === 'KHO') {
            alert("📩 Đã báo cáo tình trạng thiếu hụt toàn kho cho bộ phận Mua Hàng!");
        } else {
            navigate('/create-po');
        }
    };

    return (
        <div className="notification-wrapper" ref={dropdownRef}>
            {/* Biểu tượng chuông */}
            <div className="bell-icon" onClick={() => setIsOpen(!isOpen)}>
                🔔
                {/* Chỉ hiện chấm đỏ đếm số lượng nếu có hàng sắp hết */}
                {lowStockItems.length > 0 && (
                    <span className="badge-alert">{lowStockItems.length}</span>
                )}
            </div>

            {/* Khung Dropdown thông báo */}
            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h4>⚠️ Cảnh báo sắp hết hàng</h4>
                    </div>

                    {lowStockItems.length === 0 ? (
                        <div className="no-alert">
                            Kho đang an toàn, không có mặt hàng nào thiếu. 🎉
                        </div>
                    ) : (
                        <ul className="alert-list">
                            {lowStockItems.map((item, index) => (
                                // 🎯 TRUYỀN ITEM VÀO HÀM CLICK
                                <li key={index} className="alert-item" onClick={() => handleAlertClick(item)}>
                                    <div className="alert-info">
                                        <strong>{item.maHang}</strong> - {item.tenHang}
                                    </div>
                                    <div className="alert-stock">
                                        Tồn kho: <span className="text-danger">{item.soLuongTon}</span> / Tối thiểu: {item.soLuongToiThieu}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {lowStockItems.length > 0 && (
                        // 🎯 TÁCH HÀM CLICK CHO FOOTER
                        <div className="dropdown-footer" onClick={handleFooterClick}>
                            {user?.role?.toUpperCase() === 'KHO' ? '📢 Báo cáo bộ phận Mua Hàng' : '🛒 Lên đơn nhập hàng ngay'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;