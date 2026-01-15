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
                            <Button component={RouterLink} to="/doctors" variant="outlined" sx={{ color: "common.white", borderColor: "rgba(255,255,255,0.6)" }}>
                                Знайти лікаря
                            </Button>
                        </Stack>
                    </Stack>
                </Box>

            </Stack>
        </Container>
    );
}
