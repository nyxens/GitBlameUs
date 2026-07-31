export const Footer = () => {
  return (
    <footer id="contact" className="w-full bg-black border-t border-white/10 px-8 md:px-28 py-16 text-neutral-400">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand info */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="LifeVault Logo" className="w-6 h-6 object-contain" />
            <span className="text-xl font-bold tracking-tight text-white font-brand">
              Life<span className="text-purple-400 font-syne">Vault</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-neutral-400">
            Next-generation Blood Bank Management & Life Vault Telemetry System. Empowering blood banks, hospitals, and emergency care.
          </p>
        </div>

        {/* Column 1 */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Vault Platform</h4>
          <a href="#inventory" className="text-sm hover:text-white transition-colors">Live Blood Inventory</a>
          <a href="#donors" className="text-sm hover:text-white transition-colors">Donor Management</a>
          <a href="#dispatch" className="text-sm hover:text-white transition-colors">Emergency Dispatch</a>
          <a href="#coldchain" className="text-sm hover:text-white transition-colors">Cold-Chain Storage</a>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h4>
          <a href="#docs" className="text-sm hover:text-white transition-colors">Documentation</a>
          <a href="#api" className="text-sm hover:text-white transition-colors">Hospital API</a>
          <a href="#status" className="text-sm hover:text-white transition-colors">System Status</a>
          <a href="#compliance" className="text-sm hover:text-white transition-colors">Medical Compliance</a>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Organization</h4>
          <a href="#about" className="text-sm hover:text-white transition-colors">About LifeVault</a>
          <a href="#careers" className="text-sm hover:text-white transition-colors">Healthcare Partners</a>
          <a href="#privacy" className="text-sm hover:text-white transition-colors">Privacy & HIPAA</a>
          <a href="#terms" className="text-sm hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <div>© {new Date().getFullYear()} LifeVault Blood Bank Systems Inc. All rights reserved.</div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};
