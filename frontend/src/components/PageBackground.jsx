import { Box } from "@mui/material";

export default function PageBackground({ image, children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        backgroundImage: image ? `url(${image})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: { xs: "scroll", md: "fixed" }, // fixed на мобілках часто лагає
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          // оверлей
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))",
        }}
      />
      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </Box>
  );
}
