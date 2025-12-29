import { useState } from "react";
import formatDate from "../../utils/formatDate.js";
import { updateMyMedicalRecord } from "../../api/medical.js";

export default function MedicalRecordItem({
  record,
  canEdit = false,
  onDelete,
  onUpdated,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    diagnosis: record.diagnosis || '',
    recommendations: record.recommendations || '',
    recipe: record.recipe || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      await updateMyMedicalRecord(record.id, form);
      await onUpdated?.();
      setIsEditing(false);
    } catch (err) {
      setError(
          err.response?.data?.detail ||
          'Не вдалося зберегти запис'
      );
    } finally {
      setLoading(false);
    }
  };

//EDIT MODE
  if (isEditing) {
    return (
        <div style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
          <p><b>Редагування запису</b></p>
          <div>
            <label>Діагноз</label><br />
            <input
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            />
          </div>

          <div>
            <label>Рекомендації</label><br />
            <textarea
              value={form.recommendations}
              onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
            />
          </div>

          <div>
            <label>Рецепт</label><br />
            <textarea
              value={form.recipe}
              onChange={(e) => setForm({ ...form, recipe: e.target.value })}
            />
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button onClick={handleSave} disabled={loading}>
            {loading ? 'Збереження...' : 'Зберегти'}
          </button>
          <button onClick={() => setIsEditing(false)}>
            Скасувати
          </button>
        </div>
    );
  }


  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 10,
        marginBottom: 10,
      }}
    >
      <p>
        <b>Дата:</b> {formatDate(record.created_at)}
      </p>

      <p>
        <b>Лікар:</b>{" "}
        {record.doctor.user.first_name} {record.doctor.user.last_name}
      </p>

      <p>
        <b>Діагноз:</b> {record.diagnosis}
      </p>

      {record.recommendations && (
        <p>
          <b>Рекомендації:</b> {record.recommendations}
        </p>
      )}

      {record.recipe && (
        <p>
          <b>Рецепт:</b> {record.recipe}
        </p>
      )}

      {/*  Дії ТІЛЬКИ для лікаря */}
      {canEdit && (
        <div style={{ marginTop: 8 }}>
          <button onClick={() => setIsEditing(true)}>✏ Редагувати</button>
          <button
            onClick={() => onDelete?.(record.id)}
            style={{ marginLeft: 8 }}
          >
            🗑 Видалити
          </button>
        </div>
      )}
    </div>
  );
}
