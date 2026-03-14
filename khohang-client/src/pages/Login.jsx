import React, {useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { login, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if(success){
            navigate('/hang-hoa');
    }
};
return (
 <div className="login-container">
      <div className="login-box">
       
        <h2 className="login-title">Quản lý kho hàng</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
           
            <span className="input-icon">👤</span> 
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="input-icon">🔒</span>
          </div>
            <div className="button-group">
            <button type="submit" className="login-button">
              Đăng Nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Login;