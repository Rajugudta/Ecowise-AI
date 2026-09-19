import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [tab, setTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      id="terms-privacy-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
        <button
          id="btn-close-terms-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-[#3DCD58]/15 flex items-center justify-center text-[#3DCD58]">
            <ShieldCheck className="w-5 h-5 text-[#3DCD58]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Legal & Enterprise Compliance</h3>
            <p className="text-xs text-slate-500">EcoWise AI Smart Building Governance</p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 pt-3 pb-1">
          <button
            id="tab-btn-privacy"
            onClick={() => setTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              tab === 'privacy'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#3DCD58]" />
            Privacy Policy
          </button>
          <button
            id="tab-btn-terms"
            onClick={() => setTab('terms')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              tab === 'terms'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#3DCD58]" />
            Terms of Service
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4 text-xs text-slate-600 leading-relaxed">
          {tab === 'privacy' ? (
            <>
              <h4 className="font-bold text-slate-900 text-sm">1. Facility Data Sovereignty & Telemetry Privacy</h4>
              <p>
                EcoWise AI collects building operational data (HVAC sensor telemetry, power meter readings, kilowatt load curves, occupancy counts) strictly for energy optimization, anomaly detection, and ESG sustainability reporting. We do not inspect individual biometric data.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. Zero Third-Party Monetization</h4>
              <p>
                Building energy metrics and operational schedules remain strictly proprietary to your organization. Data processed through our AI models (including Google Gemini and predictive load algorithms) is not utilized to train public foundation models without explicit contractual agreement.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. SOC2 Type II & ISO 50001 Alignment</h4>
              <p>
                All data transmission between building edge controllers (BACnet/IP, Modbus TCP) and the EcoWise cloud platform is protected by TLS 1.3 encryption and AES-256 resting encryption.
              </p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-slate-900 text-sm">1. Acceptance of Terms</h4>
              <p>
                By accessing EcoWise AI Smart Building Energy Copilot, facility personnel agree to adhere to verified building safety codes, ASHRAE guidelines, and local grid demand response standards.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. Automated AI Control Safeguards</h4>
              <p>
                EcoWise AI provides recommendations and automated setpoint modulation (e.g., chiller pre-cooling, VAV air distribution). Facility operators retain override capability through localized BMS manual switchboards.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. Hackathon & Prototype Notice</h4>
              <p>
                This instance is operating as a production-grade demonstration for the Hackathon. Features include live Supabase authentication integration and simulated microgrid telemetry.
              </p>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            id="btn-close-legal"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
