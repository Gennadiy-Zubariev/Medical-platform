import { useState, useEffect } from "react";
import "./Profile.css"

export default function DoctorSchedulePanel({ doctor, onToggleBooking, onUpdateSchedule }) {
  const WEEK_DAYS = [
    { value: 0, label: "Пн" },
    { value: 1, label: "Вт" },
    { value: 2, label: "Ср" },
    { value: 3, label: "Чт" },
    { value: 4, label: "Пт" },
    { value: 5, label: "Сб" },
    { value: 6, label: "Нд" },
  ]
  const [form, setForm] = useState({
    work_start: "",
    work_end: "",
    slot_duration: 30,
    work_days: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doctor) {
      setForm({
        work_start: doctor.work_start || "",
        work_end: doctor.work_end || "",
        slot_duration: doctor.slot_duration ?? 30,
        work_days: doctor.work_days || [],
      });
    }
  }, [doctor]);

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      work_days: prev.work_days.includes(day)
        ? prev.work_days.filter(d => d !== day)
        : [...prev.work_days, day],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "slot_duration" ? Number(value) : value }));
  };

  const handleSave = async () => {
    if (!onUpdateSchedule) return;
    setSaving(true);
    try {
      await onUpdateSchedule({
        work_start: form.work_start,
        work_end: form.work_end,
        slot_duration: form.slot_duration,
        work_days: form.work_days,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!doctor) return null;

  return (
    <div className="schedule-card">
      <h3>Графік прийому</h3>

      <p className={`booking-status ${doctor.is_booking_open ? "open" : "closed"}`}>
        <b>Статус запису:</b>{" "}
        {doctor.is_booking_open ? "відкритий" : "закритий"}

        {onToggleBooking && (
          <button
              className={doctor.is_booking_open ? "btn-danger" : "btn-success"}
              onClick={onToggleBooking}
          >
            {doctor.is_booking_open ? "Закрити запис" : "Відкрити запис"}
          </button>
        )}
      </p>

      <div className="week-days">
        <span>Робочі дні</span>
        <div className="days-row">
          {WEEK_DAYS.map(day => (
            <label key={day.value} className="day-checkbox">
              <input
                type="checkbox"
                checked={form.work_days.includes(day.value)}
                onChange={() => toggleDay(day.value)}
              />
              {day.label}
            </label>
          ))}
        </div>
      </div>


      <div className="shedule-grid">
        <label>
          <span>Початок роботи</span>
          <input
            type="time"
            name="work_start"
            value={form.work_start}
            onChange={handleChange}
          />
        </label>

        <label>
          <span>Кінець роботи</span>
          <input
            type="time"
            name="work_end"
            value={form.work_end}
            onChange={handleChange}
          />
        </label>

        <label>
          <span>Тривалість слота (хв)</span>
          <input
            type="number"
            min={5}
            step={5}
            name="slot_duration"
            value={form.slot_duration}
            onChange={handleChange}
          />
        </label>

        <button className="btn-save" onClick={handleSave} disabled={saving || !onUpdateSchedule}>
          {saving ? "Збереження..." : "Зберегти"}
        </button>
      </div>

    </div>
  );
}