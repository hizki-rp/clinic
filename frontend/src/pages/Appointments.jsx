import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/constants';
import { Calendar, Clock, Plus, Filter, X } from 'lucide-react';
import { usePatientQueue } from '../context/PatientQueueContext';
import { healthcareApi } from '@/lib/api'; // Import the API client

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    doctorId: '', // Add doctorId to state
    date: '',
    time: '',
    reason: 'Consultation', // Renamed from 'type' to match backend
    duration_minutes: 30, // Added duration
    notes: '', // Added notes
    is_follow_up: false, // Added follow-up flag
  });
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]); // State to hold the list of doctors
  const [patients, setPatients] = useState([]); // Local state for patients
  // const { allPatients = [] } = usePatientQueue() || {}; // This is likely empty on this page

  // Fetch appointments from backend
  const fetchAppointments = async () => {
    try {
      const data = await healthcareApi.appointments.list();
      console.log('Raw appointments data:', data); // Debug log
      
      const formattedAppointments = data.map(apt => {
        console.log('Processing appointment:', apt); // Debug each appointment
        return {
          id: apt.id,
          time: new Date(apt.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          patient: `${apt.patient_detail?.user?.first_name || ''} ${apt.patient_detail?.user?.last_name || ''}`.trim() || 'Unknown Patient',
          doctor: `Dr. ${apt.doctor_detail?.first_name || ''} ${apt.doctor_detail?.last_name || ''}`.trim() || 'Unknown Doctor',
          type: apt.reason || 'General',
          status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1), // Capitalize status
          date: new Date(apt.appointment_date).toLocaleDateString('en-CA') // YYYY-MM-DD format
        };
      });
      
      console.log('Formatted appointments:', formattedAppointments); // Debug formatted data
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Display a more informative message if it's a 401 error
      if (error.message.includes('401')) {
        alert('You are not authorized to view appointments. Please log in.');
      } else {
        alert('Failed to fetch appointments. Please check your network or try again.');
      }
    }
  };

  // Fetch doctors from backend
  const fetchDoctors = async () => {
    try {
      // Use the authentication API endpoint for doctors
      const response = await fetch(`${API_BASE_URL}/auth/doctors/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      
      const doctorUsers = await response.json();
      setDoctors(doctorUsers);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  // Fetch patients for the search modal
  const fetchPatients = async () => {
    try {
      const patientsData = await healthcareApi.patients.list();
      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  useEffect(() => {
    // Check if user is authenticated before fetching data
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchAppointments();
      fetchDoctors();
      fetchPatients(); // Fetch patients when the component mounts
    } else {
      console.warn('No access token found. User may need to log in.');
    }
  }, []);
  
  // Delete appointment
  const deleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }
    
    try {
      await healthcareApi.appointments.delete(appointmentId);
      fetchAppointments();
      alert('Appointment deleted successfully!');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment.');
    }
  };

  // Update appointment
  const updateAppointment = async (appointmentId, updates) => {
    try {
      await healthcareApi.appointments.update(appointmentId, updates);
      fetchAppointments();
      setShowEditModal(false);
      setSelectedAppointment(null);
      alert('Appointment updated successfully!');
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment.');
    }
  };

  // Create appointment
  const createAppointment = async () => {
    if (!newAppointment.patientId || !newAppointment.doctorId || !newAppointment.date || !newAppointment.time) {
      alert('Please select a patient, doctor, and specify the date and time.');
      return;
    }
    
    try {
      const appointmentData = {
        patient: newAppointment.patientId,
        doctor: newAppointment.doctorId, // Add doctor to the payload
        appointment_date: `${newAppointment.date}T${newAppointment.time}:00`,
        reason: newAppointment.reason,
        status: 'scheduled',
        duration_minutes: newAppointment.duration_minutes,
        notes: newAppointment.notes,
        is_follow_up: newAppointment.is_follow_up,
      };
      
      // Use the API client to create the appointment
      const newApt = await healthcareApi.appointments.create(appointmentData);
      if (newApt) {
        fetchAppointments(); // Fixed: Removed unnecessary arguments
        setNewAppointment({
          patientId: '',
          doctorId: '',
          date: '',
          time: '',
          reason: 'Consultation',
          duration_minutes: 30,
          notes: '',
          is_follow_up: false,
        });
        setShowPatientDropdown(false);
        setShowNewAppointmentModal(false);
        alert('Appointment created successfully!');
      } else {
        // Fixed: Removed reference to non-existent 'response' variable
        alert('Error creating appointment: Server returned empty response.');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      // Optional: Check if error.response exists to show backend validation message
      const msg = error.response?.data?.message || 'Error creating appointment. Please try again.';
      alert(msg);
    }
  };

   // Filter appointments by selected date or show all
  const filteredAppointments = showAllAppointments
    ? appointments
    : appointments.filter(appointment => appointment.date === selectedDate);

  // Filter patients for search
  const filteredPatients = patients.filter(patient => {
    const searchLower = patientSearch.toLowerCase();
    return (
      `${patient.user.first_name} ${patient.user.last_name}`.toLowerCase().includes(searchLower) ||
      patient.user.phone_number?.includes(patientSearch) ||
      patient.age?.toString().includes(searchLower) ||
      patient.emergency_contact_name?.toLowerCase().includes(searchLower)
    );
  });

  const selectPatient = (patient) => {
    setNewAppointment({...newAppointment, patientId: patient.id});
    // Use the correct user object to set the name in the search bar
    setPatientSearch(`${patient.user.first_name} ${patient.user.last_name}`);
    setShowPatientDropdown(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6" style={{color: '#FFFFFF'}}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Appointments</h1>
        <p className="text-gray-400">Schedule and manage patient appointments.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="p-6 rounded-lg border" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
          <h3 className="text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Total Appointments</h3>
          <p className="text-2xl font-bold" style={{color: '#FFFFFF'}}>{appointments.length}</p>
          <p className="text-sm" style={{color: '#A6AAB2'}}>{appointments.filter(a => a.status === 'Confirmed').length} confirmed</p>
        </div>
        <div className="p-6 rounded-lg border" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
          <h3 className="text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Pending</h3>
          <p className="text-2xl font-bold" style={{color: '#FFFFFF'}}>{appointments.filter(a => a.status === 'Pending').length}</p>
          <p className="text-sm" style={{color: '#8ab7ff'}}>Awaiting response</p>
        </div>
        <div className="p-6 rounded-lg border" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
          <h3 className="text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Completed</h3>
          <p className="text-2xl font-bold" style={{color: '#FFFFFF'}}>{appointments.filter(a => a.status === 'Completed').length}</p>
          <p className="text-sm" style={{color: '#7ce0c3'}}>Finished visits</p>
        </div>
        <div className="p-6 rounded-lg border" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
          <h3 className="text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Today's Appointments</h3>
          <p className="text-2xl font-bold" style={{color: '#FFFFFF'}}>{filteredAppointments.length}</p>
          <p className="text-sm" style={{color: '#A6AAB2'}}>For selected date</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" style={{color: '#A6AAB2'}} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setShowAllAppointments(false);
            }}
            disabled={showAllAppointments}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF', opacity: showAllAppointments ? 0.5 : 1}}
          />
        </div>
         <button 
          onClick={() => {
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setShowAllAppointments(false);
          }}
          className="flex items-center px-4 py-2 rounded-lg transition-colors" 
          style={{
            backgroundColor: '#040C1D', 
            color: '#FFFFFF', 
            borderColor: 'hsl(var(--border))', 
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
          Today
        </button>
        <button 
          onClick={() => setShowAllAppointments(!showAllAppointments)}
          className="flex items-center px-4 py-2 rounded-lg transition-colors" 
          style={{
            backgroundColor: showAllAppointments ? '#3A8DFF' : '#040C1D', 
            color: '#FFFFFF', 
            borderColor: 'hsl(var(--border))', 
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
          <Filter className="w-4 h-4 mr-2" />
          {showAllAppointments ? 'Showing All' : 'Show All'}
        </button>
        <button 
          onClick={() => setShowNewAppointmentModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </button>
      </div>

      {/* Appointments List */}
      <div className="rounded-lg border overflow-hidden" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
        <div className="px-6 py-4 border-b" style={{borderColor: 'hsl(var(--border))'}}>
          <h2 className="text-lg font-semibold" style={{color: '#FFFFFF'}}>{selectedDate ? `Appointments for ${selectedDate}` : 'All Appointments'}</h2>
        </div>
        <div className="divide-y" style={{borderColor: 'hsl(var(--border))'}}>
          {filteredAppointments.length === 0 ? (
            <div className="p-6 text-center" style={{color: '#A6AAB2'}}>
              {selectedDate ? `No appointments scheduled for ${selectedDate}` : 'No appointments found.'}
            </div>
          ) : (
            filteredAppointments.map((appointment, index) => (
            <div key={`appointment-${appointment.id}-${index}`} className="p-6 transition-colors" style={{'&:hover': {backgroundColor: '#040C1D'}}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" style={{color: '#A6AAB2'}} />
                    <span className="font-medium" style={{color: '#FFFFFF'}}>{appointment.time}</span>
                  </div>
                  <div>
                    <h3 className="font-medium" style={{color: '#FFFFFF'}}>{appointment.patient}</h3>
                    <p className="text-sm" style={{color: '#A6AAB2'}}>{appointment.doctor} • {appointment.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  <button 
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowEditModal(true);
                    }}
                    className="text-sm font-medium hover:underline" 
                    style={{color: '#3A8DFF'}}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteAppointment(appointment.id)}
                    className="text-sm font-medium hover:underline" 
                    style={{color: '#ff9a9a'}}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-8 max-w-2xl w-full mx-4" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))', border: '1px solid'}}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold" style={{color: '#FFFFFF'}}>New Appointment</h3>
              <button onClick={() => setShowNewAppointmentModal(false)}>
                <X className="w-5 h-5" style={{color: '#A6AAB2'}} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Patient</label>
                <input
                  type="text"
                  placeholder="Search by name, phone, age, or emergency contact"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setShowPatientDropdown(true);
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                />
                {showPatientDropdown && filteredPatients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-48 overflow-y-auto" style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))'}}>
                    {filteredPatients.map((patient, index) => (
                      <div
                        key={`${patient.id}-${index}`}
                        onClick={() => selectPatient(patient)}
                        className="p-3 cursor-pointer hover:bg-opacity-80 border-b" 
                        style={{borderColor: 'hsl(var(--border))'}} 
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#081226'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        {/* Display patient details from the nested user object */}
                        <div style={{color: '#FFFFFF'}} className="font-medium">
                          {patient.user.first_name} {patient.user.last_name}
                        </div>
                        <div style={{color: '#A6AAB2'}} className="text-sm">
                          Phone: {patient.user.phone_number} • Age: {patient.age} • Emergency: {patient.emergency_contact_name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Doctor</label>
                <select
                  value={newAppointment.doctorId}
                  onChange={(e) => setNewAppointment({...newAppointment, doctorId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                  required
                >
                  <option value="">Select a Doctor</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.first_name} {doc.last_name} {doc.specialization ? `(${doc.specialization})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Date</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Time</label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Reason</label>
                  <select
                    value={newAppointment.reason}
                    onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Lab Work">Lab Work</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Duration (minutes)</label>
                  <input
                    type="number"
                    value={newAppointment.duration_minutes}
                    onChange={(e) => setNewAppointment({...newAppointment, duration_minutes: parseInt(e.target.value, 10)})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Notes</label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                  placeholder="Add any relevant notes for the appointment"
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_follow_up"
                  checked={newAppointment.is_follow_up}
                  onChange={(e) => setNewAppointment({...newAppointment, is_follow_up: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))'}}
                />
                <label htmlFor="is_follow_up" className="ml-2 block text-sm" style={{color: '#A6AAB2'}}>Is this a follow-up visit?</label>
              </div>

            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={createAppointment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Appointment
              </button>
              <button
                onClick={() => {
                  setShowNewAppointmentModal(false);
                  setPatientSearch('');
                  setShowPatientDropdown(false);
                  setNewAppointment({
                    patientId: '',
                    doctorId: '',
                    date: '',
                    time: '',
                    reason: 'Consultation',
                    duration_minutes: 30,
                    notes: '',
                    is_follow_up: false,
                  });
                }}
                className="px-4 py-2 border rounded-lg transition-colors"
                style={{borderColor: 'hsl(var(--border))', color: '#A6AAB2'}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-8 max-w-2xl w-full mx-4" style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))', border: '1px solid'}}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold" style={{color: '#FFFFFF'}}>Edit Appointment</h3>
              <button onClick={() => {
                setShowEditModal(false);
                setSelectedAppointment(null);
              }}>
                <X className="w-5 h-5" style={{color: '#A6AAB2'}} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Patient</label>
                <input
                  type="text"
                  value={selectedAppointment.patient}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#A6AAB2', opacity: 0.7}}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Date</label>
                  <input
                    type="date"
                    value={selectedAppointment.date}
                    onChange={(e) => setSelectedAppointment({...selectedAppointment, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Time</label>
                  <input
                    type="time"
                    value={selectedAppointment.time}
                    onChange={(e) => setSelectedAppointment({...selectedAppointment, time: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{color: '#A6AAB2'}}>Status</label>
                <select
                  value={selectedAppointment.status.toLowerCase()}
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, status: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  const appointmentDateTime = `${selectedAppointment.date}T${selectedAppointment.time}:00`;
                  updateAppointment(selectedAppointment.id, {
                    appointment_date: appointmentDateTime,
                    status: selectedAppointment.status.toLowerCase()
                  });
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 border rounded-lg transition-colors"
                style={{borderColor: 'hsl(var(--border))', color: '#A6AAB2'}}
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

export default Appointments;
