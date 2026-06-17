'use client';

import { useState, useCallback } from 'react';
import type { AppointmentStatus } from '@/types';

interface Filters {
  status?: AppointmentStatus | '';
  search?: string;
  date?: string;
}

interface AppointmentFiltersProps {
  onFilter: (filters: Filters) => void;
}

export function AppointmentFilters({ onFilter }: AppointmentFiltersProps) {
  const [filters, setFilters] = useState<Filters>({ status: '', search: '', date: '' });

  const update = useCallback(
    (key: keyof Filters, value: string) => {
      const next = { ...filters, [key]: value };
      setFilters(next);
      onFilter(next);
    },
    [filters, onFilter]
  );

  const reset = () => {
    const cleared = { status: '' as const, search: '', date: '' };
    setFilters(cleared);
    onFilter(cleared);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Search */}
      <div>
        <label className="input-label">Patient Name</label>
        <input
          type="text"
          value={filters.search ?? ''}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Search by name..."
          className="input-field w-52"
        />
      </div>

      {/* Status */}
      <div>
        <label className="input-label">Status</label>
        <select
          value={filters.status ?? ''}
          onChange={(e) => update('status', e.target.value)}
          className="select-field w-44"
        >
          <option value="">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="input-label">Date</label>
        <input
          type="date"
          value={filters.date ?? ''}
          onChange={(e) => update('date', e.target.value)}
          className="input-field w-44"
        />
      </div>

      {/* Reset */}
      <button onClick={reset} className="btn-secondary py-2">
        Reset
      </button>
    </div>
  );
}
