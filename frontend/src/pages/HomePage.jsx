import { Box, Button, Container, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PageBackground from "../components/PageBackground";
import bg from "../assets/home.png";

export default function HomePage() {
  return (
    <PageBackground image={bg}>
      <Container maxWidth="lg">
        <Stack
          sx={{
            minHeight: "100vh",
            justifyContent: "center",
            alignItems: "center", // ⬅ центр по горизонталі
            textAlign: "center",
          }}
        >
          {/* ВІДСТУП, щоб кнопка була ПІД ТЕКСТОМ */}
          <Box sx={{ mt: { xs: 16, md: 18 } }}>
            <Button
              component={RouterLink}
              to="/doctors"
              variant="contained"
              size="large"
              sx={{
                px: { xs: 5, md: 7 },
                py: { xs: 1.8, md: 2.2 },
                fontSize: { xs: "1.05rem", md: "1.15rem" },
                fontWeight: 800,
                borderRadius: 999,
                textTransform: "none",

                background:
                  "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                boxShadow: "0 16px 36px rgba(0,0,0,0.35)",

                "&:hover": {
                  background:
                    "linear-gradient(135deg, #34d399 0%, #22c55e 100%)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Знайти лікаря
            </Button>
          </Box>
        </Stack>
      </Container>
    </PageBackground>
  );
}
