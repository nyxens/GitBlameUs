import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const InteractiveHoverButton = React.forwardRef(
  (
    {
      text,
      children,
      icon: Icon = ArrowRight,
      className,
      variant = 'primary',
      size = 'md',
      onClick,
      ...props
    },
    ref
  ) => {
    const displayText = children || text || 'Button';

    const variantThemes = {
      danger: {
        border: 'border-red-500/50 group-hover:border-red-500 shadow-red-950/40',
        circleBg: 'bg-red-600',
        buttonHoverBg: 'group-hover:bg-red-600',
        textColor: 'text-white',
        iconColor: 'text-white',
      },
      primary: {
        border: 'border-purple-500/50 group-hover:border-purple-500 shadow-purple-950/40',
        circleBg: 'bg-purple-600',
        buttonHoverBg: 'group-hover:bg-purple-600',
        textColor: 'text-white',
        iconColor: 'text-white',
      },
      secondary: {
        border: 'border-white/40 group-hover:border-white shadow-black/40',
        circleBg: 'bg-white',
        buttonHoverBg: 'group-hover:bg-white',
        textColor: 'text-white group-hover:text-black',
        iconColor: 'text-black',
      },
    };

    const isSmall = size === 'sm';
    const theme = variantThemes[variant] || variantThemes.primary;

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        onClick={onClick}
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-full border-2 bg-neutral-950 pl-1 transition-all duration-300 select-none shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 flex items-center justify-between gap-2',
          isSmall ? 'h-9 min-w-[165px] pr-3.5 text-xs' : 'h-12 min-w-[185px] pr-5 text-sm',
          theme.border,
          theme.buttonHoverBg,
          className
        )}
        {...props}
      >
        {/* 100% Opaque Expanding Color Background Layer */}
        <span
          className={cn(
            'absolute left-1 top-1 z-0 rounded-full transition-all duration-500 ease-out group-hover:left-0 group-hover:top-0 group-hover:w-full group-hover:h-full group-hover:rounded-full pointer-events-none opacity-100 shadow-md',
            isSmall ? 'w-6.5 h-6.5' : 'w-9 h-9',
            theme.circleBg
          )}
          aria-hidden="true"
        />

        {/* Fixed Icon Pod Layer (Stationary at left-1 top-1) */}
        <div
          className={cn(
            'absolute left-1 top-1 z-10 flex items-center justify-center rounded-full shrink-0 pointer-events-none',
            isSmall ? 'w-6.5 h-6.5' : 'w-9 h-9'
          )}
        >
          <Icon className={cn('transition-transform duration-300 group-hover:scale-110 origin-center', isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4', theme.iconColor)} />
        </div>

        {/* Left Spacer matching icon container footprint */}
        <div className={cn('shrink-0 pointer-events-none z-0', isSmall ? 'w-6.5 h-6.5' : 'w-9 h-9')} />

        {/* Button Label Text */}
        <span
          className={cn(
            'relative z-10 flex-1 text-center font-bold tracking-tight transition-colors duration-300 whitespace-nowrap leading-none flex items-center justify-center pr-1',
            isSmall ? 'text-xs' : 'text-sm',
            theme.textColor
          )}
        >
          {displayText}
        </span>
      </motion.button>
    );
  }
);

InteractiveHoverButton.displayName = 'InteractiveHoverButton';
