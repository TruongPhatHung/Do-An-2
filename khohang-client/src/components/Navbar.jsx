import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import NotificationBell from './NotificationBell';
import { FiRefreshCw } from 'react-icons/fi'; // Import icon làm mới
import { FaWarehouse } from 'react-icons/fa'; // 👈 THÊM DÒNG NÀY: Import icon từ FontAwesome
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            console.log("1. Bắt đầu quá trình Đăng xuất...");
            const username = localStorage.getItem("username");
            console.log("2. Username lấy được từ localStorage:", username);

            if (username) {
                console.log("3. Đang gọi API báo Server tắt đèn cho:", username);
                const response = await api.post('/auth/logout', { username: username });
                console.log("4. Phản hồi từ Server:", response.data);
            } else {
                console.warn("⚠️ Không tìm thấy username trong LocalStorage, bỏ qua gọi API");
            }
        } catch (error) {
            console.error("❌ Lỗi khi gọi API đăng xuất:", error.response || error);
        } finally {
            console.log("5. Xóa dữ liệu máy khách và chuyển trang...");
            logout(); // Giả định hàm này gọi removeItem
            // Thêm chắc cú:
            localStorage.removeItem("username");
            navigate('/login');
        }
    };

    // Hàm lấy ảnh đại diện dựa trên Role hoặc URL có sẵn
    const getAvatar = () => {
        if (user?.avatar) return user.avatar; 

        const role = user?.role?.toUpperCase();
        if (role === 'ADMIN') return 'src/components/avarta/Screenshot 2026-03-21 185323.png'; 
        if (role === 'QUANLYKHO') return 'src/components/avarta/Screenshot 2026-03-21 185323.png';
        if (role === 'KHO') return 'src/components/avarta/Screenshot 2026-03-21 185323.png';   
        if (role === 'MUAHANG') return 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; 
        return 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; 
    };

    // Hàm xử lý làm mới trang
    const handleRefresh = () => {
        window.location.reload();
    };
    
    if (!user) return null;

    return (
        <nav className="navbar navbar-top">
            
            {/* --- BÊN TRÁI: Nút Menu --- */}
            <div className="nav-left-area">
                <button className="menu-toggle-btn" onClick={onToggleSidebar} title="Đóng/Mở Sidebar">
                    ☰
                </button>
            </div>
            {/* --- Ở GIỮA: Logo WMS-SYSTEM --- */}
            <div 
                className="nav-center-area" 
                onClick={() => navigate('/dashboard')} 
                title="Về trang chủ"
            >
                {/* 👈 SỬA Ở ĐÂY: Thay cục 📦 bằng thẻ icon */}
                <FaWarehouse className="nav-logo-icon" /> WMS-SYSTEM
            </div>

            {/* --- BÊN PHẢI: Refresh, Thông báo, Profile & Đăng xuất --- */}
            <div className="nav-right-area nav-user">
                
                {/* Nút Làm Mới */}
                <button 
                    className="refresh-btn" 
                    onClick={handleRefresh}
                    title="Làm mới trang"
                >
                    <FiRefreshCw />
                </button>

                {/* Nút Thông Báo */}
                <NotificationBell />

                {/* Profile */}
                <div className="nav-user-profile nav-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                        src={getAvatar()}
                        alt="avatar"
                        className="nav-avatar"
                        title={`Tài khoản: ${user.hoTen}`}
                        style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div className="nav-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                        <span className="nav-name">Chào, <strong>{user.role || 'Người dùng'}</strong></span>
                        <span className="nav-role" style={{ fontSize: '12px', color: '#666' }}></span>
                    </div>
                </div>

                <button onClick={handleLogout} className="btn-logout-custom logout-btn">
                    Đăng xuất
                </button>
            </div>
            
        </nav>
    );
};

export default Navbar;