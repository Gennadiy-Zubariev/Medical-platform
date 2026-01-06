const API_URL = import.meta.env.VITE_API_URL;

export default function DoctorProfileCard({ profile, onEdit }) {
    if (!profile) return null;

    const photoURL = profile.photo
        ? `${profile.photo}?t=${Date.now()}`
        : "/avatar-placeholder.png";
    return (
        <div className='profile-card'>
            <img
                src={photoURL}
                className='profile-photo'
                alt={'Фото профілю'}
            />

            <div>
                <p><b>Ім'я</b> {profile.user.first_name}</p>
                <p><b>Email</b> {profile.user.email}</p>
                <p><b>Спеціалізація</b> {profile.specialization ?? "--"}</p>
                <p><b>Досвід роботи</b> {profile.experience_years ?? "--"}</p>
                <p><b>Номер ліцензії</b> {profile.license_number ?? "--"}</p>

                <button onClick={onEdit}>Редагувати</button>
            </div>
        </div>
    );
}