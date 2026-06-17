import type { Patient, Doctor } from '@/types';
import { genderLabel, formatDateTime } from '@/lib/utils';

interface PatientInfoProps {
  patient: Patient;
  doctor: Doctor;
  appointmentDate: string;
  appointmentId: string;
}

function InfoField({ label, value, highlight }: { label: string; value?: string | null; highlight?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className={`mt-0.5 text-sm ${highlight ? 'font-semibold text-red-600' : 'text-gray-900'}`}>
        {value}
      </dd>
    </div>
  );
}

export function PatientInfo({ patient, doctor, appointmentDate, appointmentId }: PatientInfoProps) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-primary-700 to-primary-900 px-5 py-4 text-white shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Patient details */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold">{patient.name}</h2>
              <p className="text-sm text-primary-200">
                {patient.age} yrs • {genderLabel(patient.gender)} • {patient.mobile}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {patient.medicalHistory && (
              <div className="col-span-2 sm:col-span-3">
                <p className="text-xs font-medium text-primary-300">Medical History</p>
                <p className="text-sm text-white">{patient.medicalHistory}</p>
              </div>
            )}
            {patient.allergies && (
              <div className="col-span-2 sm:col-span-3">
                <p className="text-xs font-medium text-red-300">⚠ Allergies</p>
                <p className="text-sm font-semibold text-red-200">{patient.allergies}</p>
              </div>
            )}
          </div>
        </div>

        {/* Appointment / Doctor info */}
        <div className="rounded-lg bg-white/10 px-4 py-3 text-sm">
          <dl className="space-y-1.5">
            <div>
              <dt className="text-xs text-primary-300">Appointment Date</dt>
              <dd className="font-medium">{formatDateTime(appointmentDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-primary-300">Doctor</dt>
              <dd className="font-medium">{doctor.name}</dd>
              {doctor.specialization && (
                <dd className="text-xs text-primary-300">{doctor.specialization}</dd>
              )}
            </div>
            <div>
              <dt className="text-xs text-primary-300">Appt. ID</dt>
              <dd className="font-mono text-xs">{appointmentId.slice(0, 8).toUpperCase()}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
