import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Patient, usePatientQueue } from '@/context/PatientQueueContext';
import { Button } from '@/components/ui/button';
import { Eye, UserPlus, Edit, Trash2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import EditPatientModal from './EditPatientModal';
import AppointmentModal from './AppointmentModal';

interface PatientDataTableProps {
  data: Patient[];
}

const PatientDataTable = ({ data }: PatientDataTableProps) => {
  const navigate = useNavigate();
  const { reAdmitPatient } = usePatientQueue();
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const handleViewSummary = (patientId: string) => {
    navigate(`/patients/${patientId}/summary`);
  };

  const openReAdmitAlert = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsAlertOpen(true);
  };

  const handleReAdmit = () => {
    if (selectedPatient) {
      reAdmitPatient(selectedPatient.id);
      toast({
        title: "Patient Re-admitted",
        description: `${selectedPatient.name} has been added back to the waiting room.`,
      });
      setIsAlertOpen(false);
      setSelectedPatient(null);
      navigate('/reception/queue');
    }
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteAlert(true);
  };

  const handleScheduleAppointment = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowAppointmentModal(true);
  };

  const confirmDelete = async () => {
    if (selectedPatient) {
      try {
        const response = await fetch(`http://localhost:8000/api/healthcare/patients/${selectedPatient.id}/`, {
          method: 'DELETE'
        });
        if (response.ok) {
          toast({
            title: "Patient Deleted",
            description: `${selectedPatient.name} has been removed from the system.`,
          });
          window.location.reload();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete patient.",
          variant: "destructive"
        });
      }
      setShowDeleteAlert(false);
      setSelectedPatient(null);
    }
  };

  return (
    <>
      <div className="data-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((patient, index) => (
                <TableRow key={`patient-data-${patient.id}-${index}`}>
                  <TableCell className="font-medium">{patient.id}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.sex}</TableCell>
                  <TableCell>{patient.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={patient.stage === 'Discharged' ? 'secondary' : 'default'}>
                      {patient.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(patient)}
                        title="Edit Patient"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(patient)}
                        title="Delete Patient"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewSummary(patient.id)}
                        title="View Patient Summary"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleScheduleAppointment(patient)}
                        title="Schedule Appointment"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openReAdmitAlert(patient)}
                        title="Re-admit Patient"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Re-admit Patient?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to re-admit <span className="font-bold">{selectedPatient?.name}</span> for a new examination? This will add them back to the waiting room queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPatient(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReAdmit}>
              Re-admit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-bold">{selectedPatient?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPatient(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showEditModal && selectedPatient && (
        <EditPatientModal 
          patient={selectedPatient} 
          onClose={() => { setShowEditModal(false); setSelectedPatient(null); }}
          onSave={() => { setShowEditModal(false); setSelectedPatient(null); window.location.reload(); }}
        />
      )}

      {showAppointmentModal && selectedPatient && (
        <AppointmentModal 
          patient={selectedPatient} 
          onClose={() => { setShowAppointmentModal(false); setSelectedPatient(null); }}
          onSave={() => { setShowAppointmentModal(false); setSelectedPatient(null); }}
        />
      )}
    </>
  );
};

export default PatientDataTable;