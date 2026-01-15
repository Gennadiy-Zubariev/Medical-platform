import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#7c3aed",
    },
    background: {
      default: "#f5f7fb",
      paper: "#ffffff",
    },
    success: {
      main: "#16a34a",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f5f7fb",
          color: "#0f172a",
        },
        a: {
          textDecoration: "none",
          color: "inherit",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {

          backgroundImage: "linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px) scale(1.01)",
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.12)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px) scale(1.01)",
            boxShadow: "0 14px 28px rgba(15, 23, 42, 0.16)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px) scale(1.03)",
            boxShadow: "0 12px 22px rgba(37, 99, 235, 0.25)",
          },
          "&.Mui-disabled": {
            transform: "none",
            boxShadow: "none",
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px) scale(1.03)",
            boxShadow: "0 10px 18px rgba(15, 23, 42, 0.18)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px) scale(1.02)",
            boxShadow: "0 8px 16px rgba(15, 23, 42, 0.12)",
          },

        },
      },
    },
  },
});

export default theme;
