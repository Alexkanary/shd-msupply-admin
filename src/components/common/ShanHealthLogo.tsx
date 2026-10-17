import React from 'react';

interface ShanHealthLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ShanHealthLogo({ className = '', size = 'md' }: ShanHealthLogoProps) {
  let sizeClasses = 'w-10 h-10';
  if (size === 'sm') sizeClasses = 'w-7 h-7';
  if (size === 'md') sizeClasses = 'w-10 h-10';
  if (size === 'lg') sizeClasses = 'w-14 h-14';
  if (size === 'xl') sizeClasses = 'w-20 h-20';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-full select-none ${sizeClasses} ${className}`}
      title="Shan Health Department"
    >
      <img
        src="/shan-health-department-logo.svg"
        alt="Shan Health Department Logo"
        className="w-full h-full object-contain filter drop-shadow-sm"
        onError={(e) => {
          // Inline fallback SVG in case image doesn't load
          const target = e.currentTarget;
          target.style.display = 'none';
        }}
      />
    </div>
  );
}
