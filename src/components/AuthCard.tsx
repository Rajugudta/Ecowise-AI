import React, { useState } from 'react';
import { 
  Zap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { UserProfile, AuthViewMode } from '../types';
import { 
  supabase, 
  isSupabaseConfigured, 
  signInWithGoogleOAuth, 
  DEMO_FACILITY_MANAGER
} from '../lib/supabase';

interface AuthCardProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenForgotPassword: (email: string) => void;
  onOpenTermsPrivacy: (tab: 'privacy' | 'terms') => void;
  onOpenConfigModal: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  onLoginSuccess,
  onOpenForgotPassword,
  onOpenTermsPrivacy,
  onOpenConfigModal,
  onShowToast,
}) => {
  const [authMode, setAuthMode] = useState<AuthViewMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Real-time validation
  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError('Please enter a valid work email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    if (val.length < 6) {
      setPasswordError('Password must contain at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateFullName = (val: string) => {
    if (authMode === 'signup' && !val.trim()) {
      setNameError('Full name is required for facility clearance');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isNameValid = authMode === 'signup' ? validateFullName(fullName) : true;

    if (!isEmailValid || !isPasswordValid || !isNameValid) {
      onShowToast('Please correct the highlighted validation fields.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        if (authMode === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                role: 'Facility Operations Lead',
                organization: 'EcoWise Enterprise Member',
              },
            },
          });

          if (error) throw error;

          if (data.user) {
            onShowToast('Account successfully created! Signing you in...', 'success');
            const userProfile: UserProfile = {
              id: data.user.id,
              email: data.user.email || email,
              name: fullName || 'Facility Manager',
              role: 'Facility Operations Lead',
              organization: 'EcoWise Enterprise Member',
              buildingAssigned: 'EcoTower Delta (Zone 4)',
              provider: 'email',
            };
            onLoginSuccess(userProfile);
          }
        } else {
          // Sign in
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            const meta = data.user.user_metadata || {};
            const userProfile: UserProfile = {
              id: data.user.id,
              email: data.user.email || email,
              name: meta.full_name || meta.name || email.split('@')[0],
              role: meta.role || 'Facility Operations Manager',
              organization: meta.organization || 'Smart Campus Operations',
              buildingAssigned: meta.building || 'EcoTower Delta (Zone 4)',
              avatarUrl: meta.avatar_url,
              provider: 'email',
            };
            onShowToast(`Welcome back, ${userProfile.name}!`, 'success');
            onLoginSuccess(userProfile);
          }
        }
      } else {
        // Interactive simulation for hackathon prototype
        await new Promise((resolve) => setTimeout(resolve, 800));
        const demoUser: UserProfile = {
          id: 'user-' + Date.now(),
          email: email,
          name: authMode === 'signup' ? fullName : (email.includes('@') ? email.split('@')[0].replace('.', ' ') : 'Facility Manager'),
          role: 'Facility Energy Manager',
          organization: 'Schneider Electric Partner Network',
          buildingAssigned: 'EcoTower Delta (Zone 4)',
          provider: 'email',
        };
        onShowToast(
          authMode === 'signup' 
            ? `Welcome to EcoWise AI, ${demoUser.name}!` 
            : `Welcome back, ${demoUser.name}!`, 
          'success'
        );
        onLoginSuccess(demoUser);
      }
    } catch (err: any) {
      onShowToast(err.message || 'Authentication failed. Please verify credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogleOAuth();
      if (res.error) {
        onShowToast(res.error, 'error');
      } else if (res.data?.redirected) {
        onShowToast('Google authorization launched in new window. Return here once complete!', 'info');
      } else if (res.data) {
        onShowToast('Authenticated successfully with Google OAuth!', 'success');
        onLoginSuccess(res.data);
      }
    } catch (err: any) {
      onShowToast(err.message || 'Failed to initialize Google OAuth session.', 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFastDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onShowToast('Signed in as Senior Sustainability Engineer (Demo Clearance)', 'success');
      onLoginSuccess(DEMO_FACILITY_MANAGER);
      setIsLoading(false);
    }, 450);
  };

  return (
    <div
      id="login-card"
      className="w-full max-w-[480px] bg-white/95 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-200/90 relative z-10 transition-all duration-300"
    >
      {/* Top Brand Header */}
      <div className="text-center mb-6">
        {/* EcoWise AI logo placeholder with Schneider Electric Green accent */}
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-emerald-500/10 via-[#3DCD58]/20 to-emerald-400/10 border border-[#3DCD58]/30 shadow-sm mb-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[#3DCD58] text-slate-950 shadow-md shadow-[#3DCD58]/30">
            <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          EcoWise <span className="text-[#3DCD58]">AI</span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Smart Building Energy Copilot
        </p>
      </div>

      {/* Supabase status indicator badge */}
      <div className="mb-5 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConfigured ? 'bg-[#3DCD58]' : 'bg-emerald-500'
            }`}
          />
          <span className="text-slate-600 font-medium">
            Auth Service: <b className="text-slate-900">{isSupabaseConfigured ? 'Supabase Live' : 'Supabase Ready'}</b>
          </span>
        </div>
        <button
          id="btn-open-supabase-config"
          type="button"
          onClick={onOpenConfigModal}
          className="text-[#2fae47] hover:text-[#258d39] font-semibold text-[11px] underline underline-offset-2"
        >
          Setup Guide
        </button>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name for Sign Up */}
        {authMode === 'signup' && (
          <div>
            <label htmlFor="input-full-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name & Title
            </label>
            <div className="relative">
              <input
                id="input-full-name"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (nameError) validateFullName(e.target.value);
                }}
                placeholder="e.g. Alex Morgan (Facility Director)"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  nameError
                    ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                    : 'border-slate-200 focus:ring-[#3DCD58] focus:border-transparent'
                }`}
              />
            </div>
            {nameError && <p className="text-[11px] text-red-500 mt-1">{nameError}</p>}
          </div>
        )}

        {/* Email Field with validation */}
        <div>
          <label htmlFor="input-email" className="block text-xs font-semibold text-slate-700 mb-1">
            Work Email Address
          </label>
          <div className="relative">
            <input
              id="input-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
              placeholder="facility.manager@schneider-campus.com"
              className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                emailError
                  ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                  : 'border-slate-200 focus:ring-[#3DCD58] focus:border-transparent'
              }`}
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {emailError && (
            <p id="email-validation-msg" className="text-[11px] text-red-500 mt-1 font-medium">
              {emailError}
            </p>
          )}
        </div>

        {/* Password Field with show/hide toggle */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="input-password" className="block text-xs font-semibold text-slate-700">
              Password
            </label>
            {authMode === 'signin' && (
              <button
                id="btn-forgot-password"
                type="button"
                onClick={() => onOpenForgotPassword(email)}
                className="text-[11px] font-semibold text-[#2fae47] hover:text-[#258d39] hover:underline"
              >
                Forgot Password?
              </button>
            )}
          </div>

          <div className="relative">
            <input
              id="input-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
              }}
              onBlur={() => validatePassword(password)}
              placeholder="••••••••••••"
              className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                passwordError
                  ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                  : 'border-slate-200 focus:ring-[#3DCD58] focus:border-transparent'
              }`}
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              id="btn-toggle-password-visibility"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordError && (
            <p id="password-validation-msg" className="text-[11px] text-red-500 mt-1 font-medium">
              {passwordError}
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
            <input
              id="checkbox-remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#3DCD58] focus:ring-[#3DCD58] cursor-pointer accent-[#3DCD58]"
            />
            <span>Remember facility terminal</span>
          </label>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3DCD58]" /> 256-Bit SSL
          </span>
        </div>

        {/* Primary Sign In Button with Schneider Green #3DCD58 */}
        <button
          id="btn-primary-sign-in"
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full py-3 px-4 bg-[#3DCD58] hover:bg-[#34b64c] active:scale-[0.99] text-slate-950 font-bold rounded-2xl text-xs sm:text-sm tracking-wide shadow-lg shadow-[#3DCD58]/25 hover:shadow-xl hover:shadow-[#3DCD58]/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Authenticating Session...</span>
            </>
          ) : (
            <>
              <span>{authMode === 'signin' ? 'Sign In to Energy Copilot' : 'Create Facility Account'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>
      </form>

      {/* Divider with OR */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider text-[10px]">
            OR
          </span>
        </div>
      </div>

      {/* Continue with Google button (Google OAuth) */}
      <div className="space-y-2.5">
        <button
          id="btn-google-oauth-sign-in"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-700 font-semibold border border-slate-200 rounded-2xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-75"
        >
          {isGoogleLoading ? (
            <span className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Instant Demo Clearance for Hackathon Judges */}
        <button
          id="btn-demo-quick-access"
          type="button"
          onClick={handleFastDemoLogin}
          className="w-full py-2 px-3 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
        >
          <UserCheck className="w-3.5 h-3.5 text-[#3DCD58]" />
          <span>Quick Demo Access (Senior Facility Manager)</span>
        </button>
      </div>

      {/* Toggle Sign In / Sign Up link */}
      <div className="mt-5 text-center text-xs text-slate-600">
        {authMode === 'signin' ? (
          <p>
            Don't have an account?{' '}
            <button
              id="btn-toggle-sign-up"
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setEmailError('');
                setPasswordError('');
              }}
              className="font-bold text-[#2fae47] hover:text-[#258d39] hover:underline"
            >
              Sign Up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              id="btn-toggle-sign-in"
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setEmailError('');
                setPasswordError('');
              }}
              className="font-bold text-[#2fae47] hover:text-[#258d39] hover:underline"
            >
              Sign In
            </button>
          </p>
        )}
      </div>

      {/* Footer with Privacy Policy and Terms */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] text-slate-400">
        <button
          id="btn-footer-privacy"
          type="button"
          onClick={() => onOpenTermsPrivacy('privacy')}
          className="hover:text-slate-600 hover:underline"
        >
          Privacy Policy
        </button>
        <span>•</span>
        <button
          id="btn-footer-terms"
          type="button"
          onClick={() => onOpenTermsPrivacy('terms')}
          className="hover:text-slate-600 hover:underline"
        >
          Terms of Service
        </button>
        <span>•</span>
        <span className="text-slate-400">Schneider Green Tier</span>
      </div>
    </div>
  );
};
