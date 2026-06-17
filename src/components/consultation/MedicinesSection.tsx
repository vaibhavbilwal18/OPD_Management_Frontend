'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SectionCard } from './SectionCard';
import { AutocompleteSearch } from '@/components/shared/AutocompleteSearch';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { mastersApi, prescriptionsApi } from '@/lib/api';
import { FREQUENCY_LABELS, ROUTE_LABELS, FOOD_LABELS } from '@/lib/utils';
import type { PrescriptionMedicine, MedicineFormItem, Frequency, MedicineRoute, FoodRelation, MedicineMaster } from '@/types';

interface MedicinesSectionProps {
  prescriptionId: string;
  medicines: PrescriptionMedicine[];
  isLocked: boolean;
  appointmentId: string;
}

function emptyMedicine(name: string, master?: MedicineMaster): MedicineFormItem {
  return {
    medicineId: master?.id ?? null,
    medicineName: name,
    dosage: '',
    frequency: '',
    duration: '',
    route: master?.defaultRoute ?? '',
    foodRelation: '',
    notes: '',
    sortOrder: 0,
  };
}

export function MedicinesSection({ prescriptionId, medicines, isLocked, appointmentId }: MedicinesSectionProps) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<MedicineFormItem[]>(
    medicines.map((m, i) => ({
      id: m.id,
      medicineId: m.medicineId,
      medicineName: m.medicineName,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      route: m.route,
      foodRelation: m.foodRelation,
      notes: m.notes ?? '',
      sortOrder: i,
    }))
  );

  const saveMutation = useMutation({
    mutationFn: (data: MedicineFormItem[]) => prescriptionsApi.saveMedicines(prescriptionId, data),
    onSuccess: () => {
      toast.success('Medicines saved');
      queryClient.invalidateQueries({ queryKey: ['consultation', appointmentId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleAdd = useCallback(
    (option: { id: string; name: string }, master?: MedicineMaster) => {
      if (items.find((i) => i.medicineName === option.name)) { toast.error('Medicine already added'); return; }
      setItems((prev) => [...prev, emptyMedicine(option.name, master)]);
    },
    [items]
  );

  const handleChange = (idx: number, field: keyof MedicineFormItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleRemove = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    saveMutation.mutate(updated);
  };

  const handleSave = () => {
    const req = ['medicineName', 'dosage', 'frequency', 'duration', 'route', 'foodRelation'] as (keyof MedicineFormItem)[];
    const invalid = items.some((m) => req.some((f) => !m[f]));
    if (invalid) { toast.error('Please fill all required medicine fields'); return; }
    saveMutation.mutate(items.map((m, i) => ({ ...m, sortOrder: i })));
  };

  return (
    <SectionCard
      title="Medicines (℞)"
      count={items.length}
      isLocked={isLocked}
      accentColor="bg-green-500"
      onAdd={() => {}}
    >
      {!isLocked && (
        <div className="mb-4 flex items-center gap-2">
          <AutocompleteSearch
            placeholder="Search medicine (e.g. Paracetamol)..."
            onSearch={async (q) => {
              const r = await mastersApi.searchMedicines(q);
              return r.map((m) => ({ id: m.id, name: m.name, meta: m.genericName ?? undefined }));
            }}
            onSelect={(opt) => handleAdd(opt)}
            className="flex-1"
          />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState title="No medicines prescribed" description={isLocked ? '' : 'Search above to add medicines.'} />
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">
                  {idx + 1}. {item.medicineName}
                </span>
                {!isLocked && (
                  <button onClick={() => handleRemove(idx)} className="btn-danger py-1 text-xs">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <div>
                  <label className="input-label">Dosage *</label>
                  <input value={item.dosage} onChange={(e) => handleChange(idx, 'dosage', e.target.value)} disabled={isLocked} className="input-field" placeholder="e.g. 500mg" />
                </div>
                <div>
                  <label className="input-label">Frequency *</label>
                  <select value={item.frequency} onChange={(e) => handleChange(idx, 'frequency', e.target.value)} disabled={isLocked} className="select-field">
                    <option value="">Select</option>
                    {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Duration *</label>
                  <input value={item.duration} onChange={(e) => handleChange(idx, 'duration', e.target.value)} disabled={isLocked} className="input-field" placeholder="e.g. 5 Days" />
                </div>
                <div>
                  <label className="input-label">Route *</label>
                  <select value={item.route} onChange={(e) => handleChange(idx, 'route', e.target.value)} disabled={isLocked} className="select-field">
                    <option value="">Select</option>
                    {(Object.keys(ROUTE_LABELS) as MedicineRoute[]).map((r) => <option key={r} value={r}>{ROUTE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Food *</label>
                  <select value={item.foodRelation} onChange={(e) => handleChange(idx, 'foodRelation', e.target.value)} disabled={isLocked} className="select-field">
                    <option value="">Select</option>
                    {(Object.keys(FOOD_LABELS) as FoodRelation[]).map((f) => <option key={f} value={f}>{FOOD_LABELS[f]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Notes</label>
                  <input value={item.notes ?? ''} onChange={(e) => handleChange(idx, 'notes', e.target.value)} disabled={isLocked} className="input-field" placeholder="Optional" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLocked && items.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button onClick={handleSave} disabled={saveMutation.isPending} className="btn-primary">
            {saveMutation.isPending ? <><Spinner size="sm" />Saving...</> : 'Save Medicines'}
          </button>
        </div>
      )}
    </SectionCard>
  );
}
