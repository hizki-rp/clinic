import React, { useState } from 'react';
import { API_BASE_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface AddStaffFormProps {
  onStaffAdded: () => void;
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({ onStaffAdded }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    specialization: '',
    hire_date: new Date().toISOString().split('T')[0],
    hourly_rate: '25.00'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const roles = ['doctor', 'nurse', 'reception', 'laboratory', 'admin'];
  const departments = ['Emergency', 'Cardiology', 'Pediatrics', 'Surgery', 'Radiology', 'Administration'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/healthcare/staff/onboard/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`Staff member created successfully!\nEmployee ID: ${result.employee_id}\nTemporary Password: ${result.temporary_password}`);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          role: '',
          department: '',
          specialization: '',
          hire_date: new Date().toISOString().split('T')[0],
          hourly_rate: '25.00'
        });
        onStaffAdded();
      } else {
        const errorData = await response.json();
        setMessage('Error: ' + (errorData.error || 'Failed to create staff member'));
      }
    } catch (error) {
      setMessage('Error: Failed to create staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            required
          />
          <Input
            placeholder="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            required
          />
        </div>
        
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        
        <Input
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        
        <Input
          placeholder="Specialization (optional)"
          value={formData.specialization}
          onChange={(e) => setFormData({...formData, specialization: e.target.value})}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            value={formData.hire_date}
            onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
            required
          />
          <Input
            type="number"
            placeholder="Hourly Rate"
            value={formData.hourly_rate}
            onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Add Staff Member'}
        </Button>
      </form>
      
      {message && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <pre className="whitespace-pre-wrap text-sm">{message}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddStaffForm;