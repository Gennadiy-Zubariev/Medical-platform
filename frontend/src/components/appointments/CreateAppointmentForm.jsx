import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createAppointment, getAvailableSlots } from "../../api/appointments.js";
import { getDoctorsPublic } from "../../api/doctors";

export default function CreateAppointmentForm({ onCreated, refreshKey }) {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!doctorId || !date) return;

    setError(null);
    setSlots([]);
    setSelectedSlot("");

    getAvailableSlots(doctorId, date)
      .then((data) => setSlots(data))
      .catch((err) => {
        setSlots([]);
        setError(
          err.response?.data?.detail ||
            "Не вдалося завантажити вільні слоти"
        );
      });
  }, [doctorId, date, refreshKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setLoading(true);
    setError(null);

    try {
      await createAppointment({
        doctor: doctorId,
        start_datetime: selectedSlot,
      });

      setSelectedSlot("");
      const updatedSlots = await getAvailableSlots(doctorId, date);
      setSlots(updatedSlots);
      onCreated?.();
      alert("Запис створено");
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail ||
          data?.non_field_errors?.[0] ||
          "Не вдалося створити запис"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    setSearch(value);
    if (!value) {
      setDoctors([]);
      return;
    }
    setSearching(true);
    try {
      const data = await getDoctorsPublic({ search: value });
      setDoctors(data);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card
      elevation={2}
      sx={{
        backgroundImage: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      }}
    >
      <CardContent>
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Box>
            <Typography variant="h5">Запис до лікаря</Typography>
            <Typography color="text.secondary">
              Оберіть лікаря, дату та доступний час.
            </Typography>
          </Box>

          <Box>
            <TextField
              label="Пошук лікаря (імʼя або прізвище)"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              fullWidth
            />
            {searching && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption">Пошук лікарів...</Typography>
              </Stack>
            )}
            {doctors.length > 0 && (
              <Box sx={{ mt: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <List dense>
                  {doctors.map((d) => (
                    <ListItemButton
                      key={d.id}
                      onClick={() => {
                        setDoctorId(d.id);
                        setDoctors([]);
                        setSearch(`${d.user.first_name} ${d.user.last_name}`);
                      }}
                    >
                      <ListItemText
                        primary={`${d.user.first_name} ${d.user.last_name}`}
                        secondary={d.specialization}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          <Divider />

          <TextField
            label="Оберіть дату"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={!doctorId}
          />

          {error && <Alert severity="error">{error}</Alert>}

          {slots.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="subtitle1">Оберіть час:</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {slots.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    variant={selectedSlot === slot ? "contained" : "outlined"}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {new Date(slot).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Button>
                ))}
              </Stack>
            </Stack>
          )}

          <Button type="submit" variant="contained" disabled={!selectedSlot || loading}>
            {loading ? "Створення..." : "Записатись"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
