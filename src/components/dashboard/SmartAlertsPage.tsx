import React, { useState, useMemo, useEffect } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Building2, 
  Clock, 
  Sparkles, 
  Check, 
  RefreshCw, 
  SlidersHorizontal,
  ArrowUpRight,
  ShieldAlert,
  Layers,
  Thermometer,
  Zap,
  Activity
} from 'lucide-react';
import { alertsApi, formatErrorMessage } from '../../services/api.js';
import { aiService, AlertDiagnosis } from '../../services/aiService';
import { useFacility } from '../../context/FacilityContext';

export type AlertLevel = 'red' | 'yellow' | 'green';

export interface SmartAlertItem {
  id: string;
  buildingName: string;
  alertType: string;
  severity: AlertLevel;
  severityLabel: string;
  time: string;
  aiSuggestion: string;
  location: string;
  impactMetrics: string;
  resolved?: boolean;
}

const INITIAL_ALERTS: SmartAlertItem[] = [
  {
    id: 'alt-101',
    buildingName: 'EcoTower Delta (Main HQ)',
    alertType: 'AHU-3B Modulating Damper Stuck at 85%',
    severity: 'red',
    severityLabel: 'Critical',
    time: '8 minutes ago',
    location: 'Floor 3 (Bio-Research Lab)',
    impactMetrics: '+42 kWh/day ($18.50/day)',
    aiSuggestion: 'Overriding modulating damper actuator to 35% minimum outside airflow setpoint aligns with current low occupancy and prevents chilled water loop overdraw.',
  },
  {
    id: 'alt-102',
    buildingName: 'EcoTower Delta (Main HQ)',
    alertType: 'Chiller #2 Compressor Surge Velocity',
    severity: 'red',
    severityLabel: 'Critical',
    time: '24 minutes ago',
    location: 'Central Plant Basement',
    impactMetrics: 'Risk of equipment trip & +38 kW draw',
    aiSuggestion: 'Reset chilled water supply delta-T from 10°F to 12.2°F and throttle variable-speed drive to 54 Hz to stabilize refrigerant pressure lift.',
  },
  {
    id: 'alt-103',
    buildingName: 'BioTech Pavilion (East)',
    alertType: 'Elevated Standby Plug Loads After Hours',
    severity: 'yellow',
    severityLabel: 'Warning',
    time: '1 hour ago',
    location: 'Floor 2 (Open Workspaces)',
    impactMetrics: '+16.4 kWh baseline draw',
    aiSuggestion: 'Trigger autonomous smart-circuit cutoff on Pod B & C power strips. Scheduled to restore at 06:30 tomorrow.',
  },
  {
    id: 'alt-104',
    buildingName: 'Schneider Microgrid Lab',
    alertType: 'Rooftop Solar Inverter #2 Power Factor Drift',
    severity: 'yellow',
    severityLabel: 'Warning',
    time: '2 hours ago',
    location: 'Roof Photovoltaic Array',
    impactMetrics: '0.89 Power Factor (Lagging)',
    aiSuggestion: 'Engage four-quadrant VAR support mode on the smart micro-inverter to bring facility power factor back above 0.95.',
  },
  {
    id: 'alt-105',
    buildingName: 'EcoTower Delta (Main HQ)',
    alertType: 'HVAC Free Cooling Economizer Available',
    severity: 'green',
    severityLabel: 'Optimal',
    time: '3 hours ago',
    location: 'Whole Facility Ventilation',
    impactMetrics: 'Potential -$45.20 today',
    aiSuggestion: 'Outside air temperature is 61°F with 48% humidity. Open economizer dampers to 100% to run passive cooling without mechanical refrigeration.',
  },
  {
    id: 'alt-106',
    buildingName: 'BioTech Pavilion (East)',
    alertType: 'EV Charging Queue Load Balanced',
    severity: 'green',
    severityLabel: 'Optimal',
    time: '4 hours ago',
    location: 'Sub-level 1 Fleet Bays',
    impactMetrics: 'Coincident peak avoided',
    aiSuggestion: 'Staggered charging algorithm deployed across 12 fleet vehicles successfully kept total site demand below 250 kW transformer threshold.',
  },
];

