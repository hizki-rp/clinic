'use client';
import { usePatientQueue } from '@/context/PatientQueueContext';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useMemo } from 'react';
import { Patient } from '@/context/PatientQueueContext';
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';


// Utility component for a field with a ruled line, adapted for read-only data
const LineField = ({ label, value, className = 'col-span-2' }: { label: string; value?: string | number; className?: string }) => (
    <div className={`relative ${className} pt-4 pb-1`}>
        <label className="input-label">{label}</label>
        <div className="w-full line-input h-[26px] flex items-end">
            <span>{value || ''}</span>
        </div>
    </div>
);

// Component for a single drug row in the Rx table
const DrugRow = ({ drug }: { drug: { name: string; dose: string; frequency: string; duration: string; } }) => (
    <div className="contents rx-row-content">
        <div className="rx-cell col-span-2 flex items-center">{drug.name}</div>
        <div className="rx-cell flex items-center"></div> {/* Dosage Form - Empty */}
        <div className="rx-cell flex items-center">{drug.dose}</div>
        <div className="rx-cell flex items-center">{drug.frequency}</div>
        <div className="rx-cell flex items-center">{drug.duration}</div>
        <div className="rx-cell flex items-center"></div> {/* Qty - Empty */}
        <div className="rx-cell flex items-center"></div> {/* How to use - Empty */}
        <div className="rx-cell flex items-center justify-between border-r-0"></div> {/* Price - Empty */}
    </div>
);

const PrescriptionPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { getPatientById } = usePatientQueue();
    const [patient, setPatient] = useState<Patient | null>(null);

    useEffect(() => {
        if (userId) {
            const foundPatient = getPatientById(userId as string);
            setPatient(foundPatient || null);
        }
    }, [userId, getPatientById]);
    
    const prescriptionItems = useMemo(() => {
        if (!patient?.prescription) return [];
        return patient.prescription.split('\n').map(line => {
            const parts = line.split(',');
            return {
                name: parts[0]?.trim() || '',
                dose: parts[1]?.trim() || '',
                frequency: parts[2]?.trim() || '',
                duration: parts[3]?.trim() || '',
            };
        });
    }, [patient]);


    const handlePrint = () => {
        window.print();
    };

    if (!patient) {
        if (typeof window !== 'undefined' && !getPatientById(userId as string)) {
            navigate('/404');
            return null;
        }
        return <div className="flex justify-center items-center h-screen"><p>Loading prescription...</p></div>;
    }

    return (
        <>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-container, .print-container * {
                        visibility: visible;
                    }
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        padding: 0;
                        margin: 0;
                    }
                    .prescription-paper {
                        box-shadow: none;
                        border: none;
                        margin: 0;
                        width: 100%;
                        height: 100%;
                        padding: 0.5in; /* Maintain padding for print */
                    }
                    .print-hide {
                        display: none;
                    }
                }
                .prescription-paper {
                    width: 8.5in;
                    height: 11in;
                    background-color: white;
                    border: 1px solid #ccc;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    padding: 0.5in;
                    font-size: 0.85em;
                    color: #333;
                    overflow: hidden;
                    position: relative;
                }
                .line-input {
                    border-bottom: 1px solid #888;
                    padding-bottom: 2px;
                    width: 100%;
                    background: none;
                }
                .input-label {
                    font-size: 0.65em;
                    color: #555;
                    position: absolute;
                    top: 0;
                    left: 0;
                    white-space: nowrap;
                }
                .rx-header-cell {
                    font-weight: 600;
                    padding: 4px 6px;
                    border-bottom: 1px solid #ddd;
                    background-color: #f9fafb;
                    white-space: nowrap;
                    overflow: hidden;
                    text-align: left;
                    font-size: 0.8em;
                }
                .rx-cell {
                    padding: 4px 6px;
                    border-right: 1px dotted #e0e0e0;
                    border-bottom: 1px dotted #e0e0e0;
                    min-height: 2.2rem; /* Ensure minimal row height */
                    display: flex;
                    align-items: center;
                    font-size: 0.85em;
                }
                .rx-row-content > .rx-cell:last-child {
                    border-right: none;
                }
            `}</style>

            <main className="flex flex-col items-center bg-gray-200 p-4 sm:p-8 print-container">

                <div className="prescription-paper">

                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                        <div className="text-center transform -rotate-45 text-black opacity-[0.03] tracking-widest leading-tight select-none">
                            <p className="text-5xl font-extrabold">MENAHARIA MEDIUM CLINIC</p>
                            <p className="text-3xl mt-2">022 331 77 57 / ASELLA</p>
                        </div>
                    </div>

                    <div className="relative z-10 h-full">
                        {/* Clinic Header */}
                        <div className="absolute top-8 right-8 text-right leading-none text-gray-800">
                            <h1 className="text-xl font-extrabold text-indigo-700">Menaharia Medium Clinic</h1>
                            <p className="text-xs text-gray-600 mt-1">☎: 022 331 77 57 / Asella</p>
                        </div>

                        {/* Title */}
                        <h2 className="absolute top-[2.2in] left-8 font-bold uppercase text-base tracking-widest text-gray-800">
                            Prescription Paper
                        </h2>

                        {/* Patient Information */}
                        <div className="absolute top-[2.8in] left-8 w-[calc(100%-4rem)] grid grid-cols-6 gap-x-4 gap-y-1 text-sm">
                            <LineField label="Patient's Full Name" className="col-span-2" value={patient.name} />
                            <LineField label="Sex" className="col-span-1" value={patient.sex} />
                            <LineField label="Age" className="col-span-1" value={patient.age} />
                            <LineField label="Weight" className="col-span-1" value="" />
                            <LineField label="Card No." className="col-span-1" value={patient.id} />
                            
                            <LineField label="Tel No." className="col-span-2" value={patient.phone} />
                             <LineField label="Region" className="col-span-2" />
                            <LineField label="Town" className="col-span-2" />
                            
                            <LineField label="Address" className="col-span-6" value={patient.address} />

                            <div className="col-span-6 flex space-x-6 mt-4 text-xs">
                                <label className="flex items-center text-gray-700 font-medium">
                                    <input type="radio" name="patient_type" className="h-3 w-3 text-indigo-600 border-gray-300 rounded mr-1" />
                                    Inpatient
                                </label>
                                <label className="flex items-center text-gray-700 font-medium">
                                    <input type="radio" name="patient_type" defaultChecked className="h-3 w-3 text-indigo-600 border-gray-300 rounded mr-1" />
                                    Outpatient
                                </label>
                            </div>
                        </div>

                        {/* Diagnosis */}
                        <div className="absolute top-[4.8in] left-8 w-[calc(100%-4rem)] h-16 border-b border-gray-500 pt-4">
                            <label className="input-label">Diagnosis</label>
                            <div className="w-full h-full resize-none bg-none text-base p-1">
                                {patient.diagnosis}
                            </div>
                        </div>

                        {/* Rx Medication Table */}
                        <div className="absolute top-[5.6in] left-8 w-[calc(100%-4rem)]">
                            <div className="text-xl font-bold mb-1 -mt-3 relative z-10 bg-white inline-block pr-2">Rx</div>
                            
                            <div className="border border-gray-300 rounded-sm grid grid-cols-[2fr_1fr_0.5fr_0.5fr_0.5fr_0.5fr_1.5fr_1fr]">
                                <div className="contents text-left text-xs uppercase tracking-wider">
                                    <div className="rx-header-cell col-span-2">Drug name / Strength</div>
                                    <div className="rx-header-cell">Dosage Form</div>
                                    <div className="rx-header-cell">Dose</div>
                                    <div className="rx-header-cell">Freq.</div>
                                    <div className="rx-header-cell">Dur.</div>
                                    <div className="rx-header-cell">Qty.</div>
                                    <div className="rx-header-cell">How to use & Other Info</div>
                                    <div className="rx-header-cell border-r-0">Price</div>
                                </div>

                                {prescriptionItems.map((item, index) => (
                                    <DrugRow key={index} drug={item} />
                                ))}
                                {Array.from({ length: Math.max(0, 6 - prescriptionItems.length) }).map((_, index) => (
                                    <DrugRow key={`empty-${index}`} drug={{ name: '', dose: '', frequency: '', duration: '' }} />
                                ))}


                                <div className="contents border-t border-gray-300 bg-gray-50 text-xs font-semibold">
                                    <div className="col-span-7 p-2 text-right flex items-center justify-end">Price (dispenser's use only)</div>
                                    <div className="p-2 border-l border-gray-300 flex items-center">
                                       <div className="w-full bg-none text-right font-bold text-gray-800 h-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Signatures */}
                        <div className="absolute bottom-8 left-8 w-[calc(100%-4rem)] grid grid-cols-2 gap-x-10 text-sm">
                            <div>
                                <h3 className="font-bold mb-2 text-gray-700">Prescriber's</h3>
                                <div className="space-y-3">
                                    <LineField label="Full Name" value="Dr. Sarah Lee" />
                                    <LineField label="Qualification" value="General Practitioner" />
                                    <LineField label="Registration" value="MD-12345" />
                                    <LineField label="Date" value={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="mt-8 pt-2 border-b border-gray-800 relative text-center">
                                    <span className="text-xs text-gray-500 absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 bg-white px-2">Signature</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold mb-2 text-gray-700">Dispenser's</h3>
                                <div className="space-y-3">
                                    <LineField label="Total Price" />
                                    <LineField label="Dispenser's Info" />
                                    <div className="pt-4" />
                                    <div className="pt-4" />
                                </div>
                                <div className="mt-8 pt-2 border-b border-gray-800 relative text-center">
                                    <span className="text-xs text-gray-500 absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 bg-white px-2">Signature</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center py-8 print-hide">
                    <Button onClick={handlePrint} size="lg" className="rounded-full shadow-lg">
                        <Printer className="mr-2" />
                        Generate/Print Prescription
                    </Button>
                </div>
            </main>
        </>
    );
};

export default PrescriptionPage;