import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { registerPatient } from "../api/accounts";

export default function RegisterPatientPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    insurance_policy: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await registerPatient(form);
      console.log("Registered patient:", data);
      alert("Пацієнта успішно зареєстровано!");
      navigate("/login", {
          state: { message: "Реєстрація успішна. Увійдіть у систему."}
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
    <Container maxWidth="sm">
      <Paper elevation={2} sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Реєстрація пацієнта
            </Typography>
            <Typography color="text.secondary">
              Заповніть форму, щоб створити акаунт пацієнта.
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
                name="insurance_policy"
                label="Номер медичного страхування"
                value={form.insurance_policy}
                onChange={handleChange}
                required
                fullWidth
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Реєстрація..." : "Зареєструватись як пацієнт"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
