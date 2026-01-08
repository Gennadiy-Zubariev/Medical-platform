import {useState} from "react";
import {
    updateMyPatientProfile,
    updateMyUser,
} from "../../api/accounts";
import "./Profile.css"

export default function EditPatientProfileForm({profile, onCancel, onSaved}) {
    if (!profile) return null;

    const [email, setEmail] = useState(profile.user.email || "");
    const [insurancePolicy, setInsurancePolicy] = useState("");
    const [address, setAddress] = useState(profile.address || "");
    const [photo, setPhoto] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (email !== profile.user.email) {
                await updateMyUser({email});
            }

            const formData = new FormData();

            if (insurancePolicy) {
                formData.append("insurance_policy", insurancePolicy);
            }

            if (address) {
                formData.append("address", address);
            }

            if (photo) {
                formData.append("photo", photo);
            }

            await updateMyPatientProfile(formData);

            onSaved();
        } catch (err) {
            console.error(err);
            alert("Не вдалося зберегти профіль пацієнта");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="profile-card" onSubmit={handleSubmit}>
            <img
                src={profile.photo || "/avatar-placeholder.png"}
                className="profile-avatar"
                alt="Фото пацієнта"
            />

            <div className="profile-fields">
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>Номер страховки</label>
                <input
                    type="text"
                    value={insurancePolicy}
                    onChange={(e) => setInsurancePolicy(e.target.value)}
                />

                <label>Адреса</label>
                <textarea
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>


            <div className="profile-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>
                    Скасувати
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? "Збереження…" : "Зберегти"}
                </button>
            </div>
        </form>
    );
}
