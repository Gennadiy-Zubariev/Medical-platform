import {Typography} from "@mui/material";


export default function MedicalCardHeader({patient}) {
    return (
        <Typography variant="h4">
            Медична картка:{" "}
            {patient.user.first_name} {patient.user.last_name}
        </Typography>
    );
}
