import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/constants';
import { Users, Plus, Edit, Trash2, Search } from 'lucide-react';

interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hire_date: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  specialization?: string;
  license_number?: string;
  employee_id?: string;
  hourly_rate?: string;
}

interface StaffFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  specialization: string;
  license_number: string;
  hire_date: string;
  hourly_rate: string;
}

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    specialization: '',
    license_number: '',
    hire_date: new Date().toISOString().split('T')[0],
    hourly_rate: '25.00'
  });

  const roles = ['doctor', 'nurse', 'reception', 'admin', 'laboratory'];
  const departments = ['Emergency', 'Cardiology', 'Pediatrics', 'Surgery', 'Radiology', 'Administration'];

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, filterRole, filterDepartment]);

  const fetchStaff = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/healthcare/staff/`);
      if (response.ok) {
        const data = await response.json();
        // Transform backend data to match component expectations
        const transformedData = data.map((staff: any) => ({
          id: staff.id,
          first_name: staff.user?.first_name || '',
          last_name: staff.user?.last_name || '',
          email: staff.user?.email || '',
          phone: staff.user?.phone || '',
          role: staff.user?.role || '',
          department: staff.department,
          hire_date: staff.hire_date,
          status: staff.employment_status,
          employee_id: staff.employee_id,
          hourly_rate: staff.hourly_rate
        }));
        setStaff(transformedData);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const filterStaff = () => {
    let filtered = staff.filter(member => {
      const matchesSearch = `${member.first_name} ${member.last_name} ${member.email}`
        .toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !filterRole || member.role === filterRole;
      const matchesDepartment = !filterDepartment || member.department === filterDepartment;
      
      return matchesSearch && matchesRole && matchesDepartment;
    });
    setFilteredStaff(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        // Update existing staff
        const response = await fetch(`${API_BASE_URL}/healthcare/staff/${editingStaff.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            employment_status: 'active',
            hourly_rate: formData.hourly_rate || '25.00'
          })
        });
        
        if (response.ok) {
          fetchStaff();
          resetForm();
        }
      } else {
        // Create new staff using onboard endpoint
        const response = await fetch(`${API_BASE_URL}/healthcare/staff/onboard/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            department: formData.department,
            specialization: formData.specialization,
            hire_date: formData.hire_date || new Date().toISOString().split('T')[0],
            hourly_rate: formData.hourly_rate || '25.00'
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          alert(`Staff member created successfully!\nEmployee ID: ${result.employee_id}\nTemporary Password: ${result.temporary_password}`);
          fetchStaff();
          resetForm();
        } else {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          alert('Error creating staff member: ' + (errorData.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Error saving staff member');
    }
  };

  const handleEdit = (member: Staff) => {
    setEditingStaff(member);
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department,
      specialization: member.specialization || '',
      license_number: member.license_number || '',
      hire_date: member.hire_date || new Date().toISOString().split('T')[0],
      hourly_rate: member.hourly_rate || '25.00'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/healthcare/staff/${id}/`, { method: 'DELETE' });
        if (response.ok) {
          fetchStaff();
        }
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      specialization: '',
      license_number: '',
      hire_date: new Date().toISOString().split('T')[0],
      hourly_rate: '25.00'
    });
    setEditingStaff(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'on_leave': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{member.role}</div>
                    {member.specialization && (
                      <div className="text-xs text-gray-500">{member.specialization}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{member.department}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{member.phone}</div>
                    {member.license_number && (
                      <div className="text-xs text-gray-500">License: {member.license_number}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                      {member.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Specialization (optional)"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="License Number (optional)"
                value={formData.license_number}
                onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  placeholder="Hire Date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Hourly Rate"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingStaff ? 'Update' : 'Add'} Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;