import React from 'react';
import { DonorSection } from './DonorSection.jsx';

export const DonorPage = ({ onOpenDonorModal }) => {
  return (
    <main className="w-full">
      <DonorSection onOpenDonorModal={onOpenDonorModal} />
    </main>
  );
};
