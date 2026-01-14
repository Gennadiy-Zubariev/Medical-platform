import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import { getDoctorPublicById } from "../api/doctors";

export default function DoctorDetailPage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const formatTime = (value) => {
  if (!value) return "--";
  return value.slice(0, 5); // "09:00"
};
  const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  const formatDays = (days) => {
    if (!Array.isArray(days) || days.length === 0) return "--";
    return days.map(d => WEEK_DAYS[d]).join(", ");
  };

  useEffect(() => {
    getDoctorPublicById(id).then(setDoctor);
  }, [id]);

  if (!doctor) {
    return (
      <Container maxWidth="md">
        <Typography>Завантаження...</Typography>
      </Container>
    );
  }


  return (
    <Container maxWidth="md">
      <Card elevation={2}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Stack alignItems="center">
                <Avatar
                  src={doctor.photo || "/avatar-placeholder.png"}
                  alt="Фото лікаря"
                  sx={{ width: 140, height: 140, mb: 2 }}
                />
                <Chip
                  label={doctor.is_booking_open ? "Запис відкритий" : "Запис закритий"}
                  color={doctor.is_booking_open ? "success" : "default"}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h4">
                  {doctor.user.first_name} {doctor.user.last_name}
                </Typography>
                <Typography color="text.secondary">{doctor.specialization}</Typography>
                <Box>
                  <Typography><b>Досвід:</b> {doctor.experience_years} років</Typography>
                  <Typography><b>Про себе:</b> {doctor.bio || "--"}</Typography>
                </Box>
                <Box>
                  <Typography><b>Робочі дні:</b> {formatDays(doctor.work_days)}</Typography>
                  <Typography><b>Початок робочого дня:</b> {formatTime(doctor.work_start || "--")}</Typography>
                  <Typography><b>Кінець робочого дня:</b> {formatTime(doctor.work_end || "--")}</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
