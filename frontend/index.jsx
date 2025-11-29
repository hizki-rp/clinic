import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Welcome to your Health Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-2">Appointments</h3>
          <p className="text-gray-600">You have 3 upcoming appointments.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-2">Medical Records</h3>
          <p className="text-gray-600">Your records are up to date.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-2">Prescriptions</h3>
          <p className="text-gray-600">2 active prescriptions.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;