import random
from pathlib import Path
from datetime import date, datetime, time, timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files import File
from django.core.management.base import BaseCommand
from django.utils.timezone import make_aware

from accounts.models import DoctorProfile, PatientProfile
from appointments.models import Appointment
from medical.models import MedicalCard, MedicalRecord
from registry.models import DoctorLicense, InsurancePolicy

User = get_user_model()

DOCTOR_PHOTOS_DIR = Path(settings.BASE_DIR) / "media" / "doctor_photos"
PHOTO_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
# Особливі лікарі: ім'я файлу фото (без розширення) -> (ім'я, прізвище, спеціалізація)
SPECIAL_DOCTORS = {
    "male_8": ("Грегорі", "Хаус", "Діагност"),
    "female_7": ("Мілдред", "Ретчед", "Терапевт"),
}
MALE_DOCTOR_NAMES = ["Ігор", "Андрій", "Богдан", "Сергій", "Віктор", "Олександр", "Михайло", "Тарас"]
FEMALE_DOCTOR_NAMES = ["Олена", "Марія", "Наталія", "Юлія", "Тетяна", "Оксана", "Людмила", "Леся"]
DOCTOR_FIRST_NAMES = MALE_DOCTOR_NAMES + FEMALE_DOCTOR_NAMES
DOCTOR_LAST_NAMES = [
    "Коваленко", "Шевченко", "Бондаренко", "Ткаченко", "Кравець",
    "Мельник", "Олійник", "Поліщук", "Гончар", "Савчук",
]
PATIENT_FIRST_NAMES = [
    "Дмитро", "Катерина", "Олег", "Анна", "Максим", "Софія", "Роман",
    "Вікторія", "Артем", "Ольга", "Іван", "Ірина", "Микола", "Даря", "Павло",
]
PATIENT_LAST_NAMES = [
    "Іваненко", "Петренко", "Сидоренко", "Мороз", "Лисенко",
    "Романюк", "Ковальчук", "Кузьменко", "Бойко", "Литвин",
]
SPECIALIZATIONS = [
    "Терапевт", "Кардіолог", "Педіатр", "Невролог", "Дерматолог",
    "Офтальмолог", "Отоларинголог", "Хірург",
]
DIAGNOSES = [
    "ГРВІ", "Гіпертонічна хвороба", "Мігрень", "Гастрит", "Остеохондроз",
    "Алергічний риніт", "Бронхіт", "Артроз колінного суглоба",
]
BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]


