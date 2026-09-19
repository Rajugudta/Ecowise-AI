/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthCard } from './components/AuthCard';
import { LivePreviewPanel } from './components/LivePreviewPanel';
import { Dashboard } from './components/Dashboard';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { TermsPrivacyModal } from './components/TermsPrivacyModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { Toast } from './components/Toast';
import { UserProfile, ToastMessage } from './types';
import { supabase, isSupabaseConfigured, mapSupabaseUserToProfile } from './lib/supabase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isTermsPrivacyOpen, setIsTermsPrivacyOpen] = useState(false);
  const [termsPrivacyTab, setTermsPrivacyTab] = useState<'privacy' | 'terms'>('privacy');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({
      id: String(Date.now()),
      type,
      message,
    });
  };

  // Check existing session on mount
  useEffect(() => {
    // 1. Check if Supabase has an active session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile = mapSupabaseUserToProfile(session.user);
          setCurrentUser(profile);
          showToast(`Welcome back, ${profile.name}!`, 'success');
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile = mapSupabaseUserToProfile(session.user);
          setCurrentUser(profile);
        } else {
          // If logged out from Supabase
          if (currentUser?.provider !== 'demo') {
            setCurrentUser(null);
          }
        }
      });

      return () => {
        authListener?.subscription.unsubscribe();
      };
    } else {
      // 2. Check local mock session
      const stored = localStorage.getItem('ecowise_session_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
        } catch (e) {
          console.error('Failed to parse cached session', e);
        }
      }
    }
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('ecowise_session_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('ecowise_session_user');
    setCurrentUser(null);
    showToast('Signed out of EcoWise AI terminal successfully.', 'info');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased selection:bg-[#3DCD58] selection:text-slate-950 ${
      currentUser ? 'bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Global Notification Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Top Navbar for Login Screen */}
      {!currentUser && (
        <Navbar
          user={currentUser}
          onLogout={handleLogout}
          onOpenConfigModal={() => setIsConfigModalOpen(true)}
        />
      )}

      {/* Conditional Rendering: Dashboard when authenticated vs. Login Page */}
      {currentUser ? (
        <Dashboard
          user={currentUser}
          onLogout={handleLogout}
          onShowToast={showToast}
        />
      ) : (
        /* Login Page with High-Quality Smart Building Background & Live Preview Panel */
        <div className="relative flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 min-h-[calc(100vh-64px)] overflow-hidden">
          {/* Background: Full-screen premium smart building / modern architectural office visual */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')`,
            }}
          />

          {/* Slight blur with dark overlay for readability and contrast */}
          <div className="absolute inset-0 z-0 bg-slate-950/75 backdrop-blur-[3px] bg-gradient-to-tr from-slate-950/90 via-slate-950/80 to-slate-900/70" />

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Main content grid: Left Login Card + Right Live Preview Panel */}
          <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4 sm:py-8">
            {/* Left Column: Glassmorphism Login Card */}
            <div className="lg:col-span-5 flex justify-center w-full animate-in fade-in slide-in-from-left-4 duration-500">
              <AuthCard
                onLoginSuccess={handleLoginSuccess}
                onOpenForgotPassword={(email) => {
                  setForgotPasswordEmail(email);
                  setIsForgotPasswordOpen(true);
                }}
                onOpenTermsPrivacy={(tab) => {
                  setTermsPrivacyTab(tab);
                  setIsTermsPrivacyOpen(true);
                }}
                onOpenConfigModal={() => setIsConfigModalOpen(true)}
                onShowToast={showToast}
              />
            </div>

            {/* Right Column: Live Preview Panel */}
            <div className="lg:col-span-7 flex justify-center w-full animate-in fade-in slide-in-from-right-4 duration-500">
              <LivePreviewPanel
                onShowNotification={(msg, type) => showToast(msg, type)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        defaultEmail={forgotPasswordEmail}
        onSuccessToast={(msg) => showToast(msg, 'success')}
      />

      <TermsPrivacyModal
        isOpen={isTermsPrivacyOpen}
        onClose={() => setIsTermsPrivacyOpen(false)}
        initialTab={termsPrivacyTab}
      />

      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSaved={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
}
