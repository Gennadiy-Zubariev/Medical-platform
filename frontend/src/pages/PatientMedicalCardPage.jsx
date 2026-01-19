import { useEffect, useState, useCallback } from "react";
import { Alert, Card, CardContent, Container, Stack, Typography } from "@mui/material";
import { getMyMedicalCard, updateMyMedicalCard } from "../api/medical";
import MedicalCardEditForm from "../components/medical/MedicalCardEditForm.jsx";
import MedicalCardHeader from "../components/medical/MedicalCardHeader.jsx";
import MedicalCardView from "../components/medical/MedicalCardView.jsx";
import MedicalRecordItem from "../components/medical/MedicalRecordItem.jsx";
import PageBackground from "../components/PageBackground";
import bg from "../assets/patient_dashboard_page.jpg";
import {glassCardSx} from "../theme/glass.js";


export default function PatientMedicalCardPage() {
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);


    useEffect(() => {
        (async () => {
            try {
                const data = await getMyMedicalCard();
                setCard(data);
            } catch (err) {
                setError("Не вдалося завантажити медичну картку");
            } finally {
                setLoading(false);
            }
        })();
    }, []);


    const handleSave = useCallback(async (values) => {
        try {
            const updated = await updateMyMedicalCard(card.id, values);
            setCard(updated);
            setIsEditing(false);
        } catch {
            alert("Не вдалося зберегти медичну картку");
        }
    }, [card]);
    if (loading) return <Container maxWidth="md"><Typography>Завантаження...</Typography></Container>;
    if (error) return <Container maxWidth="md"><Alert severity="error">{error}</Alert></Container>;
    if (!card) return null;

    return (
        <PageBackground image={bg}>
            <Container maxWidth="md">
                <Stack spacing={3}>
                    <MedicalCardHeader patient={card.patient} />

                    <Card
                        elevation={2}
                        sx={glassCardSx}
                    >
                        <CardContent>
                            {isEditing ? (
                                <MedicalCardEditForm
                                    initialValues={{
                                        blood_type: card.blood_type || "",
                                        allergies: card.allergies || "",
                                        chronic_diseases: card.chronic_diseases || "",
                                    }}
                                    onSubmit={handleSave}
                                    onCancel={() => setIsEditing(false)}
                                />
                            ) : (
                                <MedicalCardView
                                    card={card}
                                    onEdit={() => setIsEditing(true)}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Typography variant="h5">Історія хвороб</Typography>
                    <Stack spacing={2}>
                        {card.records?.length ? (
                            card.records.map((r) => (
                                <MedicalRecordItem key={r.id} record={r} canEdit={false} />
                            ))
                        ) : (
                            <Typography color="text.secondary">Записів ще немає</Typography>
                        )}
                    </Stack>
                </Stack>
            </Container>
        </PageBackground>
    );
}
