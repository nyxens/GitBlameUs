import React from 'react';
import { HeroSection } from './HeroSection.jsx';
import { AboutSection } from './AboutSection.jsx';
import { TestimonialSection } from './TestimonialSection.jsx';

export const HomePage = ({
  onOpenFindBloodModal,
  onOpenGetStartedModal,
}) => {
  return (
    <main className="w-full flex flex-col">
      <HeroSection
        onOpenFindBloodModal={onOpenFindBloodModal}
        onOpenGetStartedModal={onOpenGetStartedModal}
      />
      <TestimonialSection />
      <AboutSection />
    </main>
  );
};
