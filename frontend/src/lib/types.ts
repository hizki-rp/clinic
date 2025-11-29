export type Status = "pending" | "scheduled" | "cancelled";

export interface SearchParamProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export interface Appointment {
  patient: { name: string, image?: string };
  schedule: string;
  status: Status;
  primaryPhysician: string;
  reason: string;
  note: string;
  userId: string;
  cancellationReason: string | null;
}