interface SmartAlertsPageProps {
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const SmartAlertsPage: React.FC<SmartAlertsPageProps> = ({ onShowToast }) => {
  const { facility, profile, facilitySummaryPrompt } = useFacility();
  const [alerts, setAlerts] = useState<SmartAlertItem[]>(INITIAL_ALERTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [diagnosingId, setDiagnosingId] = useState<string | null>(null);
  const [diagnoses, setDiagnoses] = useState<Record<string, AlertDiagnosis>>({});

  const handleDeepDiagnose = async (alert: SmartAlertItem) => {
    setDiagnosingId(alert.id);
    try {
      const res = await aiService.diagnoseAlert({
        title: alert.alertType,
        location: alert.location,
        severity: alert.severity,
        impact: alert.impactMetrics,
      }, facilitySummaryPrompt);

      if (res.data) {
        setDiagnoses((prev) => ({ ...prev, [alert.id]: res.data }));
        onShowToast('Gemini diagnosed root cause & BMS mitigation protocol', 'success');
      }
    } catch (err: any) {
      console.warn('[Diagnose Alert Error]:', err);
      onShowToast('Diagnosis unavailable, loaded baseline rules', 'info');
    } finally {
      setDiagnosingId(null);
    }
  };

  // Fetch alerts from FastAPI on mount
  const loadAlerts = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoadingAlerts(true);
    setFetchError(null);

    try {
      const data = await alertsApi.getAll();
      if (Array.isArray(data)) {
        setAlerts(data);
      }
      if (isManualRefresh) {
        onShowToast('Synced live alerts with FastAPI backend', 'success');
      }
    } catch (err) {
      const msg = formatErrorMessage(err, 'Could not fetch alerts from FastAPI.');
      setFetchError(msg);
      onShowToast(msg, 'error');
    } finally {
      setIsLoadingAlerts(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // Counts
  const counts = useMemo(() => {
    return {
      all: alerts.length,
      red: alerts.filter((a) => a.severity === 'red' && !a.resolved).length,
      yellow: alerts.filter((a) => a.severity === 'yellow' && !a.resolved).length,
      green: alerts.filter((a) => a.severity === 'green' && !a.resolved).length,
    };
  }, [alerts]);

  // Filtered list
  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      const matchesSeverity = selectedSeverity === 'all' || item.severity === selectedSeverity;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.buildingName.toLowerCase().includes(q) ||
        item.alertType.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.aiSuggestion.toLowerCase().includes(q);

      return matchesSeverity && matchesSearch;
    });
  }, [alerts, selectedSeverity, searchQuery]);

