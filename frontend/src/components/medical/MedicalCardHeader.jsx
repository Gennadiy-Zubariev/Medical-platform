export default function MedicalCardHeader({ patient }) {
  return (
    <h2>
      Медична картка:{" "}
      {patient.user.first_name} {patient.user.last_name}
    </h2>
  );
}