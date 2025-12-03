import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { usePatientQueue } from '../context/PatientQueueContext';
import { useNavigate } from 'react-router-dom';
import { theme } from '@/styles/theme';

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { allPatients = [], updatePatient, removePatient } = usePatientQueue() || {};
  const navigate = useNavigate();
  
  // Transform backend data to match component structure
  const patients = allPatients.map(patient => ({
    id: patient.id,
    name: patient.name,
    age: patient.age,
    phone: patient.phone || 'N/A',
    address: patient.address || 'N/A',
    emergencyContactName: patient.emergencyContactName || 'N/A',
    emergencyContactPhone: patient.emergencyContactPhone || 'N/A',
    lastVisit: patient.checkInTime ? new Date(patient.checkInTime).toISOString().split('T')[0] : 'N/A',
    status: patient.stage === 'Discharged' ? 'Inactive' : 'Active'
  }));

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.age?.toString().includes(searchTerm)
  );

  return (
    <div className={theme.page}>
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>Patient Management</h1>
        <p className={theme.text.muted}>Manage patient records, registrations, and medical history.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={theme.statsCard}>
          <h3 className={`text-sm font-medium ${theme.text.muted} mb-2`}>Total Patients</h3>
          <p className={`text-2xl font-bold ${theme.text.primary}`}>{patients.length}</p>
          <p className="text-sm text-green-400">All registered</p>
        </div>
        <div className={theme.statsCard}>
          <h3 className={`text-sm font-medium ${theme.text.muted} mb-2`}>Active Patients</h3>
          <p className={`text-2xl font-bold ${theme.text.primary}`}>{patients.filter(p => p.status === 'Active').length}</p>
          <p className={`text-sm ${theme.text.accent}`}>Currently active</p>
        </div>
        <div className={theme.statsCard}>
          <h3 className={`text-sm font-medium ${theme.text.muted} mb-2`}>Inactive Patients</h3>
          <p className={`text-2xl font-bold ${theme.text.primary}`}>{patients.filter(p => p.status === 'Inactive').length}</p>
          <p className="text-sm text-yellow-400">Discharged</p>
        </div>
        <div className={theme.statsCard}>
          <h3 className={`text-sm font-medium ${theme.text.muted} mb-2`}>Recent Visits</h3>
          <p className={`text-2xl font-bold ${theme.text.primary}`}>{patients.filter(p => p.lastVisit !== 'N/A').length}</p>
          <p className="text-sm text-red-400">With visit records</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search patients by name, phone, or age..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={theme.searchInput}
          />
        </div>
        <button 
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${theme.button.primary}`}
          onClick={() => navigate('/reception/add-user')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Patient
        </button>
      </div>

      {/* Patient Table */}
      <div className={`${theme.card} rounded-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme.table.header}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.muted} uppercase tracking-wider`}>Patient ID</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.muted} uppercase tracking-wider`}>Name</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.muted} uppercase tracking-wider`}>Age</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.muted} uppercase tracking-wider`}>Phone</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.muted} uppercase tracking-wider`}>Last Visit</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.muted} uppercase tracking-wider`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.text.muted} uppercase tracking-wider`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredPatients.map((patient, index) => (
                <tr key={`patient-${patient.id}-${index}`} className={theme.table.row}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme.text.primary}`}>#{patient.id.toString().padStart(4, '0')}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme.text.primary}`}>{patient.name}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme.text.secondary}`}>{patient.age}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme.text.secondary}`}>{patient.phone}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme.text.secondary}`}>{patient.lastVisit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      patient.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => {
                          setSelectedPatient(patient);
                          alert(`Viewing ${patient.name}\nAge: ${patient.age}\nPhone: ${patient.phone}\nStatus: ${patient.status}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-yellow-400 hover:text-yellow-300"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-red-400 hover:text-red-300"
                        onClick={() => {
                          if (confirm(`Delete patient ${patient.name}?`)) {
                            if (removePatient) {
                              removePatient(patient.id);
                            }
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedPatient && (
        <div className={theme.modal.overlay}>
          <div className={`${theme.modal.content} max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Edit Patient</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Name</label>
                <input 
                  type="text" 
                  defaultValue={selectedPatient.name}
                  className={`w-full px-3 py-2 rounded ${theme.input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Phone</label>
                <input 
                  type="text" 
                  defaultValue={selectedPatient.phone}
                  className={`w-full px-3 py-2 rounded ${theme.input}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                <input 
                  type="text" 
                  defaultValue={selectedPatient.address}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Emergency Contact Name</label>
                <input 
                  type="text" 
                  defaultValue={selectedPatient.emergencyContactName}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Emergency Contact Phone</label>
                <input 
                  type="text" 
                  defaultValue={selectedPatient.emergencyContactPhone}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button 
                className={`px-4 py-2 rounded ${theme.button.primary}`}
                onClick={() => {
                  alert('Patient updated!');
                  setShowEditModal(false);
                }}
              >
                Update
              </button>
              <button 
                className={`px-4 py-2 rounded ${theme.button.secondary}`}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default PatientManagement;