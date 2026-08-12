import { useState } from 'react';
import { Navbar, Footer } from '@layout/index';
import { HeroSection, TestimonialSection, PricingSection, AboutSection } from '@pages/home';
import { DonorSection } from '@pages/donor';
import { HospitalSection } from '@pages/hospital';
import { BBMSWorkspace } from '@pages/bbms';
import { DonorModal, HospitalPortalModal, FindBloodModal, GetStartedModal, AuthModal } from '@modals/index';

export function App() {
  // Authentication State
  const [user, setUser] = useState(null);

  // Modal Visibility States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState('CITIZEN');
  const [donorModalOpen, setDonorModalOpen] = useState(false);
  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
  const [findBloodModalOpen, setFindBloodModalOpen] = useState(false);
  const [getStartedModalOpen, setGetStartedModalOpen] = useState(false);

  // Trigger Auth Modal for specific role
  const handleOpenAuth = (role = 'CITIZEN') => {
    setAuthInitialRole(role);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // IF USER IS AUTHENTICATED: Launch isolated BBMS Application (Landing Page is completely hidden & inaccessible)
  if (user) {
    return <BBMSWorkspace user={user} onLogout={handleLogout} />;
  }

  // IF USER IS NOT AUTHENTICATED: Display Public Landing Page
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Public Landing Page Navbar */}
      <Navbar onOpenAuthModal={() => handleOpenAuth('CITIZEN')} />

      {/* Hero Section */}
      <HeroSection
        onOpenFindBloodModal={() => setFindBloodModalOpen(true)}
        onOpenGetStartedModal={() => handleOpenAuth('CITIZEN')}
      />

      {/* Citizen & Donor Section */}
      <DonorSection onOpenDonorModal={() => handleOpenAuth('CITIZEN')} />

      {/* Hospital Network Portal Section */}
      <HospitalSection onOpenHospitalModal={() => handleOpenAuth('HOSPITAL')} />

      {/* Reviews & Testimonials Section */}
      <TestimonialSection />

      {/* BBMS Licensing & Pricing Section */}
      <PricingSection onOpenAuthModal={handleOpenAuth} />

      {/* About Section */}
      <AboutSection />

      {/* Landing Page Footer */}
      <Footer />

      {/* APPLICATION MODALS */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={authInitialRole}
      />

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
        onSelectDonor={() => handleOpenAuth('CITIZEN')}
        onSelectHospital={() => handleOpenAuth('HOSPITAL')}
      />
    </div>
  );
}

export default App;
