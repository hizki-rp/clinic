import { useParams } from 'react-router-dom';

export default function PatientRegister() {
  const { userId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Patient Registration</h1>
      <div className="max-w-2xl">
        <div className="bg-card rounded-lg p-6 border">
          <p className="text-muted-foreground mb-4">
            Registering patient for user ID: {userId}
          </p>
          <p className="text-sm text-muted-foreground">
            Patient registration form will be implemented here with all the fields from the original Next.js application.
          </p>
        </div>
      </div>
    </div>
  );
}