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

import YeuCauXuatForm from './pages/YeuCauXuatForm';
import CategoryManager from './pages/CategoryManager'; // Mới từ bạn của bạn


import PODetail from './pages/PODetail';
import AdminLogs from './pages/AdminLogs';
import ChiTietHangHoa from './pages/ChiTietHangHoa';
import SuaHangHoa from './pages/SuaHangHoa';

// Import đủ rùi nè
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LichSuXuatKho from './pages/LichSuXuatKho';
import DonGiaoThieu from './pages/DonGiaoThieu';
import DuyetYeuCauMua from './pages/DuyetYeuCauMua';
import LapYeuCauMuaForm from './pages/LapYeuCauMuaForm';
import ChiTietPhieuXuat from './pages/ChiTietPhieuXuat';
import LichSuYeuCauMua from './pages/LichSuYeuCauMua'; // Kiểm tra đường dẫn này!
import DuyetYeuCauXuat from './pages/DuyetYeuCauXuat';
import LichSuYeuCauXuat from './pages/LichSuYeuCauXuat';
import LichSuNhapKho from './pages/LichSuNhapKho';
import PhieuNhapDetail from './pages/PhieuNhapDetail';

import ThemTaiKhoan from './pages/ThemTaiKhoan'; // Trang thêm tài khoản mới
import ChiTietTaiKhoan from './pages/ChiTietTaiKhoan'; // Trang chi tiết tài khoản
import SuaTaiKhoan from './pages/SuaTaiKhoan'; // Trang sửa tài khoản

import PhieuXuatDetail from './pages/PhieuXuatDetail';


function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthProvider>
      <Router>
        {/* 🎯 CẮM ĐIỆN CHO CÁI LOA Ở ĐÂY NÈ! NÓ SẼ HIỆN Ở TẤT CẢ CÁC TRANG */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="colored"
        />

        {/* Sử dụng layout class để khớp với file App.css đã tạo */}
        <div className={`app-container ${isSidebarOpen ? '' : 'sidebar-closed'}`}>


          <Sidebar isOpen={isSidebarOpen} />

          {/* Khối nội dung bên phải bao gồm Navbar và Page Content */}
          <div className="main-wrapper">
            {/* Truyền hàm toggle vào Navbar */}

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
                <Route path="/don-giao-thieu" element={<ProtectedRoute><DonGiaoThieu /></ProtectedRoute>} />

                {/* Kho vận */}
                <Route path="/nhap-kho" element={<ProtectedRoute><NhapKho /></ProtectedRoute>} />
                <Route path="/xuat-kho" element={<ProtectedRoute><PhieuXuatKho /></ProtectedRoute>} />
                <Route path="/lich-su-xuat-kho" element={<ProtectedRoute><LichSuXuatKho /></ProtectedRoute>} />
                <Route path="/chi-tiet-phieu-xuat/:id" element={<ProtectedRoute><ChiTietPhieuXuat /></ProtectedRoute>} />
                <Route path="/lich-su-yeu-cau-mua" element={<ProtectedRoute><LichSuYeuCauMua /></ProtectedRoute>} />
                <Route path="/lich-su-yeu-cau-xuat" element={<ProtectedRoute><LichSuYeuCauXuat></LichSuYeuCauXuat></ProtectedRoute>} />
                <Route path="/chi-tiet-phieu-nhap/:id" element={<ProtectedRoute><PhieuNhapDetail /></ProtectedRoute>} />
                <Route path="/lich-su-nhap-kho" element={<ProtectedRoute><LichSuNhapKho /></ProtectedRoute>} />
                <Route path="/phieu-xuat-detail/:id" element={<ProtectedRoute><PhieuXuatDetail /></ProtectedRoute>} />
                

                {/* YeuCauXuat */}
                <Route path="/lap-lenh-xuat" element={<ProtectedRoute><YeuCauXuatForm /></ProtectedRoute>} />
                <Route path="/lap-lenh-yeu-cau-mua" element={<ProtectedRoute><LapYeuCauMuaForm /></ProtectedRoute>} />
                <Route path="/duyet-yeu-cau-xuat" element={<ProtectedRoute><DuyetYeuCauXuat /></ProtectedRoute>} />


                {/* Hệ thống */}
                <Route path="/tai-khoan" element={<ProtectedRoute><QuanLyTaiKhoan /></ProtectedRoute>} />
                <Route path="/them-tai-khoan" element={<ProtectedRoute><ThemTaiKhoan /></ProtectedRoute>} />
                <Route path="/chi-tiet-tai-khoan/:id" element={<ProtectedRoute><ChiTietTaiKhoan /></ProtectedRoute>} />
                <Route path="/admin/logs" element={<ProtectedRoute><AdminLogs /></ProtectedRoute>} />
                <Route path="/sua-tai-khoan/:id" element={<ProtectedRoute><SuaTaiKhoan /></ProtectedRoute>} />
                <Route path="/thong-bao" element={<ProtectedRoute><NotificationBell /></ProtectedRoute>} />

                <Route path="/duyet-yeu-cau-mua" element={<ProtectedRoute><DuyetYeuCauMua /></ProtectedRoute>} />

              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;