class Command(BaseCommand):
    help = "Наповнює базу демо-даними (реєстри, лікарі, пацієнти, записи) для локальної розробки/скріншотів."

    def add_arguments(self, parser):
        parser.add_argument("--doctors", type=int, default=15, help="Кількість лікарів для створення.")
        parser.add_argument("--patients", type=int, default=15, help="Кількість пацієнтів для створення.")
        parser.add_argument(
            "--registry-size",
            type=int,
            default=1000,
            help="Скільки записів ліцензій/страхових полісів згенерувати в офіційних реєстрах.",
        )

    def handle(self, *args, **options):
        random.seed(42)
        n_doctors = options["doctors"]
        n_patients = options["patients"]
        registry_size = options["registry_size"]

        self.stdout.write("Наповнюю офіційні реєстри (ліцензії лікарів, страхові поліси)...")
        self._seed_registry(registry_size)

        self.stdout.write("Створюю лікарів...")
        doctors = self._seed_doctors(n_doctors)

        self.stdout.write("Створюю пацієнтів...")
        patients = self._seed_patients(n_patients)

        self.stdout.write("Створюю записи на прийом та медичні картки...")
        self._seed_appointments(doctors, patients)

        self.stdout.write(self.style.SUCCESS(
            f"Готово: {registry_size} ліцензій, {registry_size} страхових полісів, "
            f"{len(doctors)} лікарів, {len(patients)} пацієнтів."
        ))
        self.stdout.write(self.style.SUCCESS("Пароль для всіх демо-акаунтів: Demo12345!"))

    def _seed_registry(self, size):
        today = date.today()
        existing_licenses = set(DoctorLicense.objects.values_list("license_number", flat=True))
        licenses = []
        for i in range(1, size + 1):
            number = f"LIC-{i:06d}"
            if number in existing_licenses:
                continue
            licenses.append(DoctorLicense(
                license_number=number,
                full_name=f"{random.choice(DOCTOR_FIRST_NAMES)} {random.choice(DOCTOR_LAST_NAMES)}",
                issued_date=today - timedelta(days=random.randint(200, 3000)),
                valid_until=today + timedelta(days=random.randint(200, 2000)),
            ))
        DoctorLicense.objects.bulk_create(licenses, batch_size=500)

        existing_policies = set(InsurancePolicy.objects.values_list("insurance_policy", flat=True))
        policies = []
        providers = ["УкрСтрахування", "МедГарант", "Життя+", "НацМед", "Асептика Insurance"]
        for i in range(1, size + 1):
            number = f"INS-{i:06d}"
            if number in existing_policies:
                continue
            policies.append(InsurancePolicy(
                insurance_policy=number,
                full_name=f"{random.choice(PATIENT_FIRST_NAMES)} {random.choice(PATIENT_LAST_NAMES)}",
                provider=random.choice(providers),
                valid_until=today + timedelta(days=random.randint(200, 2000)),
            ))
        InsurancePolicy.objects.bulk_create(policies, batch_size=500)

    def _load_doctor_photos(self):
        """Фото з backend/media/doctor_photos: male_*.jpg -> чоловік, female_*.jpg -> жінка."""
        photos = {"male": [], "female": []}
        if DOCTOR_PHOTOS_DIR.is_dir():
            for path in sorted(DOCTOR_PHOTOS_DIR.iterdir()):
                if path.suffix.lower() not in PHOTO_EXTENSIONS:
                    continue
                for gender in photos:
                    if path.name.lower().startswith(f"{gender}_"):
                        photos[gender].append(path)
        return photos

    def _seed_doctors(self, n):
        doctors = []
        photos = self._load_doctor_photos()
        # чергуємо стать, поки є фото обох типів; далі — те, що лишилось
        queue = []
        males, females = list(photos["male"]), list(photos["female"])
        while males or females:
            if males:
                queue.append(("male", males.pop(0)))
            if females:
                queue.append(("female", females.pop(0)))
        if not queue:
            self.stdout.write("Фото лікарів не знайдено в media/doctor_photos — лікарі будуть без фото.")
        used_license_ids = set(DoctorProfile.objects.values_list("license_number_id", flat=True))
        licenses = list(
            DoctorLicense.objects.exclude(id__in=used_license_ids).order_by("id")[:n]
        )
        for i, license_obj in enumerate(licenses, start=1):
            username = f"doctor{i}"
            gender, photo_path = queue[i - 1] if i <= len(queue) else (random.choice(["male", "female"]), None)
            special = SPECIAL_DOCTORS.get(photo_path.stem.lower()) if photo_path else None
            names = MALE_DOCTOR_NAMES if gender == "male" else FEMALE_DOCTOR_NAMES
            user, created = User.objects.get_or_create(
                username=username,
                defaults=dict(
                    email=f"{username}@demo.local",
                    first_name=special[0] if special else random.choice(names),
                    last_name=special[1] if special else random.choice(DOCTOR_LAST_NAMES),
                    role=User.Roles.DOCTOR,
                ),
            )
            if created:
                user.set_password("Demo12345!")
                user.save()

            profile, _ = DoctorProfile.objects.get_or_create(
                user=user,
                defaults=dict(
                    license_number=license_obj,
                    bio="Досвідчений спеціаліст, орієнтований на індивідуальний підхід до кожного пацієнта.",
                    specialization=special[2] if special else SPECIALIZATIONS[i % len(SPECIALIZATIONS)],
                    experience_years=random.randint(3, 25),
                    work_start=time(9, 0),
                    work_end=time(17, 0),
                    slot_duration=30,
                    work_days=[0, 1, 2, 3, 4],
                    is_booking_open=True,
                ),
            )
            if photo_path and not profile.photo:
                with photo_path.open("rb") as f:
                    profile.photo.save(photo_path.name, File(f), save=True)
            doctors.append(profile)
        return doctors

    def _seed_patients(self, n):
        patients = []
        used_policy_ids = set(PatientProfile.objects.values_list("insurance_policy_id", flat=True))
        policies = list(
            InsurancePolicy.objects.exclude(id__in=used_policy_ids).order_by("id")[:n]
        )
        today = date.today()
        for i, policy in enumerate(policies, start=1):
            username = f"patient{i}"
            user, created = User.objects.get_or_create(
                username=username,
                defaults=dict(
                    email=f"{username}@demo.local",
                    first_name=random.choice(PATIENT_FIRST_NAMES),
                    last_name=random.choice(PATIENT_LAST_NAMES),
                    role=User.Roles.PATIENT,
                ),
            )
            if created:
                user.set_password("Demo12345!")
                user.save()

            profile, _ = PatientProfile.objects.get_or_create(
                user=user,
                defaults=dict(
                    date_of_birth=today - timedelta(days=random.randint(18, 70) * 365),
                    address="м. Київ, вул. Хрещатик, 1",
                    insurance_policy=policy,
                ),
            )
            MedicalCard.objects.get_or_create(
                patient=profile,
                defaults=dict(
                    blood_type=random.choice(BLOOD_TYPES),
                    allergies=random.choice(["", "Пеніцилін", "Пилок рослин", "Немає"]),
                    chronic_diseases=random.choice(["", "Немає", "Гіпертонія"]),
                ),
            )
            patients.append(profile)
        return patients

    def _seed_appointments(self, doctors, patients):
        if not doctors or not patients:
            return

        now = datetime.now()
        statuses = [Appointment.Status.PENDING, Appointment.Status.CONFIRMED, Appointment.Status.COMPLETED]

        for patient in patients:
            for _ in range(random.randint(1, 3)):
                doctor = random.choice(doctors)
                status = random.choice(statuses)

                if status == Appointment.Status.COMPLETED:
                    day_offset = -random.randint(1, 30)
                else:
                    day_offset = random.randint(1, 20)

                naive_dt = datetime.combine(
                    (now + timedelta(days=day_offset)).date(),
                    time(random.choice([9, 10, 11, 13, 14, 15, 16]), random.choice([0, 30])),
                )
                start_dt = make_aware(naive_dt)

                appointment, created = Appointment.objects.get_or_create(
                    doctor=doctor,
                    start_datetime=start_dt,
                    defaults=dict(
                        patient=patient,
                        duration_minutes=30,
                        status=status,
                        reason=random.choice([
                            "Планова консультація", "Погане самопочуття", "Контрольний огляд",
                            "Біль у грудях", "Головний біль",
                        ]),
                    ),
                )

                if created and status == Appointment.Status.COMPLETED:
                    card = getattr(patient, "medical_card", None)
                    if card:
                        MedicalRecord.objects.create(
                            card=card,
                            doctor=doctor,
                            appointment=appointment,
                            diagnosis=random.choice(DIAGNOSES),
                            recipe="Приймати згідно призначення лікаря.",
                            recommendations="Дотримуватись режиму, повторний огляд за потреби.",
                        )
