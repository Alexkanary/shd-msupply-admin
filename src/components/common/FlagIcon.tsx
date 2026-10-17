import React from 'react';
import { Language } from '../../services/i18n.tsx';

interface FlagIconProps {
  code: Language | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function FlagIcon({ code, className = '', size = 'md' }: FlagIconProps) {
  if (code === 'shn') {
    let sizeClasses = 'w-6 h-4';
    if (size === 'sm') sizeClasses = 'w-5 h-3.5';
    if (size === 'lg') sizeClasses = 'w-9 h-6';
    if (size === 'xl') sizeClasses = 'w-12 h-8';

    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 overflow-hidden rounded-sm shadow-2xs border border-slate-200 align-middle bg-white ${sizeClasses} ${className}`}
        title="Shan State flag"
      >
        <img
          src="/flags/shan.svg"
          alt="Shan State flag"
          className="w-full h-full object-cover"
        />
      </span>
    );
  }

  // Standard country emoji or badge for other languages
  let textSize = 'text-sm';
  if (size === 'sm') textSize = 'text-xs';
  if (size === 'lg') textSize = 'text-lg';
  if (size === 'xl') textSize = 'text-2xl';

  const emoji = code === 'en' ? '🇬🇧' : code === 'th' ? '🇹🇭' : '🇲🇲';

  return (
    <span className={`inline-flex items-center justify-center shrink-0 leading-none ${textSize} ${className}`}>
      {emoji}
    </span>
  );
}
