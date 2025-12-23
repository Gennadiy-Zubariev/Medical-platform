import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {Link, useNavigate} from "react-router-dom";


export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(username, password);

        if (res.success) {
            if (res.role === 'patient') navigate('/patient/dashboard');
            else if (res.role === 'doctor') navigate('/doctor/dashboard');
            else navigate('/');
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Вхід у систему</h1>
            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Логін"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <br />

                <input
                    placeholder="Пароль"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br />

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit">Увійти</button>
                <button
                    type="button"
                    onClick={() => {
                        setUsername('');
                        setPassword('');
                    }}
                >
                    Скасувати
                </button>

            </form>
        </div>
    );
}