import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="main-header">
            <nav className="header-nav">
                <Link to="/">Головна</Link>

                {!isAuthenticated && (
                    <>
                        <Link to="/login">Вхід</Link>
                        <Link to="/register">Реєстрація</Link>
                    </>
                )}

                {/* Гість */}
                {isAuthenticated && user && (
                    <>
                        {/* Особистий кабінет */}
                        {user.role === "patient" && (
                            <Link to="/patient/dashboard">Мій кабінет</Link>
                        )}

                        {user.role === "doctor" && (
                            <Link to="/doctor/dashboard">Мій кабінет</Link>
                        )}

                        {/* Вихід */}
                        <button onClick={logout} style={{ cursor: "pointer" }}>
                            Вийти ({user?.username})
                        </button>
                    </>
                )}
                <Link to="/doctors" className="btn-primary">
                    Переглянути лікарів
                </Link>
            </nav>
        </header>
    );
}
