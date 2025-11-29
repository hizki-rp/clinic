import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Calendar, FileText, Settings, UserPlus, Activity, Clock } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const HomePage = () => {
  const { user } = useAuth();
  
  const getQuickActions = (role) => {
    const baseActions = {
      reception: [
        { title: 'Patient Queue', description: 'View and manage current patient queue', icon: Users, link: '/reception/queue', color: 'bg-blue-500' },
        { title: 'Add New Patient', description: 'Register a new patient in the system', icon: UserPlus, link: '/reception/add-user', color: 'bg-green-500' },
        { title: 'My Shifts', description: 'View your weekly schedule', icon: Clock, link: '/shifts', color: 'bg-purple-500' }
      ],
      doctor: [
        { title: 'Medical Records', description: 'Access patient medical history and records', icon: FileText, link: '/ehr', color: 'bg-orange-500' },
        { title: 'Appointments', description: 'View scheduled appointments', icon: Calendar, link: '/appointments', color: 'bg-purple-500' },
        { title: 'My Shifts', description: 'View your weekly schedule', icon: Clock, link: '/shifts', color: 'bg-blue-500' }
      ],
      laboratory: [
        { title: 'Lab Tests', description: 'Manage laboratory tests and results', icon: FileText, link: '/lab', color: 'bg-green-500' },
        { title: 'Patient Queue', description: 'View patients awaiting lab work', icon: Users, link: '/reception/queue', color: 'bg-blue-500' },
        { title: 'My Shifts', description: 'View your weekly schedule', icon: Clock, link: '/shifts', color: 'bg-purple-500' }
      ],
      admin: [
        { title: 'Patient Queue', description: 'View and manage current patient queue', icon: Users, link: '/reception/queue', color: 'bg-blue-500' },
        { title: 'Staff Management', description: 'Manage employees and schedules', icon: Activity, link: '/admin/staff-management', color: 'bg-red-500' },
        { title: 'Admin Dashboard', description: 'Access full administrative controls', icon: Settings, link: '/admin', color: 'bg-gray-500' }
      ]
    };
    return baseActions[role] || baseActions.admin;
  };
  
  const quickActions = getQuickActions(user?.role);

  return (
    <div className="min-h-screen" style={{color: '#FFFFFF'}}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Menaharia Medium Clinic
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{color: '#A6AAB2'}}>
            Comprehensive Healthcare Management System with Electronic Health Records and Staff Management
          </p>
        </div>

        {/* My Shifts Section */}
        {user?.role !== 'admin' && (
          <div className="border rounded-lg p-6 mb-8" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
            <h2 className="text-xl font-bold mb-4">My Weekly Schedule</h2>
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="p-2 rounded" style={{backgroundColor: '#040C1D'}}>
                  <div className="text-sm font-medium">{day}</div>
                  <div className="text-xs mt-1" style={{color: '#A6AAB2'}}>
                    {index < 5 ? '9:00-17:00' : 'Off'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition-shadow duration-300" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
                <div className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <IconComponent size={24} />
                    </div>
                    <h3 className="text-lg font-semibold">{action.title}</h3>
                  </div>
                </div>
                <div>
                  <p className="mb-4" style={{color: '#A6AAB2'}}>
                    {action.description}
                  </p>
                  <Link to={action.link}>
                    <Button className="w-full">
                      Access {action.title}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Overview */}
        <div className="border rounded-lg shadow-lg p-8" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
          <h2 className="text-3xl font-bold text-center mb-8">
            System Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Electronic Health Records (EHR)
              </h3>
              <ul className="space-y-2" style={{color: '#A6AAB2'}}>
                <li>• Comprehensive medical history tracking</li>
                <li>• Allergy management with severity levels</li>
                <li>• Current and past medication records</li>
                <li>• Chronic conditions and surgery history</li>
                <li>• Integrated with patient queue system</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Staff Management System
              </h3>
              <ul className="space-y-2" style={{color: '#A6AAB2'}}>
                <li>• Employee profiles and information</li>
                <li>• Shift scheduling with calendar view</li>
                <li>• Automated payroll calculation</li>
                <li>• Performance review tracking</li>
                <li>• Department-wise organization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;