import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AppointmentSuccess() {
  const { userId } = useParams();

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-card rounded-lg p-8 border">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Appointment Scheduled!</h1>
            <p className="text-muted-foreground">
              Your appointment has been successfully scheduled.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/">Return Home</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/patients/${userId}/new-appointment`}>Schedule Another</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}