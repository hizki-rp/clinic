import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PasskeyModal() {
  const [passkey, setPasskey] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === '123456') {
      navigate('/admin');
    } else {
      alert('Invalid passkey');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Admin Access</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="passkey" className="block text-sm font-medium mb-2">
              Enter Admin Passkey
            </label>
            <input
              type="password"
              id="passkey"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="Enter passkey (hint: 123456)"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Access Admin
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}