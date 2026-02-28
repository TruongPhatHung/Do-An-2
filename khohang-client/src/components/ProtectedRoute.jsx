import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';

const ProtectedRoute = ({ children ,allowedRoles }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <div>Bạn không có quyền truy cập chức năng này!</div>;
    }
    return children;
};
export default ProtectedRoute;