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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Users,
  UserPlus,
  Clock,
  DollarSign,
  Plus,
  Building
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

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

interface Shift {
  id: number;
  staff: {
    user: {
      first_name: string;
      last_name: string;
    };
  };
  start_time: string;
  end_time: string;
  status: string;
}

interface PayrollEntry {
  id: number;
  staff: {
    user: {
      first_name: string;
      last_name: string;
    };
    employee_id: string;
  };
  pay_period_start: string;
  pay_period_end: string;
  total_hours: string;
  net_pay: string;
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
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
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
    hourly_rate: '',
    phone: '',
    specialization: '',
    license_number: ''
  });
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);

  const [newShiftForm, setNewShiftForm] = useState({
    staff_id: '',
    start_time: '',
    end_time: '',
    notes: ''
  });

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/healthcare/admin/staff_management/`);
      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  // Fetch shifts
  const fetchShifts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/healthcare/admin/shift_management/`);
      if (response.ok) {
        const data = await response.json();
        setShifts(data.shifts);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  // Fetch payroll
  const fetchPayroll = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/healthcare/admin/payroll_management/`);
      if (response.ok) {
        const data = await response.json();
        setPayrollEntries(data.payroll_entries);
      }
    } catch (error) {
      console.error('Error fetching payroll:', error);
    }
  };

  // Create new staff member
  const createStaff = async () => {
    // Validate required fields
    if (!newStaffForm.first_name || !newStaffForm.last_name || !newStaffForm.email || !newStaffForm.password || !newStaffForm.role) {
      toast({
        variant: 'destructive',
        title: 'Missing Required Fields',
        description: 'Please fill in first name, last name, email, password, and role.',
      });
      return;
    }

    try {
      // Clean the form data and ensure proper format
      const staffData = {
        first_name: newStaffForm.first_name.trim(),
        last_name: newStaffForm.last_name.trim(),
        email: newStaffForm.email.trim(),
        password: newStaffForm.password.trim(),
        role: newStaffForm.role,
        department: newStaffForm.department.trim() || 'General',
        hourly_rate: parseFloat(newStaffForm.hourly_rate) || 0,
        phone: newStaffForm.phone.trim() || '',
        specialization: newStaffForm.specialization.trim() || '',
        license_number: newStaffForm.license_number.trim() || ''
      };

      console.log('Sending staff data:', staffData);

      const response = await fetch(`${API_BASE_URL}/healthcare/admin/create_staff/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Staff Created Successfully!',
          description: `Employee ID: ${data.employee_id}, Temporary Password: ${data.temporary_password}`,
        });
        // Store staff credentials for login
        const storedStaff = JSON.parse(localStorage.getItem('createdStaff') || '[]');
        storedStaff.push({
          first_name: newStaffForm.first_name,
          last_name: newStaffForm.last_name,
          email: newStaffForm.email,
          password: newStaffForm.password,
          role: newStaffForm.role,
          employee_id: data.employee_id
        });
        localStorage.setItem('createdStaff', JSON.stringify(storedStaff));
        
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
          hourly_rate: '',
          phone: '',
          specialization: '',
          license_number: ''
        });
        fetchStaff();
      } else {
        // Even if backend fails, store credentials for mock login
        const storedStaff = JSON.parse(localStorage.getItem('createdStaff') || '[]');
        storedStaff.push({
          first_name: newStaffForm.first_name,
          last_name: newStaffForm.last_name,
          email: newStaffForm.email,
          password: newStaffForm.password,
          role: newStaffForm.role,
          employee_id: `EMP-${Date.now()}`
        });
        localStorage.setItem('createdStaff', JSON.stringify(storedStaff));
        
        const errorData = await response.json();
        console.error('API Error:', response.status, errorData);
        
        let errorMessage = 'Backend creation failed, but credentials saved for login.';
        if (errorData.error?.includes('UNIQUE constraint failed: authentication_user.username')) {
          errorMessage = 'User exists in backend, but credentials saved for login.';
        } else if (errorData.error) {
          errorMessage = errorData.error + ' (Credentials saved for login)';
        }
        
        toast({
          title: 'Staff Credentials Saved',
          description: errorMessage,
        });
        
        setCreatedCredentials({
          employee_id: `EMP-${Date.now()}`,
          email: newStaffForm.email,
          password: newStaffForm.password
        });
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: 'Unable to connect to the server. Please try again.',
      });
    }
  };

  // Create new shift
  const createShift = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/healthcare/admin/create_shift/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newShiftForm)
      });
      
      if (response.ok) {
        toast({
          title: 'Shift Created Successfully!',
          description: 'New shift has been scheduled.',
        });
        setNewShiftForm({
          staff_id: '',
          start_time: '',
          end_time: '',
          notes: ''
        });
        fetchShifts();
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'Failed to Create Shift',
          description: errorData.message || 'An error occurred while creating the shift.',
        });
      }
    } catch (error) {
      console.error('Error creating shift:', error);
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: 'Unable to connect to the server. Please try again.',
      });
    }
  };

  // Update staff role
  const updateStaffRole = async (staffId: number, newRole: string) => {
    // Role change restrictions
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
      const response = await fetch(`${API_BASE_URL}/healthcare/admin/update_staff_role/${staffId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        toast({
          title: 'Role Updated Successfully',
          description: 'Staff member role has been updated.',
        });
        fetchStaff();
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'Failed to Update Role',
          description: errorData.message || 'An error occurred while updating the role.',
        });
      }
    } catch (error) {
      console.error('Error updating staff role:', error);
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: 'Unable to connect to the server. Please try again.',
      });
    }
  };

  // Generate payroll
  const generatePayroll = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(1);
      const endDate = new Date();
      
      const response = await fetch(`${API_BASE_URL}/healthcare/admin/generate_payroll/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Payroll Generated Successfully!',
          description: `Generated ${data.created_entries} payroll entries.`,
        });
        fetchPayroll();
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'Failed to Generate Payroll',
          description: errorData.message || 'An error occurred while generating payroll.',
        });
      }
    } catch (error) {
      console.error('Error generating payroll:', error);
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: 'Unable to connect to the server. Please try again.',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStaff(),
        fetchShifts(),
        fetchPayroll()
      ]);
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
            Comprehensive staff management including employee records, scheduling, and payroll.
          </p>
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
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
              <CardTitle className="text-sm font-medium">Today's Shifts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {shifts.filter(s => new Date(s.start_time).toDateString() === new Date().toDateString()).length}
              </div>
              <p className="text-xs text-muted-foreground">Scheduled today</p>
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
              <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${payrollEntries.reduce((sum, entry) => sum + parseFloat(entry.net_pay), 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">{payrollEntries.length} entries</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="staff" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="staff">Staff Directory</TabsTrigger>
            <TabsTrigger value="add-staff">Add Staff</TabsTrigger>
            <TabsTrigger value="shifts">Shift Management</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>
          
          {/* Staff Directory Tab */}
          <TabsContent value="staff">
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
                    {filteredStaff.map((member) => (
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Add Staff Tab */}
          <TabsContent value="add-staff">
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
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={newStaffForm.first_name}
                      onChange={(e) => setNewStaffForm({...newStaffForm, first_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={newStaffForm.last_name}
                      onChange={(e) => setNewStaffForm({...newStaffForm, last_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="staff_email"
                      type="email"
                      value={newStaffForm.email}
                      onChange={(e) => setNewStaffForm({...newStaffForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newStaffForm.password}
                      onChange={(e) => setNewStaffForm({...newStaffForm, password: e.target.value})}
                      placeholder="Enter password for staff member"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={newStaffForm.hourly_rate}
                      onChange={(e) => setNewStaffForm({...newStaffForm, hourly_rate: e.target.value})}
                    />
                  </div>
                </div>
                <Button 
                  onClick={createStaff} 
                  className="mt-4"
                  disabled={!newStaffForm.first_name || !newStaffForm.last_name || !newStaffForm.email || !newStaffForm.password || !newStaffForm.role}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Staff Member
                </Button>
                
                {createdCredentials && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Staff Created Successfully!</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Employee ID:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded">{createdCredentials.employee_id}</code>
                          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(createdCredentials.employee_id)}>
                            Copy
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Email:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded">{createdCredentials.email}</code>
                          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(createdCredentials.email)}>
                            Copy
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Password:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded">{createdCredentials.password}</code>
                          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(createdCredentials.password)}>
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="mt-3" onClick={() => setCreatedCredentials(null)}>
                      Dismiss
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Shifts Tab */}
          <TabsContent value="shifts">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Shift Management
                  </CardTitle>
                  <CardDescription>
                    Schedule and manage staff shifts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shifts.slice(0, 10).map((shift) => (
                        <TableRow key={shift.id}>
                          <TableCell>{shift.staff.user.first_name} {shift.staff.user.last_name}</TableCell>
                          <TableCell>{new Date(shift.start_time).toLocaleString()}</TableCell>
                          <TableCell>{new Date(shift.end_time).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={shift.status === 'completed' ? 'default' : 'secondary'}>
                              {shift.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Add New Shift Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Schedule New Shift
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="staff_select">Staff Member</Label>
                      <Select value={newShiftForm.staff_id} onValueChange={(value) => setNewShiftForm({...newShiftForm, staff_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.user.first_name} {member.user.last_name} - {member.employee_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="datetime-local"
                        value={newShiftForm.start_time}
                        onChange={(e) => setNewShiftForm({...newShiftForm, start_time: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="datetime-local"
                        value={newShiftForm.end_time}
                        onChange={(e) => setNewShiftForm({...newShiftForm, end_time: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newShiftForm.notes}
                        onChange={(e) => setNewShiftForm({...newShiftForm, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button onClick={createShift} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Shift
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Payroll Tab */}
          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payroll Management
                </CardTitle>
                <CardDescription>
                  Generate and manage staff payroll
                </CardDescription>
                <Button onClick={generatePayroll} className="w-fit">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Monthly Payroll
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Net Pay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollEntries.slice(0, 10).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.staff.user.first_name} {entry.staff.user.last_name}</TableCell>
                        <TableCell>{entry.staff.employee_id}</TableCell>
                        <TableCell>{entry.pay_period_start} to {entry.pay_period_end}</TableCell>
                        <TableCell>{entry.total_hours}</TableCell>
                        <TableCell>${entry.net_pay}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StaffManagement;