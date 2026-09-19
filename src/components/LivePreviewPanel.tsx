import React, { useState } from 'react';
import { 
  Zap, 
  Leaf, 
  Sparkles, 
  Building2, 
  TrendingDown, 
  Check, 
  Clock, 
  Layers, 
  ShieldCheck, 
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import { BuildingIllustration } from './BuildingIllustration';
import { INITIAL_TELEMETRY, HOURLY_ENERGY_DATA, AI_RECOMMENDATION_OF_THE_DAY } from '../data/mockData';
import { BuildingTelemetry, AiRecommendation } from '../types';

interface LivePreviewPanelProps {
  onShowNotification?: (msg: string, type: 'success' | 'info') => void;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({ onShowNotification }) => {
  const [telemetry, setTelemetry] = useState<BuildingTelemetry>(INITIAL_TELEMETRY);
  const [recommendation, setRecommendation] = useState<AiRecommendation>(AI_RECOMMENDATION_OF_THE_DAY);
  const [activeTab, setActiveTab] = useState<'metrics' | 'building'>('metrics');
  const [isApplyingRec, setIsApplyingRec] = useState(false);

  const handleApplyRecommendation = () => {
    if (recommendation.applied) return;
    setIsApplyingRec(true);
    setTimeout(() => {
      setRecommendation(prev => ({ ...prev, applied: true }));
      setTelemetry(prev => ({
        ...prev,
        dailyUsageKWh: prev.dailyUsageKWh - 85,
        carbonSavedKg: Number((prev.carbonSavedKg + recommendation.carbonReductionKg).toFixed(1)),
        costSavedTodayUSD: Number((prev.costSavedTodayUSD + recommendation.estimatedSavingUSD).toFixed(2)),
        efficiencyScore: 96.8,
      }));
      setIsApplyingRec(false);
      if (onShowNotification) {
        onShowNotification(
          `AI Recommendation Applied: Projected to save $${recommendation.estimatedSavingUSD}/day and reduce ${recommendation.carbonReductionKg}kg CO₂!`,
          'success'
        );
      }
    }, 600);
  };

  return (
    <div id="live-preview-panel" className="w-full flex flex-col justify-between h-full bg-slate-900/60 backdrop-blur-xl border border-white/20 p-6 lg:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#3DCD58]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div>
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#3DCD58]/20 text-[#3DCD58] font-semibold text-xs border border-[#3DCD58]/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3DCD58] animate-pulse" />
                Live Telemetry Stream
              </span>
              <span className="text-xs text-slate-400 font-medium">EcoWise Edge BMS v2.4</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white mt-1.5">
              EcoTower Delta <span className="text-[#3DCD58] text-base font-normal">#884-HQ</span>
            </h2>
          </div>

          {/* Toggle View Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <button
              id="tab-btn-metrics"
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'metrics'
                  ? 'bg-[#3DCD58] text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Metrics
            </button>
            <button
              id="tab-btn-building"
              onClick={() => setActiveTab('building')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'building'
                  ? 'bg-[#3DCD58] text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Building
            </button>
          </div>
        </div>

        {/* Dynamic content based on tab */}
        {activeTab === 'metrics' ? (
          <div className="space-y-4">
            {/* Top Stat Cards: Today's Energy & Carbon Saved */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 📊 Metric 1: Today's Energy Usage */}
              <div id="metric-card-energy-usage" className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 relative group hover:border-[#3DCD58]/50 transition-colors">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Zap className="w-4 h-4 text-[#3DCD58]" />
                    Today's Energy Usage
                  </span>
                  <span className="flex items-center text-[11px] font-semibold text-[#3DCD58] bg-[#3DCD58]/10 px-2 py-0.5 rounded-full">
                    <TrendingDown className="w-3 h-3 mr-0.5" /> -14.8%
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-mono">
                    {telemetry.dailyUsageKWh.toLocaleString()}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">kWh</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Current Load: <b className="text-slate-200">{telemetry.currentLoadKW} kW</b></span>
                  <span className="text-slate-500">Target: 1,740 kWh</span>
                </div>
              </div>

              {/* 🌱 Metric 2: Carbon Saved */}
              <div id="metric-card-carbon-saved" className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 relative group hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    Carbon Offset Today
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Verified Green
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl lg:text-3xl font-bold tracking-tight text-emerald-400 font-mono">
                    {telemetry.carbonSavedKg}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">kg CO₂</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>≈ <b className="text-slate-200">{telemetry.treesEquivalent} Trees</b> planted</span>
                  <span className="text-[#3DCD58] font-medium">+${telemetry.costSavedTodayUSD} saved</span>
                </div>
              </div>
            </div>

            {/* Micro Chart: Hourly Energy Demand vs Baseline */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Hourly Demand vs AI Baseline (kW)
                </span>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#3DCD58]" /> Actual
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500" /> Unmanaged
                  </span>
                </div>
              </div>

              {/* Bar comparison graph */}
              <div className="grid grid-cols-8 gap-2 items-end h-20 pt-2 border-b border-slate-700/60 pb-1">
                {HOURLY_ENERGY_DATA.map((item) => {
                  const actualHeight = Math.round((item.actual / 260) * 100);
                  const baselineHeight = Math.round((item.baseline / 260) * 100);
                  return (
                    <div key={item.time} className="flex flex-col items-center gap-1 group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 px-2 py-1 rounded text-[10px] text-slate-200 pointer-events-none whitespace-nowrap z-20 border border-slate-700">
                        {item.time}: {item.actual} kW (Base: {item.baseline})
                      </div>
                      <div className="w-full flex items-end justify-center gap-1 h-14">
                        {/* Baseline bar */}
                        <div
                          className="w-1.5 bg-slate-700 rounded-t"
                          style={{ height: `${baselineHeight}%` }}
                        />
                        {/* Actual bar */}
                        <div
                          className={`w-2.5 rounded-t transition-all ${
                            item.isPeak ? 'bg-[#3DCD58]' : 'bg-emerald-500/80'
                          }`}
                          style={{ height: `${actualHeight}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400">{item.time.slice(0, 2)}h</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ⚡ Metric 3: AI Recommendation of the Day */}
            <div id="ai-recommendation-card" className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-800/80 to-slate-900 border border-[#3DCD58]/30 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#3DCD58]/20 text-[#3DCD58] border border-[#3DCD58]/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#3DCD58] flex items-center gap-1.5">
                      AI Recommendation of the Day
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-mono">
                        {recommendation.confidence}% Conf
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5">{recommendation.title}</h3>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-[#3DCD58] font-mono">+${recommendation.estimatedSavingUSD}</div>
                  <div className="text-[10px] text-slate-400">Est. Daily Saving</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {recommendation.impactSummary}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3DCD58]"></span>
                  Target: <span className="text-slate-300 font-medium">{recommendation.equipment}</span>
                </div>

                <button
                  id="btn-apply-recommendation"
                  onClick={handleApplyRecommendation}
                  disabled={recommendation.applied || isApplyingRec}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                    recommendation.applied
                      ? 'bg-slate-800 text-[#3DCD58] border border-[#3DCD58]/30 cursor-default'
                      : 'bg-[#3DCD58] hover:bg-[#32b84a] text-slate-950 shadow-md hover:shadow-[#3DCD58]/20'
                  }`}
                >
                  {recommendation.applied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Applied to BMS
                    </>
                  ) : isApplyingRec ? (
                    <>
                      <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" /> Apply Schedule
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 🏢 Metric 4: Smart Building Illustration */
          <div className="space-y-3">
            <BuildingIllustration />
          </div>
        )}
      </div>

      {/* Footer reassurance banner */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#3DCD58]" />
          <span>BACnet/IP & Modbus Encrypted Link</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-300">
          <span>Efficiency Score:</span>
          <span className="text-[#3DCD58] font-bold font-mono">{telemetry.efficiencyScore}/100</span>
        </div>
      </div>
    </div>
  );
};
