import React, { useState } from 'react';
import { User, Bell, Shield, Building, Save, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      sms: false,
      appointments: true,
      reminders: true
    },
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    workingHours: {
      start: '09:00',
      end: '17:00'
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Settings updated:', formData);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'clinic', label: 'Clinic Info', icon: Building }
  ];

  return (
    <div className="p-6 theme-card">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="theme-card rounded-lg border">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent theme-text-secondary hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium" style={{color: '#FFFFFF'}}>Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium" style={{color: '#FFFFFF'}}>Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        style={{color: '#A6AAB2'}}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium" style={{color: '#FFFFFF'}}>Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium" style={{color: '#FFFFFF'}}>Email Notifications</label>
                      <p className="text-sm" style={{color: '#A6AAB2'}}>Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications.email"
                      checked={formData.notifications.email}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium" style={{color: '#FFFFFF'}}>SMS Notifications</label>
                      <p className="text-sm" style={{color: '#A6AAB2'}}>Receive notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications.sms"
                      checked={formData.notifications.sms}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium" style={{color: '#FFFFFF'}}>Appointment Reminders</label>
                      <p className="text-sm" style={{color: '#A6AAB2'}}>Get reminded about upcoming appointments</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications.appointments"
                      checked={formData.notifications.appointments}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'clinic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium" style={{color: '#FFFFFF'}}>Clinic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>
                      Clinic Name
                    </label>
                    <input
                      type="text"
                      name="clinicName"
                      value={formData.clinicName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>
                      Address
                    </label>
                    <textarea
                      name="clinicAddress"
                      value={formData.clinicAddress}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="clinicPhone"
                      value={formData.clinicPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>
                        Opening Time
                      </label>
                      <input
                        type="time"
                        name="workingHours.start"
                        value={formData.workingHours.start}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>
                        Closing Time
                      </label>
                      <input
                        type="time"
                        name="workingHours.end"
                        value={formData.workingHours.end}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t" style={{borderColor: 'hsl(var(--border))'}}>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;