'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SectionCard } from './SectionCard';
import { AutocompleteSearch } from '@/components/shared/AutocompleteSearch';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { mastersApi, prescriptionsApi } from '@/lib/api';
import type { PrescriptionVital, VitalFormItem, VitalType } from '@/types';

interface VitalsSectionProps {
  prescriptionId: string;
  vitals: PrescriptionVital[];
  isLocked: boolean;
  appointmentId: string;
}

function newVital(): VitalFormItem {
  return { vitalName: '', value: '', unit: '', notes: '' };
}

export function VitalsSection({ prescriptionId, vitals, isLocked, appointmentId }: VitalsSectionProps) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<VitalFormItem[]>(
    vitals.length > 0
      ? vitals.map((v) => ({ id: v.id, vitalTypeId: v.vitalTypeId, vitalName: v.vitalName, value: v.value, unit: v.unit ?? '', notes: v.notes ?? '' }))
      : []
  );
  const [addingNew, setAddingNew] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (data: VitalFormItem[]) => prescriptionsApi.saveVitals(prescriptionId, data),
    onSuccess: () => {
      toast.success('Vitals saved');
      queryClient.invalidateQueries({ queryKey: ['consultation', appointmentId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleAddFromSearch = useCallback(
    (option: { id: string; name: string }, meta?: VitalType) => {
      const existing = items.find((i) => i.vitalName === option.name);
      if (existing) { toast.error('This vital is already added'); return; }
      const next: VitalFormItem = {
        vitalTypeId: option.id === '__new__' ? null : option.id,
        vitalName: option.name,
        value: '',
        unit: meta?.defaultUnit ?? '',
        notes: '',
      };
      const updated = [...items, next];
      setItems(updated);
      setAddingNew(false);
    },
    [items]
  );

  const handleChange = (idx: number, field: keyof VitalFormItem, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleRemove = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    saveMutation.mutate(updated);
  };

  const handleSave = () => {
    const invalid = items.some((i) => !i.vitalName.trim() || !i.value.trim());
    if (invalid) { toast.error('Each vital must have a name and value'); return; }
    saveMutation.mutate(items);
  };

  return (
    <SectionCard
      title="Vitals"
      count={items.length}
      isLocked={isLocked}
      accentColor="bg-blue-500"
      onAdd={() => setAddingNew(true)}
    >
      {/* Autocomplete search */}
      {!isLocked && addingNew && (
        <div className="mb-4">
          <AutocompleteSearch
            placeholder="Search vital type (e.g. Blood Pressure)..."
            onSearch={async (q) => {
              const results = await mastersApi.searchVitalTypes(q);
              return results.map((r) => ({ id: r.id, name: r.name, meta: r.defaultUnit ?? undefined }));
            }}
            onSelect={(opt) => handleAddFromSearch(opt)}
            clearOnSelect
          />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState title="No vitals recorded" description={isLocked ? '' : 'Search for a vital type above to add.'} />
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
              {/* Vital name */}
              <div className="col-span-3">
                <label className="input-label">Vital Type *</label>
                <input
                  value={item.vitalName}
                  onChange={(e) => handleChange(idx, 'vitalName', e.target.value)}
                  disabled={isLocked}
                  className="input-field"
                  placeholder="e.g. Blood Pressure"
                />
              </div>
              {/* Value */}
              <div className="col-span-3">
                <label className="input-label">Value *</label>
                <input
                  value={item.value}
                  onChange={(e) => handleChange(idx, 'value', e.target.value)}
                  disabled={isLocked}
                  className="input-field"
                  placeholder="e.g. 120/80"
                />
              </div>
              {/* Unit */}
              <div className="col-span-2">
                <label className="input-label">Unit</label>
                <input
                  value={item.unit ?? ''}
                  onChange={(e) => handleChange(idx, 'unit', e.target.value)}
                  disabled={isLocked}
                  className="input-field"
                  placeholder="mmHg"
                />
              </div>
              {/* Notes */}
              <div className="col-span-3">
                <label className="input-label">Notes</label>
                <input
                  value={item.notes ?? ''}
                  onChange={(e) => handleChange(idx, 'notes', e.target.value)}
                  disabled={isLocked}
                  className="input-field"
                  placeholder="Optional"
                />
              </div>
              {/* Remove */}
              {!isLocked && (
                <div className="col-span-1 flex items-end">
                  <button onClick={() => handleRemove(idx)} className="btn-danger p-2" title="Remove">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Save button */}
      {!isLocked && items.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button onClick={handleSave} disabled={saveMutation.isPending} className="btn-primary">
            {saveMutation.isPending ? <><Spinner size="sm" />Saving...</> : 'Save Vitals'}
          </button>
        </div>
      )}
    </SectionCard>
  );
}
