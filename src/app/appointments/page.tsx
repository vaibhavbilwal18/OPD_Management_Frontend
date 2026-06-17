'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api';
import { AppointmentTable } from '@/components/appointments/AppointmentTable';
import { AppointmentFilters } from '@/components/appointments/AppointmentFilters';
import { Pagination } from '@/components/appointments/Pagination';
import type { AppointmentStatus } from '@/types';

interface Filters {
  status?: AppointmentStatus | '';
  search?: string;
  date?: string;
}

export default function AppointmentsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['appointments', page, filters],
    queryFn: () =>
      appointmentsApi.list({
        page,
        limit: 10,
        status: filters.status || undefined,
        search: filters.search || undefined,
        date: filters.date || undefined,
        sortBy: 'appointmentDate',
        sortOrder: 'asc',
      }),
  });

  const handleFilter = useCallback((f: Filters) => {
    setFilters(f);
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">OPD Management</h1>
              <p className="text-xs text-gray-500">Patient Appointments</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
            <p className="text-sm text-gray-500">
              {data?.meta?.total ?? 0} total appointments
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">OPD Live</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <AppointmentFilters onFilter={handleFilter} />
        </div>

        {/* Table */}
        <div className="section-card overflow-hidden">
          {isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-red-600">Failed to load appointments</p>
              <p className="mt-1 text-xs text-gray-500">Please check your connection and try again.</p>
            </div>
          ) : (
            <>
              <AppointmentTable
                appointments={data?.data ?? []}
                isLoading={isLoading}
              />
              {data?.meta && data.meta.totalPages > 1 && (
                <Pagination meta={data.meta} onPageChange={setPage} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
