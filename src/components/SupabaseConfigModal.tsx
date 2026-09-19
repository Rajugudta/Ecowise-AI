import React, { useState } from 'react';
import { X, Key, ExternalLink, Check, Copy, AlertCircle, ShieldCheck, Database } from 'lucide-react';
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured, saveSupabaseConfig } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [url, setUrl] = useState(supabaseUrl || '');
  const [key, setKey] = useState(supabaseAnonKey || '');
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, key);
    onSaved('Supabase configuration saved! The client has been updated.');
    onClose();
    // Soft reload to apply new configuration
    window.location.reload();
  };

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div
      id="supabase-config-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        <button
          id="btn-close-config-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-[#3DCD58]">
            <Database className="w-5 h-5 text-[#3DCD58]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Supabase & Google OAuth Configuration</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isSupabaseConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isSupabaseConfigured ? 'Live Supabase Connected' : 'Demo Mode Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Complete setup guide and live credentials manager for hackathon judges & engineers.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6 text-xs text-slate-600">
          {/* Status Alert Banner */}
          {!isSupabaseConfigured && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Running in Interactive Demo Mode</p>
                <p className="text-amber-700 mt-1 leading-relaxed">
                  The login page is 100% testable right now! You can use "Continue with Google" or "Sign In with Demo Manager" to view the full post-login dashboard. To hook up your personal Supabase project, follow the 3 simple steps below.
                </p>
              </div>
            </div>
          )}

          {/* Form to enter Supabase credentials */}
          <form onSubmit={handleSave} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#3DCD58]" /> Live Project Credentials
            </h4>

            <div>
              <label htmlFor="cfg-supabase-url" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Supabase Project URL (e.g. https://yourproject.supabase.co)
              </label>
              <input
                id="cfg-supabase-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzabcdef.supabase.co"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58]"
              />
            </div>

            <div>
              <label htmlFor="cfg-supabase-key" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                id="cfg-supabase-key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setUrl('');
                  setKey('');
                  saveSupabaseConfig('', '');
                  window.location.reload();
                }}
                className="text-[11px] text-red-600 hover:underline font-medium"
              >
                Reset to Demo Defaults
              </button>
              <button
                id="btn-save-supabase-cfg"
                type="submit"
                className="px-4 py-2 bg-[#3DCD58] hover:bg-[#34b64c] text-slate-950 font-bold rounded-xl text-xs shadow-sm transition-all"
              >
                Save & Apply Credentials
              </button>
            </div>
          </form>

          {/* Step by Step Setup Instructions */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              10-Step Supabase & Google OAuth Setup Instructions
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="font-semibold text-slate-900">Step 1: Create Supabase Project</span>
                <p className="text-slate-600">
                  Head over to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a> and create a new free project named <b>EcoWise-AI</b>.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="font-semibold text-slate-900">Step 2: Copy API Credentials</span>
                <p className="text-slate-600">
                  Navigate to <b>Project Settings &gt; API</b>. Copy your <code>Project URL</code> and <code>anon public key</code> into the input fields above or into your <code>.env</code> file.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Step 3: Enable Google OAuth in Supabase</span>
                  <button
                    onClick={() => copyToClipboard('https://supabase.com/dashboard/project/_/auth/providers', 3)}
                    className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium hover:underline"
                  >
                    {copiedStep === 3 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedStep === 3 ? 'Copied' : 'Copy path'}
                  </button>
                </div>
                <p className="text-slate-600">
                  Go to <b>Authentication &gt; Providers &gt; Google</b>. Toggle Google to <b>Enabled</b>. Paste your Google Cloud OAuth <b>Client ID</b> and <b>Client Secret</b>.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Step 4: Configure Google Cloud OAuth Redirect URI</span>
                  <button
                    onClick={() => copyToClipboard('https://<your-project-id>.supabase.co/auth/v1/callback', 4)}
                    className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium hover:underline"
                  >
                    {copiedStep === 4 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedStep === 4 ? 'Copied' : 'Copy URI pattern'}
                  </button>
                </div>
                <p className="text-slate-600">
                  In the Google Cloud Console (APIs & Services &gt; Credentials &gt; Authorized Redirect URIs), enter: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">https://&lt;your-project-id&gt;.supabase.co/auth/v1/callback</code>
                </p>
              </div>

              <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-950">Step 5: Supabase URL Configuration (Redirects)</span>
                  <button
                    onClick={() => copyToClipboard('https://ais-dev-lb6ab5eftu2ykuotbyuaei-355516064721.asia-southeast1.run.app', 5)}
                    className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium hover:underline"
                  >
                    {copiedStep === 5 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedStep === 5 ? 'Copied' : 'Copy App URL'}
                  </button>
                </div>
                <p className="text-emerald-900 text-[11px] leading-relaxed">
                  In Supabase <b>Authentication &gt; URL Configuration</b>:
                </p>
                <ul className="list-disc pl-4 text-[11px] text-emerald-800 space-y-0.5">
                  <li><b>Site URL:</b> <code className="bg-white px-1 py-0.5 rounded">https://ais-dev-lb6ab5eftu2ykuotbyuaei-355516064721.asia-southeast1.run.app</code></li>
                  <li><b>Redirect URLs:</b> <code className="bg-white px-1 py-0.5 rounded">https://ais-dev-lb6ab5eftu2ykuotbyuaei-355516064721.asia-southeast1.run.app/**</code></li>
                </ul>
              </div>

              <div className="p-3 rounded-xl border border-amber-300 bg-amber-50/60 space-y-1.5">
                <span className="font-semibold text-amber-950 text-xs">⚠️ Fixing Google "403: You do not have access to this page"</span>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  If Google displays 403 on the consent screen:
                </p>
                <ol className="list-decimal pl-4 text-[11px] text-amber-800 space-y-1">
                  <li>In Google Cloud Console &gt; <b>OAuth consent screen</b>: Change User Type to <b>External</b> (not Internal).</li>
                  <li>Under <b>Test users</b>: Click <b>+ Add Users</b> and add your email address (<code>rajugumadal@gmail.com</code>).</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3DCD58]" />
            Keys stored securely in client memory/localStorage
          </span>
          <button
            id="btn-dismiss-config"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
