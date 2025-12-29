import { useState } from "react";
import { createMedicalRecord } from "../../api/medical.js";

export default function MedicalRecordForm({ cardId, onCreated, onCancel }) {
  const [form, setForm] = useState({
    diagnosis: "",
    recommendations: "",
    recipe: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createMedicalRecord({
        card_id: cardId,
        diagnosis: form.diagnosis,
        recommendations: form.recommendations,
        recipe: form.recipe,
      });

      setForm({
        diagnosis: "",
        recommendations: "",
        recipe: "",
      });

      onCreated?.(); // оновити список записів
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Не вдалося створити медичний запис"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ border: "1px solid #aaa", padding: 15, marginTop: 20 }}
    >
      <h3>Додати медичний запис</h3>

      <div>
        <label>Діагноз *</label><br />
        <input
          required
          value={form.diagnosis}
          onChange={(e) =>
            setForm({ ...form, diagnosis: e.target.value })
          }
        />
      </div>

      <div>
        <label>Рекомендації</label><br />
        <textarea
          value={form.recommendations}
          onChange={(e) =>
            setForm({ ...form, recommendations: e.target.value })
          }
        />
      </div>

      <div>
        <label>Рецепт</label><br />
        <textarea
          value={form.recipe}
          onChange={(e) =>
            setForm({ ...form, recipe: e.target.value })
          }
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Збереження..." : "Зберегти запис"}
      </button>

      <button type='button' onClick={onCancel} style={{ marginLeft: 8 }}>
        Скасувати
      </button>
    </form>
  );
}
