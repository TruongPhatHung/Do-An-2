import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // 🎯 Chặn click nhiều lần

    const { login, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Bật icon xoay xoay

        try {
            const success = await login(username, password);
            if (success) {
                navigate('/dashboard'); // 🎯 Chuyển hướng về trang chủ Dashboard
            }
        } finally {
            setIsLoading(false); // Tắt icon xoay xoay
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <div className="login-overlay"></div>

            <div className="login-box">
                <div className="login-header">
                    {/* Dùng icon user-circle của Font Awesome */}
                    <div className="avatar-container">
                        <i className="fas fa-user-circle user-avatar-icon"></i>
                    </div>
                    <p>Đăng nhập</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label>Tên đăng nhập</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                placeholder="Nhập tên tài khoản..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            {/* Icon User đặt sau input */}
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Mật khẩu</label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />

                            {/* Icon ẩn/hiện mật khẩu (Con mắt) */}
                            <span className="toggle-password" onClick={togglePasswordVisibility} title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="button-group">
                        {/* 🎯 Nút Submit tự động mờ đi và xoay vòng khi đang xử lý */}
                        <button type="submit" className="login-button" disabled={isLoading || !username || !password}>
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span> ĐANG XỬ LÝ...
                                </>
                            ) : (
                                "ĐĂNG NHẬP"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;