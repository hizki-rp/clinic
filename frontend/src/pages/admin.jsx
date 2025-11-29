import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { usePatientQueue } from "../context/PatientQueueContext";
import PatientDataTable from "../components/PatientDataTable";
import AppointmentDataTable from "../components/AppointmentDataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { appointments } from "../lib/constants";

export default function AdminPage() {
  const { allPatients = [] } = usePatientQueue() || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(allPatients);

  useEffect(() => {
    const lowercasedSearchTerm = (searchTerm || "").toLowerCase();
    const results = (allPatients || []).filter((patient) => {
      const nameMatch = patient?.name?.toLowerCase().includes(lowercasedSearchTerm);
      const ageMatch = patient?.age?.toString().includes(lowercasedSearchTerm);
      const sexMatch = patient?.sex?.toLowerCase().includes(lowercasedSearchTerm);
      const addressMatch = patient?.address?.toLowerCase().includes(lowercasedSearchTerm);
      const phoneMatch = patient?.phone?.toLowerCase().includes(lowercasedSearchTerm);
      return nameMatch || ageMatch || sexMatch || addressMatch || phoneMatch;
    });
    setFilteredPatients(results);
  }, [searchTerm, allPatients]);

  const pendingAppointments = (allPatients || []).filter((p) => p.stage !== "Discharged").length;
  const dischargedPatients = (allPatients || []).filter((p) => p.stage === "Discharged").length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="admin-header">
        <Link to="/" className="cursor-pointer">
          <h1 className="text-2xl font-bold text-primary">Menaharia Medium Clinic</h1>
        </Link>
        <p className="text-16-semibold">Admin Dashboard</p>
      </header>

      <main className="admin-main flex flex-col gap-8">
        <section>
          <h1 className="header">Welcome 👋</h1>
          <p className="text-muted-foreground">Manage your clinic's patients and performance.</p>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard type="appointments" count={(allPatients || []).length} label="Total Patients" icon="/assets/icons/user.svg" />
          <StatCard type="pending" count={pendingAppointments} label="Pending Patients" icon="/assets/icons/pending.svg" />
          <StatCard type="discharged" count={dischargedPatients} label="Discharged Patients" icon="/assets/icons/discharged.svg" />
          <StatCard
            type="cancelled"
            count={(appointments || []).filter((a) => a.status === "cancelled").length}
            label="Cancelled Appointments"
            icon="/assets/icons/cancelled.svg"
          />
        </section>

        <Tabs defaultValue="patients" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <div className="bg-card p-6 rounded-lg shadow-md border mt-4">
              <h2 className="text-xl font-bold mb-4">Patients</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name, age, sex, phone, or address..."
                  className="w-full max-w-lg p-2 border rounded-md bg-background text-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <PatientDataTable data={filteredPatients} />
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <div className="bg-card p-6 rounded-lg shadow-md border mt-4">
              <h2 className="text-xl font-bold mb-4">Recent Appointments</h2>
              <AppointmentDataTable data={appointments} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}