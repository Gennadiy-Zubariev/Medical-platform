import { Link } from 'react-router-dom'

export default function RegisterChoice() {
  return (
    <div style={{ padding: 20 }}>
        <h1>Реєстрація</h1>
        <p>Оберіть, Ви "Лікар" чи "Пацієнт"</p>

        <div style={{ marginTop: 20, display: 'flex', gap: 20 }}>
            <Link to="/register/patient">
                <button>Я пацієнт</button>
            </Link>
            <Link to="/register/doctor">
                <button>Я лікар</button>
            </Link>
        </div>
    </div>
  );
}