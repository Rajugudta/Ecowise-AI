import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  Settings, 
  CheckCircle2, 
  Zap, 
  TrendingDown, 
  Leaf, 
  Layers, 
  Building2, 
  ArrowUpRight, 
  Clock, 
  Download, 
  Sliders, 
  RefreshCw, 
  Sun, 
  BatteryCharging, 
  Activity, 
  ShieldCheck, 
  Check, 
  Send,
  Eye,
  Thermometer,
  Cpu,
  TrendingUp,
  Award
} from 'lucide-react';
import { MetricCards } from './MetricCards';
import { HOURLY_ENERGY_DATA, BUILDING_FLOORS } from '../../data/mockData';
import { AiAdvisorPage } from './AiAdvisorPage';
import { SmartAlertsPage } from './SmartAlertsPage';
import { ReportsPage } from './ReportsPage';
import { SettingsPage } from './SettingsPage';
import { WeatherWidget } from './WeatherWidget';
import { ExecutiveDashboardPage } from './ExecutiveDashboardPage';
import { AiPredictionPage } from './AiPredictionPage';
import { EnergySimulatorPage } from './EnergySimulatorPage';
import { DigitalTwinPage } from './DigitalTwinPage';
import { CarbonIntelligencePage } from './CarbonIntelligencePage';
import { AiInsightsPage } from './AiInsightsPage';
import { DEFAULT_WEATHER, RECENT_ACTIVITIES, DEFAULT_TELEMETRY } from '../../services/telemetryStore';
import { UserProfile, BuildingTelemetry } from '../../types';
import { telemetryApi, floorsApi, formatErrorMessage } from '../../services/api.js';
import { aiService, RecommendationItem } from '../../services/aiService';
import { useFacility } from '../../context/FacilityContext';
import { ExplainChartModal } from '../ai/ExplainChartModal';
import { PredictUsageModal } from '../ai/PredictUsageModal';
import { AiLoadingAnimation } from '../ai/AiLoadingAnimation';
import { AiErrorBanner } from '../ai/AiErrorBanner';

interface ViewsProps {
  currentTab: string;
  user?: UserProfile;
  onLogout?: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onNavigate?: (tab: string) => void;
}

