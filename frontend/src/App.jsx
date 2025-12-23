import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from "./components/Header";
import RegisterChoice from "./pages/RegisterChoice";
import RegisterPatientPage from "./pages/RegisterPatientPage";
import RegisterDoctorPage from "./pages/RegisterDoctorPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext.jsx";
import PatientMedicalCardPage from "./pages/PatientMedicalCardPage.jsx";
import DoctorMedicalCardPage from "./pages/DoctorMedicalCardPage.jsx";



export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Header />

                <Routes>
                    <Route path="/" element={<HomePage />} />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterChoice />} />

                    <Route path="/register/patient" element={<RegisterPatientPage />} />
                    <Route path="/register/doctor" element={<RegisterDoctorPage />} />

                    <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboardPage /></ProtectedRoute>} />
                    <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboardPage /></ProtectedRoute>} />
                    <Route path="/patient/medical-card" element={<ProtectedRoute role="patient"><PatientMedicalCardPage /></ProtectedRoute>} />
                    <Route path="/doctor/medical-card/:patientId" element={<ProtectedRoute role="doctor"><DoctorMedicalCardPage /></ProtectedRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

