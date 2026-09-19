import React, { useState } from 'react';
import { UserProfile } from '../types';
import { TopNavbar } from './dashboard/TopNavbar';
import { Sidebar, DashboardTab } from './dashboard/Sidebar';
import { Views } from './dashboard/Views';
import { CommandPalette } from './dashboard/CommandPalette';

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onShowToast }) => {
  const [currentTab, setCurrentTab] = useState<DashboardTab>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [activeBuilding, setActiveBuilding] = useState('EcoTower Delta (Main HQ)');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const getTabTitle = (tab: DashboardTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Facility Energy Overview';
      case 'executive':
        return 'Executive C-Suite Dashboard';
      case 'prediction':
        return 'AI Demand & Generation Forecasting';
      case 'simulator':
        return 'AI Energy Optimization Simulator';
      case 'digitaltwin':
        return 'Interactive Building Digital Twin';
      case 'carbon':
        return 'Carbon Intelligence & Net Zero Tracker';
      case 'insights':
        return 'AI Insights & Opportunity Matrix';
      case 'advisor':
        return 'AI Energy Copilot & Advisor';
      case 'alerts':
        return 'Smart Anomaly Alerts';
      case 'analytics':
        return 'Deep Energy Analytics & Heatmaps';
      case 'reports':
        return 'Enterprise Energy & Carbon Reports';
      case 'settings':
        return 'System & Building Settings';
      default:
        return tab;
    }
  };

  return (
    <div
      id="ecowise-saas-dashboard"
      className="min-h-screen bg-slate-50/60 dark:bg-[#0b0f17] font-sans text-slate-900 dark:text-slate-100 antialiased flex flex-col transition-colors duration-200"
    >
      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => setCurrentTab(tab as DashboardTab)}
        onTriggerAction={(action) => {
          onShowToast(`Executed: ${action}`, 'success');
        }}
      />

      {/* 1. Fixed Top Navbar */}
      <TopNavbar
        user={user}
        onLogout={onLogout}
        onToggleSidebar={() => setIsSidebarOpenMobile((prev) => !prev)}
        isSidebarOpen={isSidebarOpenMobile}
        activeBuilding={activeBuilding}
        onChangeBuilding={setActiveBuilding}
        onShowToast={(msg, type) => onShowToast(msg, type)}
      />

      <div className="flex flex-1 pt-16">
        {/* 2. Fixed Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onLogout={onLogout}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          alertCount={2}
        />

        {/* 3. Main Scrollable Workspace Content */}
        <main
          id="dashboard-main-content"
          className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-300"
        >
          {/* Subheader / Breadcrumbs bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
                <span>{activeBuilding}</span>
                <span>/</span>
                <span className="text-[#3DCD58] capitalize font-bold">{currentTab}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {getTabTitle(currentTab)}
              </h1>
            </div>

            {/* Live Operational Status Tag & Quick Search Shortcut */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs cursor-pointer"
                title="Open Command Palette (Ctrl+K)"
              >
                <span>Search features...</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
                  ⌘K
                </kbd>
              </button>

              <div className="px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3DCD58] animate-ping" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Schneider EcoStruxure BMS</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  Syncing
                </span>
              </div>
            </div>
          </div>

          {/* Render Active View */}
          <Views
            currentTab={currentTab}
            user={user}
            onLogout={onLogout}
            onShowToast={(msg, type) => onShowToast(msg, type)}
            onNavigate={(tab) => setCurrentTab(tab as DashboardTab)}
          />
        </main>
      </div>
    </div>
  );
};
