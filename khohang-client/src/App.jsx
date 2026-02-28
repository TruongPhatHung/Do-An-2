import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import HangHoaList from './pages/HangHoaList';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hang-hoa" element={<HangHoaList />} />
          
          {/* <Route path="/hang-hoa" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'KHO', 'MUAHANG']}>
              <HangHoaList />
            </ProtectedRoute>
           } 
         /> */}
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;