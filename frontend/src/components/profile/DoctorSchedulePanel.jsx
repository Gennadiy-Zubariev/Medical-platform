import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

export default function DoctorSchedulePanel({ doctor, onToggleBooking, onUpdateSchedule }) {
  const WEEK_DAYS = [
    { value: 0, label: "Пн" },
    { value: 1, label: "Вт" },
    { value: 2, label: "Ср" },
    { value: 3, label: "Чт" },
    { value: 4, label: "Пт" },
    { value: 5, label: "Сб" },
    { value: 6, label: "Нд" },
  ];
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
    <Card elevation={2}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5">Графік прийому</Typography>
              <Typography color="text.secondary">
                Налаштуйте робочі дні та тривалість прийому.
              </Typography>
            </Box>
            <Chip
              label={doctor.is_booking_open ? "Запис відкритий" : "Запис закритий"}
              color={doctor.is_booking_open ? "success" : "default"}
              variant="outlined"
            />
            {onToggleBooking && (
              <FormControlLabel
                control={
                  <Switch
                    checked={doctor.is_booking_open}
                    onChange={onToggleBooking}
                    color="success"
                  />
                }
                label={doctor.is_booking_open ? "Закрити запис" : "Відкрити запис"}
              />
            )}
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1">Робочі дні</Typography>
            <ToggleButtonGroup
              value={form.work_days}
              onChange={(_, value) => {
                const days = (value || []).map((v) => Number(v));
                setForm((prev) => ({ ...prev, work_days: days }));
              }}
            >
              {WEEK_DAYS.map((day) => (
                <ToggleButton key={day.value} value={day.value}>
                  {day.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Початок роботи"
              type="time"
              name="work_start"
              value={form.work_start}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Кінець роботи"
              type="time"
              name="work_end"
              value={form.work_end}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Тривалість слота (хв)"
              type="number"
              name="slot_duration"
              inputProps={{ min: 5, step: 5 }}
              value={form.slot_duration}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <Button variant="contained" onClick={handleSave} disabled={saving || !onUpdateSchedule}>
            {saving ? "Збереження..." : "Зберегти"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
