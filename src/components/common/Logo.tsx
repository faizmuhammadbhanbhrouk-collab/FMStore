import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl font-extrabold tracking-tight',
    xl: 'text-3xl font-black tracking-tight',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Glass Hexagonal/Rounded Badge */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-cyan-500/20 border border-indigo-200 dark:border-indigo-400/40 shadow-md shadow-indigo-500/10 dark:shadow-indigo-500/20 backdrop-blur-md group-hover:border-indigo-500/60 dark:group-hover:border-cyan-400/60 transition-all duration-300`}
      >
        {/* Glow backdrop */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-400/20 to-indigo-500/20 blur-sm pointer-events-none" />
        
        {/* Monogram letters FM */}
        <span className="relative z-10 font-mono font-black tracking-tighter bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-600 dark:from-cyan-300 dark:via-indigo-200 dark:to-purple-300 bg-clip-text text-transparent">
          FM
        </span>

        {/* Small corner tech accent */}
        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-cyan-400 shadow-sm shadow-indigo-400 dark:shadow-cyan-300" />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span className={`${textSizes[size]} text-slate-900 dark:text-white`}>FM</span>
            <span className={`${textSizes[size]} text-indigo-600 dark:text-indigo-400 font-mono`}>_</span>
            <span className={`${textSizes[size]} bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent`}>
              Store
            </span>
          </div>
          {size === 'xl' && (
            <span className="text-[11px] font-medium tracking-widest text-slate-500 dark:text-slate-400 uppercase mt-1">
              Personal Cloud & Vault
            </span>
          )}
        </div>
      )}
    </div>
  );
};
