import Layout from "../components/Layout";
import { Link, useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";
import {
    getMyAppointments,
    setAppointmentStatus,

} from "../api/appointments";
import {
    toggleDoctorBooking,
    getMyDoctorProfile,

} from "../api/accounts";
import axiosClient from "../api/axiosClient";
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


    const updateDoctorSchedule = async ({ work_start, work_end, slot_duration }) => {
        try {
          await axiosClient.patch("accounts/doctor-profiles/me/schedule/", {
            work_start,
            work_end,
            slot_duration,
          });
          await loadDoctorProfile();
          alert("Графік збережено");
        } catch (e) {
          console.error(e);
          alert("Помилка збереження графіка");
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
            <h2 className="page-title">Кабінет лікаря</h2>
            {doctor && !editing && (
                <DoctorProfileCard profile={doctor} onEdit={() => setEditing(true)}/>
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


            {/* ===== ЗАПИСИ ===== */}
            {loading && <p>Завантаження...</p>}
            {error && <p style={{color: "red"}}>{error}</p>}

            <AppointmentsList
                appointments={appointments}
                role="doctor"
                onConfirm={(id) => changeStatus(id, "confirmed")}
                onComplete={(id) => changeStatus(id, "completed")}
                onOpenChat={(id) => navigate(`/chat/${id}`)}
            />
        </Layout>
    );
}
