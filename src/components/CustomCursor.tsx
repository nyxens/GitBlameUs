import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverType, setHoverType] = useState<'button' | 'card' | 'link' | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth springs for cursor position
  const cursorX = useSpring(-100, { stiffness: 450, damping: 35 });
  const cursorY = useSpring(-100, { stiffness: 450, damping: 35 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Detect hover over interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactiveBtn = target.closest('button, a, input, select, textarea');
      const interactiveCard = target.closest('.spotlight-card, [role="button"]');

      if (interactiveBtn) {
        setIsHovered(true);
        setHoverType('button');
      } else if (interactiveCard) {
        setIsHovered(true);
        setHoverType('card');
      } else {
        setIsHovered(false);
        setHoverType(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
      {/* Outer ambient aura ring */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          scale: isHovered ? (hoverType === 'button' ? 2.2 : 1.6) : 1,
          opacity: isHovered ? 0.8 : 0.45,
          borderColor: hoverType === 'button' ? 'rgba(244, 63, 94, 0.8)' : 'rgba(168, 85, 247, 0.6)',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="-translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-purple-500/50 backdrop-blur-[1px] fixed top-0 left-0 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]"
      />

      {/* Inner precise dot cursor */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          scale: isHovered ? 0.5 : 1,
          backgroundColor: hoverType === 'button' ? '#f43f5e' : '#a855f7',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="-translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full fixed top-0 left-0 shadow-[0_0_10px_#a855f7]"
      />
    </div>
  );
};
