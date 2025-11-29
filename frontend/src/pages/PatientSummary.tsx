'use client';

import { usePatientQueue } from '@/context/PatientQueueContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Patient } from '@/context/PatientQueueContext';

const PatientSummaryPage = () => {
  const { userId } = useParams();
  const { getPatientById } = usePatientQueue();
  const [patient, setPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      const foundPatient = getPatientById(userId as string);
      if (foundPatient) {
        setPatient(foundPatient);
      }
    }
  }, [userId, getPatientById]);

  if (!patient) {
    // Wait for client-side hydration to find the patient
    if (typeof window !== 'undefined' && !getPatientById(userId as string)) {
        navigate('/404');
        return null;
    }
    return <div className="flex justify-center items-center h-screen"><p>Loading patient data...</p></div>;
  }
  
  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 print:p-2">
        <div className="bg-card shadow-lg rounded-lg p-8 print:shadow-none print:border print:border-gray-300">
          
          <header className="flex justify-between items-start pb-6 border-b-2 border-gray-200 print:border-gray-400">
            <div>
              <h1 className="text-3xl font-bold text-primary">Menaharia Medium Clinic</h1>
              <p className="text-muted-foreground">123 Health St, Wellness City</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold">Patient Discharge Summary</h2>
              <p className="text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </header>

          <section className="mt-8">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Patient Information</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patient ID</p>
                <p className="font-medium">{patient.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{patient.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{patient.phone || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{patient.address || 'N/A'}</p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Visit Details</h3>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-primary">Laboratory Test Results</h4>
                    <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                        <h5 className="font-medium">Requested Tests:</h5>
                        <ul className="list-disc list-inside pl-2 text-sm mb-2">
                            {patient.requestedLabTests?.length ? patient.requestedLabTests.map(test => <li key={test}>{test}</li>) : <li>No tests requested.</li>}
                        </ul>
                        <h5 className="font-medium mt-3">Results Summary:</h5>
                        <p className="text-sm whitespace-pre-wrap">{patient.labResults || 'No results available.'}</p>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-primary">Doctor's Diagnosis</h4>
                     <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{patient.diagnosis || 'No diagnosis recorded.'}</p>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-primary">Prescription</h4>
                     <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{patient.prescription || 'No prescription provided.'}</p>
                    </div>
                </div>
            </div>
          </section>
          
          <footer className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 text-center text-xs text-muted-foreground print:hidden">
            <Button onClick={handlePrint} className="w-full sm:w-auto">
              <Printer className="mr-2 h-4 w-4" />
              Print Summary
            </Button>
             <Button onClick={() => navigate(`/patients/${patient.id}/prescription`)} className="w-full sm:w-auto" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View Full Prescription
            </Button>
            <p className="mt-4 sm:mt-0">Thank you for choosing Menaharia Medium Clinic.</p>
          </footer>
        </div>
      </div>

       <style>{`
        @media print {
          body {
            background-color: #fff;
          }
          .print-p-2 {
            padding: 0.5rem !important;
          }
          .print\:hidden {
            display: none;
          }
          .print\:shadow-none {
            box-shadow: none;
          }
           .print\:border {
             border-width: 1px;
           }
           .print\:border-gray-300 {
             border-color: #d1d5db;
           }
           .print\:border-gray-400 {
             border-color: #9ca3af;
           }
        }
      `}</style>
    </div>
  );
};

export default PatientSummaryPage;