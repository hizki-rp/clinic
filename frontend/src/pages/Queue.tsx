'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import '../styles/queue-enhancements.css';
import { ArrowRight, User, Stethoscope, Beaker, ClipboardPlus, Printer, Plus, UserCheck, TestTube, LogOut, FileText, AlertTriangle, CheckCircle2, Clock, Phone, MapPin, Calendar, Activity, Zap, Timer, Home, FlaskConical } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { usePatientQueue, type Patient, type QueueStage } from '@/context/PatientQueueContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';

const STAGES: QueueStage[] = ['Waiting Room', 'Triage', 'Questioning', 'Laboratory Test', 'Results by Doctor'];

// Role-based stage filtering - Clean and simple
const getRelevantStages = (userRole: string): QueueStage[] => {
  switch(userRole) {
    case 'reception':
      return ['Waiting Room']; // Reception only sees waiting room
    case 'staff': // Triage/Nurse role
      return ['Triage']; // Nurses only see triage
    case 'doctor':
      return ['Questioning', 'Results by Doctor']; // Doctors see questioning and discharge
    case 'laboratory':
      return ['Laboratory Test']; // Lab only sees lab tests
    case 'admin':
      return STAGES; // Admin sees all for management
    default:
      return [];
  }
};
const AVAILABLE_LAB_TESTS = ["Complete Blood Count (CBC)", "Urinalysis", "Blood Glucose", "Lipid Panel", "Liver Function Test"];

type Role = 'Receptionist' | 'Doctor' | 'Laboratorian';

