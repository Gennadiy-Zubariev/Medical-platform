import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {
    getMyAppointments,
    cancelAppointment,
} from "../api/appointments";
import {getMyPatientProfile} from "../api/accounts";
import CreateAppointmentForm from "../components/appointments/CreateAppointmentForm.jsx";
import {Link} from "react-router-dom";
import PatientProfileCard from "../components/profile/PatientProfileCard";
import EditPatientProfileForm from "../components/profile/EditPatientProfileForm";
import AppointmentsList from "../components/appointments/AppointmentsList";


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
        <div>
            <h2>Кабінет пацієнта</h2>

            {profile && !editing && (
                <PatientProfileCard profile={profile} onEdit={() => setEditing(true)}/>
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
                <div style={{border: "1px solid #ccc", padding: 15, marginBottom: 20}}>

                    <Link to="/patient/medical-card">📄 Моя медична картка</Link>
                </div>
            )}

            {/* 🔹 форма запису */}
            <CreateAppointmentForm
                onCreated={loadAppointments}
                refreshKey={refreshSlotsKey}
            />

            {loading && <p>Завантаження...</p>}
            {error && <p style={{color: "red"}}>{error}</p>}

            {!loading && appointments.length === 0 && (
                <p>У вас ще немає записів</p>
            )}


            <AppointmentsList
              appointments={appointments}
              role="patient"
              onCancel={handleCancel}
              onOpenChat={(id) => navigate(`/chat/${id}`)}
            />

        </div>
    );
}
