import { useEffect, useState } from "react";
import {
  getMyAppointments,
  cancelAppointment,
} from "../api/appointments";
import { getMyPatientProfile } from "../api/accounts";
import CreateAppointmentForm from "../components/CreateAppointmentForm";
import {Link} from "react-router-dom";

export default function PatientDashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  // 🔑 ключ для примусового оновлення слотів у формі
  const [refreshSlotsKey, setRefreshSlotsKey] = useState(0);

  const loadAppointments = async () => {
    try {
      const data = await getMyAppointments();
      setAppointments(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : []
      );
    } catch {
      setError("Не вдалося завантажити записи");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyPatientProfile();
        setProfile(data);
      } catch {
        console.error("Не вдалося завантажити профіль пацієнта");
      }
    })();
  }, []);

  const handleCancel = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);

      // оновлюємо список записів
      await loadAppointments();

      // 🔥 сигнал формі: слоти треба перезавантажити
      setRefreshSlotsKey((k) => k + 1);
    } catch (err) {
      alert(
        err.response?.data?.detail ||
        "Не вдалося скасувати запис"
      );
    }
  };

  return (
    <div>
      <h2>Кабінет пацієнта</h2>

    {profile && (
      <div style={{ border: "1px solid #ccc", padding: 15, marginBottom: 20 }}>
        {profile.photo && (
          <img
            src={profile.photo}
            alt="Фото пацієнта"
            style={{ width: 100, borderRadius: "50%" }}
          />
        )}
        <p><b>{profile.user.first_name} {profile.user.last_name}</b></p>
        <p>{profile.user.email}</p>

        <Link to="/patient/medical-card">📄 Моя медична картка</Link>
      </div>
    )}

      {/* 🔹 форма запису */}
      <CreateAppointmentForm
        onCreated={loadAppointments}
        refreshKey={refreshSlotsKey}
      />

      {loading && <p>Завантаження...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && appointments.length === 0 && (
        <p>У вас ще немає записів</p>
      )}

      {appointments.map((a) => (
        <div
          key={a.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <p>
            <b>Лікар:</b> {a.doctor.user.first_name}{" "}
            {a.doctor.user.last_name}
          </p>
          <p>
            <b>Дата:</b>{" "}
            {new Date(a.start_datetime).toLocaleString()}
          </p>
          <p>
            <b>Статус:</b> {a.status}
          </p>

          {/* ❗ тепер скасування тільки для pending */}
          {a.status === "pending" && (
            <button onClick={() => handleCancel(a.id)}>
              Скасувати запис
            </button>
          )}

        </div>
      ))}
    </div>
  );
}
