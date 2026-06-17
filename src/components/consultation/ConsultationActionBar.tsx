'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { consultationsApi, pdfApi } from '@/lib/api';
import type { Prescription } from '@/types';

interface ConsultationActionBarProps {
  appointmentId: string;
  prescription: Prescription;
  isLocked: boolean;
}

export function ConsultationActionBar({ appointmentId, prescription, isLocked }: ConsultationActionBarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const completeMutation = useMutation({
    mutationFn: () => consultationsApi.complete(appointmentId),
    onSuccess: () => {
      toast.success('Consultation completed successfully!');
      setShowConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['consultation', appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setShowConfirm(false);
    },
  });

  const canComplete =
    prescription.diagnoses.length > 0 &&
    (prescription.medicines.length > 0 || prescription.injections.length > 0 || prescription.labTests.length > 0);

  return (
    <>
      <div className="sticky bottom-0 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <button onClick={() => router.push('/appointments')} className="btn-ghost">
            ← Back to Appointments
          </button>

          <div className="flex items-center gap-3">
            {/* PDF Download */}
            {isLocked && (
              <a
                href={pdfApi.downloadUrl(prescription.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </a>
            )}

            {/* Print */}
            <button
              onClick={() => window.open(pdfApi.htmlUrl(prescription.id), '_blank')}
              className="btn-secondary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Prescription
            </button>

            {/* Complete button */}
            {!isLocked && (
              <div className="flex items-center gap-2">
                {!canComplete && (
                  <div className="hidden max-w-xs text-right text-xs text-amber-600 sm:block">
                    {prescription.diagnoses.length === 0 && '⚠ Add at least 1 diagnosis.'}
                    {prescription.diagnoses.length > 0 &&
                      prescription.medicines.length === 0 &&
                      prescription.injections.length === 0 &&
                      prescription.labTests.length === 0 &&
                      '⚠ Add at least 1 treatment.'}
                  </div>
                )}
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={!canComplete}
                  className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Complete Consultation
                </button>
              </div>
            )}

            {isLocked && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-800">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Consultation Completed
              </span>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Complete Consultation"
        description="This will lock the prescription and mark the appointment as Completed. This action cannot be undone."
        confirmLabel="Yes, Complete"
        onConfirm={() => completeMutation.mutate()}
        onCancel={() => setShowConfirm(false)}
        isLoading={completeMutation.isPending}
        variant="primary"
      />
    </>
  );
}
