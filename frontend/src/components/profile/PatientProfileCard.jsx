const API_URL = import.meta.env.VITE_API_URL;

export default function PatientProfileCard({ profile, onEdit }) {
    if (!profile) return null;

    const photoURL = profile.photo
        ? `${API_URL}${profile.photo}?t=${Date.now()}`
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
                <p><b>Номер страховки</b> {profile.insurance_policy ?? "--"}</p>
                <p><b>Дата народження</b> {profile.date_of_birth ?? "--"}</p>
                <p><b>Адреса</b> {profile.address ?? "--"}</p>

                <button onClick={onEdit}>Редагувати</button>
            </div>
        </div>
    );
}