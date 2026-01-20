import {Avatar, Button, Card, CardContent, Stack, Typography} from "@mui/material";
import {glassCardSx} from "../../theme/glass";

export default function PatientProfileCard({profile, onEdit}) {
    if (!profile) return null;

    const photoURL = profile.photo
        ? `${profile.photo}?t=${Date.now()}`
        : "/avatar-placeholder.png";
    return (
        <Card
            elevation={2}
            sx={glassCardSx}
        >
            <CardContent>
                <Stack direction={{xs: "column", sm: "row"}} spacing={3} alignItems="center">
                    <Avatar
                        src={photoURL}
                        alt="Фото профілю"
                        sx={{width: 96, height: 96}}
                    />

                    <Stack spacing={1} sx={{flexGrow: 1}}>
                        <Typography><b>Ім'я:</b> {profile.user.first_name}</Typography>
                        <Typography><b>Прізвище:</b> {profile.user.last_name}</Typography>
                        <Typography><b>Email:</b> {profile.user.email}</Typography>
                        <Typography><b>Номер страховки:</b> {profile.insurance_policy ?? "--"}</Typography>
                        <Typography><b>Дата народження:</b> {profile.date_of_birth ?? "--"}</Typography>
                        <Typography><b>Адреса:</b> {profile.address ?? "--"}</Typography>
                    </Stack>

                    <Button variant="outlined" onClick={onEdit}>
                        Редагувати
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
