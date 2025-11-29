import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  AlertTriangle, 
  Pill, 
  Plus, 
  Search, 
  Edit, 
  Trash2 
} from 'lucide-react';

interface MedicalHistory {
  id: number;
  patient: number;
  condition_type: string;
  condition_name: string;
  diagnosis_date: string;
  description: string;
  treating_doctor: number | null;
  is_active: boolean;
  created_at: string;
}

interface Allergy {
  id: number;
  patient: number;
  allergen: string;
  allergy_type: string;
  severity: string;
  reaction: string;
  diagnosed_date: string;
  is_active: boolean;
  created_at: string;
}

interface PatientMedication {
  id: number;
  patient: number;
  medication_name: string;
  dosage: string;
  frequency: string;
  prescribed_by: number | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string;
  created_at: string;
}

const EHRManagement: React.FC = () => {
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEHRData();
  }, []);

  const fetchEHRData = async () => {
    try {
      setLoading(true);
      const [medicalHistoryRes, allergiesRes, medicationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/healthcare/medical-history/'),
        fetch(`${API_BASE_URL}/healthcare/allergies/'),
        fetch(`${API_BASE_URL}/healthcare/patient-medications/')
      ]);

      const [medicalHistoryData, allergiesData, medicationsData] = await Promise.all([
        medicalHistoryRes.json(),
        allergiesRes.json(),
        medicationsRes.json()
      ]);

      setMedicalHistories(medicalHistoryData);
      setAllergies(allergiesData);
      setMedications(medicationsData);
    } catch (error) {
      console.error('Error fetching EHR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'life_threatening':
        return 'bg-red-500';
      case 'severe':
        return 'bg-orange-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'mild':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConditionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'chronic':
        return 'bg-red-100 text-red-800';
      case 'acute':
        return 'bg-orange-100 text-orange-800';
      case 'surgery':
        return 'bg-blue-100 text-blue-800';
      case 'injury':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading EHR data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Histories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalHistories.length}</div>
            <p className="text-xs text-muted-foreground">
              {medicalHistories.filter(h => h.is_active).length} active conditions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allergies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allergies.length}</div>
            <p className="text-xs text-muted-foreground">
              {allergies.filter(a => a.severity === 'life_threatening' || a.severity === 'severe').length} critical
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medications.length}</div>
            <p className="text-xs text-muted-foreground">
              {medications.filter(m => m.is_active).length} active prescriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search medical records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* EHR Tabs */}
      <Tabs defaultValue="medical-history" className="w-full">
        <TabsList>
          <TabsTrigger value="medical-history">Medical History</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="medical-history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Medical History Records</CardTitle>
                  <CardDescription>
                    Patient medical conditions, surgeries, and treatments
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicalHistories
                  .filter(history => 
                    history.condition_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    history.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((history) => (
                    <div key={history.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{history.condition_name}</h3>
                          <Badge className={getConditionTypeColor(history.condition_type)}>
                            {history.condition_type}
                          </Badge>
                          <Badge variant={history.is_active ? "default" : "secondary"}>
                            {history.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Diagnosed: {new Date(history.diagnosis_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm">{history.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="allergies">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Allergy Records</CardTitle>
                  <CardDescription>
                    Patient allergies and adverse reactions
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Allergy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allergies
                  .filter(allergy => 
                    allergy.allergen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    allergy.reaction.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((allergy) => (
                    <div key={allergy.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{allergy.allergen}</h3>
                          <Badge className={`${getSeverityColor(allergy.severity)} text-white`}>
                            {allergy.severity.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {allergy.allergy_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Diagnosed: {new Date(allergy.diagnosed_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm"><strong>Reaction:</strong> {allergy.reaction}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="medications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Medication Records</CardTitle>
                  <CardDescription>
                    Current and past patient medications
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications
                  .filter(medication => 
                    medication.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    medication.dosage.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((medication) => (
                    <div key={medication.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{medication.medication_name}</h3>
                          <Badge variant={medication.is_active ? "default" : "secondary"}>
                            {medication.is_active ? "Active" : "Discontinued"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Dosage:</strong> {medication.dosage}</p>
                            <p><strong>Frequency:</strong> {medication.frequency.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p><strong>Start Date:</strong> {new Date(medication.start_date).toLocaleDateString()}</p>
                            {medication.end_date && (
                              <p><strong>End Date:</strong> {new Date(medication.end_date).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        {medication.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Notes:</strong> {medication.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EHRManagement;