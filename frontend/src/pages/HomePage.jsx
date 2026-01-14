import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function HomePage() {
    return (
        <Container maxWidth="lg">
            <Stack spacing={4}>
                <Box
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 4,
                        background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                        color: "common.white",
                        boxShadow: 3,
                    }}
                >
                    <Stack spacing={2} maxWidth={640}>
                        <Typography variant="h3" fontWeight={700}>
                            Медична платформа для зручних консультацій
                        </Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                            Записуйтесь до лікарів онлайн, переглядайте медичну картку та спілкуйтесь у чаті — все в одному місці.
                        </Typography>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <Button component={RouterLink} to="/register" variant="contained" color="secondary">
                                Створити акаунт
                            </Button>
                            <Button component={RouterLink} to="/doctors" variant="outlined" sx={{ color: "common.white", borderColor: "rgba(255,255,255,0.6)" }}>
                                Знайти лікаря
                            </Button>
                        </Stack>
                    </Stack>
                </Box>

                <Grid container spacing={3}>
                    {[
                        { title: "Онлайн запис", text: "Зручне бронювання прийомів та відстеження статусу." },
                        { title: "Медична картка", text: "Доступ до історії хвороб і результатів у будь-який час." },
                        { title: "Чат з лікарем", text: "Пишіть лікарю напряму та отримуйте відповіді швидко." },
                    ].map((item) => (
                        <Grid item xs={12} md={4} key={item.title}>
                            <Card elevation={2} sx={{ height: "100%" }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.text}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Stack>
        </Container>
    );
}
