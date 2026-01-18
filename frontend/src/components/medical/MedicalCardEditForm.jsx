import { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import { glassCardSx, glassPanelSx } from "../../theme/glass";

export default function MedicalCardEditForm({ initialValues, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialValues);

  const handleChange = (patch) => setForm((prev) => ({ ...prev, ...patch }));
    return (
    <Stack spacing={2}>
      <TextField
        label="Група крові"
        value={form.blood_type}
        onChange={(e) => handleChange({ blood_type: e.target.value })}
        fullWidth
      />

      <TextField
        label="Алергії"
        value={form.allergies}
        onChange={(e) => handleChange({ allergies: e.target.value })}
        multiline
        rows={2}
        fullWidth
      />

      <TextField
        label="Хронічні захворювання"
        value={form.chronic_diseases}
        onChange={(e) => handleChange({ chronic_diseases: e.target.value })}
        multiline
        rows={2}
        fullWidth
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button onClick={() => onSubmit(form)} variant="contained">
          💾 Зберегти
        </Button>
        <Button onClick={onCancel} variant="outlined">
          Скасувати
        </Button>
      </Stack>
    </Stack>
  );
}
