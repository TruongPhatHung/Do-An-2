import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'; 
import Login from './pages/Login';
import HangHoaList from './pages/HangHoaList';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NhaCungCapList from './pages/NhaCungCapList';
import POForm from './pages/POForm';
import NhapKho from './pages/NhapKho';
import POList from './pages/POList';
import PhieuXuatKho from './pages/PhieuXuatKho';
import Dashboard from './pages/Dashboard';
import NotificationBell from './components/NotificationBell';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NhaCungCapForm from './pages/NhaCungCapForm';
import QuanLyTaiKhoan from './pages/QuanLyTaiKhoan';
import EditNhaCungCap from './pages/EditNhaCungCap';
import CategoryManager from './pages/CategoryManager'; // Mới từ bạn của bạn
import PODetail from './pages/PODetail';
import AdminLogs from './pages/AdminLogs';
import ChiTietHangHoa from './pages/ChiTietHangHoa'; // Mới từ bạn của bạn
import SuaHangHoa from './pages/SuaHangHoa'; // Mới từ bạn của bạn

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthProvider>
      <Router>
        {/* Sử dụng layout class để khớp với file App.css đã tạo */}
        <div className={`app-container ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
          
          <Sidebar isOpen={isSidebarOpen} />

          <div className="main-wrapper">
            <Navbar onToggleSidebar={toggleSidebar} />
            
            <main className="content-area">
              <Routes>
                {/* Công khai */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Các trang quản lý - Đã bọc ProtectedRoute đầy đủ */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><HangHoaList /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><CategoryManager /></ProtectedRoute>} />
                <Route path="/product-detail/:id" element={<ProtectedRoute><ChiTietHangHoa /></ProtectedRoute>} />
                <Route path="/edit-product/:id" element={<ProtectedRoute><SuaHangHoa /></ProtectedRoute>} />

                {/* Nhà cung cấp */}
                <Route path="/suppliers" element={<ProtectedRoute><NhaCungCapList /></ProtectedRoute>} />
                <Route path="/add-supplier" element={<ProtectedRoute><NhaCungCapForm /></ProtectedRoute>} />
                <Route path="/edit-supplier/:id" element={<ProtectedRoute><EditNhaCungCap /></ProtectedRoute>} />

                {/* Đơn hàng PO (Cập nhật path mới nhất) */}
                <Route path="/don-hang" element={<ProtectedRoute><POForm /></ProtectedRoute>} />
                <Route path="/danh-sach-po" element={<ProtectedRoute><POList /></ProtectedRoute>} />
                <Route path="/po-detail" element={<ProtectedRoute><PODetail /></ProtectedRoute>} />

                {/* Kho vận */}
                <Route path="/nhap-kho" element={<ProtectedRoute><NhapKho /></ProtectedRoute>} />
                <Route path="/xuat-kho" element={<ProtectedRoute><PhieuXuatKho /></ProtectedRoute>} />

                {/* Hệ thống */}
                <Route path="/tai-khoan" element={<ProtectedRoute><QuanLyTaiKhoan /></ProtectedRoute>} />
                <Route path="/admin/logs" element={<ProtectedRoute><AdminLogs /></ProtectedRoute>} />
                <Route path="/thong-bao" element={<ProtectedRoute><NotificationBell /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;