import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  count?: number;
  isLocked?: boolean;
  onAdd?: () => void;
  addLabel?: string;
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}

export function SectionCard({
  title,
  count,
  isLocked,
  onAdd,
  addLabel = '+ Add',
  children,
  className,
  accentColor = 'bg-primary-500',
}: SectionCardProps) {
  return (
    <div className={cn('section-card', className)}>
      <div className="section-header">
        <div className="flex items-center gap-2">
          <span className={cn('h-3 w-1 rounded-full', accentColor)} />
          <h3 className="section-title">{title}</h3>
          {count !== undefined && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
              {count}
            </span>
          )}
        </div>
        {!isLocked && onAdd && (
          <button onClick={onAdd} className="btn-primary py-1.5 text-xs">
            {addLabel}
          </button>
        )}
        {isLocked && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Read only
          </span>
        )}
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}