  const handleApplyFix = async (id: string, alertType: string) => {
    setResolvingId(id);
    try {
      await alertsApi.resolve(id, alertType);
      setAlerts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, resolved: true } : item))
      );
      onShowToast(`Executed AI remediation via FastAPI: ${alertType}`, 'success');
    } catch (err) {
      onShowToast(`Failed to resolve alert: ${formatErrorMessage(err)}`, 'error');
    } finally {
      setResolvingId(null);
    }
  };

  const handleDismiss = async (id: string) => {
    setDismissingId(id);
    try {
      await alertsApi.dismiss(id);
      setAlerts((prev) => prev.filter((item) => item.id !== id));
      onShowToast('Alert dismissed via FastAPI', 'info');
    } catch (err) {
      onShowToast(`Failed to dismiss alert: ${formatErrorMessage(err)}`, 'error');
    } finally {
      setDismissingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Smart Anomaly & FDD Alerts</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated Fault Detection & Diagnostics across smart building submeters & HVAC equipment
          </p>
        </div>

        {/* Severity Summary Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedSeverity('red')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSeverity === 'red'
                ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            <span>Critical (Red): {counts.red}</span>
          </button>

          <button
            onClick={() => setSelectedSeverity('yellow')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSeverity === 'yellow'
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
            <span>Warning (Yellow): {counts.yellow}</span>
          </button>

          <button
            onClick={() => setSelectedSeverity('green')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSeverity === 'green'
                ? 'bg-[#3DCD58] text-slate-950 border-emerald-600 shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-[#228035] dark:text-[#3DCD58] border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#3DCD58] ring-2 ring-white dark:ring-slate-900" />
            <span>Normal / Optimal (Green): {counts.green}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        {/* Search input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by building, alert type, floor, or keywords..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] transition-all"
          />
        </div>

        {/* Severity Tabs filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
            Filter:
          </span>
          {(['all', 'red', 'yellow', 'green'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedSeverity(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                selectedSeverity === lvl
                  ? 'bg-slate-900 text-white shadow-xs dark:bg-emerald-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {lvl === 'all' ? 'All Alerts' : `${lvl}`}
            </button>
          ))}

          {(selectedSeverity !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSeverity('all');
                setSearchQuery('');
              }}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline ml-2 whitespace-nowrap cursor-pointer"
            >
              Reset filters
            </button>
          )}

          <button
            onClick={() => loadAlerts(true)}
            disabled={isRefreshing || isLoadingAlerts}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 ml-auto sm:ml-2 whitespace-nowrap cursor-pointer"
            title="Refresh live telemetry and alerts from FastAPI"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 dark:text-slate-400 ${isRefreshing ? 'animate-spin text-[#3DCD58]' : ''}`} />
            <span className="hidden sm:inline">Sync FastAPI</span>
          </button>
        </div>
      </div>

      {/* Optional Error Banner */}
      {fetchError && (
        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{fetchError} Operating in local resilient fallback mode.</span>
          </div>
          <button
            onClick={() => loadAlerts(true)}
            className="px-3 py-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 text-slate-900 dark:text-amber-100 rounded-xl font-bold transition-colors shrink-0 cursor-pointer"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Alerts Grid */}
      <div className="space-y-4">
        {isLoadingAlerts ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white/90 dark:bg-[#0f172a]/95 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-14 w-full bg-slate-100 dark:bg-slate-850 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-16 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <CheckCircle2 className="w-12 h-12 text-[#3DCD58] mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">No Matching Alerts Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              All monitored equipment and microgrid sensors in this category are operating within optimal bounds.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            // Level styling configurations
            const config = {
              red: {
                badgeBg: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
                borderAccent: 'border-l-rose-500',
                icon: AlertCircle,
                iconColor: 'text-rose-600 dark:text-rose-400',
                cardBg: 'hover:border-rose-300 dark:hover:border-rose-800',
                ringDot: 'bg-rose-500',
              },
              yellow: {
                badgeBg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
                borderAccent: 'border-l-amber-500',
                icon: AlertTriangle,
                iconColor: 'text-amber-600 dark:text-amber-400',
                cardBg: 'hover:border-amber-300 dark:hover:border-amber-800',
                ringDot: 'bg-amber-500',
              },
              green: {
                badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
                borderAccent: 'border-l-[#3DCD58]',
                icon: CheckCircle2,
                iconColor: 'text-[#228035] dark:text-[#3DCD58]',
                cardBg: 'hover:border-emerald-300 dark:hover:border-emerald-800',
                ringDot: 'bg-[#3DCD58]',
              },
            }[alert.severity];

            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={`bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs border-l-[6px] ${
                  config.borderAccent
                } ${config.cardBg} transition-all duration-200 ${
                  alert.resolved ? 'opacity-60 bg-slate-50/70 dark:bg-slate-900/60' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left content */}
                  <div className="space-y-2.5 flex-1">
                    {/* Top metadata row: Building Name + Severity Tag + Time */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                      {/* Severity Pill */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5 ${
                          config.badgeBg
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${config.ringDot}`} />
                        {alert.severity.toUpperCase()} • {alert.severityLabel}
                      </span>

                      {/* Building Name */}
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#3DCD58]" />
                        {alert.buildingName}
                      </span>

                      <span className="text-slate-300 dark:text-slate-700">•</span>

                      {/* Location */}
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {alert.location}
                      </span>

                      <span className="text-slate-300 dark:text-slate-700">•</span>

                      {/* Time */}
                      <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {alert.time}
                      </span>
                    </div>

                    {/* Alert Title */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                          {alert.alertType}
                        </h3>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                          Financial & Energy Impact:{' '}
                          <span className="text-slate-900 dark:text-slate-200 font-bold">{alert.impactMetrics}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Suggestion Box */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-950 dark:text-[#3DCD58] text-[11px] uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-[#3DCD58]" />
                          AI Copilot Diagnostic & Suggestion
                        </div>
                        <button
                          disabled={diagnosingId === alert.id}
                          onClick={() => handleDeepDiagnose(alert)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-850 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          {diagnosingId === alert.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Diagnosing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-[#3DCD58]" />
                              <span>{diagnoses[alert.id] ? 'Re-Diagnose' : 'Deep Diagnose'}</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[12px] text-emerald-900 dark:text-emerald-200 leading-relaxed">
                        {alert.aiSuggestion}
                      </p>

                      {/* Render Deep Gemini Diagnostic if available */}
                      {diagnoses[alert.id] && (
                        <div className="mt-2 pt-2 border-t border-emerald-200/70 dark:border-emerald-800/60 space-y-1.5 animate-in fade-in">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900 dark:text-white">Gemini Root Cause:</span>
                            <span className="font-bold text-[#228035] dark:text-[#3DCD58]">Avoided Loss: ${diagnoses[alert.id].avoidedLossDailyUSD}/day</span>
                          </div>
                          <p className="text-[11.5px] text-slate-700 dark:text-slate-300">
                            {diagnoses[alert.id].rootCause}
                          </p>
                          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px]">
                            <span className="font-bold text-emerald-900 dark:text-emerald-300">Immediate Remediation: </span>
                            <span className="text-slate-700 dark:text-slate-200">{diagnoses[alert.id].immediateRemediation}</span>
                          </div>
                          <div className="text-[10.5px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-950/50 p-1.5 rounded-lg">
                            <span className="font-sans font-semibold">BMS Control: </span>
                            {diagnoses[alert.id].bmsControlCommand}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    {alert.resolved ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-[#3DCD58] text-xs font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Remediated
                      </span>
                    ) : (
                      <button
                        disabled={resolvingId === alert.id}
                        onClick={() => handleApplyFix(alert.id, alert.alertType)}
                        className="px-4 py-2 rounded-2xl bg-[#3DCD58] hover:bg-[#34b64b] disabled:opacity-60 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        {resolvingId === alert.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin fill-none" />
                            <span>Remediating...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 fill-slate-950" />
                            <span>Execute AI Fix</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      disabled={dismissingId === alert.id}
                      onClick={() => handleDismiss(alert.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {dismissingId === alert.id ? 'Dismissing...' : 'Dismiss'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
