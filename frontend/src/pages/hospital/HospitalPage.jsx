import React from 'react';
import { HospitalSection } from './HospitalSection.jsx';

export const HospitalPage = ({ onOpenHospitalModal }) => {
  return (
    <main className="w-full">
      <HospitalSection onOpenHospitalModal={onOpenHospitalModal} />
    </main>
  );
};
