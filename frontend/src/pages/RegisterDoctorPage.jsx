import { useState } from "react";
import { registerDoctor } from "../api/accounts";
import { useNavigate } from "react-router-dom";

export default function RegisterDoctorPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    license_number: "",
    specialization: "",
    experience_years: 0,
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "experience_years"
          ? value.replace(/\D/g, "") // тільки цифри
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // приводимо experience_years до числа
      const payload = {
        ...form,
        experience_years: Number(form.experience_years || 0),
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

        alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Реєстрація лікаря</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 400,
        }}
      >
        <input
          name="username"
          placeholder="Логін"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          placeholder="Пароль"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="first_name"
          placeholder="Ім'я"
          value={form.first_name}
          onChange={handleChange}
        />
        <input
          name="last_name"
          placeholder="Прізвище"
          value={form.last_name}
          onChange={handleChange}
        />

        <input
          name="license_number"
          placeholder="Номер ліцензії"
          value={form.license_number}
          onChange={handleChange}
          required
        />
        <input
          name="specialization"
          placeholder="Спеціалізація (наприклад, терапевт)"
          value={form.specialization}
          onChange={handleChange}
          required
        />
        <input
          name="experience_years"
          placeholder="Стаж (років)"
          value={form.experience_years}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Реєстрація..." : "Зареєструватись як лікар"}
        </button>
      </form>
    </div>
  );
}
