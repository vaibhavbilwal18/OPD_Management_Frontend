'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Appointment } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime, statusLabel, genderLabel } from '@/lib/utils';
import { consultationsApi } from '@/lib/api';
import { useState } from 'react';

type BadgeVariant = 'info' | 'warning' | 'success' | 'default';

const statusVariant: Record<string, BadgeVariant> = {
  SCHEDULED: 'info',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
};

interface AppointmentTableProps {
  appointments: Appointment[];
  isLoading: boolean;
}

export function AppointmentTable({ appointments, isLoading }: AppointmentTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openingId, setOpeningId] = useState<string | null>(null);

  const openMutation = useMutation({
    mutationFn: consultationsApi.open,
    onSuccess: (_, appointmentId) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.push(`/consultation/${appointmentId}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setOpeningId(null);
    },
  });

  const handleOpen = (appointmentId: string) => {
    setOpeningId(appointmentId);
    openMutation.mutate(appointmentId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return <EmptyState title="No appointments found" description="Try adjusting your filters." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            {['Appt. ID', 'Patient', 'Age/Gender', 'Date & Time', 'Status', 'Action'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {appointments.map((appt) => (
            <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-gray-500">{appt.id.slice(0, 8).toUpperCase()}</span>
              </td>
              <td className="px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">{appt.patient.name}</p>
                <p className="text-xs text-gray-500">{appt.patient.mobile}</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {appt.patient.age} yrs / {genderLabel(appt.patient.gender)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatDateTime(appt.appointmentDate)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[appt.status] ?? 'default'}>
                  {statusLabel(appt.status)}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {appt.status === 'COMPLETED' ? (
                  <button
                    onClick={() => router.push(`/consultation/${appt.id}`)}
                    className="btn-ghost text-xs"
                  >
                    View
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpen(appt.id)}
                    disabled={openingId === appt.id}
                    className="btn-primary py-1.5 text-xs"
                  >
                    {openingId === appt.id ? (
                      <>
                        <Spinner size="sm" />
                        Opening...
                      </>
                    ) : (
                      'Open Consultation'
                    )}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
