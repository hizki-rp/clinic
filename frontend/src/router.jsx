import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UniversitiesPage from './pages/UniversitiesPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import NotFoundPage from './pages/NotFoundPage';
import Queue from './pages/Queue';
import Admin from './pages/Admin';
import AddUser from './pages/AddUser';
import PatientSummary from './pages/PatientSummary';
import Prescription from './pages/Prescription';
import NewAppointment from './pages/NewAppointment';
import PatientRegister from './pages/PatientRegister';
import AppointmentSuccess from './pages/AppointmentSuccess';
import Login from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import EHRManagement from './components/EHRManagement';
import StaffDashboard from './components/StaffDashboard';
import StaffManagement from './pages/StaffManagement';
import PatientManagement from './pages/PatientManagement';
import Appointments from './pages/Appointments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import PatientReadmission from './pages/PatientReadmission';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'universities', element: <UniversitiesPage /> },
      { path: 'payment-success', element: <PaymentSuccessPage /> },
      { path: 'reception/queue', element: <ProtectedRoute allowedRoles={['reception', 'doctor', 'laboratory']}><Queue /></ProtectedRoute> },
      { path: 'reception/add-user', element: <ProtectedRoute allowedRoles={['reception']}><AddUser /></ProtectedRoute> },
      { path: 'reception/readmit-patient', element: <ProtectedRoute allowedRoles={['reception', 'nurse']}><PatientReadmission /></ProtectedRoute> },
      { path: 'queue', element: <ProtectedRoute allowedRoles={['reception', 'doctor', 'laboratory', 'nurse', 'admin']}><Queue /></ProtectedRoute> },
      { path: 'admin', element: <ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute> },
      { path: 'patients/:userId/summary', element: <ProtectedRoute><PatientSummary /></ProtectedRoute> },
      { path: 'patients/:userId/prescription', element: <ProtectedRoute><Prescription /></ProtectedRoute> },
      { path: 'patients/:userId/new-appointment', element: <NewAppointment /> },
      { path: 'patients/:userId/new-appointment/success', element: <AppointmentSuccess /> },
      { path: 'patients/:userId/register', element: <PatientRegister /> },
      { path: 'ehr', element: <ProtectedRoute allowedRoles={['doctor', 'nurse', 'admin']}><EHRManagement /></ProtectedRoute> },
      { path: 'staff-management', element: <ProtectedRoute allowedRoles={['admin', 'reception']}><StaffManagement /></ProtectedRoute> },
      { path: 'admin/staff-management', element: <ProtectedRoute allowedRoles={['admin', 'reception']}><StaffDashboard /></ProtectedRoute> },
      { path: 'patients', element: <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'reception']}><PatientManagement /></ProtectedRoute> },
      { path: 'appointments', element: <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'reception']}><Appointments /></ProtectedRoute> },
      { path: 'reports', element: <ProtectedRoute allowedRoles={['admin', 'doctor']}><Reports /></ProtectedRoute> },
      { path: 'settings', element: <ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute> },
      { path: 'unauthorized', element: <div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1><p>You don't have permission to access this page.</p></div> },
    ],
  },
]);

export default router;