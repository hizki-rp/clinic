import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NewAppointment() {
  const { userId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Schedule New Appointment</h1>
      <div className="max-w-2xl">
        <div className="bg-card rounded-lg p-6 border">
          <p className="text-muted-foreground mb-4">
            Scheduling appointment for user ID: {userId}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Appointment scheduling form will be implemented here.
          </p>
          <Button asChild>
            <Link to={`/patients/${userId}/new-appointment/success`}>
              Mock Success
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}