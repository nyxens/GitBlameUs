import React, { useState } from 'react';
import { BBMSHeader } from '@layout/BBMSHeader';
import { Boxes, Users } from 'lucide-react';

export const BBMSWorkspace = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('inventory');

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col relative selection:bg-purple-500 selection:text-white">
      {/* Clean BBMS Header */}
      <BBMSHeader
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onLogout={onLogout}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 pt-24 px-6 md:px-16 pb-12">
        {activeSection === 'inventory' && (
          <section className="w-full">
            <div className="flex items-center gap-3">
              <Boxes className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Blood Vault <span className="font-serif italic font-normal text-purple-400">Inventory</span>
              </h1>
            </div>
          </section>
        )}

        {activeSection === 'donors' && (
          <section className="w-full">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-red-400" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Registered <span className="font-serif italic font-normal text-red-400">Donors</span>
              </h1>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default BBMSWorkspace;
