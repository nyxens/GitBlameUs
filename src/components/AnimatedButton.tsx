import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };

    setRipples((prev) => [...prev.slice(-3), newRipple]);

    if (onClick) {
      onClick(e);
    }
  };

  const baseStyles =
    'relative overflow-hidden font-semibold transition-colors duration-200 select-none flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3.5 text-base rounded-2xl',
  };

  const variantStyles = {
    primary:
      'bg-white text-black hover:bg-neutral-100 shadow-md hover:shadow-white/20 border border-white/20',
    secondary:
      'bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-900/30 border border-purple-400/30',
    danger:
      'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-900/30 border border-red-400/30',
    ghost:
      'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 border border-white/10',
    outline:
      'bg-transparent text-white border border-white/20 hover:border-purple-500/60 hover:bg-purple-500/10',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      onClick={handleClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...(props as any)}
    >
      {/* Ripple Animation Effects on Interaction */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
            }}
            style={{
              top: ripple.y,
              left: ripple.x,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute pointer-events-none w-12 h-12 rounded-full bg-white/40"
          />
        ))}
      </AnimatePresence>

      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};
