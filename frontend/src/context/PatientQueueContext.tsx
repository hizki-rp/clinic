import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { healthcareApi } from '@/lib/api';

export type QueueStage = 'Waiting Room' | 'Triage' | 'Questioning' | 'Laboratory Test' | 'Results by Doctor' | 'Discharged';
export type PatientPriority = 'Standard' | 'Urgent';

export interface Patient {
  id: string;
  name: string;
  stage: QueueStage;
  checkInTime: Date;
  email?: string;
  phone?: string;
  address?: string;
  age?: number;
  sex?: string;
  priority: PatientPriority;

  requestedLabTests?: string[];
  labResults?: string;
  diagnosis?: string;
  prescription?: string;
}

interface PatientDataUpdate {
  requestedLabTests?: string[];
  labResults?: string;
  diagnosis?: string;
  prescription?: string;
}

interface PatientQueueContextType {
  patients: Patient[];
  allPatients: Patient[];
  loading: boolean;
  error: string | null;
  addPatient: (patientData: { 
    name: string, 
    email?: string, 
    phone?: string, 
    address?: string, 
    age?: number, 
    sex?: string, 
    priority: PatientPriority 
  }) => Promise<void>;
  movePatient: (patientId: string, nextStage: QueueStage, data?: PatientDataUpdate) => Promise<void>;
  reAdmitPatient: (patientId: string) => Promise<void>;
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  getPatientById: (patientId: string) => Patient | undefined;
  refreshQueue: () => Promise<void>;
}

const PatientQueueContext = createContext<PatientQueueContextType | undefined>(undefined);

// Convert backend stage names to frontend stage names
const stageMapping: Record<string, QueueStage> = {
  'waiting_room': 'Waiting Room',
  'triage': 'Triage',
  'questioning': 'Questioning',
  'laboratory_test': 'Laboratory Test',
  'results_by_doctor': 'Results by Doctor',
  'discharged': 'Discharged',
};

// Convert frontend stage names to backend stage names
const reverseStageMapping: Record<QueueStage, string> = {
  'Waiting Room': 'waiting_room',
  'Triage': 'triage',
  'Questioning': 'questioning',
  'Laboratory Test': 'laboratory_test',
  'Results by Doctor': 'results_by_doctor',
  'Discharged': 'discharged',
};

// Transform backend patient data to frontend format
const transformPatientData = (backendPatient: any): Patient => {
  return {
    id: backendPatient.id,
    name: backendPatient.name,
    stage: stageMapping[backendPatient.stage] || 'Waiting Room',
    checkInTime: new Date(backendPatient.checkInTime),
    email: backendPatient.email,
    phone: backendPatient.phone,
    address: backendPatient.address,
    age: backendPatient.age,
    sex: backendPatient.sex,
    priority: backendPatient.priority === 'urgent' ? 'Urgent' : 'Standard',
    requestedLabTests: backendPatient.requestedLabTests,
    labResults: backendPatient.labResults,
    diagnosis: backendPatient.diagnosis,
    prescription: backendPatient.prescription,
  };
};

export const PatientQueueProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load queue data from backend
  const refreshQueue = async (silent = false) => {
    try {
      // Only show loading spinner on initial load, not on auto-refresh
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      // Get current queue (active patients)
      const queueData = await healthcareApi.visits.getQueue();
      const transformedQueue = queueData.map(transformPatientData);
      setPatients(transformedQueue);

      // Get all patients (including discharged)
      const allPatientsData = await healthcareApi.visits.getAllPatients();
      const transformedAllPatients = allPatientsData.map(transformPatientData);
      setAllPatients(transformedAllPatients);

    } catch (err) {
      console.error('Failed to load queue data:', err);
      // Only show error on initial load, silently fail on auto-refresh
      if (!silent) {
        setError('Failed to load patient data');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Load data on mount
  useEffect(() => {
    refreshQueue();
  }, []);

  // Auto-refresh queue every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshQueue(true); // Silent refresh - no loading spinner
    }, 10000); // 10 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const addPatient = async (patientData: { 
    name: string, 
    email?: string, 
    phone?: string, 
    address?: string,
    age?: number,
    sex?: string,
    priority: PatientPriority
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Split name into first and last name
      const nameParts = patientData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Create patient in backend
      const patientPayload = {
        first_name: firstName,
        last_name: lastName,
        email: patientData.email || '',
        age: patientData.age,
        gender: patientData.sex?.toLowerCase(),
        phone: patientData.phone,
        address: patientData.address,
        priority: patientData.priority.toLowerCase(),
      };
      
      const newPatient = await healthcareApi.patients.create(patientPayload);
      
      // Create a visit for the patient
      const visitPayload = {
        patient_id: newPatient.patient_id,
        chief_complaint: 'General consultation',
      };
      
      await healthcareApi.visits.create(visitPayload);
      
      // Refresh the queue
      await refreshQueue();
      
    } catch (err) {
      console.error('Failed to add patient:', err);
      setError('Failed to add patient');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const movePatient = async (patientId: string, nextStage: QueueStage, data?: PatientDataUpdate) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find the visit ID for this patient
      const patient = patients.find(p => p.id === patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }
      
      // Get all visits to find the current visit
      const allVisitsData = await healthcareApi.visits.list();
      const currentVisit = allVisitsData.find(visit => 
        visit.patient.patient_id === patientId && 
        visit.stage !== 'discharged'
      );
      
      if (!currentVisit) {
        throw new Error('Active visit not found for patient');
      }
      
      // Prepare the stage update payload
      const stageUpdatePayload: any = {
        stage: reverseStageMapping[nextStage],
        ...data,
      };
      
      // Move patient to new stage
      await healthcareApi.visits.moveToStage(currentVisit.id, stageUpdatePayload);
      
      // Refresh the queue
      await refreshQueue();
      
    } catch (err) {
      console.error('Failed to move patient:', err);
      setError('Failed to move patient');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reAdmitPatient = async (patientId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a new visit for the patient
      const visitPayload = {
        patient_id: patientId,
        chief_complaint: 'Follow-up visit',
      };
      
      await healthcareApi.visits.create(visitPayload);
      
      // Refresh the queue
      await refreshQueue();
      
    } catch (err) {
      console.error('Failed to re-admit patient:', err);
      setError('Failed to re-admit patient');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPatientById = (patientId: string): Patient | undefined => {
    return allPatients.find(p => p.id === patientId);
  };

  return (
    <PatientQueueContext.Provider value={{ 
      patients, 
      allPatients, 
      loading, 
      error, 
      addPatient, 
      movePatient, 
      setPatients, 
      getPatientById, 
      reAdmitPatient, 
      refreshQueue 
    }}>
      {children}
    </PatientQueueContext.Provider>
  );
};

export const usePatientQueue = () => {
  const context = useContext(PatientQueueContext);
  if (context === undefined) {
    throw new Error('usePatientQueue must be used within a PatientQueueProvider');
  }
  return context;
};