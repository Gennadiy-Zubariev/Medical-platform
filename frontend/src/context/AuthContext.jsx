import {createContext, useContext, useEffect, useState} from "react";
import {loginUser, getMyProfile} from "../api/accounts";

const AuthContext = createContext(null)

// Here we store the user object from the backend while we check the token
export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

// -------------------------------------------------------
//     CHECKING THE TOKEN WHEN RESTARTING THE PAGE
// -------------------------------------------------------

    useEffect(() => {
        const accessToken = localStorage.getItem("access");
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
                // If we are on the login page, we do not need to delete or reset anything,
                // Because it could be an obsolete token that we're just about to replace
                if (window.location.pathname !== "/login") {
                    localStorage.removeItem("access");
                    localStorage.removeItem("refresh");
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [])


// -------------------------------------------------------
//     LOGIN
// -------------------------------------------------------

    const login = async (username, password) => {
        try {
            setError(null);

            const res = await loginUser({username, password});
            console.log('Login Response:', res);

            const access = res.access;
            const refresh = res.refresh;

            localStorage.setItem("access", access);
            localStorage.setItem("refresh", refresh);

            const profile = await getMyProfile();
            setUser(profile);

            return {success: true, role: profile.role};

        } catch (err) {
            console.error('Login Error:', err);
            setError('Невірний логін або пароль!');
            return {success: false, error: err};
        }
    };

// -------------------------------------------------------
//     LOGOUT
// -------------------------------------------------------

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setUser(null);
    };

// -------------------------------------------------------
//     WHAT WE RETURN TO THE SYSTEM
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

