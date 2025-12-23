import formatDate from "../utils/formatDate";


export default function MedicalCardView({ card, onEdit }) {
  return (
    <>
      <p><b>Група крові:</b> {card.blood_type || "—"}</p>
      <p><b>Алергії:</b> {card.allergies || "—"}</p>
      <p><b>Хронічні захворювання:</b> {card.chronic_diseases || "—"}</p>
      <p><b>Створена:</b> {formatDate(card.created_at)}</p>
      <p><b>Змінена:</b> {formatDate(card.updated_at)}</p>

      <button onClick={onEdit}>
        Редагувати
      </button>
    </>
  );
}
