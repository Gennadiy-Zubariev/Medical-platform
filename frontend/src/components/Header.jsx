import {Link as RouterLink} from "react-router-dom";
import {AppBar, Box, Button, Stack, Toolbar, Typography} from "@mui/material";
import {useAuth} from "../context/AuthContext";

export default function Header() {
    const {user, isAuthenticated, logout} = useAuth();

    return (
        <AppBar position="sticky" color="inherit" elevation={0}
                sx={{borderBottom: "1px solid", borderColor: "divider"}}>
            <Toolbar sx={{gap: 2, flexWrap: "wrap"}}>
                <Typography
                    variant="h6"
                    component={RouterLink}
                    to="/"
                    sx={{fontWeight: 700, color: "primary.main"}}
                >
                    Медична платформа
                </Typography>

                <Box sx={{flexGrow: 1}}/>

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Button component={RouterLink} to="/" color="inherit">
                        Головна
                    </Button>

                    {!isAuthenticated && (
                        <>
                            <Button component={RouterLink} to="/login" color="inherit">
                                Вхід
                            </Button>
                            <Button component={RouterLink} to="/register" color="inherit">
                                Реєстрація
                            </Button>
                        </>
                    )}

                    {isAuthenticated && user && (
                        <>
                            {user.role === "patient" && (
                                <Button component={RouterLink} to="/patient/dashboard" color="inherit">
                                    Мій кабінет
                                </Button>
                            )}

                            {user.role === "doctor" && (
                                <Button component={RouterLink} to="/doctor/dashboard" color="inherit">
                                    Мій кабінет
                                </Button>
                            )}

                            <Button onClick={logout} color="inherit">
                                Вийти ({user?.username})
                            </Button>
                        </>
                    )}
                </Stack>
            </Toolbar>
        </AppBar>
    );
}
