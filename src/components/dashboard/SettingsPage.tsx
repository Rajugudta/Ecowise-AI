import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Building, 
  Bell, 
  Palette, 
  Globe, 
  Shield, 
  Sun, 
  Moon, 
  Laptop, 
  LogOut, 
  Check, 
  Save, 
  Key, 
  Smartphone, 
  Clock, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Mail, 
  Phone, 
  Layers, 
  Sliders, 
  RefreshCw, 
  Lock,
  ChevronRight,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfile } from '../../types';
import { settingsApi, formatErrorMessage } from '../../services/api.js';
import { useTheme } from '../../context/ThemeContext';

interface SettingsPageProps {
  user: UserProfile;
  onLogout: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

type SettingsTab = 
  | 'profile' 
  | 'organization' 
  | 'building' 
  | 'notifications' 
  | 'appearance' 
  | 'language' 
  | 'security';

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout, onShowToast }) => {
  const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 1. Profile State
  const [fullName, setFullName] = useState(user.name || 'Alex Morgan');
  const [email, setEmail] = useState(user.email || 'alex.morgan@ecotower.com');
  const [jobTitle, setJobTitle] = useState(user.role || 'Senior Facility Director');
  const [department, setDepartment] = useState('Sustainable Infrastructure & Operations');
  const [phone, setPhone] = useState('+1 (415) 890-3412');
  const [timezone, setTimezone] = useState('America/Los_Angeles (PST - UTC-8)');

  // 2. Organization State
  const [orgName, setOrgName] = useState(user.organization || 'EcoTower Global Properties');
  const [industry, setIndustry] = useState('Commercial Real Estate & Microgrids');
  const [orgId] = useState('ORG-SCHNEIDER-8821-EXP');
  const [billingContact, setBillingContact] = useState('finance@ecotower.com');
  const [billingCurrency, setBillingCurrency] = useState('USD ($)');

  // 3. Building Information State
  const [buildingName, setBuildingName] = useState('EcoTower Delta (Main HQ)');
  const [buildingCode, setBuildingCode] = useState('BLD-ECO-04');
  const [gfa, setGfa] = useState('145,000 sq.ft (13,470 m²)');
  const [floorsCount, setFloorsCount] = useState('4 Above-Ground + 2 Sub-Levels');
  const [yearBuilt, setYearBuilt] = useState('2021 (Deep Retrofit: 2024)');
  const [primaryChiller, setPrimaryChiller] = useState('York Dual-Centrifugal VFD (500 Ton)');
  const [peakTariff, setPeakTariff] = useState('0.24');
  const [offPeakTariff, setOffPeakTariff] = useState('0.09');
  const [demandLimitKW, setDemandLimitKW] = useState('280');

  // 4. Notifications State
  const [notifCriticalEmail, setNotifCriticalEmail] = useState(true);
  const [notifCriticalSMS, setNotifCriticalSMS] = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(true);
  const [notifCopilotSuggestions, setNotifCopilotSuggestions] = useState(true);
  const [notifPeakDemandAlert, setNotifPeakDemandAlert] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('06:00');

  // 5. Appearance & Theme Switch State
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(globalTheme);
  const [accentColor, setAccentColor] = useState<'schneider' | 'blue' | 'emerald' | 'amber'>('schneider');
  const [uiDensity, setUiDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [enableAnimations, setEnableAnimations] = useState(true);

  useEffect(() => {
    setThemeMode(globalTheme);
  }, [globalTheme]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeMode(newTheme);
    setGlobalTheme(newTheme);
  };

  // 6. Language & Localization State
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [unitsSystem, setUnitsSystem] = useState<'imperial' | 'metric'>('imperial');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  // 7. Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [ssoConnected] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSettings = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoadingSettings(true);

    try {
      const data = await settingsApi.get();
      if (data) {
        if (data.profile) {
          if (data.profile.name) setFullName(data.profile.name);
          if (data.profile.email) setEmail(data.profile.email);
          if (data.profile.role) setJobTitle(data.profile.role);
          if (data.profile.department) setDepartment(data.profile.department);
          if (data.profile.phone) setPhone(data.profile.phone);
          if (data.profile.timezone) setTimezone(data.profile.timezone);
        }
        if (data.organization) {
          if (data.organization.name) setOrgName(data.organization.name);
          if (data.organization.industry) setIndustry(data.organization.industry);
          if (data.organization.billingContact) setBillingContact(data.organization.billingContact);
          if (data.organization.billingCurrency) setBillingCurrency(data.organization.billingCurrency);
        }
        if (data.building) {
          if (data.building.name) setBuildingName(data.building.name);
          if (data.building.code) setBuildingCode(data.building.code);
          if (data.building.gfa) setGfa(data.building.gfa);
          if (data.building.floorsCount) setFloorsCount(data.building.floorsCount);
          if (data.building.yearBuilt) setYearBuilt(data.building.yearBuilt);
          if (data.building.primaryChiller) setPrimaryChiller(data.building.primaryChiller);
          if (data.building.peakTariff !== undefined) setPeakTariff(String(data.building.peakTariff));
          if (data.building.offPeakTariff !== undefined) setOffPeakTariff(String(data.building.offPeakTariff));
          if (data.building.demandLimitKW !== undefined) setDemandLimitKW(String(data.building.demandLimitKW));
        }
        if (data.notifications) {
          if (data.notifications.criticalEmail !== undefined) setNotifCriticalEmail(data.notifications.criticalEmail);
          if (data.notifications.criticalSMS !== undefined) setNotifCriticalSMS(data.notifications.criticalSMS);
          if (data.notifications.weeklyDigest !== undefined) setNotifWeeklyDigest(data.notifications.weeklyDigest);
          if (data.notifications.copilotSuggestions !== undefined) setNotifCopilotSuggestions(data.notifications.copilotSuggestions);
          if (data.notifications.peakDemandAlert !== undefined) setNotifPeakDemandAlert(data.notifications.peakDemandAlert);
          if (data.notifications.quietHoursStart) setQuietHoursStart(data.notifications.quietHoursStart);
          if (data.notifications.quietHoursEnd) setQuietHoursEnd(data.notifications.quietHoursEnd);
        }
        if (data.appearance) {
          if (data.appearance.theme) setThemeMode(data.appearance.theme);
          if (data.appearance.accentColor) setAccentColor(data.appearance.accentColor);
          if (data.appearance.uiDensity) setUiDensity(data.appearance.uiDensity);
          if (data.appearance.enableAnimations !== undefined) setEnableAnimations(data.appearance.enableAnimations);
        }
        if (data.language) {
          if (data.language.language) setSelectedLanguage(data.language.language);
          if (data.language.units) setUnitsSystem(data.language.units);
          if (data.language.dateFormat) setDateFormat(data.language.dateFormat);
        }
        if (data.security) {
          if (data.security.twoFactor !== undefined) setTwoFactorEnabled(data.security.twoFactor);
        }
        if (isManual) {
          onShowToast('Synced settings from FastAPI server', 'success');
        }
      }
    } catch (err) {
      onShowToast(`Loaded local profile: ${formatErrorMessage(err)}`, 'info');
    } finally {
      setIsLoadingSettings(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (sectionLabel: string) => {
    setIsSaving(true);
    try {
      if (activeSubTab === 'profile') {
        await settingsApi.updateProfile({
          name: fullName,
          email,
          role: jobTitle,
          department,
          phone,
          timezone,
        });
      } else if (activeSubTab === 'building') {
        await settingsApi.updateBuilding({
          name: buildingName,
          code: buildingCode,
          gfa,
          floorsCount,
          yearBuilt,
          primaryChiller,
          peakTariff: parseFloat(peakTariff) || 0.24,
          offPeakTariff: parseFloat(offPeakTariff) || 0.09,
          demandLimitKW: parseFloat(demandLimitKW) || 280,
        });
      } else if (activeSubTab === 'notifications') {
        await settingsApi.updateNotifications({
          criticalEmail: notifCriticalEmail,
          criticalSMS: notifCriticalSMS,
          weeklyDigest: notifWeeklyDigest,
          copilotSuggestions: notifCopilotSuggestions,
          peakDemandAlert: notifPeakDemandAlert,
          quietHoursStart,
          quietHoursEnd,
        });
      } else if (activeSubTab === 'appearance') {
        await settingsApi.updateAppearance({
          theme: themeMode,
          accentColor,
          uiDensity,
          enableAnimations,
        });
      } else if (activeSubTab === 'security') {
        await settingsApi.updateSecurity({
          twoFactor: twoFactorEnabled,
          newPassword: newPassword || undefined,
        });
        if (newPassword) {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      } else {
        // general organization or language
        await settingsApi.update({
          organization: { name: orgName, industry, billingContact, billingCurrency },
          language: { language: selectedLanguage, units: unitsSystem, dateFormat },
        });
      }
      onShowToast(`${sectionLabel} settings saved to FastAPI`, 'success');
    } catch (err) {
      onShowToast(`Error saving settings: ${formatErrorMessage(err)}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const navMenuItems = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User, desc: 'Personal details & role' },
    { id: 'organization' as SettingsTab, label: 'Organization', icon: Building2, desc: 'Enterprise team & tier' },
    { id: 'building' as SettingsTab, label: 'Building Information', icon: Building, desc: 'Facility metadata & BMS' },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell, desc: 'Alert channels & quiet hours' },
    { id: 'appearance' as SettingsTab, label: 'Appearance & Theme', icon: Palette, desc: 'Theme switch & accents' },
    { id: 'language' as SettingsTab, label: 'Language & Region', icon: Globe, desc: 'Localization & units' },
    { id: 'security' as SettingsTab, label: 'Security & Access', icon: Shield, desc: '2FA, passwords & SSO' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner / Breadcrumb Header */}
      <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">System Preferences & Settings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your account credentials, building asset telemetry, notifications, and security protocols
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => loadSettings(true)}
            disabled={isRefreshing || isLoadingSettings}
            className="px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#3DCD58]' : ''}`} />
            <span>Sync FastAPI</span>
          </button>

          {/* Quick Theme Switcher Pill in Header */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-[#3DCD58]" />
              Theme:
            </span>
            <button
              type="button"
              onClick={() => {
                handleThemeChange('light');
                onShowToast('Applied High-Contrast Light Theme', 'info');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                themeMode === 'light'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleThemeChange('dark');
                onShowToast('Applied Control Room Dark Theme', 'info');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                themeMode === 'dark'
                  ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleThemeChange('system');
                onShowToast('Synchronized Theme with System OS', 'info');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                themeMode === 'system'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="System Theme"
            >
              <Laptop className="w-3.5 h-3.5 text-emerald-500" />
              <span>Auto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Body: Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl p-3 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all ${
                    isActive
                      ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-semibold'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isActive
                        ? 'bg-[#3DCD58] text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs leading-snug">{item.label}</div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                      {item.desc}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-[#3DCD58] translate-x-0.5' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              );
            })}

            {/* Logout Trigger Card in Navigation */}
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full p-3 rounded-2xl flex items-center gap-3 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all font-bold text-xs group"
              >
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0 group-hover:bg-rose-200 transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div>Sign Out Terminal</div>
                  <div className="text-[10px] text-rose-400 dark:text-rose-500 font-normal">Terminate active session</div>
                </div>
              </button>
            </div>
          </div>

          {/* Connected Gateway Widget */}
          <div className="bg-white/80 dark:bg-[#0f172a]/90 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-[#3DCD58]" />
              <span>Gateway Operational Status</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Modbus BACnet/IP telemetry syncs every 15 minutes. Protocol encryption TLS 1.3 verified.
            </p>
            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-1">
              UUID: f7254db0-20f7-48ff-852a
            </div>
          </div>
        </div>

        {/* Right Tab Content Panel */}
        <div className="lg:col-span-8 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          {/* -------------------------------------------------------------
              1. PROFILE SECTION
          ------------------------------------------------------------- */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Personal Profile</h3>
                  <p className="text-xs text-slate-500">Update your contact identity and terminal access profile</p>
                </div>
                <button
                  onClick={() => handleSave('Profile')}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>

              {/* Avatar Row */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-xl shadow-xs border-2 border-white ring-2 ring-[#3DCD58]/50">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{fullName}</h4>
                  <p className="text-xs text-slate-500">{jobTitle} • {orgName}</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onShowToast('Avatar change dialog triggered', 'info')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 shadow-2xs transition-colors"
                    >
                      Change Photo
                    </button>
                    <button
                      onClick={() => onShowToast('Avatar reset to default initials', 'info')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Work Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Job Title / Role</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Direct Phone / SMS</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Operational Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] focus:bg-white transition-all"
                  >
                    <option value="America/Los_Angeles (PST - UTC-8)">America/Los_Angeles (PST - UTC-8)</option>
                    <option value="America/New_York (EST - UTC-5)">America/New_York (EST - UTC-5)</option>
                    <option value="Europe/London (GMT - UTC+0)">Europe/London (GMT - UTC+0)</option>
                    <option value="Europe/Paris (CET - UTC+1)">Europe/Paris (CET - UTC+1)</option>
                    <option value="Asia/Tokyo (JST - UTC+9)">Asia/Tokyo (JST - UTC+9)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              2. ORGANIZATION SECTION
          ------------------------------------------------------------- */}
          {activeSubTab === 'organization' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Organization & Enterprise Tier</h3>
                  <p className="text-xs text-slate-500">Corporate facility hierarchy, team seats, and billing</p>
                </div>
                <button
                  onClick={() => handleSave('Organization')}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Organization</span>
                </button>
              </div>

              {/* Organization Summary Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3DCD58] text-slate-950 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{orgName}</h4>
                    <span className="text-[11px] text-emerald-800 font-semibold">
                      Enterprise Microgrid & ESG Tier • Active SLA
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                    Assigned Seats
                  </span>
                  <span className="text-xs font-black text-slate-800">8 / 15 Manager Licenses</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Organization Legal Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Industry Sector</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Enterprise Org ID</label>
                  <input
                    type="text"
                    disabled
                    value={orgId}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Primary Billing Contact</label>
                  <input
                    type="email"
                    value={billingContact}
                    onChange={(e) => setBillingContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              3. BUILDING INFORMATION SECTION
          ------------------------------------------------------------- */}
          {activeSubTab === 'building' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Building Physical & Asset Telemetry</h3>
                  <p className="text-xs text-slate-500">Gross area, HVAC chillers, and utility tariff rate structure</p>
                </div>
                <button
                  onClick={() => handleSave('Building Information')}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Building Data</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Facility Name</label>
                  <input
                    type="text"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Facility Asset Code</label>
                  <input
                    type="text"
                    value={buildingCode}
                    onChange={(e) => setBuildingCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#3DCD58]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Gross Floor Area (GFA)</label>
                  <input
                    type="text"
                    value={gfa}
                    onChange={(e) => setGfa(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Vertical Floors</label>
                  <input
                    type="text"
                    value={floorsCount}
                    onChange={(e) => setFloorsCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Year Built & Retrofit</label>
                  <input
                    type="text"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Primary Chiller Plant</label>
                  <input
                    type="text"
                    value={primaryChiller}
                    onChange={(e) => setPrimaryChiller(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58]"
                  />
                </div>
              </div>

              {/* Utility Tariffs and Peak Shaving Limits */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Time-of-Use (TOU) Electricity Tariffs & Demand Caps</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Peak Tariff ($/kWh)</label>
                    <input
                      type="text"
                      value={peakTariff}
                      onChange={(e) => setPeakTariff(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#3DCD58]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Off-Peak Tariff ($/kWh)</label>
                    <input
                      type="text"
                      value={offPeakTariff}
                      onChange={(e) => setOffPeakTariff(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#3DCD58]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Peak Demand Cap (kW)</label>
                    <input
                      type="text"
                      value={demandLimitKW}
                      onChange={(e) => setDemandLimitKW(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#3DCD58]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              4. NOTIFICATIONS SECTION
          ------------------------------------------------------------- */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Notification Preferences</h3>
                  <p className="text-xs text-slate-500">Configure alert escalation, email digests, and SMS push</p>
                </div>
                <button
                  onClick={() => handleSave('Notifications')}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'criticalEmail',
                    title: 'Critical Anomaly Email Escalation',
                    desc: 'Instant dispatch when a Red severity equipment surge or breaker trip occurs.',
                    checked: notifCriticalEmail,
                    toggle: () => setNotifCriticalEmail(!notifCriticalEmail),
                  },
                  {
                    id: 'criticalSMS',
                    title: 'SMS Push Alerts to On-Duty Engineers',
                    desc: 'Direct SMS to facility engineers for outside-damper or chiller freeze risks.',
                    checked: notifCriticalSMS,
                    toggle: () => setNotifCriticalSMS(!notifCriticalSMS),
                  },
                  {
                    id: 'weeklyDigest',
                    title: 'Executive Weekly ESG & Energy Digest',
                    desc: 'Weekly summary PDF with avoided carbon, cost savings, and EUI index.',
                    checked: notifWeeklyDigest,
                    toggle: () => setNotifWeeklyDigest(!notifWeeklyDigest),
                  },
                  {
                    id: 'copilotSuggestions',
                    title: 'AI Copilot ECM Recommendation Notifications',
                    desc: 'Notify when weather conditions enable economizer free-cooling or battery peak shaving.',
                    checked: notifCopilotSuggestions,
                    toggle: () => setNotifCopilotSuggestions(!notifCopilotSuggestions),
                  },
                  {
                    id: 'peakDemand',
                    title: 'Peak Tariff Coincident Demand Warning',
                    desc: 'Alert 15 minutes before facility load reaches utility ratcheting thresholds.',
                    checked: notifPeakDemandAlert,
                    toggle: () => setNotifPeakDemandAlert(!notifPeakDemandAlert),
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={item.toggle}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.checked ? 'bg-[#3DCD58]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          item.checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Quiet Hours */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Quiet Hours (Non-Critical Alerts)</h4>
                  <p className="text-[11px] text-slate-500">Mute low & medium priority notifications overnight</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              5. APPEARANCE & THEME SWITCH SECTION
          ------------------------------------------------------------- */}
          {activeSubTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Appearance & Theme Switch</h3>
                  <p className="text-xs text-slate-500">Customize terminal styling, contrast, and layout density</p>
                </div>
                <button
                  onClick={() => handleSave('Appearance')}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Appearance</span>
                </button>
              </div>

              {/* Theme Switch Selector Cards */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">Display Theme</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'light' as const,
                      label: 'High-Contrast Light',
                      desc: 'Default clean white canvas with crisp contrast',
                      icon: Sun,
                      iconColor: 'text-amber-500',
                    },
                    {
                      id: 'dark' as const,
                      label: 'Control Room Dark',
                      desc: 'Eye-safe dark slate palette for NOC environments',
                      icon: Moon,
                      iconColor: 'text-indigo-400',
                    },
                    {
                      id: 'system' as const,
                      label: 'System Sync',
                      desc: 'Automatically synchronizes with OS preference',
                      icon: Laptop,
                      iconColor: 'text-emerald-500',
                    },
                  ].map((theme) => {
                    const Icon = theme.icon;
                    const isSelected = themeMode === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          handleThemeChange(theme.id);
                          onShowToast(`Theme switched to ${theme.label}`, 'info');
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#3DCD58] bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-[#3DCD58]/40 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 ${theme.iconColor}`} />
                          {isSelected && <Check className="w-4 h-4 text-[#3DCD58]" />}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{theme.label}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{theme.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Selection */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">Brand Accent Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'schneider' as const, name: 'Schneider Green', color: '#3DCD58', code: '#3DCD58' },
                    { id: 'blue' as const, name: 'Electric Azure', color: '#0284c7', code: '#0284c7' },
                    { id: 'emerald' as const, name: 'Deep Forest', color: '#059669', code: '#059669' },
                    { id: 'amber' as const, name: 'Solar Amber', color: '#d97706', code: '#d97706' },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setAccentColor(acc.id);
                        onShowToast(`Accent changed to ${acc.name}`, 'info');
                      }}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                        accentColor === acc.id
                          ? 'border-slate-900 dark:border-[#3DCD58] bg-white dark:bg-slate-800 shadow-2xs font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-2xs ring-1 ring-black/10"
                        style={{ backgroundColor: acc.color }}
                      />
                      <span className="text-xs text-slate-800 dark:text-slate-200">{acc.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Density */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2">Interface Density</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'comfortable' as const, label: 'Comfortable', desc: 'Generous padding & card spacing' },
                    { id: 'compact' as const, label: 'High Density (Compact)', desc: 'Optimized for multi-screen operations centers' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setUiDensity(d.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        uiDensity === d.id
                          ? 'border-[#3DCD58] bg-emerald-50/50 shadow-2xs font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs text-slate-900">{d.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              6. LANGUAGE & REGION SECTION
          ------------------------------------------------------------- */}
          {activeSubTab === 'language' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Language & Regional Settings</h3>
                  <p className="text-xs text-slate-500">Configure language, units of measure, and date formats</p>
                </div>
                <button
                  onClick={() => handleSave('Language & Localization')}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Regional</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Terminal Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58]"
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="fr-FR">Français (France - Schneider HQ)</option>
                    <option value="de-DE">Deutsch (Deutschland)</option>
                    <option value="es-ES">Español (España)</option>
                    <option value="ja-JP">日本語 (Japan)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Measurement Units</label>
                  <select
                    value={unitsSystem}
                    onChange={(e) => setUnitsSystem(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58]"
                  >
                    <option value="imperial">Imperial (°F, sq.ft, lbs CO₂)</option>
                    <option value="metric">Metric SI (°C, m², kg CO₂)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Date Display Format</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58]"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (European Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Currency Format</label>
                  <select
                    value={billingCurrency}
                    onChange={(e) => setBillingCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DCD58]"
                  >
                    <option value="USD ($)">USD ($) - United States Dollar</option>
                    <option value="EUR (€)">EUR (€) - Eurozone</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                    <option value="JPY (¥)">JPY (¥) - Japanese Yen</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              7. SECURITY SECTION
          ------------------------------------------------------------- */}
          {activeSubTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Security & Authentication</h3>
                  <p className="text-xs text-slate-500">Manage 2FA, enterprise SSO, password credentials, and sessions</p>
                </div>
                <button
                  onClick={() => handleSave('Security')}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Security</span>
                </button>
              </div>

              {/* 2FA & SSO Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 2FA Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-[#3DCD58]" />
                      Two-Factor Authentication (2FA)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-extrabold uppercase">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Time-based One-Time Password (TOTP) authenticator app is paired and mandatory.
                  </p>
                </div>

                {/* SSO SAML Card */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Enterprise SSO / SAML
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 text-[10px] font-extrabold uppercase">
                      Linked
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Connected to Okta & Microsoft Azure AD corporate directory.
                  </p>
                </div>
              </div>

              {/* Change Password */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                    Change Account Password
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-700 text-xs flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Current Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#3DCD58]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#3DCD58]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#3DCD58]"
                    />
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Active Authorized Sessions</h4>
                  <button
                    onClick={() => onShowToast('Terminated 2 background sessions successfully', 'success')}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 transition-colors"
                  >
                    Revoke Other Sessions
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50">
                  <div className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Laptop className="w-4 h-4 text-[#3DCD58]" />
                      <div>
                        <div className="font-bold text-slate-900">Chrome on macOS (Current Browser)</div>
                        <div className="text-[10px] text-slate-400">San Francisco, US • IP: 192.168.1.42</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      Active Now
                    </span>
                  </div>

                  <div className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="font-bold text-slate-900">EcoWise Mobile App (iOS 18)</div>
                        <div className="text-[10px] text-slate-400">Oakland, US • Last active 2 hours ago</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Standby</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900">Sign Out of EcoWise AI?</h3>
              <p className="text-xs text-slate-500">
                You will be returned to the secure authentication portal. Your local telemetry preferences will remain saved.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
