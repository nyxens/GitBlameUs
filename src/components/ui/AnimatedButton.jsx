import React from 'react';
import { InteractiveHoverButton } from './InteractiveHoverButton.jsx';
import { ArrowRight, Droplet, Heart, Building2 } from 'lucide-react';

export const AnimatedButton = ({
  children,
  text,
  variant = 'primary',
  icon,
  className = '',
  onClick,
  ...props
}) => {
  // Determine suitable icon based on variant or children if not explicitly passed
  let SelectedIcon = icon || ArrowRight;
  if (variant === 'danger') {
    SelectedIcon = Droplet;
  }

  return (
    <InteractiveHoverButton
      variant={variant}
      icon={SelectedIcon}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children || text}
    </InteractiveHoverButton>
  );
};
