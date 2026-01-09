import {useState} from "react";
import {updateMyDoctorProfile, updateMyUser} from "../../api/accounts";
import "./Profile.css"

export default function EditDoctorProfileForm({profile, onCancel, onSaved}) {
    if (!profile) return null;

    const [email, setEmail] = useState(profile.user.email || "");
    const [bio, setBio] = useState(profile.bio || "");
    const [specialization, setSpecialization] = useState(profile.specialization || "");
    const [experienceYears, setExperienceYears] = useState(
        profile.experience_years ?? ""
    );
    const [licenseNumber, setLicenseNumber] = useState(
        profile.license_number?.license_number || ""
    );
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
            if (bio) formData.append("bio", bio);
            if (specialization) formData.append("specialization", specialization);
            if (experienceYears !== "")
                formData.append("experience_years", experienceYears);
            if (licenseNumber)
                formData.append("license_number", licenseNumber);
            if (photo) formData.append("photo", photo);

            await updateMyDoctorProfile(formData);

            onSaved();
        } catch (err) {
            console.error(err);
            const data = err.response?.data;

            if (data) {
                const messages = Object.values(data)
                    .flat()
                    .join("\n");

                alert(messages);
            } else {
                alert("Не вдалося зберегти профіль доктора");
            }
        } finally {
            setSaving(false);
        }
    };

    return (

        <form className="profile-card" onSubmit={handleSubmit}>
            <img
                src={profile.photo || "/avatar-placeholder.png"}
                className="profile-avatar"
                alt="Фото лікаря"
            />
            <div className="profile-fields">
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>Номер ліцензії</label>
                <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                />

                <label>Про себе</label>
                <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />

                <label>Спеціалізація</label>
                <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                />

                <label>Стаж (років)</label>
                <input
                    type="number"
                    min="0"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                />

                <label>Фото</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
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
