import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Alert, Box, Button, Container, Paper, Stack, TextField, Typography} from "@mui/material";
import {registerDoctor} from "../api/accounts";
import PageBackground from "../components/PageBackground";
import bg from "../assets/doctors_page.jpg";

export default function RegisterDoctorPage() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        email: "",
        first_name: "",
        last_name: "",
        license_number: "",
        specialization: "",
        experience_years: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        const {name, value} = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                name === "experience_years"
                    ? value.replace(/\D/g, "") // only numbers
                    : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // experience_years to int
            const payload = {
                ...form,
                experience_years: form.experience_years === "" ? null : Number(form.experience_years)
            };

            const data = await registerDoctor(payload);
            console.log("Registered doctor:", data);
            alert("Лікаря успішно зареєстровано!");
            navigate("/login", {
                state: {message: "Реєстрація успішна. Увійдіть у систему."}
            });
        } catch (error) {
            let msg = "Помилка реєстрації";
            const data = error.response?.data;

            if (data && typeof data === "object") {
                const key = Object.keys(data)[0];
                if (key && Array.isArray(data[key])) {
                    msg = data[key][0];
                }
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageBackground image={bg}>
            <Container maxWidth="sm">
                <Paper
                    elevation={2}
                    sx={{
                        p: {xs: 3, md: 4},
                        backgroundImage: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                    }}
                >
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h4" gutterBottom>
                                Реєстрація лікаря
                            </Typography>
                            <Typography color="text.secondary">
                                Заповніть дані, щоб створити профіль лікаря.
                            </Typography>
                        </Box>

                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    name="username"
                                    label="Логін"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />
                                <TextField
                                    name="password"
                                    label="Пароль"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />
                                <TextField
                                    name="email"
                                    label="Email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />
                                <TextField
                                    name="first_name"
                                    label="Ім'я"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    fullWidth
                                />
                                <TextField
                                    name="last_name"
                                    label="Прізвище"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    fullWidth
                                />

                                <TextField
                                    name="license_number"
                                    label="Номер ліцензії"
                                    value={form.license_number}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />
                                <TextField
                                    name="specialization"
                                    label="Спеціалізація (наприклад, терапевт)"
                                    value={form.specialization}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />
                                <TextField
                                    name="experience_years"
                                    label="Стаж (років)"
                                    value={form.experience_years}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />

                                {error && <Alert severity="error">{error}</Alert>}

                                <Button type="submit" variant="contained" disabled={loading}>
                                    {loading ? "Реєстрація..." : "Зареєструватись як лікар"}
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </PageBackground>
    );
}
