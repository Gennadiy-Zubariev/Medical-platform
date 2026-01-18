import { Link as RouterLink } from "react-router-dom";
import { Button, Container, Paper, Stack, Typography } from "@mui/material";
import PageBackground from "../components/PageBackground";
import bg from "../assets/login_page.jpg";

export default function RegisterChoice() {
  return (
      <PageBackground image={bg}>
        <Container maxWidth="sm">
            <Paper
                elevation={2}
                sx={{
                    p: { xs: 3, md: 4 },
                    backgroundImage: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                }}
            >
                <Stack spacing={3}>
                    <div>
                        <Typography variant="h4" gutterBottom>
                            Реєстрація
                        </Typography>
                        <Typography color="text.secondary">
                            Оберіть вашу роль, щоб продовжити.
                        </Typography>
                    </div>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <Button component={RouterLink} to="/register/patient" variant="contained" fullWidth>
                            Я пацієнт
                        </Button>
                        <Button component={RouterLink} to="/register/doctor" variant="outlined" fullWidth>
                            Я лікар
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Container>
      </PageBackground>
  );
}
