import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) return <p>Завантаження...</p>;

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // якщо сторінка для лікарів, а користувач не лікар
    if (role && user.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
}