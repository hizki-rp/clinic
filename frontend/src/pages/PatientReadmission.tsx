'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Phone, MapPin, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePatientQueue, type PatientPriority } from '@/context/PatientQueueContext';

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

const PatientReadmission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addPatient } = usePatientQueue();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState('Normal');

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
      // Search in the patient queue context first
      const { allPatients } = usePatientQueue();

      
      // Filter patients based on search term
      const searchLower = searchTerm.toLowerCase();
      const filtered = allPatients.filter(patient => 
        patient.name?.toLowerCase().includes(searchLower) ||
        patient.phone?.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.address?.toLowerCase().includes(searchLower) ||
        patient.id?.toLowerCase().includes(searchLower)
      );

      setSearchResults(filtered.map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        sex: p.sex,
        phone: p.phone,
        email: p.email,
        address: p.address,
        card_number: p.id,
        last_visit: new Date().toISOString(),
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
        description: 'Unable to search patients',
      });
    } finally {
      setLoading(false);
    }
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
      // Add patient back to queue
      const newPatient = {
        name: selectedPatient.name,
        age: selectedPatient.age,
        sex: selectedPatient.sex,
        phone: selectedPatient.phone,
        email: selectedPatient.email,
        address: selectedPatient.address,
        priority: priority as PatientPriority,
      };

      addPatient(newPatient);

      toast({
        title: 'Patient Readmitted',
        description: `${selectedPatient.name} has been added to the queue`,
      });

      // Reset form
      setSelectedPatient(null);
      setReason('');
      setPriority('Normal');
      setSearchTerm('');
      setSearchResults([]);

      // Navigate to queue
      setTimeout(() => navigate('/queue'), 1500);
    } catch (error) {
      console.error('Readmission error:', error);
      toast({
        variant: 'destructive',
        title: 'Readmission Failed',
        description: 'Unable to readmit patient',
      });
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="admin-header">
        <h1 className="text-2xl font-bold text-primary">Patient Readmission</h1>
        <p className="text-16-semibold">Search and readmit previous patients</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Patients
            </CardTitle>
            <CardDescription>
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
                className="flex-1"
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
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPatient?.id === patient.id ? 'border-primary border-2' : ''
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{patient.name}</span>
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
                          {patient.last_visit && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Last visit: {new Date(patient.last_visit).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        {selectedPatient?.id === patient.id && (
                          <Badge className="bg-primary">Selected</Badge>
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

        {/* Readmission Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Readmit Patient
            </CardTitle>
            <CardDescription>
              {selectedPatient ? 'Fill in visit details' : 'Select a patient to readmit'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPatient ? (
              <>
                {/* Selected Patient Info */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Selected Patient</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedPatient.name}</p>
                    {selectedPatient.age && <p><strong>Age:</strong> {selectedPatient.age} years</p>}
                    {selectedPatient.sex && <p><strong>Gender:</strong> {selectedPatient.sex}</p>}
                    {selectedPatient.phone && <p><strong>Phone:</strong> {selectedPatient.phone}</p>}
                    {selectedPatient.card_number && <p><strong>Card #:</strong> {selectedPatient.card_number}</p>}
                  </div>
                </div>

                {/* Visit Details */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="reason">Reason for Visit *</Label>
                    <Input
                      id="reason"
                      placeholder="e.g., Follow-up, New complaint, Check-up"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-background"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPatient(null);
                      setReason('');
                      setPriority('Normal');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReadmit}
                    disabled={!reason.trim()}
                    className="flex-1"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Readmit to Queue
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Patient Selected</p>
                <p className="text-sm">Search and select a patient from the left to readmit them</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      {searchResults.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Found {searchResults.length} patient{searchResults.length !== 1 ? 's' : ''}
              </span>
              {selectedPatient && (
                <span className="text-primary font-medium">
                  Ready to readmit: {selectedPatient.name}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientReadmission;
