import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Leaf, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Filter, 
  Layers, 
  Download,
  Sliders
} from 'lucide-react';
import { BuildingTelemetry } from '../../types';

interface AiInsightsPageProps {
  telemetry: BuildingTelemetry;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onExecuteAction: (actionTitle: string) => void;
}

export const AiInsightsPage: React.FC<AiInsightsPageProps> = ({
  telemetry,
  onShowToast,
  onExecuteAction,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'opportunities' | 'risks' | 'carbon' | 'financial'>('all');

  const insightsList = [
    {
      id: 'ins-1',
      title: 'Chiller Plant #2 Lift Optimization',
      category: 'opportunities',
      impact: 'High Impact / Low Effort',
      savingsUSD: 240,
      carbonReductionKg: 85,
      urgency: 'high',
      matrixCoord: 'high-impact-low-effort',
      desc: 'Raising chilled water supply setpoint from 44°F to 47°F cuts centrifugal compressor lift by 6.2%, saving $240 daily with zero impact on tenant comfort.',
      action: 'Set CHW Supply Temp to 47°F via BACnet',
    },
    {
      id: 'ins-2',
      title: 'Floor 6 Compute Cluster Thermal Recirculation Risk',
      category: 'risks',
      impact: 'High Risk / Medium Effort',
      savingsUSD: 180,
      carbonReductionKg: 42,
      urgency: 'critical',
      matrixCoord: 'high-impact-high-effort',
      desc: 'Hot aisle containment blanking panel missing on Rack Row D, causing 7.4°F hot air entrainment into server inlet fans.',
      action: 'Alert Facilities Dispatch to inspect Rack D',
    },
    {
      id: 'ins-3',
      title: 'Daylight Harvesting Modulation on South Facade',
      category: 'opportunities',
      impact: 'Medium Impact / Low Effort',
      savingsUSD: 68,
      carbonReductionKg: 34,
      urgency: 'medium',
      matrixCoord: 'medium-impact-low-effort',
      desc: 'External lux sensors on Floors 3–5 show 850 lux ambient sunlight. Dimmable 0-10V LED ballasts can safely scale back to 55%.',
      action: 'Engage Smart Photocell Dimming Routine',
    },
    {
      id: 'ins-4',
      title: 'EV Fleet Peak Grid Demand Ratchet Risk',
      category: 'risks',
      impact: 'High Risk / Low Effort',
      savingsUSD: 450,
      carbonReductionKg: 120,
      urgency: 'critical',
      matrixCoord: 'high-impact-low-effort',
      desc: 'Simultaneous Level 2 EV charging draws 48 kW during 14:00 peak PG&E tariff window, threatening a $450 demand ratchet fee.',
      action: 'Cap EV Charging Station Bus to 16 kW',
    },
  ];

  const filteredInsights = insightsList.filter((item) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'opportunities') return item.category === 'opportunities';
    if (activeCategory === 'risks') return item.category === 'risks';
    if (activeCategory === 'financial') return item.savingsUSD > 100;
    if (activeCategory === 'carbon') return item.carbonReductionKg > 50;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#228035] dark:text-[#3DCD58]">
              <Sparkles className="w-4 h-4 text-[#3DCD58]" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#228035] dark:text-[#3DCD58]">
              Prescriptive AI Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Insights & Opportunity Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Autonomous pattern detection identifying energy waste, mechanical degradation, and tariff optimization opportunities.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'opportunities', 'risks', 'financial', 'carbon'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 dark:bg-[#3DCD58] text-white dark:text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Matrix 2x2 Card */}
      <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#3DCD58]" />
            Opportunity Priority Matrix (Impact vs. Implementation Effort)
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">4 Prescriptions Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Quadrant 1: Quick Wins (High Impact, Low Effort) */}
          <div className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3DCD58]" />
                Top Priority Quick Wins (High Impact / Low Effort)
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200">
                Immediate Execution
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="p-3 bg-white dark:bg-slate-900/90 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-2xs">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Chiller Plant #2 Lift Optimization</span>
                  <span className="text-xs font-extrabold text-[#228035] dark:text-[#3DCD58]">+$240/day</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Autonomous setpoint adjustment from 44°F to 47°F.</p>
                <button
                  onClick={() => onExecuteAction('Chiller Plant #2 Lift Optimization')}
                  className="mt-2 text-xs font-bold text-emerald-800 dark:text-[#3DCD58] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Execute Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900/90 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-2xs">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">EV Fleet Peak Charging Shave</span>
                  <span className="text-xs font-extrabold text-[#228035] dark:text-[#3DCD58]">+$450 fee avoided</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Cap Level 2 chargers during 14:00 peak PG&E tariff.</p>
                <button
                  onClick={() => onExecuteAction('EV Fleet Peak Charging Shave')}
                  className="mt-2 text-xs font-bold text-emerald-800 dark:text-[#3DCD58] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Execute Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quadrant 2: Strategic Investments (High Impact, Higher Effort) */}
          <div className="p-5 rounded-3xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Major Strategic Projects (High Impact / Higher Effort)
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-200 dark:bg-blue-900/80 text-blue-900 dark:text-blue-200">
                Scheduled Maintenance
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="p-3 bg-white dark:bg-slate-900/90 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-2xs">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Floor 6 Compute Hot Aisle Remediation</span>
                  <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400">Avoids Rack Faults</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Install blanking panels to eliminate 7.4°F air recirculation.</p>
                <button
                  onClick={() => onExecuteAction('Floor 6 Compute Hot Aisle Remediation')}
                  className="mt-2 text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Assign Work Order</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900/90 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-2xs">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Daylight Photocell Calibration</span>
                  <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400">+$68/day</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Recalibrate south facade lux sensors on Floors 3–5.</p>
                <button
                  onClick={() => onExecuteAction('Daylight Photocell Calibration')}
                  className="mt-2 text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Execute Routine</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Insights Cards List */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Actionable Prescriptions ({filteredInsights.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((item) => (
            <div
              key={item.id}
              className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-xl ${item.category === 'risks' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-950/60 text-[#228035] dark:text-[#3DCD58]'}`}>
                      {item.category === 'risks' ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-[#228035] dark:text-[#3DCD58] flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-[#3DCD58]" /> +${item.savingsUSD}/day
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-[#3DCD58]" /> -{item.carbonReductionKg} kg
                  </span>
                </div>

                <button
                  onClick={() => onExecuteAction(item.title)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Apply</span>
                  <ArrowRight className="w-3 h-3 text-[#3DCD58]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
