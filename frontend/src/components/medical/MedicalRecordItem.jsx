import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import formatDate from "../../utils/formatDate.js";
import { updateMyMedicalRecord } from "../../api/medical.js";
import { glassCardSx, glassPanelSx } from "../../theme/glass";

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
        <Card
          elevation={2}
          sx={glassCardSx}
        >
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle1"><b>Редагування запису</b></Typography>
              <TextField
                label="Діагноз"
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                fullWidth
              />
              <TextField
                label="Рекомендації"
                value={form.recommendations}
                onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Рецепт"
                value={form.recipe}
                onChange={(e) => setForm({ ...form, recipe: e.target.value })}
                multiline
                rows={2}
                fullWidth
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button onClick={handleSave} disabled={loading} variant="contained">
                  {loading ? "Збереження..." : "Зберегти"}
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outlined">
                  Скасувати
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
    );
  }


  return (
    <Card
      elevation={2}
      sx={glassCardSx}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Typography>
            <b>Дата:</b> {formatDate(record.created_at)}
          </Typography>

          <Typography>
            <b>Лікар:</b>{" "}
            {record.doctor.user.first_name} {record.doctor.user.last_name}
          </Typography>

          <Typography>
            <b>Діагноз:</b> {record.diagnosis}
          </Typography>

          {record.recommendations && (
            <Typography>
              <b>Рекомендації:</b> {record.recommendations}
            </Typography>
          )}

          {record.recipe && (
            <Typography>
              <b>Рецепт:</b> {record.recipe}
            </Typography>
          )}

          {canEdit && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button onClick={() => setIsEditing(true)} variant="outlined">
                ✏ Редагувати
              </Button>
              <Button onClick={() => onDelete?.(record.id)} color="error" variant="contained">
                🗑 Видалити
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
