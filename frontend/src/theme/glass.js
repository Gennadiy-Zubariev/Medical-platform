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

