import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMedicalCardByPatient } from "../api/medical";
import MedicalRecordForm from "../components/medical/MedicalRecordForm.jsx";
import MedicalRecordItem from "../components/medical/MedicalRecordItem.jsx";
import { getMyDoctorProfile } from "../api/accounts";
import { deleteMedicalRecord } from "../api/medical";


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

    if (loading) return <p>Завантаження ...</p>;
    if (error) return <p style={{color: "red"}}>{error}</p>;
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
        <div>

            <h2 style={{ marginTop: 20 }}>
                Медична картка:{" "}
                {card.patient.user.first_name} {card.patient.user.last_name}
            </h2>

            {/* Загальні медичні дані */}
            <div style={{ border: "1px solid #ccc", padding: 15, marginBottom: 20 }}>
                <p><b>Група крові</b> {card.blood_type || "-"}</p>
                <p><b>Алегрії</b> {card.allergies || "-"}</p>
                <p><b>Хронічні захворювання</b> {card.chronic_diseases || "-"}</p>
            </div>

            {/* Історія хвороб */}
            <h3>Медичні записи</h3>

            <button
                onClick={() => setShowCreateForm(true)}
                style={{ marginBottom: 10 }}
            >
                Додати медичний запис
            </button>

            {card.records.length === 0 && (
                <p>Медичних записів немає</p>
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


            {doctor && card.records.map((r) => (
                <MedicalRecordItem
                    key={r.id}
                    record={r}
                    canEdit={r.doctor.id === doctor.id} // тільки свої
                    onDelete={handleDeleteRecord}
                    onUpdated={loadCard}

                />
            ))}
        </div>
    );
}