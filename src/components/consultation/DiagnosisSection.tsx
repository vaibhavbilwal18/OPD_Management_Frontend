'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SectionCard } from './SectionCard';
import { AutocompleteSearch } from '@/components/shared/AutocompleteSearch';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { mastersApi, prescriptionsApi } from '@/lib/api';
import type { PrescriptionDiagnosis, DiagnosisFormItem } from '@/types';

interface DiagnosisSectionProps {
  prescriptionId: string;
  diagnoses: PrescriptionDiagnosis[];
  isLocked: boolean;
  appointmentId: string;
}

export function DiagnosisSection({ prescriptionId, diagnoses, isLocked, appointmentId }: DiagnosisSectionProps) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<DiagnosisFormItem[]>(
    diagnoses.map((d) => ({ id: d.id, diagnosisId: d.diagnosisId, diagnosisName: d.diagnosisName, notes: d.notes ?? '' }))
  );

  const saveMutation = useMutation({
    mutationFn: (data: DiagnosisFormItem[]) => prescriptionsApi.saveDiagnoses(prescriptionId, data),
    onSuccess: () => {
      toast.success('Diagnoses saved');
      queryClient.invalidateQueries({ queryKey: ['consultation', appointmentId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleAdd = useCallback(
    (option: { id: string; name: string }) => {
      if (items.find((i) => i.diagnosisName === option.name)) { toast.error('Diagnosis already added'); return; }
      setItems((prev) => [...prev, { diagnosisId: option.id === '__new__' ? null : option.id, diagnosisName: option.name, notes: '' }]);
    },
    [items]
  );

  const handleChange = (idx: number, field: keyof DiagnosisFormItem, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleRemove = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    saveMutation.mutate(updated);
  };

  const handleSave = () => {
    if (items.some((i) => !i.diagnosisName.trim())) { toast.error('Diagnosis name required'); return; }
    saveMutation.mutate(items);
  };

  return (
    <SectionCard
      title="Diagnosis"
      count={items.length}
      isLocked={isLocked}
      accentColor="bg-red-500"
      onAdd={() => {}}
    >
      {/* Required badge */}
      {!isLocked && (
        <div className="mb-4 flex items-center gap-2">
          <AutocompleteSearch
            placeholder="Search diagnosis (e.g. Viral Fever)..."
            onSearch={async (q) => {
              const r = await mastersApi.searchDiagnoses(q);
              return r.map((d) => ({ id: d.id, name: d.name, meta: d.icd10Code ?? undefined }));
            }}
            onSelect={handleAdd}
            className="flex-1"
          />
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
            Required (min. 1)
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No diagnosis added"
          description={isLocked ? '' : 'At least one diagnosis is required to complete the consultation.'}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 rounded-lg border border-red-100 bg-red-50 p-3">
              <div className="col-span-5">
                <label className="input-label">Diagnosis *</label>
                <input
                  value={item.diagnosisName}
                  onChange={(e) => handleChange(idx, 'diagnosisName', e.target.value)}
                  disabled={isLocked}
                  className="input-field"
                />
              </div>
              <div className="col-span-6">
                <label className="input-label">Clinical Notes</label>
                <input
                  value={item.notes ?? ''}
                  onChange={(e) => handleChange(idx, 'notes', e.target.value)}
                  disabled={isLocked}
                  className="input-field"
                  placeholder="Optional — stage, severity, etc."
                />
              </div>
              {!isLocked && (
                <div className="col-span-1 flex items-end">
                  <button onClick={() => handleRemove(idx)} className="btn-danger p-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLocked && items.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button onClick={handleSave} disabled={saveMutation.isPending} className="btn-primary">
            {saveMutation.isPending ? <><Spinner size="sm" />Saving...</> : 'Save Diagnoses'}
          </button>
        </div>
      )}
    </SectionCard>
  );
}
