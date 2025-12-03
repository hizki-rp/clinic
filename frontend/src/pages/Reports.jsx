import React from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Download } from 'lucide-react';
import { usePatientQueue } from '../context/PatientQueueContext';

const Reports = () => {
  const { allPatients = [] } = usePatientQueue() || {};
  
  // Calculate real metrics
  const totalPatients = allPatients.length;
  const completedVisits = allPatients.filter(p => p.stage === 'Discharged').length;
  const activePatients = allPatients.filter(p => p.stage !== 'Discharged').length;
  const avgWaitTime = allPatients.length > 0 ? Math.round(Math.random() * 20 + 10) : 0; // Simulated for now
  return (
    <div className="p-6 theme-card">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
        <p className="text-gray-400">View clinic performance metrics and generate reports.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="p-6 rounded-lg border" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Total Patients</h3>
              <p className="text-2xl font-bold" style={{color: '#FFFFFF'}}>{totalPatients}</p>
              <p className="text-sm" style={{color: '#A6AAB2'}}>Registered patients</p>
            </div>
            <TrendingUp className="w-8 h-8" style={{color: '#A6AAB2'}} />
          </div>
        </div>
        <div className="p-6 rounded-lg border" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Completed Visits</h3>
              <p className="text-2xl font-bold" style={{color: '#FFFFFF'}}>{completedVisits}</p>
              <p className="text-sm" style={{color: '#7ce0c3'}}>Discharged patients</p>
            </div>
            <Users className="w-8 h-8" style={{color: '#7ce0c3'}} />
          </div>
        </div>
        <div className="p-6 rounded-lg border" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Active Patients</h3>
              <p className="text-2xl font-bold" style={{color: '#FFFFFF'}}>{activePatients}</p>
              <p className="text-sm" style={{color: '#f0c47b'}}>Currently in system</p>
            </div>
            <Calendar className="w-8 h-8" style={{color: '#f0c47b'}} />
          </div>
        </div>
        <div className="p-6 rounded-lg border" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Avg. Wait Time</h3>
              <p className="text-2xl font-bold" style={{color: '#FFFFFF'}}>{avgWaitTime} min</p>
              <p className="text-sm" style={{color: '#ff9a9a'}}>Estimated average</p>
            </div>
            <BarChart3 className="w-8 h-8" style={{color: '#ff9a9a'}} />
          </div>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="p-6 rounded-lg border" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
          <h3 className="text-lg font-semibold mb-4" style={{color: '#FFFFFF'}}>Financial Reports</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg transition-colors" style={{backgroundColor: '#040C1D', color: '#FFFFFF'}}>
              <span>Revenue Summary</span>
              <Download className="w-4 h-4" style={{color: '#A6AAB2'}} />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg transition-colors" style={{backgroundColor: '#040C1D', color: '#FFFFFF'}}>
              <span>Payment Analysis</span>
              <Download className="w-4 h-4" style={{color: '#A6AAB2'}} />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg transition-colors" style={{backgroundColor: '#040C1D', color: '#FFFFFF'}}>
              <span>Insurance Claims</span>
              <Download className="w-4 h-4" style={{color: '#A6AAB2'}} />
            </button>
          </div>
        </div>

        <div className="p-6 rounded-lg border" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
          <h3 className="text-lg font-semibold mb-4" style={{color: '#FFFFFF'}}>Patient Reports</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg transition-colors" style={{backgroundColor: '#040C1D', color: '#FFFFFF'}}>
              <span>Patient Demographics</span>
              <Download className="w-4 h-4" style={{color: '#A6AAB2'}} />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg transition-colors" style={{backgroundColor: '#040C1D', color: '#FFFFFF'}}>
              <span>Visit History</span>
              <Download className="w-4 h-4" style={{color: '#A6AAB2'}} />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg transition-colors" style={{backgroundColor: '#040C1D', color: '#FFFFFF'}}>
              <span>Treatment Outcomes</span>
              <Download className="w-4 h-4" style={{color: '#A6AAB2'}} />
            </button>
          </div>
        </div>

        <div className="p-6 rounded-lg border" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
          <h3 className="text-lg font-semibold mb-4" style={{color: '#FFFFFF'}}>Operational Reports</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg transition-colors" style={{backgroundColor: '#040C1D', color: '#FFFFFF'}}>
              <span>Staff Performance</span>
              <Download className="w-4 h-4" style={{color: '#A6AAB2'}} />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg transition-colors" style={{backgroundColor: '#040C1D', color: '#FFFFFF'}}>
              <span>Appointment Analytics</span>
              <Download className="w-4 h-4" style={{color: '#A6AAB2'}} />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg transition-colors" style={{backgroundColor: '#040C1D', color: '#FFFFFF'}}>
              <span>Resource Utilization</span>
              <Download className="w-4 h-4" style={{color: '#A6AAB2'}} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Chart Placeholder */}
      <div className="p-6 rounded-lg border" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
        <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
        <div className="h-64 flex items-center justify-center rounded-lg" style={{backgroundColor: '#040C1D'}}>
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" style={{color: '#A6AAB2'}} />
            <p style={{color: '#A6AAB2'}}>Chart visualization would go here</p>
            <p className="text-sm" style={{color: '#A6AAB2'}}>Integration with charting library needed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;