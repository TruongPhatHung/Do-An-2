import React, { createContext,useState } from 'react';
import api from '../services/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const[error,setError] = useState('');

  const mockUsers = [
    { maND: 'U01', username: 'admin1', password: '123', role: 'ADMIN', hoTen: 'Quản trị viên 1' },
    { maND: 'U02', username: 'kho1', password: '123', role: 'KHO', hoTen: 'Thủ kho Nguyễn Văn A' },
    { maND: 'U03', username: 'muahang1', password: '123', role: 'MUAHANG', hoTen: 'Nhân viên mua hàng B' },
    { maND: 'U04', username: 'hungsayhi', password: '123', role: 'KHO', hoTen: 'Hùng Say Hi' }, // User của bạn
  ];

  const login = async (username,password) => {
    try {
        // const response = await api.post('/auth/login',{username,password});
        // const {token,role,maND,hoTen} = response.data;
        // localStorage.setItem('token',token);
        // setUser({username,role,maND,hoTen});
        // setError('');
        const foundUser = mockUsers.find(
            (u) => u.username === username && u.password === password
        );

        // 3. Xử lý kết quả tìm kiếm
        if (foundUser) {
            // Nếu tìm thấy: Lấy CHÍNH XÁC quyền từ danh sách giả lập
            setUser({
                maND: foundUser.maND,
                username: foundUser.username,
                role: foundUser.role, // Tự động lấy role chuẩn của user đó
                hoTen: foundUser.hoTen
            });
            setError('');
            return true;
        } else {
            // Nếu gõ sai tên hoặc mật khẩu (không có trong mockUsers)
            setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
            return false;
        }

        return true;
    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
        return false;
    }
 };
 const logout = () => {
    localStorage.removeItem('token');
        setUser(null);
 };
 return(
    <AuthContext.Provider value={{user,login,logout,error}}>
        {children}
    </AuthContext.Provider>
 );
};