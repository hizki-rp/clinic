import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './components/AuthProvider';
import { PatientQueueProvider } from './context/PatientQueueContext';
import Layout from './components/Layout';
import Home from './pages/Home.jsx';
import Admin from './pages/admin.jsx';
import PatientRegister from './pages/PatientRegister.tsx';
import NewAppointment from './pages/NewAppointment.tsx';
import AppointmentSuccess from './pages/AppointmentSuccess.tsx';
import Prescription from './pages/Prescription.tsx';
import PatientSummary from './pages/PatientSummary.tsx';
import AddUser from './pages/AddUser.tsx';
import Queue from './pages/Queue.tsx';
import Login from './pages/Login.tsx';
import StaffManagement from './pages/StaffManagement.tsx';
import PatientManagement from './pages/PatientManagement.jsx';
import PatientManagementHub from './pages/PatientManagementHub.tsx';
import Appointments from './pages/Appointments.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import { ProtectedRoute } from './components/ProtectedRoute';
import './globals.css';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <PatientQueueProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/patients/:userId/register" element={<PatientRegister />} />
                <Route path="/patients/:userId/new-appointment" element={<NewAppointment />} />
                <Route path="/patients/:userId/new-appointment/success" element={<AppointmentSuccess />} />
                <Route path="/patients/:userId/prescription" element={<Prescription />} />
                <Route path="/patients/:userId/summary" element={<PatientSummary />} />
                <Route path="/reception/add-user" element={<AddUser />} />
                <Route path="/reception/patient-management" element={<ProtectedRoute allowedRoles={['reception', 'nurse']}><PatientManagementHub /></ProtectedRoute>} />
                <Route path="/reception/queue" element={<Queue />} />
                <Route path="/staff-management" element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'laboratory']}><StaffManagement /></ProtectedRoute>} />
                <Route path="/patients" element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'reception']}><PatientManagement /></ProtectedRoute>} />
                <Route path="/appointments" element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'reception']}><Appointments /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin', 'doctor']}><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
              </Routes>
            </Layout>
          </Router>
        </PatientQueueProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;