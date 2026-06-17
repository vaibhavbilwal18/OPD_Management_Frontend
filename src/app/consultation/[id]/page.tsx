'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { prescriptionsApi } from '@/lib/api';
import { PatientInfo } from '@/components/consultation/PatientInfo';
import { VitalsSection } from '@/components/consultation/VitalsSection';
import { SymptomsSection } from '@/components/consultation/SymptomsSection';
import { DiagnosisSection } from '@/components/consultation/DiagnosisSection';
import { MedicinesSection } from '@/components/consultation/MedicinesSection';
import { InjectionsSection } from '@/components/consultation/InjectionsSection';
import { LabTestsSection } from '@/components/consultation/LabTestsSection';
import { AdviceSection } from '@/components/consultation/AdviceSection';
import { ConsultationActionBar } from '@/components/consultation/ConsultationActionBar';
import { PageLoader } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { statusLabel } from '@/lib/utils';

export default function ConsultationPage() {
  const { id: appointmentId } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: prescription, isLoading, isError, error } = useQuery({
    queryKey: ['consultation', appointmentId],
    queryFn: () => prescriptionsApi.getByAppointment(appointmentId),
    refetchInterval: false,
    staleTime: 0,
  });

  if (isLoading) return <PageLoader message="Loading consultation..." />;

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-lg font-semibold text-red-600">Failed to load consultation</p>
        <p className="text-sm text-gray-500">{(error as Error)?.message}</p>
        <button onClick={() => router.push('/appointments')} className="btn-primary">
          ← Back to Appointments
        </button>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-sm text-gray-500">No prescription found for this appointment.</p>
        <button onClick={() => router.push('/appointments')} className="btn-primary">← Back</button>
      </div>
    );
  }

  const { appointment, isLocked } = prescription;
  const { patient, doctor } = appointment;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/appointments')} className="btn-ghost py-1.5 text-sm">
                ← Appointments
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-sm font-semibold text-gray-800">Consultation</span>
            </div>
            <Badge
              variant={
                appointment.status === 'COMPLETED'
                  ? 'success'
                  : appointment.status === 'IN_PROGRESS'
                  ? 'warning'
                  : 'info'
              }
            >
              {statusLabel(appointment.status)}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8">
        {/* Patient Info Banner */}
        <div className="mb-6">
          <PatientInfo
            patient={patient}
            doctor={doctor}
            appointmentDate={appointment.appointmentDate}
            appointmentId={appointmentId}
          />
        </div>

        {/* Prescription Sections */}
        <div className="space-y-4">
          <VitalsSection
            prescriptionId={prescription.id}
            vitals={prescription.vitals}
            isLocked={isLocked}
            appointmentId={appointmentId}
          />

          <SymptomsSection
            prescriptionId={prescription.id}
            symptoms={prescription.symptoms}
            isLocked={isLocked}
            appointmentId={appointmentId}
          />

          <DiagnosisSection
            prescriptionId={prescription.id}
            diagnoses={prescription.diagnoses}
            isLocked={isLocked}
            appointmentId={appointmentId}
          />

          <MedicinesSection
            prescriptionId={prescription.id}
            medicines={prescription.medicines}
            isLocked={isLocked}
            appointmentId={appointmentId}
          />

          <InjectionsSection
            prescriptionId={prescription.id}
            injections={prescription.injections}
            isLocked={isLocked}
            appointmentId={appointmentId}
          />

          <LabTestsSection
            prescriptionId={prescription.id}
            labTests={prescription.labTests}
            isLocked={isLocked}
            appointmentId={appointmentId}
          />

          <AdviceSection
            prescriptionId={prescription.id}
            advice={prescription.advice}
            isLocked={isLocked}
            appointmentId={appointmentId}
          />
        </div>
      </main>

      {/* Sticky bottom action bar */}
      <ConsultationActionBar
        appointmentId={appointmentId}
        prescription={prescription}
        isLocked={isLocked}
      />
    </div>
  );
}
