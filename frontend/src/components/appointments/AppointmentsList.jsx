import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

export default function AppointmentsList({
  appointments = [],
  role = "patient",
  onCancel,
  onConfirm,
  onComplete,
  onOpenChat,
}) {
  if (!appointments?.length) return null;

  const statusColor = {
    pending: "warning",
    confirmed: "success",
    completed: "default",
  };

  return (
    <Stack spacing={2}>
      {appointments.map((a) => (
        <Card
          key={a.id}
          elevation={2}
          sx={{
            backgroundImage: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
          }}
        >
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                {role === "doctor" ? "Пацієнт:" : "Лікар:"}{" "}
                {role === "doctor"
                  ? `${a.patient.user.first_name} ${a.patient.user.last_name}`
                  : `${a.doctor.user.first_name} ${a.doctor.user.last_name}`}
              </Typography>

              {role === "doctor" && (
                <Button
                  component={RouterLink}
                  to={`/doctor/medical-card/${a.patient.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ alignSelf: "flex-start" }}
                >
                  📄 Медична картка
                </Button>
              )}

              <Typography>
                <b>Дата:</b> {new Date(a.start_datetime).toLocaleString()}
              </Typography>

              <Box>
                <Chip
                  label={`Статус: ${a.status}`}
                  color={statusColor[a.status] || "default"}
                  variant="outlined"
                />
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {role === "patient" && a.status === "pending" && onCancel && (
                  <Button color="error" variant="contained" onClick={() => onCancel(a.id)}>
                    Скасувати запис
                  </Button>
                )}

                {role === "doctor" && a.status === "pending" && onConfirm && (
                  <Button color="success" variant="contained" onClick={() => onConfirm(a.id)}>
                    Підтвердити
                  </Button>
                )}

                {role === "doctor" && a.status === "confirmed" && onComplete && (
                  <Button color="success" variant="contained" onClick={() => onComplete(a.id)}>
                    Завершити прийом
                  </Button>
                )}

                <Button variant="outlined" onClick={() => onOpenChat?.(a.id)}>
                  💬 Чат
                  {a.has_unread_messages && (
                    <Box component="span" sx={{ ml: 1, color: "error.main", fontWeight: 700 }}>
                      ●
                    </Box>
                  )}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
