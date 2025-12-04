'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Phone, MapPin, User, Edit, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePatientQueue } from '@/context/PatientQueueContext';
import { API_BASE_URL } from '@/lib/constants';

interface PatientSearchResult {
  id: string;
  name: string;
  age?: number;
  sex?: string;
  phone?: string;
  email?: string;
  address?: string;
  card_number?: string;
  last_visit?: string;
  total_visits?: number;
}

const PatientManagementHub = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reAdmitPatient } = usePatientQueue();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [activeTab, setActiveTab] = useState('search');
  
  // Readmission form
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState('Normal');
  
  // Edit form
  const [editFormData, setEditFormData] = useState({
    name: '',
    age: '',
    sex: '',
    phone: '',
    email: '',
    address: ''
  });
  
  // New appointment form
  const [appointmentData, setAppointmentData] = useState({
    reason: '',
    priority: 'Normal',
    notes: ''
  });

  // Search patients
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        variant: 'destructive',
        title: 'Search Required',
        description: 'Please enter a search term',
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch all patients from the API
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/healthcare/patients/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const patients = await response.json();
      
      // Filter patients based on search term
      const searchLower = searchTerm.toLowerCase();
      const filtered = patients.filter((patient: any) => {
        const fullName = `${patient.user?.first_name || ''} ${patient.user?.last_name || ''}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          patient.phone?.toLowerCase().includes(searchLower) ||
          patient.user?.email?.toLowerCase().includes(searchLower) ||
          patient.address?.toLowerCase().includes(searchLower) ||
          patient.id?.toString().includes(searchLower)
        );
      });

      // Map to our search result format
      setSearchResults(filtered.map((p: any) => ({
        id: p.id.toString(),
        name: `${p.user?.first_name || ''} ${p.user?.last_name || ''}`.trim(),
        age: p.age,
        sex: p.gender,
        phone: p.phone,
        email: p.user?.email,
        address: p.address,
        card_number: p.id.toString(),
        last_visit: p.updated_at || new Date().toISOString(),
        total_visits: 1
      })));

      if (filtered.length === 0) {
        toast({
          title: 'No Results',
          description: 'No patients found matching your search',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: 'Unable to search patients. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Select patient and populate forms
  const handleSelectPatient = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setEditFormData({
      name: patient.name,
      age: patient.age?.toString() || '',
      sex: patient.sex || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || ''
    });
  };

  // Handle readmission
  const handleReadmit = async () => {
    if (!selectedPatient) return;

    if (!reason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Reason Required',
        description: 'Please enter a reason for visit',
      });
      return;
    }

    try {
      // Use reAdmitPatient which creates a new visit for existing patient
      await reAdmitPatient(selectedPatient.id);

      toast({
        title: 'Patient Readmitted',
        description: `${selectedPatient.name} has been added to the queue`,
        className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      });

      // Reset form
      setReason('');
      setPriority('Normal');
      
      // Navigate to queue
      setTimeout(() => navigate('/reception/queue'), 1500);
    } catch (error) {
      console.error('Readmission error:', error);
      toast({
        variant: 'destructive',
        title: 'Readmission Failed',
        description: 'Unable to readmit patient',
      });
    }
  };

  // Handle patient edit
  const handleEditPatient = async () => {
    if (!selectedPatient) return;

    if (!editFormData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Name Required',
        description: 'Patient name is required',
      });
      return;
    }

    setLoading(true);
    try {
      const [firstName, ...lastNameParts] = editFormData.name.split(' ');
      const lastName = lastNameParts.join(' ');
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${API_BASE_URL}/healthcare/patients/${selectedPatient.id}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          age: parseInt(editFormData.age) || null,
          gender: editFormData.sex,
          phone: editFormData.phone,
          address: editFormData.address,
          user: {
            first_name: firstName,
            last_name: lastName,
            email: editFormData.email
          }
        })
      });

      if (response.ok) {
        toast({
          title: 'Patient Updated',
          description: `${editFormData.name}'s information has been updated`,
          className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        });
        
        // Update selected patient
        setSelectedPatient({
          ...selectedPatient,
          name: editFormData.name,
          age: parseInt(editFormData.age) || undefined,
          sex: editFormData.sex,
          phone: editFormData.phone,
          email: editFormData.email,
          address: editFormData.address
        });
        
        // Refresh search results
        handleSearch();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Unable to update patient information',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle new appointment
  const handleNewAppointment = async () => {
    if (!selectedPatient) return;

    if (!appointmentData.reason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Reason Required',
        description: 'Please enter a reason for the appointment',
      });
      return;
    }

    try {
      // Use reAdmitPatient which creates a new visit for existing patient
      await reAdmitPatient(selectedPatient.id);

      toast({
        title: 'Appointment Created',
        description: `New appointment for ${selectedPatient.name} has been added to the queue`,
        className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      });

      // Reset form
      setAppointmentData({
        reason: '',
        priority: 'Normal',
        notes: ''
      });
      
      // Navigate to queue
      setTimeout(() => navigate('/reception/queue'), 1500);
    } catch (error) {
      console.error('Appointment creation error:', error);
      toast({
        variant: 'destructive',
        title: 'Appointment Failed',
        description: 'Unable to create appointment',
      });
    }
  };

  // Reset all forms
  const handleReset = () => {
    setSelectedPatient(null);
    setReason('');
    setPriority('Normal');
    setAppointmentData({ reason: '', priority: 'Normal', notes: '' });
    setActiveTab('search');
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="admin-header">
        <h1 className="text-2xl font-bold text-primary">Patient Management</h1>
        <p className="text-16-semibold text-muted-foreground">Search, edit, readmit, and create appointments</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Section */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Search className="h-5 w-5" />
              Search Patients
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Search by name, phone, email, address, or patient ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter name, phone, email, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-background text-foreground"
              />
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Search Results */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((patient) => (
                  <Card
                    key={patient.id}
                    className={`cursor-pointer transition-all hover:shadow-md bg-card ${
                      selectedPatient?.id === patient.id ? 'border-primary border-2' : ''
                    }`}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-card-foreground">{patient.name}</span>
                            {patient.age && (
                              <Badge variant="outline">{patient.age}y</Badge>
                            )}
                            {patient.sex && (
                              <Badge variant="outline">{patient.sex}</Badge>
                            )}
                          </div>
                          {patient.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </div>
                          )}
                          {patient.address && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {patient.address}
                            </div>
                          )}
                        </div>
                        {selectedPatient?.id === patient.id && (
                          <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : searchTerm && !loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No patients found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Enter a search term to find patients</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Section with Tabs */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              {selectedPatient ? selectedPatient.name : 'Select a Patient'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {selectedPatient ? 'Choose an action below' : 'Search and select a patient to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPatient ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                  <TabsTrigger value="readmit" className="data-[state=active]:bg-background">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Readmit
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="data-[state=active]:bg-background">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="appointment" className="data-[state=active]:bg-background">
                    <FileText className="h-4 w-4 mr-2" />
                    Appointment
                  </TabsTrigger>
                </TabsList>

                {/* Readmit Tab */}
                <TabsContent value="readmit" className="space-y-4 mt-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold text-foreground">Patient Information</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">Name:</strong> {selectedPatient.name}</p>
                      {selectedPatient.age && <p><strong className="text-foreground">Age:</strong> {selectedPatient.age} years</p>}
                      {selectedPatient.sex && <p><strong className="text-foreground">Gender:</strong> {selectedPatient.sex}</p>}
                      {selectedPatient.phone && <p><strong className="text-foreground">Phone:</strong> {selectedPatient.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="reason" className="text-foreground">Reason for Visit *</Label>
                      <Input
                        id="reason"
                        placeholder="e.g., Follow-up, New complaint, Check-up"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="bg-background text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority" className="text-foreground">Priority</Label>
                      <select
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-background text-foreground"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={handleReset} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleReadmit} disabled={!reason.trim()} className="flex-1">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Readmit to Queue
                    </Button>
                  </div>
                </TabsContent>

                {/* Edit Tab */}
                <TabsContent value="edit" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="edit-name" className="text-foreground">Full Name *</Label>
                      <Input
                        id="edit-name"
                        placeholder="Full Name"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="bg-background text-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-age" className="text-foreground">Age</Label>
                        <Input
                          id="edit-age"
                          type="number"
                          placeholder="Age"
                          value={editFormData.age}
                          onChange={(e) => setEditFormData({...editFormData, age: e.target.value})}
                          className="bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-sex" className="text-foreground">Gender</Label>
                        <select
                          id="edit-sex"
                          value={editFormData.sex}
                          onChange={(e) => setEditFormData({...editFormData, sex: e.target.value})}
                          className="w-full p-2 border rounded-lg bg-background text-foreground"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-phone" className="text-foreground">Phone</Label>
                      <Input
                        id="edit-phone"
                        placeholder="Phone"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                        className="bg-background text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-email" className="text-foreground">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        placeholder="Email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        className="bg-background text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-address" className="text-foreground">Address</Label>
                      <Input
                        id="edit-address"
                        placeholder="Address"
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                        className="bg-background text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={handleReset} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleEditPatient} disabled={loading || !editFormData.name.trim()} className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </TabsContent>

                {/* New Appointment Tab */}
                <TabsContent value="appointment" className="space-y-4 mt-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold text-foreground">Patient Information</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">Name:</strong> {selectedPatient.name}</p>
                      {selectedPatient.age && <p><strong className="text-foreground">Age:</strong> {selectedPatient.age} years</p>}
                      {selectedPatient.sex && <p><strong className="text-foreground">Gender:</strong> {selectedPatient.sex}</p>}
                      {selectedPatient.phone && <p><strong className="text-foreground">Phone:</strong> {selectedPatient.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="appt-reason" className="text-foreground">Reason for Visit *</Label>
                      <Input
                        id="appt-reason"
                        placeholder="e.g., Consultation, Follow-up, Emergency"
                        value={appointmentData.reason}
                        onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}
                        className="bg-background text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="appt-priority" className="text-foreground">Priority</Label>
                      <select
                        id="appt-priority"
                        value={appointmentData.priority}
                        onChange={(e) => setAppointmentData({...appointmentData, priority: e.target.value})}
                        className="w-full p-2 border rounded-lg bg-background text-foreground"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="appt-notes" className="text-foreground">Notes (Optional)</Label>
                      <textarea
                        id="appt-notes"
                        placeholder="Additional notes or instructions..."
                        value={appointmentData.notes}
                        onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                        className="w-full p-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={handleReset} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleNewAppointment} disabled={!appointmentData.reason.trim()} className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Create Appointment
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Patient Selected</p>
                <p className="text-sm">Search and select a patient from the left to manage their information</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      {searchResults.length > 0 && (
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Found {searchResults.length} patient{searchResults.length !== 1 ? 's' : ''}
              </span>
              {selectedPatient && (
                <span className="text-primary font-medium">
                  Selected: {selectedPatient.name}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientManagementHub;
