import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const MotionButton = ({ label = 'Get Started', children, className, variant = 'primary', onClick, ...props }) => {
  const displayText = children || label;

  const bgCircleStyles = {
    primary: 'bg-purple-600',
    danger: 'bg-red-600',
    secondary: 'bg-white',
    outline: 'bg-purple-600',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'bg-neutral-950 group relative h-12 min-w-[160px] cursor-pointer rounded-full border border-white/20 p-1 outline-none transition-all hover:border-purple-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 select-none overflow-hidden',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'circle m-0 block h-10 w-10 overflow-hidden rounded-full duration-500 group-hover:w-full',
          bgCircleStyles[variant] || 'bg-purple-600'
        )}
        aria-hidden="true"
      />
      <div className="icon absolute top-1/2 left-3.5 translate-x-0 -translate-y-1/2 duration-500 group-hover:translate-x-[0.3rem] z-10">
        <ArrowRight className="text-white w-4 h-4" />
      </div>
      <span className="button-text text-white font-sans absolute top-1/2 left-1/2 ml-2 -translate-x-1/2 -translate-y-1/2 text-center text-sm font-semibold tracking-tight whitespace-nowrap duration-500 z-10 pr-3">
        {displayText}
      </span>
    </button>
  );
};
