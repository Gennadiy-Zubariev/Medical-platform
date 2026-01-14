import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, Stack, Typography } from "@mui/material";
import Layout from "../components/Layout";
import {
    getMyAppointments,
    setAppointmentStatus,

} from "../api/appointments";
import {
    toggleDoctorBooking,
    getMyDoctorProfile,
    updateMyDoctorSchedule,

} from "../api/accounts";
import DoctorProfileCard from "../components/profile/DoctorProfileCard";
import EditDoctorProfileForm from "../components/profile/EditDoctorProfileForm";
import AppointmentsList from "../components/appointments/AppointmentsList";
import DoctorSchedulePanel from "../components/profile/DoctorSchedulePanel";

export default function DoctorDashboardPage() {
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const loadDoctorProfile = async () => {
        try {
            const data = await getMyDoctorProfile();
            setDoctor(data);
        } catch {
            setError("Не вдалося завантажити профіль лікаря");
        }
    };

    useEffect(() => {
        loadAppointments();
        loadDoctorProfile();
    }, []);


    const updateDoctorSchedule = async (data) => {
      try {
        await updateMyDoctorSchedule(data);
        await loadDoctorProfile();
        alert("Графік збережено");
      } catch (e) {
        console.error(e);

        const errors = e.response?.data;
        if (errors) {
          const msg = Object.values(errors).flat().join("\n");
          alert(msg);
        } else {
          alert("Помилка збереження графіка");
        }
      }
    };

    const toggleBooking = async () => {
        if (!doctor.is_schedule_ready) {
            alert("Спочатку заповніть графік роботи");
            return;
        }

        const data = await toggleDoctorBooking();
        setDoctor((prev) => ({
            ...prev,
            is_booking_open: data.is_booking_open,
        }));
    };

    const changeStatus = async (id, status) => {
        await setAppointmentStatus(id, status);
        loadAppointments();
    };

    return (
        <Layout>
            <Stack spacing={3}>
                <Typography variant="h4">Кабінет лікаря</Typography>

                {doctor && !editing && (
                    <DoctorProfileCard profile={doctor} onEdit={() => setEditing(true)} />
                )}

                {editing && (
                    <EditDoctorProfileForm
                        profile={doctor}
                        onCancel={() => setEditing(false)}
                        onSaved={() => {
                            setEditing(false);
                            loadDoctorProfile();
                        }}
                    />
                )}

                {doctor && (
                    <DoctorSchedulePanel
                        doctor={doctor}
                        onToggleBooking={toggleBooking}
                        onUpdateSchedule={updateDoctorSchedule}
                    />
                )}

                {loading && <Typography>Завантаження...</Typography>}
                {error && <Alert severity="error">{error}</Alert>}

                <AppointmentsList
                    appointments={appointments}
                    role="doctor"
                    onConfirm={(id) => changeStatus(id, "confirmed")}
                    onComplete={(id) => changeStatus(id, "completed")}
                    onOpenChat={(id) => navigate(`/chat/${id}`)}
                />
            </Stack>
        </Layout>
    );
}
