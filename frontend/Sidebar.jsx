import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Calendar, 
  FileText, 
  Activity,
  Settings,
  ClipboardList
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { path: '/staff-management', label: 'Staff Management', icon: Users },
    { path: '/patients', label: 'Patient Management', icon: UserPlus },
    { path: '/appointments', label: 'Appointments', icon: Calendar },
    { path: '/reception/queue', label: 'Patient Queue', icon: ClipboardList },
    { path: '/ehr', label: 'Medical Records', icon: FileText },
    { path: '/reports', label: 'Reports & Analytics', icon: Activity },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-blue-400">Menaharia Medium Clinic</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="text-sm text-gray-400">
          Logged in as: Admin User
        </div>
      </div>
    </div>
  );
};

export default Sidebar;