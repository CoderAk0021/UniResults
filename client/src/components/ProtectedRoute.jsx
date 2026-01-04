import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Check if token exists
    const token = localStorage.getItem('adminToken');

    // If token exists, let them pass (render child routes via Outlet)
    // If NOT, kick them to /login
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;