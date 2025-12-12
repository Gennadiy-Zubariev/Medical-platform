import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, getMyProfile } from "../api/accounts";

const AuthContext = createContext(null)

// тут зберігаємо об'єкт користувача з бекенду поки перевіряємо токен
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

// -------------------------------------------------------
//     ПЕРЕВІРКА ТОКЕНУ ПРИ ПЕРЕЗАПУСКУ СТОРІНКИ
// -------------------------------------------------------

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const res = await getMyProfile();
                setUser(res);
            } catch (err) {
              console.error("Помилка отримання профілю", err);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
            } finally {
              setLoading(false);
            }
        })();
    }, [])


// -------------------------------------------------------
//     ЛОГІН
// -------------------------------------------------------

    const login = async (username, password) => {
        try {
            setError(null);

            const res = await loginUser({ username, password });
            console.log('Login Response:', res);

            const access = res.access;
            const refresh = res.refresh;

            localStorage.setItem("accessToken", access);
            localStorage.setItem("refreshToken", refresh);

            const profile = await getMyProfile();
            setUser(profile);

            return { success: true, role: profile.role };

        }   catch (err) {
            console.error('Login Error:', err);
            setError('Невірний логін або пароль!');
            return { success: false, error: err };
        }
    };

// -------------------------------------------------------
//     ЛОГАУТ
// -------------------------------------------------------

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
    };

// -------------------------------------------------------
//     ЩО ПОВЕРТАЄМО У СИСТЕМУ
// -------------------------------------------------------

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth має використовуватись всередині <AuthProvider>');
    }
    return ctx;
}

