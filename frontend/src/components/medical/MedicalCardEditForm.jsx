import { useState } from "react";

export default function MedicalCardEditForm({ initialValues, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialValues);

  const handleChange = (patch) => setForm((prev) => ({ ...prev, ...patch }));
    return (
    <>
      <div>
        <label>Група крові:</label><br />
        <input
          value={form.blood_type}
          onChange={(e) =>
            handleChange({ blood_type: e.target.value })
          }
        />
      </div>

      <div>
        <label>Алергії:</label><br />
        <textarea
          value={form.allergies}
          onChange={(e) =>
            handleChange({ allergies: e.target.value })
          }
        />
      </div>

      <div>
        <label>Хронічні захворювання:</label><br />
        <textarea
          value={form.chronic_diseases}
          onChange={(e) =>
            handleChange({ chronic_diseases: e.target.value })
          }
        />
      </div>

      <button onClick={() => onSubmit(form)}>💾 Зберегти</button>
      <button onClick={onCancel}>Скасувати</button>
    </>
  );
}
