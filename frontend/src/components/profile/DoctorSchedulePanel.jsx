import { useState, useEffect } from "react";

export default function DoctorSchedulePanel({ doctor, onToggleBooking, onUpdateSchedule }) {
  const [form, setForm] = useState({
    work_start: "",
    work_end: "",
    slot_duration: 30,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doctor) {
      setForm({
        work_start: doctor.work_start || "",
        work_end: doctor.work_end || "",
        slot_duration: doctor.slot_duration ?? 30,
      });
    }
  }, [doctor]);

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
      });
    } finally {
      setSaving(false);
    }
  };

  if (!doctor) return null;

  return (
    <div style={{ border: "1px solid #ccc", padding: 15, marginBottom: 20 }}>
      <h3>Графік прийому</h3>

      <p>
        <b>Статус запису:</b> {doctor.is_booking_open ? "відкритий" : "закритий"}
        {onToggleBooking && (
          <button style={{ marginLeft: 10 }} onClick={onToggleBooking}>
            {doctor.is_booking_open ? "Закрити запис" : "Відкрити запис"}
          </button>
        )}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
        <label style={{ display: "grid" }}>
          <span>Початок роботи</span>
          <input
            type="time"
            name="work_start"
            value={form.work_start}
            onChange={handleChange}
          />
        </label>

        <label style={{ display: "grid" }}>
          <span>Кінець роботи</span>
          <input
            type="time"
            name="work_end"
            value={form.work_end}
            onChange={handleChange}
          />
        </label>

        <label style={{ display: "grid" }}>
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

        <button onClick={handleSave} disabled={saving || !onUpdateSchedule}>
          {saving ? "Збереження..." : "Зберегти"}
        </button>
      </div>

      <p style={{ marginTop: 10, color: "#666" }}>
        Після зміни параметрів графіка оновіть доступні слоти для нових записів.
      </p>
    </div>
  );
}