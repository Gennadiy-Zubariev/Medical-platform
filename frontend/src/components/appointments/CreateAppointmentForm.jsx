import { useEffect, useState } from "react";
import {
  createAppointment,
  getAvailableSlots,
} from "../../api/appointments.js";
import { getDoctorsPublic } from "../../api/doctors";
import "./Appointment.css"

export default function CreateAppointmentForm({ onCreated, refreshKey }) {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");


  // 🔹 завантажуємо слоти
  useEffect(() => {
    if (!doctorId || !date) return;

    setError(null);
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
      <input
        type="text"
        placeholder="Пошук лікаря (імʼя або прізвище)"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          getDoctorsPublic({ search: e.target.value }).then(setDoctors);
        }}
      />

      {doctors.map((d) => (
        <div
            key={d.id}
            className="doctor-option"
            onClick={() => {
                setDoctorId(d.id);
                setDoctors([]);
                setSearch(`${d.user.first_name} ${d.user.last_name}`);
            }}
        >
            {d.user.first_name} {d.user.last_name}
        </div>
      ))}

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
        <div className="slots">
          <p>Оберіть час:</p>
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              className={
                  selectedSlot === slot
                      ? "slot selected"
                      : "slot"
              }
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
