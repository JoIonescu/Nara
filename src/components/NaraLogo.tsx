import React from "react";

interface NaraLogoProps {
  showText?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function NaraLogo({ showText = true, className = "", size = "md" }: NaraLogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl"
  };

  return (
    <div id="nara-logo-container" className={`flex items-center gap-2.5 ${className}`}>
      {/* Sleek, responsive, modern geometric logo */}
      <div 
        id="nara-logo-icon"
        className={`${iconSizes[size]} relative flex items-center justify-center bg-gradient-to-tr from-[#3D729E] to-[#6FA6CD] rounded-xl shadow-sm border border-[#5B8FB9]/20 transition-all hover:scale-105 active:scale-95`}
      >
        {/* Dynamic layered books & soundwaves path representing audio reading assist */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          className="w-1/2 h-1/2 text-white stroke-[2.5]" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Custom geometric curve representing combined Book Pages and Audio Soundwave */}
          <path d="M12 6V18M12 6C9 6 6 8 6 8V20C6 20 9 18 12 18M12 6C15 6 18 8 18 8V20C18 20 15 18 12 18" />
          <path d="M16 12C17.5 12 17.5 14 16 14" />
          <path d="M8 12C6.5 12 6.5 14 8 14" />
        </svg>
      </div>

      {showText && (
        <span 
          id="nara-logo-text" 
          className={`${textSizes[size]} font-extrabold tracking-tight uppercase text-stone-900 flex items-center gap-1`}
        >
          <span>Incluread</span>
        </span>
      )}
    </div>
  );
}