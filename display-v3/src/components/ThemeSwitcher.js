'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

export default function ThemeSwitcher() {
  const { isReal, toggle } = useTheme();

  const label = isReal ? '写实' : '水墨';
  const tooltip = isReal ? '切换到水墨模式' : '切换到写实模式';

  return (
    <button
      onClick={toggle}
      title={tooltip}
      aria-label={tooltip}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:translate-y-[-1px] transition-all duration-300 shadow-sm cursor-pointer select-none backdrop-blur-md md:px-3 md:py-2 px-2.5 py-1.5"
    >
      <div className="relative w-5 h-5 transition-transform duration-500 [transform-style:preserve-3d] hover:rotate-180">
        {isReal ? (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3C7 3 3 7 3 12" strokeDasharray="4 3" />
            <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" className="opacity-30" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2" strokeWidth="1" />
          </svg>
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 2L4 18" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 4c2 2 3 5 2 8-1 3-4 5-7 5" strokeWidth="1.5" />
            <path d="M4 18c-1-1-1-3 0-4s3-1 4 0" fill="currentColor" className="opacity-20" stroke="none" />
            <circle cx="7" cy="17" r="1.5" fill="currentColor" className="opacity-15" stroke="none" />
          </svg>
        )}
      </div>
      <span className="text-xs font-semibold tracking-wider md:inline hidden">{label}</span>
    </button>
  );
}
