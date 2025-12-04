'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, Clock, Building } from 'lucide-react';
import apiClient from '@/lib/api';

interface Staff {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  employee_id: string;
  hire_date: string;
  employment_status: string;
  hourly_rate: string;
  department: string;
}

interface CreatedCredentials {
  employee_id: string;
  email: string;
  password: string;
}

const StaffManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [newStaffForm, setNewStaffForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    hourly_rate: ''
  });
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      const data = await apiClient.get<any>('/healthcare/admin/staff_management/');
      setStaff(data.staff || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    }
  };

  // Create new staff member
  const createStaff = async () => {
    if (!newStaffForm.first_name || !newStaffForm.last_name || !newStaffForm.email || !newStaffForm.password || !newStaffForm.role) {
      toast({
        variant: 'destructive',
        title: 'Missing Required Fields',
        description: 'Please fill in first name, last name, email, password, and role.',
      });
      return;
    }

    try {
      const staffData = {
        first_name: newStaffForm.first_name.trim(),
        last_name: newStaffForm.last_name.trim(),
        email: newStaffForm.email.trim(),
        password: newStaffForm.password.trim(),
        role: newStaffForm.role,
        department: newStaffForm.department.trim() || 'General',
        hourly_rate: parseFloat(newStaffForm.hourly_rate) || 0
      };

      const data = await apiClient.post<any>('/healthcare/admin/create_staff/', staffData);

      if (data) {
        toast({
          title: 'Staff Created Successfully!',
          description: `Employee ID: ${data.employee_id}`,
        });

        setCreatedCredentials({
          employee_id: data.employee_id,
          email: newStaffForm.email,
          password: newStaffForm.password
        });
        
        setNewStaffForm({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          role: '',
          department: '',
          hourly_rate: ''
        });
        
        fetchStaff();
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Unable to create staff member. Please try again.',
      });
    }
  };

  // Update staff role
  const updateStaffRole = async (staffId: number, newRole: string) => {
    if (user?.role === 'reception') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Receptionists cannot change user roles.',
      });
      return;
    }
    
    if (user?.role === 'doctor' || user?.role === 'laboratory') {
      if (newRole !== 'reception') {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You can only change roles to Reception.',
        });
        return;
      }
    }

    try {
      await apiClient.patch<any>(`/healthcare/admin/update_staff_role/${staffId}/`, { role: newRole });
      toast({
        title: 'Role Updated',
        description: 'Staff member role has been updated.',
      });
      fetchStaff();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Update Role',
        description: error.message || 'An error occurred.',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStaff();
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredStaff = staff.filter(member =>
    member.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading Staff Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="admin-header">
        <Link to="/" className="cursor-pointer">
          <h1 className="text-2xl font-bold text-primary">Menaharia Medium Clinic</h1>
        </Link>
        <p className="text-16-semibold">Staff Management System</p>
      </header>
      
      <main className="admin-main flex flex-col gap-8">
        <section>
          <h1 className="header">Staff Management 👥</h1>
          <p className="text-muted-foreground">
            Manage clinic staff members and their information.
          </p>
        </section>

        {/* Fixed Height Stats Container */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 min-h-[120px]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
              <p className="text-xs text-muted-foreground">
                {staff.filter(s => s.employment_status === 'active').length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(staff.map(s => s.department)).size}
              </div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roles</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(staff.map(s => s.user.role)).size}
              </div>
              <p className="text-xs text-muted-foreground">Different roles</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="staff" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="staff">Staff Directory</TabsTrigger>
            <TabsTrigger value="add-staff">Add Staff</TabsTrigger>
          </TabsList>

          {/* Staff Directory Tab */}
          <TabsContent value="staff" className="min-h-[600px]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Staff Directory
                </CardTitle>
                <CardDescription>
                  View and manage all clinic staff members
                </CardDescription>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Hourly Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hire Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No staff members found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStaff.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.employee_id}</TableCell>
                            <TableCell>{member.user.first_name} {member.user.last_name}</TableCell>
                            <TableCell className="capitalize">
                              {user?.role === 'admin' || 
                               (user?.role === 'doctor' && member.user.role !== 'reception') ||
                               (user?.role === 'laboratory' && member.user.role !== 'reception') ? (
                                <Select
                                  value={member.user.role}
                                  onValueChange={(newRole) => updateStaffRole(member.id, newRole)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {user?.role === 'admin' && (
                                      <>
                                        <SelectItem value="doctor">Doctor</SelectItem>
                                        <SelectItem value="reception">Reception</SelectItem>
                                        <SelectItem value="laboratory">Laboratory</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                      </>
                                    )}
                                    {(user?.role === 'doctor' || user?.role === 'laboratory') && (
                                      <SelectItem value="reception">Reception</SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span>{member.user.role}</span>
                              )}
                            </TableCell>
                            <TableCell>{member.department}</TableCell>
                            <TableCell>${member.hourly_rate}/hr</TableCell>
                            <TableCell>
                              <Badge variant={member.employment_status === 'active' ? 'default' : 'secondary'}>
                                {member.employment_status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(member.hire_date).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Staff Tab */}
          <TabsContent value="add-staff" className="min-h-[600px]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Add New Staff Member
                </CardTitle>
                <CardDescription>
                  Create a new employee profile with login credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={newStaffForm.first_name}
                      onChange={(e) => setNewStaffForm({...newStaffForm, first_name: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={newStaffForm.last_name}
                      onChange={(e) => setNewStaffForm({...newStaffForm, last_name: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="staff_email"
                      type="email"
                      value={newStaffForm.email}
                      onChange={(e) => setNewStaffForm({...newStaffForm, email: e.target.value})}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newStaffForm.password}
                      onChange={(e) => setNewStaffForm({...newStaffForm, password: e.target.value})}
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select value={newStaffForm.role} onValueChange={(value) => setNewStaffForm({...newStaffForm, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {user?.role === 'admin' && (
                          <>
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="reception">Reception</SelectItem>
                            <SelectItem value="laboratory">Laboratory</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                          </>
                        )}
                        {(user?.role === 'doctor' || user?.role === 'laboratory') && (
                          <SelectItem value="reception">Reception</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newStaffForm.department}
                      onChange={(e) => setNewStaffForm({...newStaffForm, department: e.target.value})}
                      placeholder="e.g., General, Cardiology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      value={newStaffForm.hourly_rate}
                      onChange={(e) => setNewStaffForm({...newStaffForm, hourly_rate: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={createStaff} 
                  className="mt-6"
                  disabled={!newStaffForm.first_name || !newStaffForm.last_name || !newStaffForm.email || !newStaffForm.password || !newStaffForm.role}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Staff Member
                </Button>
                
                {createdCredentials && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3">Staff Created Successfully!</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="font-medium">Employee ID:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-white px-3 py-1 rounded border">{createdCredentials.employee_id}</code>
                          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(createdCredentials.employee_id)}>
                            Copy
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="font-medium">Email:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-white px-3 py-1 rounded border">{createdCredentials.email}</code>
                          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(createdCredentials.email)}>
                            Copy
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="font-medium">Password:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-white px-3 py-1 rounded border">{createdCredentials.password}</code>
                          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(createdCredentials.password)}>
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="mt-4" onClick={() => setCreatedCredentials(null)}>
                      Dismiss
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StaffManagement;
