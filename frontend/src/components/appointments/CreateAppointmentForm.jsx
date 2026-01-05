import { useEffect, useState } from "react";
import {
  createAppointment,
  getAvailableSlots,
} from "../../api/appointments.js";
import { getDoctors } from "../../api/accounts.js";

export default function CreateAppointmentForm({ onCreated, refreshKey }) {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 завантажуємо лікарів
  useEffect(() => {
      ( async () => {
          try {
              const data = await getDoctors();
              setDoctors(Array.isArray(data) ? data : data.results || []);
          } catch {
              setError("Не вдалося завантажити лікарів");
          }
      })();
  }, []);

  // 🔹 завантажуємо слоти
  useEffect(() => {
    if (!doctorId || !date) return;

    setSlots([]);
    setSelectedSlot("");


    getAvailableSlots(doctorId, date)
      .then((data) => setSlots(data))
      .catch((err) => {
        setSlots([]);
        setError(
          err.response?.data?.detail ||
            "Не вдалося завантажити вільні слоти"
        );
      });
  }, [doctorId, date, refreshKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setLoading(true);
    setError(null);

    try {
      await createAppointment({
        doctor: doctorId,
        start_datetime: selectedSlot,
      });

      setSelectedSlot("");
      const updatedSlots = await getAvailableSlots(doctorId, date);
      setSlots(updatedSlots);
      onCreated?.();
      alert("Запис створено");
    } catch (err) {
      const data = err.response?.data;
      setError(
          data?.detail ||
          data?.non_field_errors?.[0] ||
          "Не вдалося створити запис"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
        onSubmit={handleSubmit}
        style={{ border: "1px solid #aaa", padding: 15, marginBottom: 20 }}>
      <h3>Запис до лікаря</h3>

      {/* Вибір лікаря */}
      <select
        value={doctorId}
        onChange={(e) => setDoctorId(e.target.value)}
      >
        <option value="">Оберіть лікаря</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.user.first_name} {d.user.last_name}
          </option>
        ))}
      </select>

      <br />

      {/* Вибір дати */}
      {doctorId && (
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      )}

      {/* Повідомлення */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Вільні слоти */}
      {slots.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <p>Оберіть час:</p>
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              style={{
                margin: 5,
                background:
                  selectedSlot === slot ? "#8ecae6" : "#eee",
              }}
              onClick={() => setSelectedSlot(slot)}
            >
              {new Date(slot).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </button>
          ))}
        </div>
      )}

      {/* Кнопка */}
      <br />
      <button
        type="submit"
        disabled={!selectedSlot || loading}

      >
        {loading ? "Створення..." : "Записатись"}
      </button>
    </form>
  );
}