const PatientCard = ({ patient }: { patient: Patient }) => {
  const { movePatient } = usePatientQueue();
  const { user } = useAuth();
  const role = user?.role || '';
  const [isQuestioningModalOpen, setQuestioningModalOpen] = useState(false);
  const [isLabModalOpen, setLabModalOpen] = useState(false);
  const [isDoctorModalOpen, setDoctorModalOpen] = useState(false);

  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [labResults, setLabResults] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const navigate = useNavigate();

  const handleTestAction = () => {
    switch (patient.stage) {
      case 'Waiting Room':
        if(role === 'reception') movePatient(patient.id, 'Triage');
        break;
      case 'Triage':
        if(role === 'staff') setQuestioningModalOpen(true); // Nurse completes triage
        break;
      case 'Questioning':
        if(role === 'doctor') setQuestioningModalOpen(true);
        break;
      case 'Laboratory Test':
        if(role === 'laboratory') setLabModalOpen(true);
        break;
      case 'Results by Doctor':
        if(role === 'doctor') setDoctorModalOpen(true);
        break;
    }
  };

  const handleSendToLab = () => {
    movePatient(patient.id, 'Laboratory Test', { requestedLabTests: selectedTests });
    setQuestioningModalOpen(false);
    setSelectedTests([]);
  }

  const handleAddLabResults = () => {
    movePatient(patient.id, 'Results by Doctor', { labResults });
    setLabModalOpen(false);
    setLabResults('');
  }

  const handleDischarge = () => {
    movePatient(patient.id, 'Discharged', { diagnosis, prescription });
    setDoctorModalOpen(false);
    navigate(`/patients/${patient.id}/prescription`);
  }
  
  const handlePrint = () => {
    navigate(`/patients/${patient.id}/summary`);
  }

  const getActionButton = () => {
    let text = '';
    let icon: React.ReactNode = <ArrowRight className="ml-2 h-4 w-4" />;
    let isVisible = false;
    let variant: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link" = "default";

    switch (patient.stage) {
      case 'Waiting Room':
        text = 'Move to Triage';
        icon = <UserCheck className="mr-2 h-4 w-4" />
        isVisible = role === 'reception';
        variant = "default";
        break;
      case 'Triage':
        text = 'Complete Triage';
        icon = <Activity className="mr-2 h-4 w-4" />;
        isVisible = role === 'staff'; // Nurse
        variant = "default";
        break;
      case 'Questioning':
        text = 'Assign Lab Tests';
        icon = <Stethoscope className="mr-2 h-4 w-4" />;
        isVisible = role === 'doctor';
        variant = "default";
        break;
      case 'Laboratory Test':
        text = 'Add Lab Results';
        icon = <TestTube className="mr-2 h-4 w-4" />;
        isVisible = role === 'laboratory';
        variant = "default";
        break;
      case 'Results by Doctor':
        text = 'Diagnose & Discharge';
        icon = <LogOut className="mr-2 h-4 w-4" />;
        isVisible = role === 'doctor';
        variant = "default";
        break;
    }

    if (!isVisible) return null;

    return (
        <Button 
          size="sm" 
          variant={variant} 
          onClick={handleTestAction} 
          className="w-full mt-4 transition-all duration-200 hover:scale-105 shadow-sm"
        >
            {icon} {text}
        </Button>
    )
  };

  const getWaitingTime = () => {
    const now = new Date();
    const checkIn = new Date(patient.checkInTime);
    const diffMs = now.getTime() - checkIn.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      "bg-gradient-to-br from-card to-card/80 backdrop-blur-sm",
      "border-l-4 border-r border-t border-b",
      patient.priority === 'Urgent' 
        ? 'border-l-red-500 shadow-red-100 dark:shadow-red-900/20' 
        : 'border-l-blue-500 shadow-blue-100 dark:shadow-blue-900/20'
    )}>
      <CardContent className="p-4 space-y-4">
        {/* Header with name and priority */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground truncate">{patient.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                ID: {patient.id}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{getWaitingTime()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {patient.priority === 'Urgent' ? (
              <Badge variant="destructive" className="flex items-center gap-1 text-xs font-bold">
                <AlertTriangle className="h-3 w-3" />
                URGENT
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                Standard
              </Badge>
            )}
          </div>
        </div>

        {/* Patient details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Checked in: {new Date(patient.checkInTime).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
          
          {patient.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{patient.phone}</span>
            </div>
          )}
          
          {patient.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{patient.address}</span>
            </div>
          )}

          {patient.age && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 flex-shrink-0" />
              <span>{patient.age} years old • {patient.sex || 'Not specified'}</span>
            </div>
          )}
        </div>

        {/* Lab tests and results */}
        {patient.requestedLabTests && patient.requestedLabTests.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TestTube className="h-4 w-4" />
              <span>Lab Tests</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {patient.requestedLabTests.map((test, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {test}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {patient.labResults && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
              <Activity className="h-4 w-4" />
              <span>Lab Results Available</span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 line-clamp-2">
              {patient.labResults}
            </p>
          </div>
        )}

        {/* Action button */}
        {getActionButton()}
        
        {/* Modals */}
        <AlertDialog open={isQuestioningModalOpen} onOpenChange={setQuestioningModalOpen}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Assign Lab Tests
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Select the required laboratory tests for {patient.name}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4 max-h-60 overflow-y-auto">
                    {AVAILABLE_LAB_TESTS.map(test => (
                        <div key={test} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                            <Checkbox 
                                id={`test-${patient.id}-${test}`}
                                onCheckedChange={(checked) => {
                                    setSelectedTests(prev => checked ? [...prev, test] : prev.filter(t => t !== test))
                                }}
                            />
                            <label 
                              htmlFor={`test-${patient.id}-${test}`} 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                                {test}
                            </label>
                        </div>
                    ))}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleSendToLab} 
                      disabled={selectedTests.length === 0}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Send to Lab ({selectedTests.length})
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isLabModalOpen} onOpenChange={setLabModalOpen}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5" />
                      Lab Results for {patient.name}
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <ClipboardPlus className="h-4 w-4" />
                          Requested Tests:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {patient.requestedLabTests?.map((test, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {test}
                            </Badge>
                          ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lab-results" className="text-sm font-medium">Test Results</Label>
                      <Textarea 
                          id="lab-results" 
                          value={labResults} 
                          onChange={e => setLabResults(e.target.value)}
                          placeholder="Enter detailed lab findings and measurements..."
                          className="min-h-[120px] resize-none"
                      />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleAddLabResults} 
                      disabled={!labResults.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Submit Results
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={isDoctorModalOpen} onOpenChange={setDoctorModalOpen}>
            <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <AlertDialogHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <AlertDialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Final Diagnosis - {patient.name}
                      </AlertDialogTitle>
                      <Button variant="ghost" size="icon" onClick={handlePrint} title="Print Summary">
                          <Printer className="h-4 w-4"/>
                      </Button>
                    </div>
                </AlertDialogHeader>
                <div className="flex-1 overflow-y-auto space-y-4 py-4">
                    {patient.labResults && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <Activity className="h-4 w-4" />
                            Lab Results:
                          </h4>
                          <div className="bg-white dark:bg-gray-800 rounded-md p-3 text-sm whitespace-pre-wrap border">
                            {patient.labResults}
                          </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="diagnosis" className="text-sm font-medium">Final Diagnosis *</Label>
                        <Textarea 
                            id="diagnosis" 
                            value={diagnosis}
                            onChange={e => setDiagnosis(e.target.value)}
                            placeholder="Enter the final diagnosis based on examination and lab results..."
                            className="min-h-[100px] resize-none"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="prescription" className="text-sm font-medium">Prescription & Treatment Plan *</Label>
                        <Textarea 
                            id="prescription" 
                            value={prescription}
                            onChange={e => setPrescription(e.target.value)}
                            placeholder="e.g., Amoxicillin 500mg, 3 times daily for 7 days&#10;Paracetamol 500mg as needed for pain&#10;Follow-up in 1 week"
                            className="min-h-[120px] resize-none"
                        />
                    </div>
                </div>
                <AlertDialogFooter className="flex-shrink-0">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDischarge} 
                      disabled={!diagnosis.trim() || !prescription.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Discharge Patient
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </CardContent>
    </Card>
  );
};

const QueueColumn = ({ title, patients, color, icon, stage }: { 
  title: string; 
  patients: Patient[]; 
  color: string;
  icon: React.ReactNode;
  stage: QueueStage;
}) => {
  return (
    <div className="flex flex-col h-full" id={`queue-${stage.replace(/\s+/g, '-').toLowerCase()}`}>
        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border shadow-lg h-full flex flex-col">
            <CardHeader className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-muted/30 to-muted/10">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${color} text-white shadow-sm`}>
                          {icon}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {patients.length} patient{patients.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                    </div>
                    <Badge variant="secondary" className="font-bold text-sm px-3 py-1">
                      {patients.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {patients
                  .sort((a, b) => {
                    // Sort by priority first (urgent first), then by check-in time
                    if (a.priority === 'Urgent' && b.priority !== 'Urgent') return -1;
                    if (a.priority !== 'Urgent' && b.priority === 'Urgent') return 1;
                    return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
                  })
                  .map(p => <PatientCard key={p.id} patient={p} />)
                }
                {patients.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      {icon}
                    </div>
                    <p className="text-muted-foreground text-sm">No patients in this stage</p>
                  </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
};

// Removed old RoleProvider, QueueShortcuts, and RoleSwitcher components
// Now using useAuth directly for role-based filtering

export default function ClinicQueueManager() {
  const { patients } = usePatientQueue();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get relevant stages based on user role
  const relevantStages = getRelevantStages(user?.role || '');
  
  // Filter patients to only show those in relevant stages
  const relevantPatients = patients.filter(p => relevantStages.includes(p.stage));

  const stageConfig = {
    'Waiting Room': { 
      color: 'bg-blue-500', 
      icon: <User className="h-4 w-4" /> 
    },
    'Triage': { 
      color: 'bg-teal-500', 
      icon: <Activity className="h-4 w-4" /> 
    },
    'Questioning': { 
      color: 'bg-yellow-500', 
      icon: <Stethoscope className="h-4 w-4" /> 
    },
    'Laboratory Test': { 
      color: 'bg-purple-500', 
      icon: <TestTube className="h-4 w-4" /> 
    },
    'Results by Doctor': { 
      color: 'bg-green-500', 
      icon: <FileText className="h-4 w-4" /> 
    },
  };

  const totalPatients = relevantPatients.length;
  const urgentPatients = relevantPatients.filter(p => p.priority === 'Urgent').length;

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch(role) {
      case 'reception': return 'Reception';
      case 'staff': return 'Triage Nurse';
      case 'doctor': return 'Doctor';
      case 'laboratory': return 'Laboratory';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Patient Queue - {getRoleDisplayName(user?.role || '')}
                </h1>
                <p className="text-muted-foreground">
                    {totalPatients} patient{totalPatients !== 1 ? 's' : ''} in your queue
                    {urgentPatients > 0 && (
                      <span className="ml-2 text-red-600 font-medium">
                        • {urgentPatients} urgent
                      </span>
                    )}
                </p>
            </div>
            {user?.role === 'reception' && (
              <Button 
                onClick={() => navigate('/reception/add-user')}
                className="bg-primary hover:bg-primary/90 shadow-sm transition-all duration-200 hover:scale-105"
              >
                  <Plus className="mr-2 h-4 w-4"/> Add Patient
              </Button>
            )}
          </div>
        </div>

        {/* Queue Grid - Only show relevant stages */}
        <div className={`grid gap-6 ${relevantStages.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : relevantStages.length === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4'}`}>
            {relevantStages.map((stage) => (
            <QueueColumn
                key={stage}
                title={stage}
                patients={relevantPatients.filter(p => p.stage === stage)}
                color={stageConfig[stage].color}
                icon={stageConfig[stage].icon}
                stage={stage}
            />
            ))}
        </div>
      </main>
    </div>
  );
}