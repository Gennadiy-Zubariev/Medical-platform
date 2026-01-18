import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
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
import {getDoctorPublicById} from "../api/doctors";
import PageBackground from "../components/PageBackground";
import bg from "../assets/doctor_profile_page 1.jpg";

export default function DoctorDetailPage() {
    const {id} = useParams();
    const [doctor, setDoctor] = useState(null);

    const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
    const normalizeWorkDayLabel = (day) => {
        if (typeof day === "number") {
            if (day >= 0 && day <= 6) return WEEK_DAYS[day];
            return null;
        }
        if (typeof day === "string") {
            const numericDay = Number(day);
            if (!Number.isNaN(numericDay)) return normalizeWorkDayLabel(numericDay);
            if (WEEK_DAYS.includes(day)) return day;
            return null;
        }
        return null;
    };
    const workDayLabels = Array.isArray(doctor?.work_days)
        ? doctor.work_days.map((day) => normalizeWorkDayLabel(day)).filter(Boolean)
        : [];

    const formatTime = (value) => {
        if (!value) return "--";
        return value.slice(0, 5);
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
        <PageBackground image={bg}>
            <Container maxWidth="md">
                <Card
                    elevation={2}
                    sx={{
                        borderRadius: 3,
                        background:
                            "linear-gradient(135deg, rgba(0, 150, 136, 0.08), rgba(33, 150, 243, 0.08))",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
                        },
                    }}
                >

                    <CardContent>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <Stack alignItems="center">
                                    <Avatar
                                        src={doctor.photo || "/avatar-placeholder.png"}
                                        alt="Фото лікаря"
                                        sx={{
                                            width: 140,
                                            height: 140,
                                            mb: 2,
                                            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.2)",
                                            border: "3px solid rgba(255, 255, 255, 0.85)",
                                        }}
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
                                    <Box
                                        sx={{
                                            mt: 1,
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: "rgba(255, 255, 255, 0.85)",
                                            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{mb: 1}}>
                                            Розклад
                                        </Typography>
                                        <Stack direction={{xs: "column", sm: "row"}} spacing={2} alignItems="center">
                                            <Stack spacing={0.5}>
                                                <Typography variant="body2">
                                                    <b>Початок:</b> {formatTime(doctor.work_start)}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <b>Кінець:</b> {formatTime(doctor.work_end)}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                {workDayLabels.length > 0 ? (
                                                    workDayLabels.map((day) => (
                                                        <Chip key={day} label={day} size="small" variant="outlined"/>
                                                    ))
                                                ) : (
                                                    <Chip label="--" size="small" variant="outlined"/>
                                                )}
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Container>
        </PageBackground>
    );
}
