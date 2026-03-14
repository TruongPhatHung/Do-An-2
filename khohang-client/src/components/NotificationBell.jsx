import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import './NotificationBell.css'; 

const NotificationBell = () => {
    const [lowStockItems, setLowStockItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Lấy dữ liệu kho và lọc ra các mặt hàng sắp hết
    useEffect(() => {
        const fetchInventoryAlerts = async () => {
            try {
                // Tùy theo Backend của bạn là /hang-hoa hay /products nhé
                const response = await api.get('/products'); 
                const allProducts = response.data;
                
                // Thuật toán cốt lõi: Lọc các món có Tồn kho <= Mức cảnh báo
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

    // Khi click vào thông báo, chuyển thẳng sang trang Lên Đơn Đặt Hàng (PO)
    const handleAlertClick = () => {
        setIsOpen(false);
        navigate('/po-form'); 
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
                                <li key={index} className="alert-item" onClick={handleAlertClick}>
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
                        <div className="dropdown-footer" onClick={handleAlertClick}>
                            🛒 Lên đơn nhập hàng ngay
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;