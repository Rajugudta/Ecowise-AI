import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Zap, 
  BarChart3, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  AlertTriangle, 
  Leaf, 
  TrendingUp, 
  Building2, 
  Sliders, 
  Layers, 
  ArrowRight,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  Download,
  X
} from 'lucide-react';
import { DashboardTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: DashboardTab) => void;
  onTriggerAction: (actionName: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onTriggerAction,
}) => {
  const { setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    // Theme Switchers
    { id: 'theme-dark', category: 'Appearance', label: 'Switch to Dark Theme (Control Room)', themeAction: 'dark' as const, icon: Moon },
    { id: 'theme-light', category: 'Appearance', label: 'Switch to Light Theme (High Contrast)', themeAction: 'light' as const, icon: Sun },
    { id: 'theme-system', category: 'Appearance', label: 'Sync Theme with System OS', themeAction: 'system' as const, icon: Laptop },

    // Navigation
    { id: 'nav-dash', category: 'Navigation', label: 'Go to Facility Overview Dashboard', tab: 'dashboard' as DashboardTab, icon: LayoutDashboard },
    { id: 'nav-exec', category: 'Navigation', label: 'Go to Executive CEO Dashboard', tab: 'executive' as DashboardTab, icon: Layers },
    { id: 'nav-pred', category: 'Navigation', label: 'Go to AI 24h & Monthly Predictions', tab: 'prediction' as DashboardTab, icon: TrendingUp },
    { id: 'nav-sim', category: 'Navigation', label: 'Go to Energy Optimization Simulator', tab: 'simulator' as DashboardTab, icon: Sliders },
    { id: 'nav-twin', category: 'Navigation', label: 'Go to Interactive Building Digital Twin', tab: 'digitaltwin' as DashboardTab, icon: Building2 },
    { id: 'nav-carbon', category: 'Navigation', label: 'Go to Carbon & Net Zero Intelligence', tab: 'carbon' as DashboardTab, icon: Leaf },
    { id: 'nav-insights', category: 'Navigation', label: 'Go to AI Insights Center & Matrix', tab: 'insights' as DashboardTab, icon: Sparkles },
    { id: 'nav-adv', category: 'Navigation', label: 'Open AI Energy Advisor Copilot', tab: 'advisor' as DashboardTab, icon: Sparkles },
    { id: 'nav-alerts', category: 'Navigation', label: 'View Smart Anomaly Alerts', tab: 'alerts' as DashboardTab, icon: AlertTriangle },
    { id: 'nav-reports', category: 'Navigation', label: 'Generate Sustainability Reports & ESG', tab: 'reports' as DashboardTab, icon: FileText },
    { id: 'nav-analytics', category: 'Navigation', label: 'View Deep Energy Analytics & Heatmaps', tab: 'analytics' as DashboardTab, icon: BarChart3 },
    { id: 'nav-settings', category: 'Navigation', label: 'Facility Settings & BMS Integrations', tab: 'settings' as DashboardTab, icon: Settings },

    // Quick Actions
    { id: 'act-peak', category: 'BMS Actions', label: 'Execute Peak Shaving (Shed 24 kW)', action: 'peak-shave', icon: Zap },
    { id: 'act-precool', category: 'BMS Actions', label: 'Initiate Thermal Pre-Cooling Cycle', action: 'pre-cool', icon: Sun },
    { id: 'act-bess', category: 'BMS Actions', label: 'Dispatch Tesla Megapack BESS (35 kW)', action: 'dispatch-bess', icon: Zap },
    { id: 'act-export', category: 'BMS Actions', label: 'Export Certified ESG Audit (PDF)', action: 'export-pdf', icon: Download },
    { id: 'act-demo', category: 'Control', label: 'Toggle Demo Sensor Streaming Mode', action: 'toggle-demo', icon: ShieldCheck },
  ];

  const filtered = commands.filter((c) => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: typeof commands[0]) => {
    if ('themeAction' in item && item.themeAction) {
      setTheme(item.themeAction);
      onTriggerAction(`Theme changed to ${item.themeAction}`);
    } else if ('tab' in item && item.tab) {
      onSelectTab(item.tab);
    } else if ('action' in item && item.action) {
      onTriggerAction(item.action);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, page name, or BMS action..."
            className="w-full text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none"
            autoFocus
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50 dark:divide-slate-800/60">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No matching commands or navigation pages found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left px-3 py-2.5 rounded-2xl flex items-center justify-between text-xs transition-all group ${
                    idx === selectedIndex
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-300 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-[#3DCD58]/20 transition-colors text-slate-700 dark:text-slate-300 group-hover:text-emerald-900 dark:group-hover:text-[#3DCD58]">
                      <Icon className="w-4 h-4 text-[#3DCD58]" />
                    </div>
                    <div>
                      <span className="block font-semibold">{item.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal uppercase tracking-wider">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-700 dark:group-hover:text-[#3DCD58] transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300">Esc</kbd> to exit</span>
          <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
            <Sparkles className="w-3 h-3 text-[#3DCD58]" /> EcoWise Enterprise Command
          </span>
        </div>
      </div>
    </div>
  );
};
