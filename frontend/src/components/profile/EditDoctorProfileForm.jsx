import { useState } from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { updateMyDoctorProfile, updateMyUser } from "../../api/accounts";
import { glassCardSx, glassPanelSx } from "../../theme/glass";

export default function EditDoctorProfileForm({ profile, onCancel, onSaved }) {
    if (!profile) return null;

    const [email, setEmail] = useState(profile.user.email || "");
    const [bio, setBio] = useState(profile.bio || "");
    const [specialization, setSpecialization] = useState(profile.specialization || "");
    const [experienceYears, setExperienceYears] = useState(
        profile.experience_years ?? ""
    );
    const [licenseNumber, setLicenseNumber] = useState(
        profile.license_number?.license_number || ""
    );
    const [photo, setPhoto] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            if (email !== profile.user.email) {
                await updateMyUser({ email });
            }

            const formData = new FormData();
            if (bio) formData.append("bio", bio);
            if (specialization) formData.append("specialization", specialization);
            if (experienceYears !== "")
                formData.append("experience_years", experienceYears);
            if (licenseNumber)
                formData.append("license_number", licenseNumber);
            if (photo) formData.append("photo", photo);

            await updateMyDoctorProfile(formData);

            onSaved();
        } catch (err) {
            console.error(err);
            const data = err.response?.data;

            if (data) {
                const messages = Object.values(data)
                    .flat()
                    .join("\n");
                setError(messages);
            } else {
                setError("Не вдалося зберегти профіль доктора");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card
            elevation={2}
            sx={glassCardSx}
        >
            <CardContent component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
                        <Avatar
                            src={profile.photo || "/avatar-placeholder.png"}
                            alt="Фото лікаря"
                            sx={{ width: 96, height: 96 }}
                        />
                        <Box>
                            <Typography variant="h6">Редагувати профіль лікаря</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Оновіть дані та збережіть зміни.
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack spacing={2}>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Номер ліцензії"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Про себе"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            multiline
                            rows={3}
                            fullWidth
                        />
                        <TextField
                            label="Спеціалізація"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Стаж (років)"
                            type="number"
                            inputProps={{ min: 0 }}
                            value={experienceYears}
                            onChange={(e) => setExperienceYears(e.target.value)}
                            fullWidth
                        />
                        <Button variant="outlined" component="label">
                            Завантажити фото
                            <input
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files[0])}
                            />
                        </Button>
                    </Stack>

                    {error && <Alert severity="error">{error}</Alert>}

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <Button type="button" variant="outlined" onClick={onCancel}>
                            Скасувати
                        </Button>
                        <Button type="submit" variant="contained" disabled={saving}>
                            {saving ? "Збереження…" : "Зберегти"}
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
