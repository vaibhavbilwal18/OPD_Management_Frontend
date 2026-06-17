'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SectionCard } from './SectionCard';
import { AutocompleteSearch } from '@/components/shared/AutocompleteSearch';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { mastersApi, prescriptionsApi } from '@/lib/api';
import { SEVERITY_LABELS } from '@/lib/utils';
import type { PrescriptionSymptom, SymptomFormItem, Severity } from '@/types';

interface SymptomsSectionProps {
  prescriptionId: string;
  symptoms: PrescriptionSymptom[];
  isLocked: boolean;
  appointmentId: string;
}

export function SymptomsSection({ prescriptionId, symptoms, isLocked, appointmentId }: SymptomsSectionProps) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<SymptomFormItem[]>(
    symptoms.map((s) => ({
      id: s.id,
      symptomId: s.symptomId,
      symptomName: s.symptomName,
      duration: s.duration ?? '',
      severity: s.severity ?? '',
      notes: s.notes ?? '',
    }))
  );

  const saveMutation = useMutation({
    mutationFn: (data: SymptomFormItem[]) => prescriptionsApi.saveSymptoms(prescriptionId, data),
    onSuccess: () => {
      toast.success('Symptoms saved');
      queryClient.invalidateQueries({ queryKey: ['consultation', appointmentId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleAddFromSearch = useCallback(
    (option: { id: string; name: string }) => {
      if (items.find((i) => i.symptomName === option.name)) {
        toast.error('Symptom already added');
        return;
      }
      setItems((prev) => [
        ...prev,
        { symptomId: option.id === '__new__' ? null : option.id, symptomName: option.name, duration: '', severity: '', notes: '' },
      ]);
    },
    [items]
  );

  const handleChange = (idx: number, field: keyof SymptomFormItem, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleRemove = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    saveMutation.mutate(updated);
  };

  const handleSave = () => {
    if (items.some((i) => !i.symptomName.trim())) { toast.error('Symptom name is required'); return; }
    saveMutation.mutate(items);
  };

  return (
    <SectionCard
      title="Symptoms"
      count={items.length}
      isLocked={isLocked}
      accentColor="bg-orange-500"
      onAdd={() => {}}
    >
      {!isLocked && (
        <div className="mb-4">
          <AutocompleteSearch
            placeholder="Search symptom (e.g. Fever)..."
            onSearch={async (q) => {
              const r = await mastersApi.searchSymptoms(q);
              return r.map((s) => ({ id: s.id, name: s.name, meta: s.category ?? undefined }));
            }}
            onSelect={handleAddFromSearch}
          />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState title="No symptoms added" description={isLocked ? '' : 'Search above to add symptoms.'} />
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="col-span-3">
                <label className="input-label">Symptom *</label>
                <input value={item.symptomName} onChange={(e) => handleChange(idx, 'symptomName', e.target.value)} disabled={isLocked} className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="input-label">Duration</label>
                <input value={item.duration ?? ''} onChange={(e) => handleChange(idx, 'duration', e.target.value)} disabled={isLocked} className="input-field" placeholder="e.g. 3 days" />
              </div>
              <div className="col-span-2">
                <label className="input-label">Severity</label>
                <select value={item.severity ?? ''} onChange={(e) => handleChange(idx, 'severity', e.target.value)} disabled={isLocked} className="select-field">
                  <option value="">Select</option>
                  {(Object.keys(SEVERITY_LABELS) as Severity[]).map((s) => (
                    <option key={s} value={s}>{SEVERITY_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-4">
                <label className="input-label">Notes</label>
                <input value={item.notes ?? ''} onChange={(e) => handleChange(idx, 'notes', e.target.value)} disabled={isLocked} className="input-field" placeholder="Optional" />
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
            {saveMutation.isPending ? <><Spinner size="sm" />Saving...</> : 'Save Symptoms'}
          </button>
        </div>
      )}
    </SectionCard>
  );
}
