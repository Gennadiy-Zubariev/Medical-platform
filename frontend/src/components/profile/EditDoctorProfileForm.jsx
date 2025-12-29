import { useState } from "react";
import { updateMyDoctorProfile, updateMyUser } from "../../api/accounts";

export default function EditDoctorProfileForm({ profile, onCancel, onSaved }) {
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
        await updateMyUser({ email });
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
      alert("Не вдалося зберегти профіль лікаря");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="profile-card" onSubmit={handleSubmit}>
      <h3>Редагування профілю лікаря</h3>

      <label>
        Email
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label>
        Номер ліцензії
        <input
          type="text"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
        />
      </label>

      <label>
        Про себе
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </label>

      <label>
        Спеціалізація
        <input
          type="text"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        />
      </label>

      <label>
        Стаж (років)
        <input
          type="number"
          min="0"
          value={experienceYears}
          onChange={(e) => setExperienceYears(e.target.value)}
        />
      </label>

      <label>
        Фото
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
        />
      </label>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button type="button" onClick={onCancel}>
          Скасувати
        </button>
        <button type="submit" disabled={saving}>
          {saving ? "Збереження…" : "Зберегти"}
        </button>
      </div>
    </form>
  );
}
