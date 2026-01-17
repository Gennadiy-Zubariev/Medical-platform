import {Avatar, Box, Button, Card, CardContent, Chip, Stack, Typography} from "@mui/material";

export function DoctorProfileCard({profile, onEdit}) {
    if (!profile) return null;

    const photoURL = profile.photo
        ? `${profile.photo}?t=${Date.now()}`
        : "/avatar-placeholder.png";

    const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
    const normalizeWorkDayLabel = (day) => {
        if (typeof day === "number") {
            if (day >= 0 && day <= 6) return WEEK_DAYS[day];
            return null;
        }
        if (typeof day === "string") {
            const numericDay = Number(day);
            if (!Number.isNaN(numericDay)) return normalizeWorkDayLabel(numericDay);
            if (WEEK_DAYS.includes(day)) return day;
            return null;
        }
        return null;
    };
    const workDayLabels = Array.isArray(profile.work_days)
        ? profile.work_days
            .map((day) => normalizeWorkDayLabel(day))
            .filter(Boolean)
        : [];
    const formatTime = (value) => {
        if (!value) return "--";
        return value.slice(0, 5);
    };
    return (
        <Card
            elevation={2}
            sx={{
                borderRadius: 3,
                background:
                    "linear-gradient(135deg, rgba(0, 150, 136, 0.08), rgba(33, 150, 243, 0.08))",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
                },
            }}
        >

            <CardContent>
                <Stack direction={{xs: "column", sm: "row"}} spacing={3} alignItems="center">
                    <Avatar
                        src={photoURL}
                        alt="Фото профілю"
                        sx={{
                            width: {xs: 120, sm: 160, md: 200},
                            height: {xs: 120, sm: 160, md: 200},
                            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.2)",
                            border: "3px solid rgba(255, 255, 255, 0.85)",
                            flexShrink: 0,
                        }}
                    />

                    <Stack spacing={1} sx={{flexGrow: 1}}>
                        <Typography><b>Ім'я:</b> {profile.user.first_name}</Typography>
                        <Typography><b>Ім'я:</b> {profile.user.last_name}</Typography>
                        <Typography><b>Email:</b> {profile.user.email}</Typography>
                        <Typography><b>Спеціалізація:</b> {profile.specialization ?? "--"}</Typography>
                        <Typography><b>Досвід роботи:</b> {profile.experience_years ?? "--"}</Typography>
                        <Typography><b>Номер
                            ліцензії:</b> {profile.license_number?.license_number ?? profile.license_number ?? "--"}
                        </Typography>
                        <Typography><b>Про себе:</b> {profile.bio ?? "--"}</Typography>
                        <Box
                            sx={{
                                mt: 1,
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: "rgba(255, 255, 255, 0.85)",
                                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                            }}
                        >
                            <Typography variant="subtitle2" sx={{mb: 1}}>
                                Розклад
                            </Typography>
                            <Stack direction={{xs: "column", sm: "row"}} spacing={2} alignItems="center">
                                <Stack spacing={0.5}>
                                    <Typography variant="body2">
                                        <b>Початок:</b> {formatTime(profile.work_start)}
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>Кінець:</b> {formatTime(profile.work_end)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {workDayLabels.length > 0 ? (
                                        workDayLabels.map((day) => (
                                            <Chip key={day} label={day} size="small" variant="outlined"/>
                                        ))
                                    ) : (
                                        <Chip label="--" size="small" variant="outlined"/>
                                    )}
                                </Stack>
                            </Stack>
                        </Box>

                    </Stack>

                    <Button variant="outlined" onClick={onEdit}>
                        Редагувати
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
