import { useState } from "react";
import { registerPatient } from "../api/accounts";

export default function RegisterPatientPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    insurance_number: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await registerPatient(form);
      console.log("Registered patient:", data);
      alert("Пацієнта успішно зареєстровано!");
      // тут буде редірект після створення
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data || {}) ||
        "Помилка реєстрації";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Реєстрація пацієнта</h1>

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
          name="insurance_number"
          placeholder="Номер медичного страхування"
          value={form.insurance_number}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Реєстрація..." : "Зареєструватись як пацієнт"}
        </button>
      </form>
    </div>
  );
}
