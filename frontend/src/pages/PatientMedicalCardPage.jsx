import {useEffect, useState, useCallback} from "react";
import {getMyMedicalCard, updateMyMedicalCard} from "../api/medical";
import MedicalCardEditForm from "../components/medical/MedicalCardEditForm.jsx";
import MedicalCardHeader from "../components/medical/MedicalCardHeader.jsx";
import MedicalCardView from "../components/medical/MedicalCardView.jsx";
import MedicalRecordItem from "../components/medical/MedicalRecordItem.jsx";


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
    if (loading) return <p>Завантаження...</p>;
    if (error) return <p style={{color: "red"}}>{error}</p>;
    if (!card) return null;

    return (
        <div className='card-wrapper'>

            <MedicalCardHeader patient={card.patient}/>

            {isEditing ? (
                <MedicalCardEditForm
                    initialValues={{
                        blood_type: card.blood_type || '',
                        allergies: card.allergies || '',
                        chronic_diseases: card.chronic_diseases || '',
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

            <h3>Історія хвороб</h3>
            {card.records?.length ? (
                card.records.map((r) => (
                    <MedicalRecordItem key={r.id} record={r} canEdit={false}/>
                ))
            ) : (
                <p>Записів ще немає</p>
            )}
        </div>
    );
}
