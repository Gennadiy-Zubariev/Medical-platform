import { useState } from "react";
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
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
    <Card elevation={1} component="form" onSubmit={handleSubmit}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Додати медичний запис</Typography>

          <TextField
            label="Діагноз *"
            required
            value={form.diagnosis}
            onChange={(e) =>
              setForm({ ...form, diagnosis: e.target.value })
            }
            fullWidth
          />

          <TextField
            label="Рекомендації"
            value={form.recommendations}
            onChange={(e) =>
              setForm({ ...form, recommendations: e.target.value })
            }
            multiline
            rows={2}
            fullWidth
          />

          <TextField
            label="Рецепт"
            value={form.recipe}
            onChange={(e) =>
              setForm({ ...form, recipe: e.target.value })
            }
            multiline
            rows={2}
            fullWidth
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Збереження..." : "Зберегти запис"}
            </Button>
            <Button type="button" onClick={onCancel} variant="outlined">
              Скасувати
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
