import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, UserCheck, Settings, BarChart3, FileText } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const managementCards = [
    {
      title: 'Patient Management',
      description: 'Manage patient records and information',
      icon: Users,
      path: '/admin/patients'
    },
    {
      title: 'Appointment Management',
      description: 'Schedule and manage appointments',
      icon: Calendar,
      path: '/admin/appointments'
    },
    {
      title: 'Staff Management',
      description: 'Manage healthcare staff and roles',
      icon: UserCheck,
      path: '/admin/staff'
    },
    {
      title: 'Reports & Analytics',
      description: 'View clinic statistics and reports',
      icon: BarChart3,
      path: '/admin/reports'
    },
    {
      title: 'Medical Records',
      description: 'Access and manage medical records',
      icon: FileText,
      path: '/admin/records'
    },
    {
      title: 'System Settings',
      description: 'Configure clinic settings',
      icon: Settings,
      path: '/admin/settings'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage your clinic operations from here</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managementCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link
                key={card.path}
                to={card.path}
                className="dashboard-box rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-lg mr-4 border border-dark-500">
                    <IconComponent className="h-6 w-6 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                </div>
                <p className="text-gray-300">{card.description}</p>
                <div className="mt-4 flex items-center text-blue-400 font-medium">
                  <span>Manage</span>
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 dashboard-box rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-dark-500 rounded-lg bg-dark-500">
              <div className="text-2xl font-bold">--</div>
              <div className="text-sm text-gray-400">Total Patients</div>
            </div>
            <div className="text-center p-4 border border-dark-500 rounded-lg bg-dark-500">
              <div className="text-2xl font-bold">--</div>
              <div className="text-sm text-gray-400">Today's Appointments</div>
            </div>
            <div className="text-center p-4 border border-dark-500 rounded-lg bg-dark-500">
              <div className="text-2xl font-bold">--</div>
              <div className="text-sm text-gray-400">Active Staff</div>
            </div>
            <div className="text-center p-4 border border-dark-500 rounded-lg bg-dark-500">
              <div className="text-2xl font-bold">--</div>
              <div className="text-sm text-gray-400">Pending Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;