import { useState } from "react";
import {
  updateMyPatientProfile,
  updateMyUser,
} from "../../api/accounts";

export default function EditPatientProfileForm({ profile, onCancel, onSaved }) {
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
        await updateMyUser({ email });
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
      <h3>Редагування профілю пацієнта</h3>

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
        Номер страховки
        <input
          type="text"
          placeholder="Введіть номер страховки"
          value={insurancePolicy}
          onChange={(e) => setInsurancePolicy(e.target.value)}
        />
      </label>

      <label>
        Адреса
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
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
