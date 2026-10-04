import React from 'react';

/**
 * Brand logo rendering the authentic Sinhala calligraphy "ඉස්කෝලේ"
 * along with the sun & sprout graphic elements and ambient glow.
 */
const BrandLogo = ({ className = '', subtitle = 'Wycherley Gampaha', compact = false }) => {
  return (
    <div className={`group relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Graphic Elements Layer (Sun & Sprout) */}
      <div className="w-full relative flex justify-between items-end px-2 mb-[-8px] pointer-events-none">
        {/* Sun Element aligned with center */}
        <div className="absolute left-[45%] -translate-x-1/2 -top-2">
          <svg
            width="38"
            height="22"
            viewBox="0 0 42 24"
            fill="none"
            className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)] transition-transform duration-500 group-hover:scale-110"
          >
            <path d="M 9 20 A 12 12 0 0 1 33 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="21" y1="2" x2="21" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="10" y1="6" x2="13" y2="10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="32" y1="6" x2="29" y2="10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="3" y1="18" x2="7" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="39" y1="18" x2="35" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Sprout Element at the tail of 'ලේ' */}
        <div className="absolute right-3 -top-3">
          <svg
            width="24"
            height="26"
            viewBox="0 0 26 28"
            fill="none"
            className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
          >
            <path d="M 6 26 C 8 18 12 10 16 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 7 16 C -1 14 -1 7 4 4 C 7 5 8 10 7 16 Z" fill="currentColor" />
            <path d="M 12 12 C 18 9 19 3 15 1 C 11 1 10 6 12 12 Z" fill="currentColor" />
            <path d="M 16 2 C 16 -3 21 -4 23 -2 C 24 1 21 4 16 2 Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Main Freestyle Calligraphic Text */}
      <div className="flex items-baseline iskole-art-font brand-glow text-white tracking-wide mt-1 transition-transform duration-300 group-hover:scale-105">
        <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-indigo-200">
          ඉ
        </span>
        <span className="text-2xl font-extrabold ml-[-2px] tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          ස්කෝ
        </span>
        <span className="text-3xl font-extrabold text-indigo-300 ml-[1px]">
          ලේ
        </span>
      </div>

      {!compact && subtitle && (
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5 font-sans">
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
