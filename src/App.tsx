import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DonorSection } from './components/DonorSection';
import { HospitalSection } from './components/HospitalSection';
import { TestimonialSection } from './components/TestimonialSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { DonorModal } from './components/DonorModal';
import { HospitalPortalModal } from './components/HospitalPortalModal';
import { FindBloodModal } from './components/FindBloodModal';
import { GetStartedModal } from './components/GetStartedModal';

export function App() {
  const [donorModalOpen, setDonorModalOpen] = useState<boolean>(false);
  const [hospitalModalOpen, setHospitalModalOpen] = useState<boolean>(false);
  const [findBloodModalOpen, setFindBloodModalOpen] = useState<boolean>(false);
  const [getStartedModalOpen, setGetStartedModalOpen] = useState<boolean>(false);

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenGetStartedModal={() => setGetStartedModalOpen(true)} />

      {/* Section 1: Hero */}
      <HeroSection
        onOpenFindBloodModal={() => setFindBloodModalOpen(true)}
        onOpenGetStartedModal={() => setGetStartedModalOpen(true)}
      />

      {/* For Donors */}
      <DonorSection onOpenDonorModal={() => setDonorModalOpen(true)} />

      {/* For Hospitals (Purple / Pink Theme) */}
      <HospitalSection onOpenHospitalModal={() => setHospitalModalOpen(true)} />

      {/* Section 2: Testimonial / Review (Hospital Emergency Logistics) */}
      <TestimonialSection />

      {/* About Section */}
      <AboutSection />

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <DonorModal
        isOpen={donorModalOpen}
        onClose={() => setDonorModalOpen(false)}
      />

      <HospitalPortalModal
        isOpen={hospitalModalOpen}
        onClose={() => setHospitalModalOpen(false)}
      />

      <FindBloodModal
        isOpen={findBloodModalOpen}
        onClose={() => setFindBloodModalOpen(false)}
      />

      <GetStartedModal
        isOpen={getStartedModalOpen}
        onClose={() => setGetStartedModalOpen(false)}
        onSelectDonor={() => setDonorModalOpen(true)}
        onSelectHospital={() => setHospitalModalOpen(true)}
      />
    </div>
  );
}

export default App;
