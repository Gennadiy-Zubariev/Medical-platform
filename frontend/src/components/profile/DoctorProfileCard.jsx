import { Avatar, Button, Card, CardContent, Stack, Typography } from "@mui/material";

export default function DoctorProfileCard({ profile, onEdit }) {
    if (!profile) return null;

    const photoURL = profile.photo
        ? `${profile.photo}?t=${Date.now()}`
        : "/avatar-placeholder.png";
    return (
        <Card elevation={2}>
            <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
                    <Avatar
                        src={photoURL}
                        alt="Фото профілю"
                        sx={{ width: 96, height: 96 }}
                    />

                    <Stack spacing={1} sx={{ flexGrow: 1 }}>
                        <Typography><b>Ім'я:</b> {profile.user.first_name}</Typography>
                        <Typography><b>Email:</b> {profile.user.email}</Typography>
                        <Typography><b>Спеціалізація:</b> {profile.specialization ?? "--"}</Typography>
                        <Typography><b>Досвід роботи:</b> {profile.experience_years ?? "--"}</Typography>
                        <Typography><b>Номер ліцензії:</b> {profile.license_number?.license_number ?? profile.license_number ?? "--"}</Typography>
                        <Typography><b>Про себе:</b> {profile.bio ?? "--"}</Typography>
                    </Stack>

                    <Button variant="outlined" onClick={onEdit}>
                        Редагувати
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
