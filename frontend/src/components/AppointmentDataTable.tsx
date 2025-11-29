import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Appointment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreVertical, Search, Plus, Phone } from 'lucide-react';
import StatusBadge from './StatusBadge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import NewAppointmentModal from './NewAppointmentModal';

interface AppointmentDataTableProps {
  data: Appointment[];
}

const AppointmentDataTable = ({ data }: AppointmentDataTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let filtered = data;
    
    if (searchTerm) {
      filtered = filtered.filter(appointment => 
        appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.primaryPhysician.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(appointment => 
        new Date(appointment.schedule).toISOString().split('T')[0] === dateFilter
      );
    }
    
    setFilteredData(filtered);
  }, [data, searchTerm, dateFilter]);

  const handleCallPatient = (appointment: Appointment) => {
    if (appointment.patient.phone) {
      window.open(`tel:${appointment.patient.phone}`);
      toast({
        title: "Calling Patient",
        description: `Calling ${appointment.patient.name} at ${appointment.patient.phone}`,
      });
    } else {
      toast({
        title: "No Phone Number",
        description: "Patient phone number not available",
        variant: "destructive"
      });
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      const response = await fetch(`http://localhost:8000/api/healthcare/appointments/${appointment.id}/cancel/`, {
        method: 'POST'
      });
      if (response.ok) {
        toast({
          title: "Appointment Cancelled",
          description: `Appointment for ${appointment.patient.name} has been cancelled.`,
        });
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, phone, or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-48"
        />
        <Button onClick={() => setShowNewAppointmentModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>
      
      <div className="data-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((appointment) => (
                <TableRow key={appointment.patient.name}>
                  <TableCell>
                      <p className="font-medium">{appointment.patient.name}</p>
                  </TableCell>
                  <TableCell>{new Date(appointment.schedule).toLocaleDateString()}</TableCell>
                  <TableCell>
                      <StatusBadge status={appointment.status} />
                  </TableCell>
                  <TableCell>{appointment.primaryPhysician}</TableCell>
                  <TableCell className="text-right">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                  <MoreVertical />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleCallPatient(appointment)}>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Call Patient
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCancelAppointment(appointment)}>
                                  Cancel Appointment
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No appointments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {showNewAppointmentModal && (
        <NewAppointmentModal 
          onClose={() => setShowNewAppointmentModal(false)}
          onSave={() => { setShowNewAppointmentModal(false); window.location.reload(); }}
        />
      )}
    </div>
  );
};

export default AppointmentDataTable;