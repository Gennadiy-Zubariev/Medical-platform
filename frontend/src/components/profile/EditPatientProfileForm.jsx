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
import { updateMyPatientProfile, updateMyUser } from "../../api/accounts";

export default function EditPatientProfileForm({ profile, onCancel, onSaved }) {
    if (!profile) return null;

    const [email, setEmail] = useState(profile.user.email || "");
    const [insurancePolicy, setInsurancePolicy] = useState("");
    const [address, setAddress] = useState(profile.address || "");
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

            if (insurancePolicy) {
                formData.append("insurance_policy", insurancePolicy);
            }

            if (address) {
                formData.append("address", address);
            }

            if (photo) {
                formData.append("photo", photo);
            }

            await updateMyPatientProfile(formData);

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
                setError("Не вдалося зберегти профіль пацієнта");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card
            elevation={2}
            component="form"
            onSubmit={handleSubmit}
            sx={{
                backgroundImage: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            }}
        >
            <CardContent>
                <Stack spacing={3}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
                        <Avatar
                            src={profile.photo || "/avatar-placeholder.png"}
                            alt="Фото пацієнта"
                            sx={{ width: 96, height: 96 }}
                        />
                        <Box>
                            <Typography variant="h6">Редагувати профіль пацієнта</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Заповніть дані та збережіть зміни.
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
                            label="Номер страховки"
                            value={insurancePolicy}
                            onChange={(e) => setInsurancePolicy(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Адреса"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            multiline
                            rows={3}
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
