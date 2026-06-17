'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

interface Option {
  id: string;
  name: string;
  meta?: string;
}

interface AutocompleteSearchProps {
  placeholder?: string;
  onSearch: (query: string) => Promise<Option[]>;
  onSelect: (option: Option) => void;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
  clearOnSelect?: boolean;
}

export function AutocompleteSearch({
  placeholder = 'Search...',
  onSearch,
  onSelect,
  debounceMs = 300,
  disabled = false,
  className,
  clearOnSelect = true,
}: AutocompleteSearchProps) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setOptions([]);
        setIsOpen(false);
        return;
      }
      setIsLoading(true);
      try {
        const results = await onSearch(q);
        setOptions(results);
        setIsOpen(true);
        setActiveIndex(-1);
      } catch {
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [onSearch]
  );

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), debounceMs);
    return () => clearTimeout(timerRef.current);
  }, [query, debounceMs, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (option: Option) => {
    onSelect(option);
    if (clearOnSelect) setQuery('');
    setIsOpen(false);
    setOptions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(options[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="input-field pr-8"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
        />
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {isOpen && options.length > 0 && (
        <ul
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {options.map((option, i) => (
            <li
              key={option.id}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(option); }}
              className={cn(
                'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm',
                i === activeIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <span className="flex-1">{option.name}</span>
              {option.meta && <span className="text-xs text-gray-400">{option.meta}</span>}
            </li>
          ))}
        </ul>
      )}

      {isOpen && !isLoading && options.length === 0 && query.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
          <p className="text-sm text-gray-500">No results for &ldquo;{query}&rdquo;</p>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelect({ id: '__new__', name: query });
            }}
            className="mt-1 text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            + Add &ldquo;{query}&rdquo; as new entry
          </button>
        </div>
      )}
    </div>
  );
}
