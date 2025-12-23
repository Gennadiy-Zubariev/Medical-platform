import { Link } from "react-router-dom";
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

export default function DoctorDashboardPage() {
    const [appointments, setAppointments] = useState([]);
    const [doctor, setDoctor] = useState(null);
    const [schedule, setSchedule] = useState({
        work_start: "",
        work_end: "",
        slot_duration: "",
    });
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
            setSchedule({
                work_start: data.work_start || "",
                work_end: data.work_end || "",
                slot_duration: data.slot_duration || "",
            });
        } catch {
            setError("Не вдалося завантажити профіль лікаря");
        }
    };

    useEffect(() => {
        loadAppointments();
        loadDoctorProfile();
    }, []);

    const saveSchedule = async () => {
        try {
            const res = await axiosClient.patch(
                "accounts/doctor-profiles/me/",
                schedule
            );
            setDoctor(res.data);
            alert("Графік збережено");
        } catch {
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
        <div>
            <h2>Кабінет лікаря</h2>

            {/* ===== ГРАФІК РОБОТИ ===== */}
            {doctor && (
                <div style={{border: "1px solid #aaa", padding: 15, marginBottom: 20}}>
                    <h3>Графік роботи</h3>

                    <label>
                        Початок роботи:
                        <input
                            type="time"
                            value={schedule.work_start}
                            onChange={(e) =>
                                setSchedule({...schedule, work_start: e.target.value})
                            }
                        />
                    </label>
                    <br/>

                    <label>
                        Кінець роботи:
                        <input
                            type="time"
                            value={schedule.work_end}
                            onChange={(e) =>
                                setSchedule({...schedule, work_end: e.target.value})
                            }
                        />
                    </label>
                    <br/>

                    <label>
                        Тривалість слота (хв):
                        <input
                            type="number"
                            min="5"
                            step="5"
                            value={schedule.slot_duration}
                            onChange={(e) =>
                                setSchedule({
                                    ...schedule,
                                    slot_duration: e.target.value,
                                })
                            }
                        />
                    </label>
                    <br/>

                    <button onClick={saveSchedule}>Зберегти графік</button>

                    {!doctor.is_schedule_ready && (
                        <p style={{color: "orange"}}>
                            Запис закритий (недостатньо даних)
                        </p>
                    )}

                    <p>
                        <b>Статус запису:</b>{" "}
                        {doctor.is_booking_open ? "Відкрито" : "Закрито"}
                    </p>

                    <button onClick={toggleBooking}>
                        {doctor.is_booking_open ? "Закрити запис" : "Відкрити запис"}
                    </button>
                </div>
            )}

            {/* ===== ЗАПИСИ ===== */}
            {loading && <p>Завантаження...</p>}
            {error && <p style={{color: "red"}}>{error}</p>}

            {appointments.map((a) => (
                <div
                    key={a.id}
                    style={{border: "1px solid #ccc", padding: 10, marginBottom: 10}}
                >
                    <p>
                        <b>Пацієнт:</b> {a.patient.user.first_name}{" "}
                        {a.patient.user.last_name}
                    </p>
                    {/* Кнопка мед картки пацієнта */}
                    <Link
                      to={`/doctor/medical-card/${a.patient.id}`}
                      style={{
                        textDecoration: "none",
                        padding: "6px 10px",
                        border: "1px solid #1976d2",
                        borderRadius: 4,
                        color: "#1976d2",
                        fontWeight: "bold",
                      }}
                    >
                      📄 Медична картка
                    </Link>
                    <p>
                        <b>Дата:</b>{" "}
                        {new Date(a.start_datetime).toLocaleString()}
                    </p>
                    <p>
                        <b>Статус:</b> {a.status}
                    </p>



                    {a.status === "pending" && (
                        <>
                            <button onClick={() => changeStatus(a.id, "confirmed")}>
                                Підтвердити
                            </button>
                        </>
                    )}

                    {a.status === "confirmed" && (
                        <button onClick={() => changeStatus(a.id, "completed")}>
                            Завершити прийом
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
