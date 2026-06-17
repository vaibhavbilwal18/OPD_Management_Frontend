'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SectionCard } from './SectionCard';
import { AutocompleteSearch } from '@/components/shared/AutocompleteSearch';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { mastersApi, prescriptionsApi } from '@/lib/api';
import { FREQUENCY_LABELS, ROUTE_LABELS } from '@/lib/utils';
import type { PrescriptionInjection, InjectionFormItem, Frequency, MedicineRoute } from '@/types';

interface InjectionsSectionProps {
  prescriptionId: string;
  injections: PrescriptionInjection[];
  isLocked: boolean;
  appointmentId: string;
}

export function InjectionsSection({ prescriptionId, injections, isLocked, appointmentId }: InjectionsSectionProps) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<InjectionFormItem[]>(
    injections.map((inj, i) => ({
      id: inj.id,
      injectionId: inj.injectionId,
      injectionName: inj.injectionName,
      dose: inj.dose,
      route: inj.route,
      frequency: inj.frequency,
      notes: inj.notes ?? '',
      sortOrder: i,
    }))
  );

  const saveMutation = useMutation({
    mutationFn: (data: InjectionFormItem[]) => prescriptionsApi.saveInjections(prescriptionId, data),
    onSuccess: () => {
      toast.success('Injections saved');
      queryClient.invalidateQueries({ queryKey: ['consultation', appointmentId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleAdd = useCallback(
    (option: { id: string; name: string }) => {
      if (items.find((i) => i.injectionName === option.name)) { toast.error('Injection already added'); return; }
      setItems((prev) => [
        ...prev,
        { injectionId: option.id === '__new__' ? null : option.id, injectionName: option.name, dose: '', route: '', frequency: '', notes: '', sortOrder: prev.length },
      ]);
    },
    [items]
  );

  const handleChange = (idx: number, field: keyof InjectionFormItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleRemove = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    saveMutation.mutate(updated);
  };

  const handleSave = () => {
    if (items.some((i) => !i.injectionName || !i.dose || !i.route || !i.frequency)) {
      toast.error('Please fill all required injection fields');
      return;
    }
    saveMutation.mutate(items.map((m, i) => ({ ...m, sortOrder: i })));
  };

  return (
    <SectionCard
      title="Injections"
      count={items.length}
      isLocked={isLocked}
      accentColor="bg-purple-500"
      onAdd={() => {}}
    >
      {!isLocked && (
        <div className="mb-4">
          <AutocompleteSearch
            placeholder="Search injection (e.g. Ceftriaxone)..."
            onSearch={async (q) => {
              const r = await mastersApi.searchInjections(q);
              return r.map((inj) => ({ id: inj.id, name: inj.name }));
            }}
            onSelect={handleAdd}
          />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState title="No injections prescribed" description={isLocked ? '' : 'Search above to add injections.'} />
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-purple-100 bg-purple-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-purple-900">{item.injectionName}</span>
                {!isLocked && (
                  <button onClick={() => handleRemove(idx)} className="btn-danger py-1 text-xs">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="input-label">Dose *</label>
                  <input value={item.dose} onChange={(e) => handleChange(idx, 'dose', e.target.value)} disabled={isLocked} className="input-field" placeholder="e.g. 1g" />
                </div>
                <div>
                  <label className="input-label">Route *</label>
                  <select value={item.route} onChange={(e) => handleChange(idx, 'route', e.target.value)} disabled={isLocked} className="select-field">
                    <option value="">Select</option>
                    {(Object.keys(ROUTE_LABELS) as MedicineRoute[]).map((r) => <option key={r} value={r}>{ROUTE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Frequency *</label>
                  <select value={item.frequency} onChange={(e) => handleChange(idx, 'frequency', e.target.value)} disabled={isLocked} className="select-field">
                    <option value="">Select</option>
                    {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
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
            {saveMutation.isPending ? <><Spinner size="sm" />Saving...</> : 'Save Injections'}
          </button>
        </div>
      )}
    </SectionCard>
  );
}
