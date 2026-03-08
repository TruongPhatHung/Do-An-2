import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import HangHoaList from './pages/HangHoaList';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NhaCungCapList from './pages/NhaCungCapList';
import Navbar from './components/Navbar';
import POForm from './pages/POForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Navbar nằm ngoài Routes để luôn hiển thị */}
        <Navbar /> 
        
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/hang-hoa" element={<HangHoaList />} />
            <Route path="/nha-cung-cap" element={<NhaCungCapList />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/don-hang" element={<POForm />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;