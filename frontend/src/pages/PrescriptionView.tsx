import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Download, FileText, User, Calendar, CreditCard, Stethoscope } from 'lucide-react';
import { usePatientQueue } from '@/context/PatientQueueContext';
import { useToast } from '@/hooks/use-toast';

interface PrescriptionData {
  id: string;
  prescription_number: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  instructions: string;
  notes: string;
  prescribed_by: {
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  valid_until: string;
  printed_at?: string;
  printed_by?: {
    first_name: string;
    last_name: string;
  };
}

interface PatientData {
  id: string;
  name: string;
  patient_id: string;
  card_number?: string;
  age?: number;
  gender?: string;
  phone?: string;
  address?: string;
}

export default function PrescriptionView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getPatientById } = usePatientQueue();
  
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      // Get patient data
      const patientData = getPatientById(patientId);
      if (patientData) {
        setPatient({
          id: patientData.id,
          name: patientData.name,
          patient_id: patientData.id,
          card_number: undefined, // Will be fetched from backend
          age: patientData.age,
          gender: patientData.sex,
          phone: patientData.phone,
          address: patientData.address,
        });

        // Mock prescription data for now - in real implementation, fetch from API
        setPrescription({
          id: '1',
          prescription_number: 'RX-001',
          medications: [
            {
              name: 'Amoxicillin',
              dosage: '500mg',
              frequency: '3 times daily',
              duration: '7 days',
              instructions: 'Take with food'
            },
            {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'As needed',
              duration: 'For pain relief',
              instructions: 'Do not exceed 8 tablets in 24 hours'
            }
          ],
          instructions: 'Complete the full course of antibiotics even if symptoms improve. Return if symptoms worsen or do not improve after 3 days.',
          notes: 'Follow-up appointment recommended in 1 week.',
          prescribed_by: {
            first_name: 'Dr. John',
            last_name: 'Smith',
            email: 'dr.smith@clinic.com'
          },
          created_at: new Date().toISOString(),
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        });
      }
      setLoading(false);
    }
  }, [patientId, getPatientById]);

  const handlePrint = () => {
    window.print();
    toast({
      title: "Prescription Printed",
      description: "The prescription has been sent to the printer.",
    });
  };

  const handleDownload = () => {
    // In a real implementation, this would generate and download a PDF
    toast({
      title: "Download Started",
      description: "The prescription PDF is being generated.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading prescription...</div>
      </div>
    );
  }

  if (!patient || !prescription) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-4">Prescription Not Found</h2>
          <Button onClick={() => navigate('/queue')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => navigate('/queue')} 
            variant="outline"
            className="text-white border-slate-600 hover:bg-slate-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queue
          </Button>
          
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="mr-2 h-4 w-4" />
              Print Prescription
            </Button>
          </div>
        </div>

        {/* Prescription Card */}
        <Card className="bg-white shadow-lg print:shadow-none">
          <CardHeader className="border-b bg-slate-50 print:bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">Medical Prescription</CardTitle>
                  <p className="text-slate-600">Clinic Management System</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-lg px-3 py-1 font-mono">
                  {prescription.prescription_number}
                </Badge>
                <p className="text-sm text-slate-600 mt-1">
                  {new Date(prescription.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Name:</span>
                    <span className="text-slate-900">{patient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Patient ID:</span>
                    <span className="text-slate-900">{patient.patient_id}</span>
                  </div>
                  {patient.card_number && (
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-600">Card Number:</span>
                      <span className="text-slate-900">{patient.card_number}</span>
                    </div>
                  )}
                  {patient.age && (
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-600">Age:</span>
                      <span className="text-slate-900">{patient.age} years</span>
                    </div>
                  )}
                  {patient.gender && (
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-600">Gender:</span>
                      <span className="text-slate-900">{patient.gender}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Prescribing Doctor
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Doctor:</span>
                    <span className="text-slate-900">
                      {prescription.prescribed_by.first_name} {prescription.prescribed_by.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Date:</span>
                    <span className="text-slate-900">
                      {new Date(prescription.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Valid Until:</span>
                    <span className="text-slate-900">
                      {new Date(prescription.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Prescribed Medications
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 font-medium text-slate-700">Medication</th>
                      <th className="text-left p-4 font-medium text-slate-700">Dosage</th>
                      <th className="text-left p-4 font-medium text-slate-700">Frequency</th>
                      <th className="text-left p-4 font-medium text-slate-700">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.medications.map((med, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-slate-900">{med.name}</div>
                            {med.instructions && (
                              <div className="text-sm text-slate-600 mt-1">{med.instructions}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-900">{med.dosage}</td>
                        <td className="p-4 text-slate-900">{med.frequency}</td>
                        <td className="p-4 text-slate-900">{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instructions */}
            {prescription.instructions && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Treatment Instructions</h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-slate-700 whitespace-pre-wrap">{prescription.instructions}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {prescription.notes && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Additional Notes</h3>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-slate-700 whitespace-pre-wrap">{prescription.notes}</p>
                </div>
              </div>
            )}

            {/* Print Information */}
            {prescription.printed_at && (
              <div className="border-t pt-4 text-sm text-slate-600">
                <p>
                  Printed on {new Date(prescription.printed_at).toLocaleString()}
                  {prescription.printed_by && (
                    <span> by {prescription.printed_by.first_name} {prescription.printed_by.last_name}</span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}