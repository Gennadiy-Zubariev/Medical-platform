import {useEffect, useState} from "react";
import {Link as RouterLink} from "react-router-dom";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import {getDoctorSpecializations, getDoctorsPublic} from "../api/doctors";
import PageBackground from "../components/PageBackground";
import bg from "../assets/doctors_page.jpg";
import {glassCardSx} from "../theme/glass.js";

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
        const params = selectedSpec ? {specialization: selectedSpec} : {};
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
        <PageBackground image={bg}>
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
                        {doctors.map((doc, index) => (
                            <Grid item xs={12} sm={6} md={4} sx={{display: "flex"}}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        ...glassCardSx,
                                        width: 320,
                                        height: 180,
                                        display: "flex",
                                        flexDirection: "column"
                                    }}
                                >
                                    <CardContent sx={{flexGrow: 1}}>
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            alignItems="center"
                                            sx={{minHeight: 96}}
                                        >
                                            <Avatar
                                                src={doc.photo || "/avatar-placeholder.png"}
                                                alt="Фото лікаря"
                                                sx={{
                                                    width: 72,
                                                    height: 72,
                                                    boxShadow: "0 8px 16px rgba(15, 23, 42, 0.18)",
                                                    border: "2px solid rgba(255, 255, 255, 0.9)",
                                                    flexShrink: 0,
                                                }}
                                            />

                                            <Box sx={{flexGrow: 1, minWidth: 0}}>
                                                <Tooltip title={`${doc.user.last_name} ${doc.user.first_name}`}>
                                                    <Typography variant="h6" sx={{
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        maxWidth: "100%"
                                                    }}>
                                                        {doc.user.last_name} {doc.user.first_name}
                                                    </Typography>
                                                </Tooltip>
                                                <Typography color="text.secondary" sx={{
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis"
                                                }}>
                                                    {doc.specialization}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                    <Box sx={{p: 2, pt: 0}}>
                                        <Button
                                            component={RouterLink}
                                            to={`/doctors/${doc.id}`}
                                            variant="outlined"
                                            fullWidth
                                        >
                                            Переглянути
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Stack>
            </Container>
        </PageBackground>
    );
}
