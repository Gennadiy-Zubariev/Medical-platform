import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header style={{
            padding: "10px 20px",
            background: "#f3f3f3",
            marginBottom: "20px",
            display: "flex",
            gap: "20px"
        }}>
            <Link to="/">Головна</Link>

            {!isAuthenticated && (
                <>
                    <Link to="/login">Вхід</Link>
                    <Link to="/register">Реєстрація</Link>
                </>
            )}

            {isAuthenticated && (
                <button onClick={logout} style={{ cursor: "pointer" }}>
                    Вийти ({user?.username})
                </button>
            )}
        </header>
    );
}
