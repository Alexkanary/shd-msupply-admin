import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '../../services/i18n.tsx';
import { FlagIcon } from './FlagIcon';

interface LanguageSelectorProps {
  variant?: 'compact' | 'cards' | 'segmented';
  align?: 'left' | 'right';
  className?: string;
}

export function LanguageSelector({
  variant = 'compact',
  align = 'left',
  className = '',
}: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 ${className}`}>
        {SUPPORTED_LANGUAGES.map((opt) => {
          const isSelected = opt.code === language;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title={opt.name}
            >
              <FlagIcon code={opt.code} size="sm" />
              <span>{opt.nativeName}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
        {SUPPORTED_LANGUAGES.map((opt) => {
          const isSelected = opt.code === language;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/60 text-teal-950 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <FlagIcon code={opt.code} size="xl" />
                {isSelected && (
                  <span className="h-5 w-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight text-slate-900">
                  {opt.nativeName}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {opt.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {opt.region}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact dropdown variant: default aligned to the left edge of the button so it opens TO THE RIGHT
  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-800 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
        aria-expanded={isOpen}
      >
        <FlagIcon code={currentOption.code} size="md" />
        <span className="font-medium hidden sm:inline">{currentOption.nativeName}</span>
        <span className="font-mono text-[10px] uppercase sm:hidden">{currentOption.code}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${alignClass} mt-1.5 w-52 max-w-[calc(100vw-2rem)] rounded-xl bg-white shadow-2xl border border-slate-200/90 py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-100 ring-1 ring-slate-900/5`}
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Choose Language / ၽႃႇသႃႇ
          </div>
          {SUPPORTED_LANGUAGES.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLanguage(opt.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50 text-teal-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FlagIcon code={opt.code} size="md" />
                  <div className="text-left">
                    <div className="text-xs font-medium text-slate-900">{opt.nativeName}</div>
                    <div className="text-[10px] text-slate-400">{opt.name}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-teal-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
