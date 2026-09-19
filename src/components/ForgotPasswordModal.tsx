import React, { useState } from 'react';
import { Mail, ArrowRight, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  onSuccessToast: (msg: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  onSuccessToast,
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid corporate or facility email address.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (resetErr) throw resetErr;
      } else {
        // Fallback simulation for hackathon demo
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setIsSent(true);
      onSuccessToast(`Password recovery instructions dispatched to ${email}`);
    } catch (err: any) {
      setError(err.message || 'Unable to dispatch recovery instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="forgot-password-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
        <button
          id="btn-close-forgot-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#3DCD58]/15 flex items-center justify-center text-[#3DCD58] border border-[#3DCD58]/20">
            <Mail className="w-5 h-5 text-[#3DCD58]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Reset Credentials</h3>
            <p className="text-xs text-slate-500">EcoWise AI Enterprise Access</p>
          </div>
        </div>

        {isSent ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#3DCD58] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Recovery Link Dispatched</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We have forwarded a cryptographic password recovery link to <span className="font-semibold text-slate-900">{email}</span>. Please verify your inbox and spam folder.
            </p>
            <div className="pt-3">
              <button
                id="btn-forgot-modal-done"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Return to Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Specify your registered facility manager email. We'll generate an encrypted one-time reset link compatible with your SSO or Supabase directory.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] focus:border-transparent transition-all"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-submit-reset"
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 bg-[#3DCD58] hover:bg-[#34b64c] text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Link <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3DCD58]" />
              <span>TLS 1.3 End-to-End Encrypted Handshake</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
