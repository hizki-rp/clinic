import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './components/AuthProvider';
import { PatientQueueProvider } from './context/PatientQueueContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Admin from './pages/Admin';
import PatientRegister from './pages/PatientRegister';
import NewAppointment from './pages/NewAppointment';
import AppointmentSuccess from './pages/AppointmentSuccess';
import Prescription from './pages/Prescription';
import PatientSummary from './pages/PatientSummary';
import AddUser from './pages/AddUser';
import Queue from './pages/Queue';
import Login from './pages/Login';
import StaffManagement from './pages/StaffManagement';
import PatientManagement from './pages/PatientManagement';
import Appointments from './pages/Appointments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
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