export const glassCardSx = {
  borderRadius: 3,
  background:
      "linear-gradient(135deg, rgba(0, 150, 136, 0.08), rgba(33, 150, 243, 0.08))",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
  },
};

export const glassPanelSx = {
  borderRadius: 2,
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  border: "1px solid rgba(255,255,255,0.45)",
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.6)",
};
