import { useEffect, useState } from "react";
import { getDoctorSpecializations, getDoctorsPublic } from "../api/doctors";
import { Link } from "react-router-dom";
import "./DoctorsPage.css"

export default function DoctorsPage() {
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  useEffect(() => {
    const params = selectedSpec ? { specialization: selectedSpec } : {};
    getDoctorsPublic(params).then(setDoctors);
  }, [selectedSpec]);

  if (loading) return <p>Завантаження...</p>;

  return (
    <div className="doctors-page">
      <h2>Наші лікарі</h2>

      {/* Фільтри */}
      <div className="doctors-filters">
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

      {doctors.length === 0 && <p>Лікарів не знайдено</p>}

      {/* Список лікарів */}
      <div className="doctors-list">
        {doctors.map((doc) => (
          <div key={doc.id} className="doctor-card">
            <img
              src={doc.photo || "/avatar-placeholder.png"}
              alt="Фото лікаря"
              className="doctor-avatar"
            />

            <div className="doctor-info">
              <p className="doctor-name">
                {doc.user.first_name} {doc.user.last_name}
              </p>

              <p className="doctor-spec">{doc.specialization}</p>

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
