import React, { useState, useEffect } from 'react';
import { BBMSHeader, isStaffOrAdmin } from '@layout/BBMSHeader';
import { RecipientsPage } from './RecipientsPage';
import { DonorsPage } from './DonorsPage';
import { HistoryPage } from './HistoryPage';
import { GiverPage } from './GiverPage';
import { SeekerPage } from './SeekerPage';
import { ProfilePage } from './ProfilePage';
import { FacilitiesPage } from './FacilitiesPage';
import { InventoryPage } from './InventoryPage';

export const BBMSWorkspace = ({ user, onLogout, onUpdateUser }) => {
  const isStaff = isStaffOrAdmin(user?.role);
  const allowedSections = isStaff
    ? ['inventory', 'hospitals', 'bloodbanks', 'donors', 'recipients', 'history', 'profile']
    : ['seeker', 'giver', 'profile'];

  const [activeSection, setActiveSection] = useState(() => (isStaff ? 'inventory' : 'seeker'));

  // Ensure activeSection conforms strictly to user role permissions
  useEffect(() => {
    if (!allowedSections.includes(activeSection)) {
      setActiveSection(allowedSections[0]);
    }
  }, [user?.role, activeSection, allowedSections]);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col relative selection:bg-purple-500 selection:text-white">
      {/* Clean BBMS Header */}
      <BBMSHeader
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onLogout={onLogout}
        user={user}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 pt-24 px-6 md:px-16 pb-16">
        {/* 1. INVENTORY SECTION (Staff / Admin Only) */}
        {isStaff && activeSection === 'inventory' && <InventoryPage />}

        {/* HOSPITALS / BLOOD BANKS SECTIONS (Staff / Admin Only) */}
        {isStaff && activeSection === 'hospitals' && <FacilitiesPage type="hospital" isAdmin={user?.role === 'ADMIN'} />}
        {isStaff && activeSection === 'bloodbanks' && <FacilitiesPage type="bloodbank" isAdmin={user?.role === 'ADMIN'} />}

        {/* 2. DONORS SECTION (Staff / Admin Only) */}
        {isStaff && activeSection === 'donors' && <DonorsPage />}

        {/* 3. RECIPIENTS SECTION (Staff / Admin Only) */}
        {isStaff && activeSection === 'recipients' && <RecipientsPage />}

        {/* 4. HISTORY SECTION (Staff / Admin Only) */}
        {isStaff && activeSection === 'history' && <HistoryPage />}

        {/* 5. SEEKER SECTION (Citizen Only) */}
        {!isStaff && activeSection === 'seeker' && <SeekerPage user={user} />}

        {/* 6. GIVER SECTION (Citizen Only) */}
        {!isStaff && activeSection === 'giver' && <GiverPage user={user} />}

        {/* 7. PROFILE SECTION (All Authenticated Users) */}
        {activeSection === 'profile' && (
          <ProfilePage user={user} onUpdateUser={onUpdateUser} />
        )}
      </main>
    </div>
  );
};

export default BBMSWorkspace;
