import { useEffect, useState } from "react";
import { getDoctorSpecializations, getDoctorsPublic } from "../api/doctors";
import { Link } from "react-router-dom";


export default function DoctorsPage() {
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 початкове завантаження
  useEffect(() => {
      async function loadInitial() {
        try {
          const specs = await getDoctorSpecializations();
          const docs = await getDoctorsPublic();

          setSpecializations(specs);
          setDoctors(docs);
        } catch (err) {
          console.error("Помилка завантаження лікарів:", err);
        } finally {
          setLoading(false);
        }
      }

      loadInitial();
  }, []);

  // 🔹 фільтр по спеціалізації
  useEffect(() => {
    const params = {};
    if (selectedSpec) {
      params.specialization = selectedSpec;
    }

    getDoctorsPublic(params).then(setDoctors);
  }, [selectedSpec]);

  if (loading) return <p>Завантаження...</p>;

  return (
    <div>
      <h2>Наші лікарі</h2>

      {/* ФІЛЬТР ПО КАТЕГОРІЯХ */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <button
          onClick={() => setSelectedSpec(null)}
          className={selectedSpec === null ? "btn-success" : "btn-outline"}
        >
          Всі
        </button>

        {specializations.map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpec(spec)}
            className={selectedSpec === spec ? "btn-success" : "btn-outline"}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* СПИСОК ЛІКАРІВ */}
      {doctors.length === 0 && <p>Лікарів не знайдено</p>}

      <div style={{ marginTop: 20 }}>
        {doctors.map((doc) => (
          <div key={doc.id} className="profile-card">
            <img
              src={doc.photo || "/avatar-placeholder.png"}
              className="profile-avatar"
              alt="Фото лікаря"
            />

            <div>
              <p>
                <b>
                  {doc.user.first_name} {doc.user.last_name}
                </b>
              </p>
              <p>{doc.specialization}</p>

              <Link to={`/doctors/${doc.id}`} className="btn-outline">
                Переглянути
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
