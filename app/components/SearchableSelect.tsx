'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface SelectOption {
  id: string | number;
  name: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (val: string | number) => void;
  placeholder: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset query when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const selectedOption = options.find((o) => o.id.toString() === value?.toString());

  const filteredOptions = options.filter((o) =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selector Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-left cursor-pointer select-none"
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-150 rounded-xl shadow-xl max-h-60 flex flex-col overflow-hidden animate-slide-up">
          {/* Search Box Input */}
          <div className="relative p-2 border-b border-slate-100 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search option..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* List Options */}
          <div className="overflow-y-auto flex-1 py-1 max-h-40">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 font-semibold">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                    option.id.toString() === value?.toString()
                      ? 'bg-brand-orange/10 text-brand-orange'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
