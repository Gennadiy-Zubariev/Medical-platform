import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Card, CardContent, Container, Stack, Typography } from "@mui/material";
import { getMedicalCardByPatient, deleteMedicalRecord } from "../api/medical";
import MedicalRecordForm from "../components/medical/MedicalRecordForm.jsx";
import MedicalRecordItem from "../components/medical/MedicalRecordItem.jsx";
import { getMyDoctorProfile } from "../api/accounts";


export default function DoctorMedicalCardPage() {
    const { patientId } = useParams();
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [doctor, setDoctor] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
      loadDoctor();
    }, []);

    const loadDoctor = async () => {
      try {
        const data = await getMyDoctorProfile();
        setDoctor(data);
      } catch {
        console.error("Не вдалося завантажити профіль лікаря");
      }
    };

    useEffect(() => {
        loadCard();
    }, [patientId]);

    const loadCard = async () => {
        try {
            const data = await getMedicalCardByPatient(patientId);
            setCard(data);
        } catch {
            setError("Не вдалося завантажити медичну картку");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Container maxWidth="md"><Typography>Завантаження ...</Typography></Container>;
    if (error) return <Container maxWidth="md"><Alert severity="error">{error}</Alert></Container>;
    if (!card) return null;

    const handleDeleteRecord = async (recordId) => {
      const ok = window.confirm("Видалити цей медичний запис?");
      if (!ok) return;

      try {
        await deleteMedicalRecord(recordId);
        await loadCard(); // 🔁 оновлюємо список
      } catch (err) {
        alert(
          err.response?.data?.detail ||
          "Не вдалося видалити медичний запис"
        );
      }
    };

    return (
        <Container maxWidth="md">
            <Stack spacing={3}>
                <Typography variant="h4">
                    Медична картка: {card.patient.user.first_name} {card.patient.user.last_name}
                </Typography>

                <Card
                    elevation={2}
                    sx={{
                        backgroundImage: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                    }}
                >
                    <CardContent>
                        <Stack spacing={1}>
                            <Typography><b>Група крові:</b> {card.blood_type || "-"}</Typography>
                            <Typography><b>Алегрії:</b> {card.allergies || "-"}</Typography>
                            <Typography><b>Хронічні захворювання:</b> {card.chronic_diseases || "-"}</Typography>
                        </Stack>
                    </CardContent>
                </Card>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                    <Typography variant="h5">Медичні записи</Typography>
                    <Button onClick={() => setShowCreateForm(true)} variant="contained">
                        Додати медичний запис
                    </Button>
                </Stack>

                {card.records.length === 0 && (
                    <Typography color="text.secondary">Медичних записів немає</Typography>
                )}

                {showCreateForm && (
                    <MedicalRecordForm
                        cardId={card.id}
                        onCreated={() => {
                            setShowCreateForm(false);
                            loadCard();
                        }}
                        onCancel={() => setShowCreateForm(false)}
                    />
                )}

                <Stack spacing={2}>
                    {doctor && card.records.map((r) => (
                        <MedicalRecordItem
                            key={r.id}
                            record={r}
                            canEdit={r.doctor.id === doctor.id}
                            onDelete={handleDeleteRecord}
                            onUpdated={loadCard}
                        />
                    ))}
                </Stack>
            </Stack>
        </Container>
    );
}
