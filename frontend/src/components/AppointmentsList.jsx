import { Link } from "react-router-dom";

export default function AppointmentsList({
  appointments,
  role,
  onConfirm,
  onComplete,
  onCancel,
  onOpenChat,
}) {
  if (!appointments.length) {
    return <p>Записів немає</p>;
  }

  return (
    <>
      {appointments.map((a) => (
        <div
          key={a.id}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          {/* ===== HEADER ===== */}
          {role === "doctor" ? (
            <p>
              <b>Пацієнт:</b>{" "}
              {a.patient.user.first_name} {a.patient.user.last_name}
            </p>
          ) : (
            <p>
              <b>Лікар:</b>{" "}
              {a.doctor.user.first_name} {a.doctor.user.last_name}
            </p>
          )}

          {/* ===== MED CARD LINK ===== */}
          {role === "doctor" && (
            <Link to={`/doctor/medical-card/${a.patient.id}`}>
              📄 Медична картка
            </Link>
          )}

          <p>
            <b>Дата:</b> {new Date(a.start_datetime).toLocaleString()}
          </p>

          <p>
            <b>Статус:</b> {a.status}
          </p>

          {/* ===== ACTIONS ===== */}
          {role === "doctor" && a.status === "pending" && (
            <button onClick={() => onConfirm(a.id)}>Підтвердити</button>
          )}

          {role === "doctor" && a.status === "confirmed" && (
            <button onClick={() => onComplete(a.id)}>
              Завершити прийом
            </button>
          )}

          {role === "patient" && a.status === "pending" && (
            <button onClick={() => onCancel(a.id)}>
              Скасувати запис
            </button>
          )}

          {/* ===== CHAT ===== */}
          <button onClick={() => onOpenChat(a.id)}>
            💬 Чат
            {a.has_unread_message && (
              <span style={{ color: "red", marginLeft: 6 }}>●</span>
            )}
          </button>
        </div>
      ))}
    </>
  );
}
