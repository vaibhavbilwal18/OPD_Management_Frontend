'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SectionCard } from './SectionCard';
import { AutocompleteSearch } from '@/components/shared/AutocompleteSearch';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { mastersApi, prescriptionsApi } from '@/lib/api';
import { PRIORITY_LABELS } from '@/lib/utils';
import type { PrescriptionLabTest, LabTestFormItem, Priority } from '@/types';

interface LabTestsSectionProps {
  prescriptionId: string;
  labTests: PrescriptionLabTest[];
  isLocked: boolean;
  appointmentId: string;
}

const priorityVariant = { ROUTINE: 'success', URGENT: 'warning', STAT: 'danger' } as const;

export function LabTestsSection({ prescriptionId, labTests, isLocked, appointmentId }: LabTestsSectionProps) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<LabTestFormItem[]>(
    labTests.map((lt, i) => ({
      id: lt.id,
      labTestId: lt.labTestId,
      testName: lt.testName,
      priority: lt.priority,
      notes: lt.notes ?? '',
      sortOrder: i,
    }))
  );

  const saveMutation = useMutation({
    mutationFn: (data: LabTestFormItem[]) => prescriptionsApi.saveLabTests(prescriptionId, data),
    onSuccess: () => {
      toast.success('Lab tests saved');
      queryClient.invalidateQueries({ queryKey: ['consultation', appointmentId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleAdd = useCallback(
    (option: { id: string; name: string }) => {
      if (items.find((i) => i.testName === option.name)) { toast.error('Test already added'); return; }
      setItems((prev) => [
        ...prev,
        { labTestId: option.id === '__new__' ? null : option.id, testName: option.name, priority: 'ROUTINE', notes: '', sortOrder: prev.length },
      ]);
    },
    [items]
  );

  const handleChange = (idx: number, field: keyof LabTestFormItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleRemove = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    saveMutation.mutate(updated);
  };

  const handleSave = () => {
    if (items.some((i) => !i.testName || !i.priority)) {
      toast.error('Test name and priority are required');
      return;
    }
    saveMutation.mutate(items.map((m, i) => ({ ...m, sortOrder: i })));
  };

  return (
    <SectionCard
      title="Lab Tests"
      count={items.length}
      isLocked={isLocked}
      accentColor="bg-teal-500"
      onAdd={() => {}}
    >
      {!isLocked && (
        <div className="mb-4">
          <AutocompleteSearch
            placeholder="Search lab test (e.g. CBC)..."
            onSearch={async (q) => {
              const r = await mastersApi.searchLabTests(q);
              return r.map((lt) => ({ id: lt.id, name: lt.name, meta: lt.category ?? undefined }));
            }}
            onSelect={handleAdd}
          />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState title="No lab tests ordered" description={isLocked ? '' : 'Search above to order tests.'} />
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.testName}</p>
                {item.notes && <p className="text-xs text-gray-500">{item.notes}</p>}
              </div>

              {isLocked ? (
                <Badge variant={priorityVariant[item.priority as Priority] ?? 'default'}>
                  {PRIORITY_LABELS[item.priority as Priority] ?? item.priority}
                </Badge>
              ) : (
                <>
                  <select
                    value={item.priority}
                    onChange={(e) => handleChange(idx, 'priority', e.target.value)}
                    className="select-field w-32"
                  >
                    {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                  <input
                    value={item.notes ?? ''}
                    onChange={(e) => handleChange(idx, 'notes', e.target.value)}
                    className="input-field w-48"
                    placeholder="Notes (optional)"
                  />
                  <button onClick={() => handleRemove(idx)} className="btn-danger p-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLocked && items.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button onClick={handleSave} disabled={saveMutation.isPending} className="btn-primary">
            {saveMutation.isPending ? <><Spinner size="sm" />Saving...</> : 'Save Lab Tests'}
          </button>
        </div>
      )}
    </SectionCard>
  );
}
