import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { type Patient } from '@/context/PatientQueueContext';
import { useToast } from '@/hooks/use-toast';

interface AppointmentModalProps {
  patient: Patient;
  onClose: () => void;
  onSave: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ patient, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    reason: '',
    notes: '',
    doctor: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/healthcare/staff/?role=doctor');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appointmentDateTime = `${formData.appointment_date}T${formData.appointment_time}:00`;
      
      const response = await fetch('http://localhost:8000/api/healthcare/appointments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: patient.id,
          doctor: formData.doctor,
          appointment_date: appointmentDateTime,
          reason: formData.reason,
          notes: formData.notes,
          status: 'scheduled'
        })
      });

      if (response.ok) {
        toast({
          title: "Appointment Scheduled",
          description: `Appointment scheduled for ${patient.name} on ${formData.appointment_date} at ${formData.appointment_time}`,
        });
        onSave();
      } else {
        toast({
          title: "Error",
          description: "Failed to schedule appointment",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Schedule Appointment for {patient.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                required
              />
              <Input
                type="time"
                value={formData.appointment_time}
                onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                required
              />
            </div>
            <select
              value={formData.doctor}
              onChange={(e) => setFormData({...formData, doctor: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor: any) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.user?.first_name} {doctor.user?.last_name}
                </option>
              ))}
            </select>
            <Input
              placeholder="Reason for visit"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              required
            />
            <textarea
              placeholder="Additional notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-2 border rounded-lg h-20 resize-none"
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Scheduling...' : 'Schedule Appointment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentModal;