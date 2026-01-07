import React from 'react';

export const MandalaBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-10">
      <svg
        viewBox="0 0 100 100"
        className="w-[150vmax] h-[150vmax] text-orange-500 animate-spin-slow"
        fill="currentColor"
      >
         <path d="M50 0 L55 35 L90 35 L60 55 L70 90 L50 70 L30 90 L40 55 L10 35 L45 35 Z" />
         <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
         <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
         <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
         <path d="M50 10 Q60 10 60 20 T50 30 T40 20 T50 10" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(0 50 50)" />
         <path d="M50 10 Q60 10 60 20 T50 30 T40 20 T50 10" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(45 50 50)" />
         <path d="M50 10 Q60 10 60 20 T50 30 T40 20 T50 10" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(90 50 50)" />
         <path d="M50 10 Q60 10 60 20 T50 30 T40 20 T50 10" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(135 50 50)" />
         <path d="M50 10 Q60 10 60 20 T50 30 T40 20 T50 10" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(180 50 50)" />
         <path d="M50 10 Q60 10 60 20 T50 30 T40 20 T50 10" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(225 50 50)" />
         <path d="M50 10 Q60 10 60 20 T50 30 T40 20 T50 10" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(270 50 50)" />
         <path d="M50 10 Q60 10 60 20 T50 30 T40 20 T50 10" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(315 50 50)" />
      </svg>
    </div>
  );
};