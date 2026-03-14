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
import PODetail from './pages/PODetail';
import AdminLogs from './pages/AdminLogs';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Bọc toàn bộ App trong 1 div flex cột */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          
          <Navbar /> {/* Thanh ngang trên cùng */}

          {/* Wrapper cho Sidebar và Nội dung chính */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            
            <Sidebar /> {/* Thanh dọc bên trái */}

            {/* Nội dung chính bên phải */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f4f6f9' }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/products" element={<ProtectedRoute><HangHoaList /></ProtectedRoute>} />
                <Route path="/suppliers" element={<ProtectedRoute><NhaCungCapList /></ProtectedRoute>} />
                <Route path="/don-hang" element={<POForm />} />
                <Route path="/nhap-kho" element={<NhapKho />} />
                <Route path="/danh-sach-po" element={<POList />} />
                <Route path="/xuat-kho" element={<PhieuXuatKho />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/thong-bao" element={<NotificationBell />} />
               
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/tai-khoan" element={<ProtectedRoute><QuanLyTaiKhoan /></ProtectedRoute>} />
                <Route path="/add-supplier" element={<ProtectedRoute><NhaCungCapForm/></ProtectedRoute>}/>
                <Route path="/po-detail" element={<PODetail />} />
                <Route path="/admin/logs" element={<AdminLogs />} />
              </Routes>
            </div>

          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;