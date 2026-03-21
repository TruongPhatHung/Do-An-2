import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import CategoryManager from './pages/CategoryManager';
import PODetail from './pages/PODetail';
import AdminLogs from './pages/AdminLogs';
import ChiTietHangHoa from './pages/ChiTietHangHoa';
import SuaHangHoa from './pages/SuaHangHoa';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

          <Navbar />

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

            <Sidebar />

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f4f6f9' }}>
              <Routes>
                {/* Công khai */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Các trang quản lý - Tất cả đều được bảo vệ */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><HangHoaList /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><CategoryManager /></ProtectedRoute>} />
                
                <Route path="/edit-product/:id" element={<ProtectedRoute><SuaHangHoa /></ProtectedRoute>} />

                {/* Nhà cung cấp */}
                <Route path="/suppliers" element={<ProtectedRoute><NhaCungCapList /></ProtectedRoute>} />
                <Route path="/add-supplier" element={<ProtectedRoute><NhaCungCapForm /></ProtectedRoute>} />
                <Route path="/edit-supplier/:id" element={<ProtectedRoute><EditNhaCungCap /></ProtectedRoute>} />

                {/* Đơn hàng PO - Đã đổi path để khớp với lệnh navigate('/orders') và navigate('/create-po') */}
                <Route path="/orders" element={<ProtectedRoute><POList /></ProtectedRoute>} />
                <Route path="/create-po" element={<ProtectedRoute><POForm /></ProtectedRoute>} />
                <Route path="/po-detail" element={<ProtectedRoute><PODetail /></ProtectedRoute>} />

                {/* Kho vận */}
                <Route path="/nhap-kho" element={<ProtectedRoute><NhapKho /></ProtectedRoute>} />
                <Route path="/xuat-kho" element={<ProtectedRoute><PhieuXuatKho /></ProtectedRoute>} />
                <Route path="/product-detail/:id" element={<ProtectedRoute><ChiTietHangHoa /></ProtectedRoute>} />
                {/* Hệ thống */}
                <Route path="/tai-khoan" element={<ProtectedRoute><QuanLyTaiKhoan /></ProtectedRoute>} />
                <Route path="/admin/logs" element={<ProtectedRoute><AdminLogs /></ProtectedRoute>} />
                <Route path="/thong-bao" element={<ProtectedRoute><NotificationBell /></ProtectedRoute>} />
              </Routes>
            </div>

          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;