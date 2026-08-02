import React from 'react';
import { InteractiveDashboard } from './InteractiveDashboard.jsx';

export const LifeVaultSection = () => {
  return (
    <section className="w-full py-16 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <InteractiveDashboard />
      </div>
    </section>
  );
};
