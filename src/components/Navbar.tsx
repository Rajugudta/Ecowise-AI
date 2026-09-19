import React from 'react';
import { Zap, LogOut, Settings, ShieldCheck, Database, Building2 } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
  onOpenConfigModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onOpenConfigModal }) => {
  return (
    <header
      id="main-app-header"
      className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#3DCD58] text-slate-950 font-black shadow-sm shadow-[#3DCD58]/30">
            <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                EcoWise <span className="text-[#3DCD58]">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3DCD58] animate-pulse"></span>
                Schneider Green #3DCD58
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 font-medium -mt-0.5">
              Smart Building Energy Copilot
            </p>
          </div>
        </div>

        {/* Right: User Profile or Quick Tools */}
        <div className="flex items-center gap-3">
          {user ? (
            /* Logged in state: Display user's profile picture and name in navbar */
            <div id="navbar-user-profile" className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-500 font-medium flex items-center justify-end gap-1">
                  <Building2 className="w-3 h-3 text-[#3DCD58]" />
                  {user.buildingAssigned || 'EcoTower Delta'}
                </span>
              </div>

              {/* Profile avatar */}
              <div className="relative">
                {user.avatarUrl ? (
                  <img
                    id="navbar-user-avatar"
                    src={user.avatarUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#3DCD58] shadow-sm"
                  />
                ) : (
                  <div
                    id="navbar-user-avatar-fallback"
                    className="w-9 h-9 rounded-full bg-[#3DCD58]/20 border-2 border-[#3DCD58] text-slate-900 font-bold text-xs flex items-center justify-center shadow-sm"
                  >
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'EM'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#3DCD58] border-2 border-white" />
              </div>

              {/* Sign out button */}
              <button
                id="btn-navbar-logout"
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all flex items-center gap-1.5 text-xs font-medium"
                title="Sign Out of Session"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            /* Login view: Status & Supabase instructions button */
            <div className="flex items-center gap-2">
              <button
                id="btn-navbar-config"
                onClick={onOpenConfigModal}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200/80 transition-all flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5 text-[#3DCD58]" />
                <span className="hidden sm:inline">Supabase & OAuth Guide</span>
                <span className="sm:hidden">Guide</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
