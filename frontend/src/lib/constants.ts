import { PlaceHolderImages } from "./placeholder-images";
import { type Status } from "./types";

export const Doctors = [
  {
    image: PlaceHolderImages.find(img => img.id === 'dr-alcantara')?.imageUrl ?? '',
    name: "John Alcantara",
  },
  {
    image: PlaceHolderImages.find(img => img.id === 'dr-lee')?.imageUrl ?? '',
    name: "Sarah Lee",
  },
  {
    image: PlaceHolderImages.find(img => img.id === 'dr-williams')?.imageUrl ?? '',
    name: "David Williams",
  },
];

export const IdentificationTypes = [
  "Birth Certificate",
  "Driver's License",
  "Medical Insurance Card/Policy",
  "Military ID Card",
  "National Identity Card",
  "Passport",
  "Resident Alien Card (Green Card)",
  "Social Security Card",
  "State ID Card",
  "Student ID Card",
  "Voter ID Card",
];

export const PatientFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),
  gender: "Male" as "Male" | "Female",
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  primaryPhysician: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  identificationType: "Birth Certificate",
  identificationNumber: "",
  identificationDocument: [],
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,
};

export const Genders = ["Male", "Female", "Other"];

export const appointments = [
    {
      patient: { name: 'John Doe', image: PlaceHolderImages.find(p => p.id === 'dr-alcantara')?.imageUrl },
      schedule: '2024-08-15T10:00:00',
      status: 'scheduled' as Status,
      primaryPhysician: 'Dr. Sarah Lee',
      reason: 'Check-up',
      note: 'Feeling tired lately.',
      userId: 'user1',
      cancellationReason: null,
    },
    {
      patient: { name: 'Jane Smith', image: PlaceHolderImages.find(p => p.id === 'dr-lee')?.imageUrl },
      schedule: '2024-08-16T11:30:00',
      status: 'pending' as Status,
      primaryPhysician: 'Dr. David Williams',
      reason: 'Sore throat',
      note: 'Needs a quick check.',
      userId: 'user2',
      cancellationReason: null,
    },
    {
      patient: { name: 'Alice Johnson', image: PlaceHolderImages.find(p => p.id === 'dr-williams')?.imageUrl },
      schedule: '2024-08-17T14:00:00',
      status: 'cancelled' as Status,
      primaryPhysician: 'Dr. John Alcantara',
      reason: 'Follow-up',
      note: 'Previous test results review.',
      userId: 'user3',
      cancellationReason: 'Scheduling conflict.',
    },
  ];