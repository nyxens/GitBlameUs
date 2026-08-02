import { useState } from 'react';
import { Navbar, Footer } from '@layout/index';
import { HeroSection, TestimonialSection, PricingSection, AboutSection } from '@pages/home';
import { DonorSection } from '@pages/donor';
import { HospitalSection } from '@pages/hospital';
import { CitizenPortalPage } from '@pages/citizen';
import { HospitalManagementWebApp } from '@pages/hospitalApp';
import { DonorModal, HospitalPortalModal, FindBloodModal, GetStartedModal, AuthModal } from '@modals/index';

export function App() {
  // Authentication & Navigation State
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('landing');

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
    setCurrentView('workspace'); // Automatically navigate to role-specific workspace upon sign in
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col font-sans selection:bg-purple-500 selection:text-white">


      {/* Global Application Navbar */}
      <Navbar
        user={user}
        onOpenAuthModal={() => handleOpenAuth('CITIZEN')}
        onLogout={handleLogout}
        currentView={currentView}
        onToggleView={(view) => setCurrentView(view)}
      />

      {/* RENDER VIEW SWITCH: WORKSPACE VS LANDING */}
      {currentView === 'workspace' && user ? (
        user.role === 'CITIZEN' ? (
          <CitizenPortalPage user={user} onOpenFindBlood={() => setFindBloodModalOpen(true)} />
        ) : (
          <HospitalManagementWebApp user={user} onOpenLanding={() => setCurrentView('landing')} />
        )
      ) : (
        <>
          {/* LANDING PAGE FLOW */}

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

          {/* Footer */}
          <Footer />
        </>
      )}

      {/* APPLICATION MODALS */}

      {/* Unified Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={authInitialRole}
      />

      {/* Donor Scheduling Modal */}
      <DonorModal
        isOpen={donorModalOpen}
        onClose={() => setDonorModalOpen(false)}
      />

      {/* Hospital Access Modal */}
      <HospitalPortalModal
        isOpen={hospitalModalOpen}
        onClose={() => setHospitalModalOpen(false)}
      />

      {/* Search Blood Modal */}
      <FindBloodModal
        isOpen={findBloodModalOpen}
        onClose={() => setFindBloodModalOpen(false)}
      />

      {/* Get Started Options Modal */}
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
