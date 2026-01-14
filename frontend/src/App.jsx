import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "./components/Header";
import RegisterChoice from "./pages/RegisterChoice";
import RegisterPatientPage from "./pages/RegisterPatientPage";
import RegisterDoctorPage from "./pages/RegisterDoctorPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientMedicalCardPage from "./pages/PatientMedicalCardPage.jsx";
import DoctorMedicalCardPage from "./pages/DoctorMedicalCardPage.jsx";
import ChatPage from "./pages/ChatPage";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorDetailPage from "./pages/DoctorDetailPage";



export default function App() {
    return (
        <Router>
            <Header />
            <Box component="main" sx={{ minHeight: "100vh", py: { xs: 3, md: 4 } }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterChoice />} />

                    <Route path="/register/patient" element={<RegisterPatientPage />} />
                    <Route path="/register/doctor" element={<RegisterDoctorPage />} />

                    <Route
                        path="/doctor/dashboard"
                        element={(
                            <ProtectedRoute role="doctor">
                                <DoctorDashboardPage />
                            </ProtectedRoute>
                        )}
                    />
                    <Route
                        path="/patient/dashboard"
                        element={(
                            <ProtectedRoute role="patient">
                                <PatientDashboardPage />
                            </ProtectedRoute>
                        )}
                    />
                    <Route
                        path="/patient/medical-card"
                        element={(
                            <ProtectedRoute role="patient">
                                <PatientMedicalCardPage />
                            </ProtectedRoute>
                        )}
                    />
                    <Route
                        path="/doctor/medical-card/:patientId"
                        element={(
                            <ProtectedRoute role="doctor">
                                <DoctorMedicalCardPage />
                            </ProtectedRoute>
                        )}
                    />
                    <Route
                        path="/chat/:appointmentId"
                        element={(
                            <ProtectedRoute>
                                <ChatPage />
                            </ProtectedRoute>
                        )}
                    />
                    <Route path="/doctors" element={<DoctorsPage />} />
                    <Route path="/doctors/:id" element={<DoctorDetailPage />} />
                </Routes>
            </Box>
        </Router>
    );
}
