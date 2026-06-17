'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SectionCard } from './SectionCard';
import { Spinner } from '@/components/ui/Spinner';
import { prescriptionsApi } from '@/lib/api';

interface AdviceSectionProps {
  prescriptionId: string;
  advice: string | null | undefined;
  isLocked: boolean;
  appointmentId: string;
}

export function AdviceSection({ prescriptionId, advice, isLocked, appointmentId }: AdviceSectionProps) {
  const queryClient = useQueryClient();
  const [text, setText] = useState(advice ?? '');

  const saveMutation = useMutation({
    mutationFn: (val: string) => prescriptionsApi.saveAdvice(prescriptionId, val),
    onSuccess: () => {
      toast.success('Advice saved');
      queryClient.invalidateQueries({ queryKey: ['consultation', appointmentId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <SectionCard title="Additional Advice" isLocked={isLocked} accentColor="bg-amber-500">
      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          Include dietary advice, lifestyle recommendations, and follow-up instructions.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLocked}
          rows={5}
          className="textarea-field"
          placeholder={
            isLocked
              ? 'No additional advice recorded.'
              : 'e.g.\n• Drink 2-3 litres of water daily\n• Avoid spicy food for 1 week\n• Follow up after 7 days\n• Rest and avoid strenuous activity'
          }
        />
        {!isLocked && (
          <div className="flex justify-end">
            <button onClick={() => saveMutation.mutate(text)} disabled={saveMutation.isPending} className="btn-primary">
              {saveMutation.isPending ? <><Spinner size="sm" />Saving...</> : 'Save Advice'}
            </button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
