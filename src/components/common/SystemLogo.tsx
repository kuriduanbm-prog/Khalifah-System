import React, { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';

interface SystemLogoProps {
  logoUrl?: string;
  className?: string;
  iconClassName?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  frameless?: boolean;
  glow?: boolean;
}

export const SystemLogo: React.FC<SystemLogoProps> = ({
  logoUrl,
  className = '',
  iconClassName = '',
  alt = 'System Logo',
  size = 'md',
  frameless = false,
  glow = false
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(logoUrl ? 'loading' : 'error');

  useEffect(() => {
    if (!logoUrl || logoUrl.trim() === '') {
      setStatus('error');
      return;
    }

    setStatus('loading');
    let isMounted = true;
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
      if (isMounted) setStatus('loaded');
    };
    img.onerror = () => {
      if (isMounted) setStatus('error');
    };

    return () => {
      isMounted = false;
    };
  }, [logoUrl]);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
    hero: 'w-28 h-28 sm:w-36 sm:h-36'
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
    hero: 'w-16 h-16 sm:w-20 sm:h-20'
  }[size];

  // While loading image, show minimalist educational icon loop with soft diffuse glow
  if (status === 'loading') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}>
        {glow || size === 'hero' ? (
          <div className="absolute inset-0 bg-sky-400/20 dark:bg-sky-500/20 rounded-full blur-xl scale-125 animate-pulse pointer-events-none" />
        ) : null}
        <div
          className={`relative flex items-center justify-center w-full h-full ${
            glow || size === 'hero'
              ? 'p-3 bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-[0_0_20px_5px_rgba(56,189,248,0.15)]'
              : frameless
              ? 'p-0 text-sky-800 dark:text-sky-300'
              : 'bg-sky-900/90 text-white rounded-2xl'
          }`}
        >
          <GraduationCap className={`${iconSizes} animate-pulse text-sky-500 dark:text-sky-300 z-10 ${iconClassName}`} />
        </div>
      </div>
    );
  }

  // If loaded successfully
  if (status === 'loaded' && logoUrl) {
    if (glow || size === 'hero') {
      return (
        <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}>
          {/* Subtle Diffuse Glowing Aura Background */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-400/20 via-cyan-300/15 to-sky-300/20 dark:from-sky-500/20 dark:via-cyan-500/15 dark:to-sky-400/20 rounded-full blur-xl scale-110 pointer-events-none transition-all duration-500" />
          <div className="absolute inset-0 bg-sky-300/15 dark:bg-sky-400/10 rounded-3xl blur-md scale-105 pointer-events-none" />

          {/* Clean Logo Container with Soft Shadow & Subtle Ambient Background */}
          <div className="relative w-full h-full p-3.5 sm:p-5 rounded-3xl sm:rounded-[2.2rem] bg-white/95 dark:bg-slate-900/95 shadow-[0_0_25px_6px_rgba(56,189,248,0.2)] dark:shadow-[0_0_30px_8px_rgba(56,189,248,0.15)] flex items-center justify-center transition-all duration-300 hover:scale-105">
            <img
              src={logoUrl}
              alt={alt}
              className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(56,189,248,0.2)] transition-transform duration-300"
            />
          </div>
        </div>
      );
    }

    if (frameless) {
      return (
        <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}>
          <img
            src={logoUrl}
            alt={alt}
            className="w-full h-full object-contain filter drop-shadow-md transition-all duration-300 hover:scale-105"
          />
        </div>
      );
    }

    return (
      <div className={`relative flex items-center justify-center bg-white/10 dark:bg-slate-800/80 p-1 border border-white/20 dark:border-slate-700/60 shrink-0 overflow-hidden ${sizeClasses} ${className}`}>
        <img
          src={logoUrl}
          alt={alt}
          className="w-full h-full object-contain rounded-xl transition-opacity duration-300"
        />
      </div>
    );
  }

  // Fallback if no logo or error: Minimalist educational icon badge with glowing soft sky blue aura
  if (glow || size === 'hero') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}>
        <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-400/20 via-cyan-300/15 to-sky-300/20 dark:from-sky-500/20 dark:via-cyan-500/15 dark:to-sky-400/20 rounded-full blur-xl scale-110 pointer-events-none" />
        <div className="relative w-full h-full p-3.5 sm:p-5 rounded-3xl sm:rounded-[2.2rem] bg-white/95 dark:bg-slate-900/95 shadow-[0_0_25px_6px_rgba(56,189,248,0.2)] dark:shadow-[0_0_30px_8px_rgba(56,189,248,0.15)] flex items-center justify-center">
          <GraduationCap className={`${iconSizes} text-sky-600 dark:text-sky-300 ${iconClassName}`} />
        </div>
      </div>
    );
  }

  if (frameless) {
    return (
      <div className={`flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0 ${sizeClasses} ${className}`}>
        <GraduationCap className={`${iconSizes} ${iconClassName}`} />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-sky-700 dark:bg-sky-900 text-white border border-sky-500/50 shadow-sm shrink-0 ${sizeClasses} ${className}`}
    >
      <GraduationCap className={`${iconSizes} ${iconClassName}`} />
    </div>
  );
};
