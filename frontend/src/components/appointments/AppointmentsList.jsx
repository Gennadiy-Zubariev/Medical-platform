import { Link } from "react-router-dom";
import "./Appointment.css";

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
        <div key={a.id} className="appointment-card">
          <p className="appointment-person">
            <b>{role === "doctor" ? "Пацієнт:" : "Лікар:"}</b> {" "}
            {role === "doctor"
                ? `${a.patient.user.first_name} ${a.patient.user.last_name}`
                : `${a.doctor.user.first_name} ${a.doctor.user.last_name}`}
          </p>

          {role === "doctor" && (
            <Link
              to={`/doctor/medical-card/${a.patient.id}`}
              className="btn-outline"
            >
              📄 Медична картка
            </Link>
          )}

          <p>
            <b>Дата:</b> {new Date(a.start_datetime).toLocaleString()}
          </p>
          <p className={`appointments-status ${a.status}`}>
            <b>Статус:</b> {a.status}
          </p>
          <div className="appointment-actions">
            {role === "patient" && a.status === "pending" && onCancel && (
              <button className="btn-danger" onClick={() => onCancel(a.id)}>Скасувати запис</button>
            )}

            {role === "doctor" && a.status === "pending" && onConfirm && (
              <button  className="btn-success" onClick={() => onConfirm(a.id)}>Підтвердити</button>
            )}

            {role === "doctor" && a.status === "confirmed" && onComplete && (
              <button className="btn-success" onClick={() => onComplete(a.id)}>Завершити прийом</button>
            )}

            <button className="btn-chat" onClick={() => onOpenChat?.(a.id)}>
              💬 Чат
              {a.has_unread_messages && <span className="chat-dot">●</span>}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}