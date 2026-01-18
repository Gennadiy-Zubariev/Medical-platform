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
        backgroundAttachment: "fixed",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.35))",
        }}
      />
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
