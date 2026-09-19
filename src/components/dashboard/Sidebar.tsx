import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  Settings, 
  LogOut,
  Building,
  Building2,
  Zap,
  Activity,
  TrendingUp,
  Sliders,
  Leaf,
  Layers,
  Award
} from 'lucide-react';

export type DashboardTab = 
  | 'dashboard' 
  | 'executive'
  | 'prediction'
  | 'simulator'
  | 'digitaltwin'
  | 'carbon'
  | 'insights'
  | 'analytics' 
  | 'advisor' 
  | 'alerts' 
  | 'reports' 
  | 'settings';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  alertCount = 2,
}) => {
  const navSections = [
    {
      title: 'Operations',
      items: [
        { id: 'dashboard' as DashboardTab, label: 'Facility Overview', icon: LayoutDashboard },
        { id: 'executive' as DashboardTab, label: 'Executive Dashboard', icon: Award, badge: 'C-Suite' },
        { id: 'digitaltwin' as DashboardTab, label: 'Building Digital Twin', icon: Building2 },
        { id: 'analytics' as DashboardTab, label: 'Analytics & Energy', icon: BarChart3 },
      ],
    },
    {
      title: 'AI & Intelligence',
      items: [
        { id: 'prediction' as DashboardTab, label: 'AI Prediction', icon: TrendingUp, badge: 'ML' },
        { id: 'simulator' as DashboardTab, label: 'Energy Simulator', icon: Sliders, badge: 'New' },
        { id: 'carbon' as DashboardTab, label: 'Carbon Intelligence', icon: Leaf },
        { id: 'insights' as DashboardTab, label: 'AI Insights Matrix', icon: Layers },
        { id: 'advisor' as DashboardTab, label: 'AI Energy Advisor', icon: Sparkles, badge: 'Copilot' },
      ],
    },
    {
      title: 'Governance',
      items: [
        { id: 'alerts' as DashboardTab, label: 'Smart Alerts', icon: AlertTriangle, count: alertCount },
        { id: 'reports' as DashboardTab, label: 'Reports & Export', icon: FileText },
        { id: 'settings' as DashboardTab, label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        id="dashboard-sidebar"
        className={`fixed top-16 bottom-0 left-0 w-64 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 z-35 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Items */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 text-slate-900 dark:text-white shadow-2xs font-bold border-l-4 border-[#3DCD58]'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors shrink-0 ${
                          isActive ? 'text-[#3DCD58]' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* Badge or Count */}
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-extrabold uppercase tracking-wide">
                        {item.badge}
                      </span>
                    )}
                    {item.count && item.count > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[9px] font-extrabold">
                        {item.count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Area: Live Telemetry Indicator & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Microgrid Live Heartbeat */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#3DCD58] animate-pulse" />
                Microgrid BMS
              </span>
              <span className="text-[10px] font-extrabold text-[#228035] dark:text-[#3DCD58] bg-emerald-100/80 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-md">
                ONLINE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Solar canopy generating 42.4 kW. Chiller efficiency: 0.58 kW/ton.
            </p>
          </div>

          {/* Logout Button */}
          <button
            id="btn-sidebar-logout"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
