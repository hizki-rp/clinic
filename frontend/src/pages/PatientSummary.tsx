'use client';

import { usePatientQueue } from '@/context/PatientQueueContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Printer, History, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Patient } from '@/context/PatientQueueContext';
import { API_BASE_URL } from '@/lib/constants';

interface Visit {
  id: number;
  check_in_time: string;
  discharge_time: string | null;
  stage: string;
  chief_complaint: string;
  vital_signs: any;
  triage_notes: string;
  questioning_findings: string;
  lab_findings: string;
  diagnosis: string;
  treatment_plan: string;
  final_findings: string;
  lab_tests: any[];
  prescription: any;
}

const PatientSummaryPage = () => {
  const { userId } = useParams();
  const { getPatientById } = usePatientQueue();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [previousVisits, setPreviousVisits] = useState<Visit[]>([]);
  const [showVisitHistory, setShowVisitHistory] = useState(false);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      const foundPatient = getPatientById(userId as string);
      if (foundPatient) {
        setPatient(foundPatient);
      }
    }
  }, [userId, getPatientById]);

  // Fetch previous visits when component mounts
  useEffect(() => {
    const fetchPreviousVisits = async () => {
      if (!userId) return;
      
      setLoadingVisits(true);
      try {
        const token = localStorage.getItem('access_token');
        
        // First, get the patient data to find the actual patient ID
        const patientResponse = await fetch(`${API_BASE_URL}/healthcare/patients/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (patientResponse.ok) {
          const patients = await patientResponse.json();
          const currentPatient = patients.find((p: any) => p.patient_id === userId);
          
          if (currentPatient) {
            // Fetch visits for this patient
            const visitsResponse = await fetch(`${API_BASE_URL}/healthcare/patients/${currentPatient.id}/visits/`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (visitsResponse.ok) {
              const visits = await visitsResponse.json();
              // Sort by check-in time, most recent first
              const sortedVisits = visits.sort((a: Visit, b: Visit) => 
                new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime()
              );
              setPreviousVisits(sortedVisits);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching previous visits:', error);
      } finally {
        setLoadingVisits(false);
      }
    };

    fetchPreviousVisits();
  }, [userId]);

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

          {/* Triage Assessment Section */}
          <section className="mt-8">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Triage Assessment</h3>
            {patient.vitalSigns ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Vital Signs</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {(() => {
                    let vitalSignsData: any = {};
                    if (typeof patient.vitalSigns === 'string') {
                      try {
                        vitalSignsData = JSON.parse(patient.vitalSigns);
                      } catch {
                        vitalSignsData = {};
                      }
                    } else {
                      vitalSignsData = patient.vitalSigns;
                    }
                    
                    return (
                      <>
                        {vitalSignsData.height && (
                          <div>
                            <span className="font-medium text-blue-700 dark:text-blue-300">Height:</span>
                            <span className="ml-2">{vitalSignsData.height} cm</span>
                          </div>
                        )}
                        {vitalSignsData.weight && (
                          <div>
                            <span className="font-medium text-blue-700 dark:text-blue-300">Weight:</span>
                            <span className="ml-2">{vitalSignsData.weight} kg</span>
                          </div>
                        )}
                        {vitalSignsData.bloodPressure && (
                          <div>
                            <span className="font-medium text-blue-700 dark:text-blue-300">Blood Pressure:</span>
                            <span className="ml-2">{vitalSignsData.bloodPressure} mmHg</span>
                          </div>
                        )}
                        {vitalSignsData.temperature && (
                          <div>
                            <span className="font-medium text-blue-700 dark:text-blue-300">Temperature:</span>
                            <span className="ml-2">{vitalSignsData.temperature}°C</span>
                          </div>
                        )}
                        {vitalSignsData.pulse && (
                          <div>
                            <span className="font-medium text-blue-700 dark:text-blue-300">Pulse:</span>
                            <span className="ml-2">{vitalSignsData.pulse} bpm</span>
                          </div>
                        )}
                        {vitalSignsData.respiratoryRate && (
                          <div>
                            <span className="font-medium text-blue-700 dark:text-blue-300">Respiratory Rate:</span>
                            <span className="ml-2">{vitalSignsData.respiratoryRate}/min</span>
                          </div>
                        )}
                        {vitalSignsData.oxygenSaturation && (
                          <div>
                            <span className="font-medium text-blue-700 dark:text-blue-300">Oxygen Saturation:</span>
                            <span className="ml-2">{vitalSignsData.oxygenSaturation}%</span>
                          </div>
                        )}
                        {vitalSignsData.bmi && (
                          <div>
                            <span className="font-medium text-blue-700 dark:text-blue-300">BMI:</span>
                            <span className="ml-2">{vitalSignsData.bmi}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                {patient.triageNotes && (
                  <div className="mt-4">
                    <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Triage Notes:</h5>
                    <p className="text-sm bg-white dark:bg-gray-800 rounded p-3 border">{patient.triageNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">No triage assessment data available.</p>
              </div>
            )}
          </section>

          {/* Questioning Findings Section */}
          {patient.questioningFindings && (
            <section className="mt-8">
              <h3 className="text-xl font-semibold mb-4 border-b pb-2">Doctor's Examination Findings</h3>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p className="text-sm whitespace-pre-wrap">{patient.questioningFindings}</p>
              </div>
            </section>
          )}

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

          {/* Previous Visits Section */}
          {previousVisits.length > 1 && (
            <section className="mt-8 print:hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold border-b pb-2 flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Previous Visits ({previousVisits.length - 1})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVisitHistory(!showVisitHistory)}
                >
                  {showVisitHistory ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide History
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show History
                    </>
                  )}
                </Button>
              </div>

              {showVisitHistory && (
                <div className="space-y-4">
                  {previousVisits.slice(1).map((visit, index) => (
                    <Card key={visit.id} className="bg-muted/30">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>Visit #{previousVisits.length - index - 1}</span>
                          <div className="flex gap-2">
                            <Badge variant={visit.stage === 'discharged' ? 'default' : 'secondary'}>
                              {visit.stage.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground font-normal">
                              {new Date(visit.check_in_time).toLocaleDateString()}
                            </span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Chief Complaint */}
                        {visit.chief_complaint && (
                          <div>
                            <h5 className="font-semibold text-sm text-muted-foreground mb-1">Chief Complaint</h5>
                            <p className="text-sm">{visit.chief_complaint}</p>
                          </div>
                        )}

                        {/* Vital Signs */}
                        {visit.vital_signs && Object.keys(visit.vital_signs).length > 0 && (
                          <div>
                            <h5 className="font-semibold text-sm text-muted-foreground mb-2">Vital Signs</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                              {visit.vital_signs.height && (
                                <div><span className="font-medium">Height:</span> {visit.vital_signs.height} cm</div>
                              )}
                              {visit.vital_signs.weight && (
                                <div><span className="font-medium">Weight:</span> {visit.vital_signs.weight} kg</div>
                              )}
                              {visit.vital_signs.bloodPressure && (
                                <div><span className="font-medium">BP:</span> {visit.vital_signs.bloodPressure}</div>
                              )}
                              {visit.vital_signs.temperature && (
                                <div><span className="font-medium">Temp:</span> {visit.vital_signs.temperature}°C</div>
                              )}
                              {visit.vital_signs.pulse && (
                                <div><span className="font-medium">Pulse:</span> {visit.vital_signs.pulse} bpm</div>
                              )}
                              {visit.vital_signs.respiratoryRate && (
                                <div><span className="font-medium">Resp:</span> {visit.vital_signs.respiratoryRate}/min</div>
                              )}
                              {visit.vital_signs.oxygenSaturation && (
                                <div><span className="font-medium">SpO2:</span> {visit.vital_signs.oxygenSaturation}%</div>
                              )}
                              {visit.vital_signs.bmi && (
                                <div><span className="font-medium">BMI:</span> {visit.vital_signs.bmi}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Triage Notes */}
                        {visit.triage_notes && (
                          <div>
                            <h5 className="font-semibold text-sm text-muted-foreground mb-1">Triage Notes</h5>
                            <p className="text-sm bg-background rounded p-2">{visit.triage_notes}</p>
                          </div>
                        )}

                        {/* Doctor's Findings */}
                        {visit.questioning_findings && (
                          <div>
                            <h5 className="font-semibold text-sm text-muted-foreground mb-1">Examination Findings</h5>
                            <p className="text-sm bg-background rounded p-2 whitespace-pre-wrap">{visit.questioning_findings}</p>
                          </div>
                        )}

                        {/* Lab Tests */}
                        {visit.lab_tests && visit.lab_tests.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-sm text-muted-foreground mb-1">Laboratory Tests</h5>
                            <div className="space-y-2">
                              {visit.lab_tests.map((test: any) => (
                                <div key={test.id} className="text-sm bg-background rounded p-2">
                                  <div className="flex justify-between items-start">
                                    <span className="font-medium">{test.test_name}</span>
                                    <Badge variant={test.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                      {test.status}
                                    </Badge>
                                  </div>
                                  {test.results && (
                                    <p className="text-xs text-muted-foreground mt-1">{test.results}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Lab Findings */}
                        {visit.lab_findings && (
                          <div>
                            <h5 className="font-semibold text-sm text-muted-foreground mb-1">Lab Findings</h5>
                            <p className="text-sm bg-background rounded p-2 whitespace-pre-wrap">{visit.lab_findings}</p>
                          </div>
                        )}

                        {/* Diagnosis */}
                        {visit.diagnosis && (
                          <div>
                            <h5 className="font-semibold text-sm text-muted-foreground mb-1">Diagnosis</h5>
                            <p className="text-sm bg-green-50 dark:bg-green-900/20 rounded p-2 whitespace-pre-wrap">{visit.diagnosis}</p>
                          </div>
                        )}

                        {/* Treatment Plan */}
                        {visit.treatment_plan && (
                          <div>
                            <h5 className="font-semibold text-sm text-muted-foreground mb-1">Treatment Plan</h5>
                            <p className="text-sm bg-background rounded p-2 whitespace-pre-wrap">{visit.treatment_plan}</p>
                          </div>
                        )}

                        {/* Prescription */}
                        {visit.prescription && visit.prescription.medications && visit.prescription.medications.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-sm text-muted-foreground mb-1">Prescription</h5>
                            <div className="bg-background rounded p-2 space-y-1">
                              {visit.prescription.medications.map((med: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  <span className="font-medium">{med.name}</span> - {med.dose}, {med.frequency}, {med.duration}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Discharge Info */}
                        {visit.discharge_time && (
                          <div className="text-xs text-muted-foreground pt-2 border-t">
                            Discharged: {new Date(visit.discharge_time).toLocaleString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {loadingVisits && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Loading visit history...</p>
                </div>
              )}
            </section>
          )}
          
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