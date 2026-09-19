import React, { useState } from 'react';
import { 
  Zap, 
  Bell, 
  Search, 
  Menu, 
  X, 
  Check, 
  Building2, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useFacility, OperationalScenario } from '../../context/FacilityContext';
import { FACILITY_PROFILES } from '../../data/facilityDatasets';

interface TopNavbarProps {
  user: UserProfile;
  onLogout: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  activeBuilding: string;
  onChangeBuilding: (building: string) => void;
  onShowToast: (msg: string, type: 'success' | 'info') => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  user,
  onLogout,
  onToggleSidebar,
  isSidebarOpen,
  activeBuilding,
  onChangeBuilding,
  onShowToast,
}) => {
  const { theme, resolvedTheme, isDark, setTheme, toggleTheme } = useTheme();
  const { facilityId, setFacilityId, profile, activeScenario, setScenario, isLiveSimulating, toggleLiveSimulation } = useFacility();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false);
  const [showScenarioDropdown, setShowScenarioDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Peak Tariff Window Approaching',
      desc: 'Grid demand charges increase at 14:00. Pre-cooling is running in Zone 2 & 3.',
      time: '5m ago',
      urgent: true,
    },
    {
      id: 'notif-2',
      title: 'AHU-3B Airflow Restored',
      desc: 'AI Copilot auto-trimmed secondary chilled water damper on Floor 3.',
      time: '24m ago',
      urgent: false,
    },
    {
      id: 'notif-3',
      title: 'Monthly Energy Target Passed',
      desc: 'EcoTower Delta is 8.2% ahead of budget, saving 3,820 kWh.',
      time: '2h ago',
      urgent: false,
    },
  ];

  const buildings = [
    'EcoTower Delta (Main HQ)',
    'BioTech Pavilion (East)',
    'Schneider Microgrid Lab',
  ];

  const handleClearNotifications = () => {
    setUnreadCount(0);
    onShowToast('All notifications marked as read', 'info');
  };

  const handleSelectTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setShowThemeMenu(false);
    onShowToast(
      newTheme === 'system'
        ? 'Theme synced with OS system preference'
        : `Switched to ${newTheme === 'dark' ? 'Control Room Dark' : 'High-Contrast Light'} theme`,
      'info'
    );
  };

  return (
    <header
      id="dashboard-top-navbar"
      className="fixed top-0 left-0 right-0 h-16 bg-white/85 dark:bg-[#0f172a]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 z-40 transition-colors duration-200"
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Project Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Project Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#3DCD58] text-slate-950 font-black shadow-sm shadow-[#3DCD58]/30">
              <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                  EcoWise <span className="text-[#3DCD58]">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3DCD58] animate-pulse" />
                  Schneider Green
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
                Smart Building Energy Copilot
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search / Building selector */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search telemetry, sensors, chillers, or press ⌘K..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] transition-all"
            />
            <kbd className="hidden lg:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-700/70 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Building Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBuildingDropdown(!showBuildingDropdown)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200/90 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 whitespace-nowrap transition-all shadow-2xs cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#3DCD58]" />
              <span className="max-w-[140px] truncate">{profile.shortName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            </button>

            {showBuildingDropdown && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Select Facility Complex
                </div>
                {Object.values(FACILITY_PROFILES).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFacilityId(f.id);
                      onChangeBuilding(f.name);
                      setShowBuildingDropdown(false);
                      onShowToast(`Switched active dataset to ${f.shortName} (${f.location})`, 'success');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      facilityId === f.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{f.shortName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{f.location} • {f.floorAreaSqFt.toLocaleString()} sq ft</div>
                    </div>
                    {facilityId === f.id && <Check className="w-3.5 h-3.5 text-[#3DCD58]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Operational Scenario Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowScenarioDropdown(!showScenarioDropdown)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer"
              title="Change operating scenario simulation"
            >
              <span className={`w-2 h-2 rounded-full ${activeScenario === 'heatwave' ? 'bg-amber-500 animate-pulse' : activeScenario === 'intermittent' ? 'bg-indigo-400' : 'bg-[#3DCD58]'}`} />
              <span className="capitalize">{activeScenario} Mode</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showScenarioDropdown && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Simulation Scenario
                </div>
                {[
                  { id: 'standard', label: 'Standard Operations', desc: 'Typical weekday baseline' },
                  { id: 'heatwave', label: 'Severe Heatwave (4CP)', desc: '+22% HVAC load, peak tariffs' },
                  { id: 'intermittent', label: 'Solar Intermittency', desc: 'Cloud cover, 65% PV reduction' },
                  { id: 'nighttime', label: 'Night Standby', desc: 'Vampire load & deep setback' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setScenario(s.id as OperationalScenario);
                      setShowScenarioDropdown(false);
                      onShowToast(`Applied simulation scenario: ${s.label}`, 'info');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      activeScenario === s.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{s.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{s.desc}</div>
                    </div>
                    {activeScenario === s.id && <Check className="w-3.5 h-3.5 text-[#3DCD58]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Theme Switcher, Notifications, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Theme Toggle & Dropdown */}
          <div className="relative">
            <button
              id="btn-navbar-theme-toggle"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-slate-700/70 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title={`Current theme: ${theme} (Click to change)`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              )}
              <span className="hidden xl:inline text-[11px] font-bold text-slate-700 dark:text-slate-300 capitalize">
                {theme}
              </span>
            </button>

            {/* Theme Selector Popover */}
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Select Theme
                </div>
                {[
                  { id: 'light' as const, label: 'Light Mode', icon: Sun, color: 'text-amber-500' },
                  { id: 'dark' as const, label: 'Dark Mode', icon: Moon, color: 'text-indigo-400' },
                  { id: 'system' as const, label: 'System Sync', icon: Laptop, color: 'text-slate-400' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTheme(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#228035] dark:text-[#3DCD58]'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#3DCD58]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notification Icon with unread badge */}
          <div className="relative">
            <button
              id="btn-navbar-notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-slate-700/70 transition-all relative cursor-pointer shadow-2xs"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3DCD58] ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-4 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#3DCD58]/20 text-[#228035] dark:text-[#3DCD58] text-[10px] font-extrabold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="py-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 px-2 rounded-xl transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {notif.urgent && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {notif.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar & Name */}
          <div id="navbar-user-info" className="flex items-center gap-2.5 pl-1 sm:pl-2 border-l border-slate-200/80 dark:border-slate-800">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#3DCD58] shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#3DCD58]/20 border-2 border-[#3DCD58] text-slate-900 dark:text-slate-100 font-bold text-xs flex items-center justify-center shadow-sm">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'EM'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#3DCD58] border-2 border-white dark:border-slate-900" />
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {user.role || 'Facility Operations Manager'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
