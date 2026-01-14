import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { getDoctorSpecializations, getDoctorsPublic } from "../api/doctors";

export default function DoctorsPage() {
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const specs = await getDoctorSpecializations();
        const docs = await getDoctorsPublic();
        setSpecializations(specs);
        setDoctors(docs);
      } catch (err) {
        console.error("Помилка завантаження лікарів:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const params = selectedSpec ? { specialization: selectedSpec } : {};
    getDoctorsPublic(params).then(setDoctors);
  }, [selectedSpec]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>Завантаження...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Наші лікарі
          </Typography>
          <Typography color="text.secondary">
            Оберіть спеціалізацію та знайдіть фахівця для консультації.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            onClick={() => setSelectedSpec(null)}
            variant={selectedSpec === null ? "contained" : "outlined"}
          >
            Всі
          </Button>

          {specializations.map((spec) => (
            <Button
              key={spec}
              onClick={() => setSelectedSpec(spec)}
              variant={selectedSpec === spec ? "contained" : "outlined"}
            >
              {spec}
            </Button>
          ))}
        </Stack>

        {doctors.length === 0 && (
          <Typography color="text.secondary">Лікарів не знайдено</Typography>
        )}

        <Grid container spacing={3}>
          {doctors.map((doc) => (
            <Grid item xs={12} md={6} key={doc.id}>
              <Card elevation={2}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={doc.photo || "/avatar-placeholder.png"}
                      alt="Фото лікаря"
                      sx={{ width: 72, height: 72 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        {doc.user.first_name} {doc.user.last_name}
                      </Typography>
                      <Typography color="text.secondary">
                        {doc.specialization}
                      </Typography>
                    </Box>
                    <Button component={RouterLink} to={`/doctors/${doc.id}`} variant="outlined">
                      Переглянути
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
