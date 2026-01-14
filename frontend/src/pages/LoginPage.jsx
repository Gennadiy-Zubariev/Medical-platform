import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(username, password);

        if (res.success) {
            if (res.role === "patient") navigate("/patient/dashboard");
            else if (res.role === "doctor") navigate("/doctor/dashboard");
            else navigate("/");
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={2} sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Вхід у систему
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Введіть ваші дані, щоб продовжити роботу.
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                label="Логін"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                fullWidth
                            />
                            <TextField
                                label="Пароль"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                fullWidth
                            />

                            {error && <Alert severity="error">{error}</Alert>}

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Button type="submit" variant="contained" fullWidth>
                                    Увійти
                                </Button>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => {
                                        setUsername("");
                                        setPassword("");
                                    }}
                                >
                                    Скасувати
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
}
