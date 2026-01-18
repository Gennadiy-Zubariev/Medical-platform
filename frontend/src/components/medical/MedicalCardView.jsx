import formatDate from "../../utils/formatDate.js";
import { Button, Stack, Typography } from "@mui/material";
import { glassCardSx, glassPanelSx } from "../../theme/glass";


export default function MedicalCardView({ card, onEdit }) {
  return (
    <Stack spacing={1.5}>
      <Typography><b>Група крові:</b> {card.blood_type || "—"}</Typography>
      <Typography><b>Алергії:</b> {card.allergies || "—"}</Typography>
      <Typography><b>Хронічні захворювання:</b> {card.chronic_diseases || "—"}</Typography>
      <Typography><b>Створена:</b> {formatDate(card.created_at)}</Typography>
      <Typography><b>Змінена:</b> {formatDate(card.updated_at)}</Typography>

      <Button onClick={onEdit} variant="outlined">
        Редагувати
      </Button>
    </Stack>
  );
}
