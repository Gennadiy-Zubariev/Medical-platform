import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import Layout from "../components/Layout";
import {
    getMyAppointments,
    cancelAppointment,
} from "../api/appointments";
import {getMyPatientProfile} from "../api/accounts";
import CreateAppointmentForm from "../components/appointments/CreateAppointmentForm.jsx";
import PatientProfileCard from "../components/profile/PatientProfileCard";
import EditPatientProfileForm from "../components/profile/EditPatientProfileForm";
import AppointmentsList from "../components/appointments/AppointmentsList";
import PageBackground from "../components/PageBackground";
import bg from "../assets/patient_dashboard_page.jpg";
import {glassCardSx} from "../theme/glass.js";


export default function PatientDashboardPage() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);

    // 🔑 ключ для примусового оновлення слотів у формі
    const [refreshSlotsKey, setRefreshSlotsKey] = useState(0);

    const loadAppointments = async () => {
        try {
            const data = await getMyAppointments();
            setAppointments(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.results)
                        ? data.results
                        : []
            );
        } catch {
            setError("Не вдалося завантажити записи");
        } finally {
            setLoading(false);
        }
    };

    const loadProfile = async () => {
        try {
            const data = await getMyPatientProfile();
            setProfile(data);
        } catch (e) {
            console.error('Не вдалося завантажити профіль пацієнта')
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    useEffect(() => {
        loadProfile();
    }, []);

    const handleCancel = async (appointmentId) => {
        try {
            await cancelAppointment(appointmentId);

            // оновлюємо список записів
            await loadAppointments();

            // 🔥 сигнал формі: слоти треба перезавантажити
            setRefreshSlotsKey((k) => k + 1);
        } catch (err) {
            alert(
                err.response?.data?.detail ||
                "Не вдалося скасувати запис"
            );
        }
    };

    return (
        <PageBackground image={bg}>
            <Layout>
                <Stack spacing={3}>
                    <Typography variant="h4">Кабінет пацієнта</Typography>

                    {profile && !editing && (
                        <PatientProfileCard profile={profile} onEdit={() => setEditing(true)} />
                    )}

                    {editing && (
                        <EditPatientProfileForm
                            profile={profile}
                            onCancel={() => setEditing(false)}
                            onSaved={() => {
                                setEditing(false);
                                loadProfile();
                            }}
                        />
                    )}

                    {profile && (
                        <Card
                            elevation={2}
                            sx={glassCardSx}
                        >
                            <CardContent>
                                <Button component={RouterLink} to="/patient/medical-card" variant="outlined">
                                    📄 Моя медична картка
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <CreateAppointmentForm
                        onCreated={loadAppointments}
                        refreshKey={refreshSlotsKey}
                    />

                    {loading && <Typography>Завантаження...</Typography>}
                    {error && <Alert severity="error">{error}</Alert>}

                    {!loading && appointments.length === 0 && (
                        <Typography color="text.secondary">У вас ще немає записів</Typography>
                    )}

                    <AppointmentsList
                        appointments={appointments}
                        role="patient"
                        onCancel={handleCancel}
                        onOpenChat={(id) => navigate(`/chat/${id}`)}
                    />
                </Stack>
            </Layout>
        </PageBackground>
    );
}
