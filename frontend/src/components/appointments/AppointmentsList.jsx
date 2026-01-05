import { Link } from "react-router-dom";

export default function AppointmentsList({
  appointments = [],
  role = "patient",
  onCancel,
  onConfirm,
  onComplete,
  onOpenChat,
}) {
  if (!appointments?.length) return null;

  return (
    <div>
      {appointments.map((a) => (
        <div key={a.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <p>
            <b>{role === "doctor" ? "Пацієнт:" : "Лікар:"}</b> {role === "doctor" ? `${a.patient.user.first_name} ${a.patient.user.last_name}` : `${a.doctor.user.first_name} ${a.doctor.user.last_name}`}
          </p>

          {role === "doctor" && (
            <Link
              to={`/doctor/medical-card/${a.patient.id}`}
              style={{ textDecoration: "none", padding: "6px 10px", border: "1px solid #1976d2", borderRadius: 4, color: "#1976d2", fontWeight: "bold" }}
            >
              📄 Медична картка
            </Link>
          )}

          <p>
            <b>Дата:</b> {new Date(a.start_datetime).toLocaleString()}
          </p>
          <p>
            <b>Статус:</b> {a.status}
          </p>

          {role === "patient" && a.status === "pending" && onCancel && (
            <button onClick={() => onCancel(a.id)}>Скасувати запис</button>
          )}

          {role === "doctor" && a.status === "pending" && onConfirm && (
            <button onClick={() => onConfirm(a.id)}>Підтвердити</button>
          )}

          {role === "doctor" && a.status === "confirmed" && onComplete && (
            <button onClick={() => onComplete(a.id)}>Завершити прийом</button>
          )}

          <button className="btn-chat" onClick={() => onOpenChat?.(a.id)}>
            💬 Чат
            {a.has_unread_messages && <span style={{ color: "red", marginLeft: 6 }}>●</span>}
          </button>
        </div>
      ))}
    </div>
  );
}