export const Views: React.FC<ViewsProps> = ({ currentTab, user, onLogout, onShowToast, onNavigate = (_tab: string) => {} }) => {
  const { facility, profile, activeScenario, facilitySummaryPrompt } = useFacility();

  // FastAPI Live State synced with active Facility dataset
  const [telemetryMetrics, setTelemetryMetrics] = useState({
    todayUsageKWh: facility.telemetry.dailyUsageKWh,
    monthlyUsageKWh: 42850,
    carbonEmissionsKg: facility.telemetry.carbonSavedKg,
    energyScore: facility.telemetry.efficiencyScore,
    costSavingsUSD: facility.telemetry.costSavedTodayUSD,
  });
  const [hourlyData, setHourlyData] = useState(facility.hourly);
  const [floorsData, setFloorsData] = useState(facility.floors);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isSyncingDashboard, setIsSyncingDashboard] = useState(false);

  // When facility or activeScenario changes, update dashboard telemetry state
  useEffect(() => {
    setTelemetryMetrics({
      todayUsageKWh: facility.telemetry.dailyUsageKWh,
      monthlyUsageKWh: Math.round(facility.telemetry.dailyUsageKWh * 28.5),
      carbonEmissionsKg: facility.telemetry.carbonSavedKg,
      energyScore: facility.telemetry.efficiencyScore,
      costSavingsUSD: facility.telemetry.costSavedTodayUSD,
    });
    setHourlyData(facility.hourly);
    setFloorsData(facility.floors);
  }, [facility, activeScenario]);

  // Fetch telemetry & floors from FastAPI
  const loadDashboardData = async (isManual = false) => {
    if (isManual) setIsSyncingDashboard(true);
    else setIsLoadingDashboard(true);

    try {
      const [telemetryRes, floorsRes] = await Promise.all([
        telemetryApi.get(),
        floorsApi.getAll(),
      ]);

      const telem = telemetryRes as any;
      if (telem) {
        setTelemetryMetrics({
          todayUsageKWh: telem.todayUsageKWh ?? telem.dailyUsageKWh ?? 1482.4,
          monthlyUsageKWh: telem.monthlyUsageKWh ?? 42850,
          carbonEmissionsKg: telem.carbonEmissionsKg ?? telem.carbonSavedKg ?? 384.2,
          energyScore: telem.energyScore ?? telem.efficiencyScore ?? 94,
          costSavingsUSD: telem.costSavingsUSD ?? telem.costSavedTodayUSD ?? 3842.50,
        });
        if (Array.isArray(telem.hourly) && telem.hourly.length > 0) {
          setHourlyData(telem.hourly);
        }
      }
      if (Array.isArray(floorsRes) && floorsRes.length > 0) {
        setFloorsData(floorsRes as any);
      }

      if (isManual) {
        onShowToast('Synced live BMS telemetry from FastAPI', 'success');
      }
    } catch (err) {
      if (isManual) {
        onShowToast(`Failed to sync FastAPI: ${formatErrorMessage(err)}`, 'error');
      }
    } finally {
      setIsLoadingDashboard(false);
      setIsSyncingDashboard(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Interactive state for AI recommendations
  const [appliedRecommendations, setAppliedRecommendations] = useState<string[]>([]);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [geminiRecs, setGeminiRecs] = useState<RecommendationItem[] | null>(null);
  const [recError, setRecError] = useState<string | null>(null);
  const [recFallbackActive, setRecFallbackActive] = useState(false);

  // AI Modal States
  const [explainChartModalOpen, setExplainChartModalOpen] = useState(false);
  const [explainChartInfo, setExplainChartInfo] = useState<{ type: string; title: string; data: any }>({
    type: '24h-demand-curve',
    title: 'Real-time Load Curve & Peak Shaving',
    data: HOURLY_ENERGY_DATA,
  });
  const [predictModalOpen, setPredictModalOpen] = useState(false);

  const handleGenerateGeminiRecs = async () => {
    setIsGeneratingRecs(true);
    setRecError(null);
    try {
      const res = await aiService.generateRecommendations({
        todayUsageKWh: telemetryMetrics.todayUsageKWh,
        peakKW: facility.telemetry.peakDemandKW,
        tariffPeriod: `${facility.profile.tariffName} ($${facility.profile.peakRateUSD}/kWh)`,
        building: facility.profile.name,
      }, facilitySummaryPrompt);
      if (res.recommendations && res.recommendations.length > 0) {
        setGeminiRecs(res.recommendations);
        setRecFallbackActive(res.source === 'simulation_fallback');
        if (res.apiError) {
          setRecError(res.apiError);
        }
        onShowToast(`Generated ${res.recommendations.length} optimization measures with Gemini`, 'success');
      }
    } catch (err: any) {
      console.error('[Gemini Recommendations Error]:', err);
      setRecError(err.message || 'Failed to generate recommendations');
      onShowToast(`Recommendation error: ${err.message}`, 'error');
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  const [activeAnomalies, setActiveAnomalies] = useState([
    {
      id: 'alert-1',
      title: 'AHU-3B Static Pressure Anomaly',
      location: 'Floor 3 (Bio-Research Lab)',
      severity: 'Critical',
      time: '12m ago',
      impact: '+42 kWh/day',
      details: 'Modulating damper stuck at 85% open despite low occupancy.',
    },
    {
      id: 'alert-2',
      title: 'Nighttime Base Load Elevated',
      location: 'Floor 2 (Workstation Pods)',
      severity: 'Warning',
      time: '45m ago',
      impact: '+$35/night',
      details: 'Smart power strips in Pod B remained in active state after 20:00.',
    },
    {
      id: 'alert-3',
      title: 'Solar Inverter 2 Power Factor Drift',
      location: 'Rooftop Solar Array',
      severity: 'Info',
      time: '2h ago',
      impact: '0.91 PF',
      details: 'Reactive power compensation recommended to avoid utility surcharge.',
    },
  ]);

  // Advisor Chat state
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorMessages, setAdvisorMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: "Hello! I'm your EcoWise AI Energy Copilot. I'm actively analyzing Schneider microgrid loops and weather forecasts. What energy metrics or equipment sets would you like to inspect?",
      time: 'Just now',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // Settings state
  const [aiAutonomy, setAiAutonomy] = useState<'balanced' | 'aggressive' | 'conservative'>('balanced');
  const [tariffPeak, setTariffPeak] = useState('0.24');
  const [tariffOffPeak, setTariffOffPeak] = useState('0.09');
  const [smartAlertsEnabled, setSmartAlertsEnabled] = useState(true);

  const handleApplyRecommendation = (recId: string, title: string) => {
    setAppliedRecommendations(prev => [...prev, recId]);
    onShowToast(`Applied to Building Management System: ${title}`, 'success');
  };

  const handleResolveAlert = (id: string, title: string) => {
    setActiveAnomalies(prev => prev.filter(a => a.id !== id));
    onShowToast(`Resolved alert: ${title}`, 'success');
  };

  const handleSendAdvisorMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorInput.trim()) return;
    const userQuery = advisorInput.trim();
    setAdvisorInput('');
    setAdvisorMessages(prev => [...prev, { sender: 'user', text: userQuery, time: 'Just now' }]);
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      let reply = "Based on building telemetry, chiller supply water can be reset by +1.5°F without violating thermal comfort. This reduces compressor work by ~6.8% today.";
      if (userQuery.toLowerCase().includes('cost') || userQuery.toLowerCase().includes('saving')) {
        reply = "Estimated savings for September are $3,842.50. You are on track to save an additional $620 by enabling solar battery discharge during the 14:00-18:00 peak tariff.";
      } else if (userQuery.toLowerCase().includes('solar') || userQuery.toLowerCase().includes('battery')) {
        reply = "Rooftop solar is currently outputting 42.4 kW. The 100 kWh Tesla Megapack is charged to 92% and scheduled to discharge at 14:15.";
      }
      setAdvisorMessages(prev => [...prev, { sender: 'ai', text: reply, time: 'Just now' }]);
    }, 800);
  };

  /* -------------------------------------------------------------
     VIEW 1: MAIN DASHBOARD
  ------------------------------------------------------------- */
  if (currentTab === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Quick Actions Navigation Strip */}
        <div className="bg-white/90 dark:bg-[#0f172a]/95 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 overflow-x-auto transition-colors">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
            <Sparkles className="w-4 h-4 text-[#3DCD58]" />
            <span className="uppercase tracking-wider text-[10px]">Copilot Actions:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('prediction')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#3DCD58]" />
              <span>AI Prediction</span>
            </button>

            <button
              onClick={() => onNavigate('simulator')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Energy Simulator</span>
            </button>

            <button
              onClick={() => onNavigate('digitaltwin')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Building Twin</span>
            </button>

            <button
              onClick={() => onNavigate('carbon')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Carbon Tracker</span>
            </button>

            <button
              onClick={() => onNavigate('executive')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Award className="w-3.5 h-3.5 text-[#3DCD58] dark:text-white" />
              <span>C-Suite Board View</span>
            </button>
          </div>
        </div>

        {/* Top 5 Required Metric Cards */}
        <MetricCards 
          isLoading={isLoadingDashboard}
          todayUsageKWh={telemetryMetrics.todayUsageKWh}
          monthlyUsageKWh={telemetryMetrics.monthlyUsageKWh}
          carbonEmissionsKg={telemetryMetrics.carbonEmissionsKg}
          energyScore={telemetryMetrics.energyScore}
          costSavingsUSD={telemetryMetrics.costSavingsUSD}
        />

        {/* Live Weather Microclimate & HVAC Advisory Widget */}
        <WeatherWidget 
          weather={DEFAULT_WEATHER}
          onShowAdvisor={() => onNavigate('advisor')}
        />

        {/* Demand Curve Chart + Energy Mix Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 24-Hour Energy Demand Chart */}
          <div className="lg:col-span-2 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3DCD58] animate-pulse" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                    Real-time Load Curve & Peak Shaving
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Hourly electrical power (kW) vs. ASHRAE 90.1 standard baseline
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setExplainChartInfo({
                      type: '24h-demand-curve',
                      title: 'Real-time Load Curve & Peak Shaving',
                      data: hourlyData,
                    });
                    setExplainChartModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[11px] font-bold text-[#228035] dark:text-[#3DCD58] border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Explain load curve with Gemini"
                >
                  <Sparkles className="w-3 h-3 fill-[#3DCD58] text-[#228035] dark:text-[#3DCD58]" />
                  <span>Explain Chart</span>
                </button>

                <button
                  onClick={() => setPredictModalOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-[11px] font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Predict 24h demand with Gemini"
                >
                  <TrendingUp className="w-3 h-3 text-[#3DCD58]" />
                  <span>24h Forecast</span>
                </button>

                <button
                  onClick={() => loadDashboardData(true)}
                  disabled={isSyncingDashboard || isLoadingDashboard}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Sync live telemetry with FastAPI"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingDashboard ? 'animate-spin text-[#3DCD58]' : ''}`} />
                  <span>{isSyncingDashboard ? 'Syncing...' : 'Sync'}</span>
                </button>
              </div>
            </div>

            {/* Visual Bar/Line Chart */}
            <div className="mt-6">
              <div className="h-56 flex items-end gap-1.5 sm:gap-2.5 pt-4">
                {hourlyData.map((item, idx) => {
                  const actualHeight = Math.min(100, Math.max(15, (item.actual / 220) * 100));
                  const baselineHeight = Math.min(100, Math.max(15, (item.baseline / 220) * 100));
                  const isPeakWindow = idx >= 7 && idx <= 9; // 14:00 - 18:00

                  return (
                    <div key={item.time} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-12 bg-slate-900 dark:bg-slate-800 border border-transparent dark:border-slate-700 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-md">
                        <div className="font-bold">{item.time}</div>
                        <div>Actual: {item.actual} kW</div>
                        <div className="text-slate-400">Saved: {item.baseline - item.actual} kW</div>
                      </div>

                      {/* Bar comparison */}
                      <div className="w-full flex items-end justify-center gap-1 h-44 relative">
                        {/* Baseline ghost bar */}
                        <div
                          className="w-1.5 sm:w-2 bg-slate-200 dark:bg-slate-700 rounded-t-sm"
                          style={{ height: `${baselineHeight}%` }}
                        />
                        {/* Actual bar with Schneider Green */}
                        <div
                          className={`w-2.5 sm:w-3.5 rounded-t-sm transition-all duration-300 ${
                            isPeakWindow 
                              ? 'bg-amber-500 group-hover:brightness-110' 
                              : 'bg-[#3DCD58] group-hover:brightness-110'
                          }`}
                          style={{ height: `${actualHeight}%` }}
                        />
                      </div>

                      {/* Label */}
                      <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-tighter truncate w-full text-center">
                        {item.time.split(':')[0]}h
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Peak window indicator */}
              <div className="mt-4 p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                <span className="flex items-center gap-2 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Peak Tariff Period (14:00 - 18:00): $0.24/kWh. AI Microgrid battery shaving active.
                </span>
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Energy Mix & Microgrid Distribution */}
          <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                    Energy Source Mix
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    On-site microgrid vs. Municipal Utility
                  </p>
                </div>
                <button
                  onClick={() => {
                    setExplainChartInfo({
                      type: 'energy-source-mix',
                      title: 'Microgrid & Utility Energy Mix',
                      data: {
                        solarKWh: 42.4,
                        solarPercent: 28.4,
                        batteryKWh: 92,
                        batteryPercent: 18.2,
                        gridKWh: 81.0,
                        gridPercent: 53.4,
                      },
                    });
                    setExplainChartModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[10px] font-bold text-[#228035] dark:text-[#3DCD58] border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Explain energy mix with Gemini"
                >
                  <Sparkles className="w-3 h-3 fill-[#3DCD58] text-[#228035] dark:text-[#3DCD58]" />
                  <span>Explain Mix</span>
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {/* Solar */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                      <Sun className="w-4 h-4 text-[#3DCD58]" /> Rooftop Solar PV
                    </span>
                    <span className="font-extrabold text-[#228035] dark:text-[#3DCD58]">28.4% (42.4 kW)</span>
                  </div>
                  <div className="w-full bg-emerald-100 dark:bg-emerald-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#3DCD58] h-full rounded-full w-[28.4%]" />
                  </div>
                </div>

                {/* Battery Storage */}
                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-2">
                      <BatteryCharging className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Battery Storage (ESS)
                    </span>
                    <span className="font-extrabold text-blue-700 dark:text-blue-400">18.2% (92 kWh)</span>
                  </div>
                  <div className="w-full bg-blue-100 dark:bg-blue-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full w-[18.2%]" />
                  </div>
                </div>

                {/* Grid */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Grid Utility Import
                    </span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300">53.4% (81.0 kW)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-500 h-full rounded-full w-[53.4%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Self-sufficiency index: <strong className="text-emerald-700 dark:text-[#3DCD58] font-bold">46.6% Green Energy</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Floor Telemetry Breakdown + AI Quick Recommendation Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Floor Breakdown */}
          <div className="lg:col-span-2 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                  Floor-by-Floor Telemetry
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Zone sensor aggregation across EcoTower Delta
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{floorsData.length} Active Zones</span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {floorsData.map((floor) => (
                <div
                  key={floor.floor}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-[#3DCD58]/50 hover:shadow-xs transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{floor.label}</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{floor.occupancyCount} Occupants</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        floor.status === 'optimal'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#3DCD58]'
                          : floor.status === 'warning'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {floor.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Power</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{floor.kwDraw} kW</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Temp</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{floor.tempCelsius}°C</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">HVAC</span>
                      <span className="font-bold text-emerald-700 dark:text-[#3DCD58]">{floor.hvacActive ? 'Active' : 'Standby'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Energy Copilot Action Box */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-[#0f172a] rounded-3xl p-6 border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#3DCD58] text-slate-950 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      AI Energy Advisor
                    </h4>
                    <span className="text-[10px] font-bold text-[#228035] dark:text-[#3DCD58] uppercase tracking-wider">
                      Energy Conservation Measures
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGenerateGeminiRecs}
                  disabled={isGeneratingRecs}
                  className="px-2.5 py-1 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                  title="Prompt Gemini to generate new ECMs"
                >
                  <Sparkles className={`w-3 h-3 fill-slate-950 ${isGeneratingRecs ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingRecs ? 'Generating...' : 'Generate with Gemini'}</span>
                </button>
              </div>

              {recError && (
                <AiErrorBanner
                  error={recError}
                  isFallbackActive={recFallbackActive}
                  onRetry={handleGenerateGeminiRecs}
                  onDismiss={() => setRecError(null)}
                />
              )}

              {isGeneratingRecs ? (
                <AiLoadingAnimation
                  title="Generating ECM Recommendations..."
                  subtitle="Correlating chiller load, weather, and PG&E peak tariff"
                  steps={[
                    'Scanning HVAC, chiller & VSD metrics...',
                    'Optimizing setpoints for peak cost reduction...',
                    'Calculating estimated kWh & carbon savings...',
                    'Formatting Schneider BMS commands...',
                  ]}
                  size="sm"
                />
              ) : geminiRecs && geminiRecs.length > 0 ? (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {geminiRecs.map((rec) => {
                    const isApplied = appliedRecommendations.includes(rec.id);
                    return (
                      <div key={rec.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-emerald-100 dark:border-slate-800 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/70 text-[#228035] dark:text-[#3DCD58] text-[10px] font-bold">
                            {rec.category} • {rec.impact} Impact
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                            Confidence: {Math.round(rec.confidenceScore * 100)}%
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {rec.title}
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          {rec.description}
                        </p>
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-emerald-700 dark:text-[#3DCD58] font-bold">-${rec.estimatedCostSavedUsd}/day</span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">-{rec.estimatedKwhSaved} kWh</span>
                        </div>
                        <button
                          onClick={() => handleApplyRecommendation(rec.id, rec.title)}
                          disabled={isApplied}
                          className={`w-full mt-2 py-2 px-3 rounded-xl text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                            isApplied
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#3DCD58] cursor-default'
                              : 'bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-extrabold cursor-pointer'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 dark:text-[#3DCD58]" />
                              Applied to BMS Controls
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 fill-slate-950" />
                              Execute BMS Reset
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-emerald-100 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/70 text-[#228035] dark:text-[#3DCD58] text-[10px] font-bold">
                      Chillers • High Impact
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                      Confidence: 98%
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Chiller #2 VSD Frequency Modulation
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Wet-bulb temperature decreased to 62°F. Increasing chilled water delta-T by 1.2°F avoids $185 in peak surge fees today.
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-emerald-700 dark:text-[#3DCD58] font-bold">Projected: -18.4 kWh/hr</span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">-$185 peak fee</span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleApplyRecommendation('dash-rec-1', 'Chiller #2 VSD Frequency Modulation')}
                      disabled={appliedRecommendations.includes('dash-rec-1')}
                      className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                        appliedRecommendations.includes('dash-rec-1')
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#3DCD58] cursor-default'
                          : 'bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-extrabold cursor-pointer'
                      }`}
                    >
                      {appliedRecommendations.includes('dash-rec-1') ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-800 dark:text-[#3DCD58]" />
                          Applied to BMS Controls
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-slate-950" />
                          Execute Automated BMS Reset
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-3">
              Schneider Electric EcoStruxure & Gemini 3.8 Flash compliant
            </p>
          </div>
        </div>

        {/* Gemini Explain Chart Modal */}
        <ExplainChartModal
          isOpen={explainChartModalOpen}
          onClose={() => setExplainChartModalOpen(false)}
          chartType={explainChartInfo.type}
          chartTitle={explainChartInfo.title}
          chartData={explainChartInfo.data}
          onShowToast={onShowToast}
        />

        {/* Gemini 24h Energy Demand Prediction Modal */}
        <PredictUsageModal
          isOpen={predictModalOpen}
          onClose={() => setPredictModalOpen(false)}
          telemetryData={telemetryMetrics}
          onShowToast={onShowToast}
        />
      </div>
    );
  }

  /* -------------------------------------------------------------
     VIEW 2: ANALYTICS
  ------------------------------------------------------------- */
  if (currentTab === 'analytics') {
    return (
      <div className="space-y-6">
        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Energy & Power Analytics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive facility submetering & consumption telemetry</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Last 30 Days
              </span>
              <button 
                onClick={() => onShowToast('Exported analytical dataset to CSV', 'success')}
                className="px-3 py-1 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export Data
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Energy Use Intensity (EUI)</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">48.2 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kBtu/ft²</span></div>
              <span className="text-[11px] text-[#228035] dark:text-[#3DCD58] font-semibold mt-1 block">-18% vs US Commercial Median</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Average Power Factor</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">0.96 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Lagging</span></div>
              <span className="text-[11px] text-emerald-700 dark:text-[#3DCD58] font-semibold mt-1 block">Optimal range (No penalties)</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Peak Demand (kW)</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">312 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kW</span></div>
              <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-1 block">Surge capped via battery</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">HVAC COP Efficiency</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">5.2 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">COP</span></div>
              <span className="text-[11px] text-[#228035] dark:text-[#3DCD58] font-semibold mt-1 block">Top tier variable chiller</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Load Breakdown by Subsystem
              </h4>
              <button
                onClick={() => {
                  setExplainChartInfo({
                    type: 'subsystem-breakdown',
                    title: 'Load Breakdown by Subsystem',
                    data: {
                      hvac: '48% (20,568 kWh)',
                      lighting: '22% (9,427 kWh)',
                      plugLoads: '18% (7,713 kWh)',
                      evFleetChargers: '12% (5,142 kWh)',
                      totalKWh: '42,850 kWh',
                    },
                  });
                  setExplainChartModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[10px] font-bold text-[#228035] dark:text-[#3DCD58] border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                title="Explain load breakdown with Gemini"
              >
                <Sparkles className="w-3 h-3 fill-[#3DCD58] text-[#228035] dark:text-[#3DCD58]" />
                <span>Explain Breakdown</span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800 dark:text-slate-200">HVAC & Chillers (VAV + Pumps)</span>
                  <span className="text-slate-900 dark:text-white font-bold">48% (20,568 kWh)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#3DCD58] h-full rounded-full w-[48%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800 dark:text-slate-200">Lighting (DALI-2 Adaptive LED)</span>
                  <span className="text-slate-900 dark:text-white font-bold">22% (9,427 kWh)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full w-[22%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800 dark:text-slate-200">Receptacle & Plug Loads</span>
                  <span className="text-slate-900 dark:text-white font-bold">18% (7,713 kWh)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full w-[18%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800 dark:text-slate-200">EV Fleet Fast Chargers</span>
                  <span className="text-slate-900 dark:text-white font-bold">12% (5,142 kWh)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full w-[12%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gemini Explain Chart Modal */}
        <ExplainChartModal
          isOpen={explainChartModalOpen}
          onClose={() => setExplainChartModalOpen(false)}
          chartType={explainChartInfo.type}
          chartTitle={explainChartInfo.title}
          chartData={explainChartInfo.data}
          onShowToast={onShowToast}
        />

        {/* Gemini 24h Energy Demand Prediction Modal */}
        <PredictUsageModal
          isOpen={predictModalOpen}
          onClose={() => setPredictModalOpen(false)}
          telemetryData={telemetryMetrics}
          onShowToast={onShowToast}
        />
      </div>
    );
  }

  /* -------------------------------------------------------------
     VIEW: EXECUTIVE C-SUITE DASHBOARD
  ------------------------------------------------------------- */
  if (currentTab === 'executive') {
    return (
      <ExecutiveDashboardPage
        telemetry={DEFAULT_TELEMETRY}
        onShowToast={onShowToast}
        onNavigateToReports={() => onNavigate('reports')}
      />
    );
  }

  /* -------------------------------------------------------------
     VIEW: AI PREDICTION MODULE
  ------------------------------------------------------------- */
  if (currentTab === 'prediction') {
    return (
      <AiPredictionPage
        telemetry={DEFAULT_TELEMETRY}
        onShowToast={onShowToast}
        onNavigateToSimulator={() => onNavigate('simulator')}
      />
    );
  }

  /* -------------------------------------------------------------
     VIEW: ENERGY OPTIMIZATION SIMULATOR
  ------------------------------------------------------------- */
  if (currentTab === 'simulator') {
    return (
      <EnergySimulatorPage
        onShowToast={onShowToast}
      />
    );
  }

  /* -------------------------------------------------------------
     VIEW: INTERACTIVE BUILDING DIGITAL TWIN
  ------------------------------------------------------------- */
  if (currentTab === 'digitaltwin') {
    return (
      <DigitalTwinPage
        onShowToast={onShowToast}
        onOpenAdvisor={() => onNavigate('advisor')}
      />
    );
  }

  /* -------------------------------------------------------------
     VIEW: CARBON INTELLIGENCE & NET ZERO TRACKER
  ------------------------------------------------------------- */
  if (currentTab === 'carbon') {
    return (
      <CarbonIntelligencePage
        telemetry={DEFAULT_TELEMETRY}
        onShowToast={onShowToast}
        onNavigateToAdvisor={() => onNavigate('advisor')}
      />
    );
  }

  /* -------------------------------------------------------------
     VIEW: AI INSIGHTS & OPPORTUNITY MATRIX
  ------------------------------------------------------------- */
  if (currentTab === 'insights') {
    return (
      <AiInsightsPage
        telemetry={DEFAULT_TELEMETRY}
        onShowToast={onShowToast}
        onExecuteAction={(action) => {
          onShowToast(`Dispatched BMS command: ${action}`, 'success');
        }}
      />
    );
  }

  /* -------------------------------------------------------------
     VIEW 3: AI ENERGY ADVISOR (ChatGPT-style Copilot)
  ------------------------------------------------------------- */
  if (currentTab === 'advisor') {
    return <AiAdvisorPage onShowToast={onShowToast} />;
  }

  /* -------------------------------------------------------------
     VIEW 4: SMART ALERTS (Green, Yellow, Red Levels + Filters)
  ------------------------------------------------------------- */
  if (currentTab === 'alerts') {
    return <SmartAlertsPage onShowToast={onShowToast} />;
  }

  /* -------------------------------------------------------------
     VIEW 5: REPORTS (Weekly, Monthly, Energy, Carbon + Export)
  ------------------------------------------------------------- */
  if (currentTab === 'reports') {
    return <ReportsPage onShowToast={onShowToast} />;
  }

  /* -------------------------------------------------------------
     VIEW 6: SETTINGS (Modern Layout with Profile, Org, Building, etc.)
  ------------------------------------------------------------- */
  const defaultUser: UserProfile = user || {
    id: 'user-default',
    name: 'Alex Morgan',
    email: 'alex.morgan@ecotower.com',
    role: 'Senior Facility Director',
    organization: 'EcoTower Global Properties',
    buildingAssigned: 'EcoTower Delta (Main HQ)',
  };

  return (
    <SettingsPage
      user={defaultUser}
      onLogout={onLogout || (() => {})}
      onShowToast={onShowToast}
    />
  );
};
