import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoctorPublicById } from "../api/doctors";

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const formatTime = (value) => {
  if (!value) return "--";
  return value.slice(0, 5); // "09:00"
};
  const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  const formatDays = (days) => {
    if (!Array.isArray(days) || days.length === 0) return "--";
    return days.map(d => WEEK_DAYS[d]).join(", ");
  };

  useEffect(() => {
    getDoctorPublicById(id).then(setDoctor);
  }, [id]);

  if (!doctor) return <p>Завантаження...</p>;


  return (
    <div className="profile-card">
      <img
        src={doctor.photo || "/avatar-placeholder.png"}
        className="profile-avatar"
        alt="Фото лікаря"
      />

      <div>
        <h3>
          {doctor.user.first_name} {doctor.user.last_name}
        </h3>

        <p><b>Спеціалізація:</b> {doctor.specialization}</p>
        <p><b>Досвід:</b> {doctor.experience_years} років</p>
        <p><b>Про себе:</b> {doctor.bio || "--"}</p>
        <p><b>Робочі дні:</b>{" "}{formatDays(doctor.work_days)}</p>
        <p><b>Початок робочого дня:</b> {formatTime(doctor.work_start || "--")}</p>
        <p><b>Кінець робочого дня:</b> {formatTime(doctor.work_end || "--")}</p>

        <p>
          <b>Запис:</b>{" "}
          {doctor.is_booking_open ? "Відкритий" : "Закритий"}
        </p>

      </div>
    </div>
  );
}
