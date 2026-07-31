import React from 'react';

export const LifeVaultLogoSVG: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Abstract Vault Shield Outer Boundary */}
    <path
      d="M16 2.5L5 7.2V15.5C5 22.8 9.7 29.2 16 30.8C22.3 29.2 27 22.8 27 15.5V7.2L16 2.5Z"
      stroke="url(#vault-purple-grad)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Abstract Blood Drop Core */}
    <path
      d="M16 9C16 9 11 14.8 11 18.8C11 21.6 13.2 23.8 16 23.8C18.8 23.8 21 21.6 21 18.8C21 14.8 16 9 16 9Z"
      fill="url(#blood-red-grad)"
    />
    {/* Subtle Inner Highlight Node */}
    <circle cx="16" cy="19" r="2" fill="#FFFFFF" opacity="0.8" />
    
    <defs>
      <linearGradient id="vault-purple-grad" x1="5" y1="2.5" x2="27" y2="30.8" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C084FC" />
        <stop offset="1" stopColor="#7E22CE" />
      </linearGradient>
      <linearGradient id="blood-red-grad" x1="16" y1="9" x2="16" y2="23.8" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F87171" />
        <stop offset="1" stopColor="#DC2626" />
      </linearGradient>
    </defs>
  </svg>
);
