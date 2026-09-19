import React, { useState } from 'react';
import { 
  Leaf, 
  Sparkles, 
  TrendingDown, 
  Trees, 
  Award, 
  ArrowUpRight, 
  CheckCircle2, 
  Calendar, 
  Download, 
  PieChart as PieChartIcon, 
  Zap, 
  Building,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { BuildingTelemetry } from '../../types';

interface CarbonIntelligencePageProps {
  telemetry: BuildingTelemetry;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onNavigateToAdvisor: () => void;
}

export const CarbonIntelligencePage: React.FC<CarbonIntelligencePageProps> = ({
  telemetry,
  onShowToast,
  onNavigateToAdvisor,
}) => {
  const [period, setPeriod] = useState<'today' | 'weekly' | 'monthly'>('today');

  // Emission sources breakdown
  const carbonSourceData = [
    { name: 'Chillers & Primary HVAC', value: 46, color: '#3DCD58' },
    { name: 'Office Lighting & VAVs', value: 24, color: '#228035' },
    { name: 'Plug & Workstation Loads', value: 18, color: '#60a5fa' },
    { name: 'EV Fleet Charging Hub', value: 12, color: '#f59e0b' },
  ];

  // Carbon trend comparison (Historical Baseline vs Decarbonized Actual)
  const carbonTrendData = [
    { month: 'Jan', baselineCO2: 18.2, actualCO2: 15.4, avoided: 2.8 },
    { month: 'Feb', baselineCO2: 17.8, actualCO2: 14.8, avoided: 3.0 },
    { month: 'Mar', baselineCO2: 19.4, actualCO2: 15.9, avoided: 3.5 },
    { month: 'Apr', baselineCO2: 20.1, actualCO2: 16.2, avoided: 3.9 },
    { month: 'May', baselineCO2: 22.4, actualCO2: 17.8, avoided: 4.6 },
    { month: 'Jun', baselineCO2: 24.6, actualCO2: 19.2, avoided: 5.4 },
    { month: 'Jul', baselineCO2: 26.2, actualCO2: 20.4, avoided: 5.8 },
    { month: 'Aug', baselineCO2: 25.4, actualCO2: 19.8, avoided: 5.6 },
  ];

  const aiCarbonRecs = [
    {
      id: 'crec-1',
      title: 'Synchronize 24-Bay EV Chargers with Midday Solar Surplus',
      impact: '-18.4 kg CO2e / day',
      desc: 'Smart curtailment during 13:00–15:00 peak shifts 80 kWh from carbon-heavy marginal natural gas peaker plants to 100% clean rooftop solar.',
    },
    {
      id: 'crec-2',
      title: 'Automated Nighttime Heat Rejection via Evaporative Coolers',
      impact: '-26.2 kg CO2e / night',
      desc: 'Utilizes cool marine fog layer to cool condenser water loops without running primary 450-Ton centrifugal chillers.',
    },
    {
      id: 'crec-3',
      title: 'Enforce ASHRAE 90.1 Daylight Harvesting on Floors 4–7',
      impact: '-12.8 kg CO2e / day',
      desc: 'Auto-dims perimeter LED fixtures by 35% when ambient exterior sunlight exceeds 400 lux.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#3DCD58]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-[#3DCD58]/20 text-[#3DCD58] text-[10px] font-extrabold uppercase tracking-widest border border-[#3DCD58]/30 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" />
                Scope 1 & 2 ESG Dashboard
              </span>
              <span className="text-xs text-slate-400">GHG Protocol Certified</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Carbon Intelligence & Net Zero Tracker
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Auditable carbon accounting, real-time marginal grid emission factors, and automated decarbonization pathways.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
              {(['today', 'weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    period === p
                      ? 'bg-[#3DCD58] text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => onShowToast('Exported Greenhouse Gas Protocol CSV Report', 'success')}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#3DCD58]" />
              <span>Export GHG Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Carbon KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Avoided Carbon Today */}
        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {period === 'today' ? "Today's CO2 Avoided" : period === 'weekly' ? 'Weekly CO2 Avoided' : 'Monthly CO2 Avoided'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#228035] dark:text-[#3DCD58]">
              <Leaf className="w-4 h-4 text-[#3DCD58]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {period === 'today' ? '384.2 kg' : period === 'weekly' ? '2,680 kg' : '11.4 Tons'}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-[#228035] dark:text-[#3DCD58] flex items-center">
                <TrendingDown className="w-3.5 h-3.5" /> -22.4%
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">vs grid intensity</span>
            </div>
          </div>
        </div>

        {/* Trees Equivalent */}
        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Trees Equivalent
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-[#3DCD58]">
              <Trees className="w-4 h-4 text-[#3DCD58]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {period === 'today' ? '16 Trees' : period === 'weekly' ? '112 Trees' : '480 Trees'}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Carbon sequestered equivalent
              </span>
            </div>
          </div>
        </div>

        {/* Net Zero 2030 Progress */}
        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Zero 2030 Progress
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              64.2%
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-[#228035] dark:text-[#3DCD58]">
                On track for 2028 completion
              </span>
            </div>
          </div>
        </div>

        {/* Carbon Intensity Factor */}
        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Real-Time Grid Cleanliness
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              88% Clean
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                CAISO Hydro & Solar Mix
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid: Trend (Left) & Emission Source Pie (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Decarbonization Trend Area Chart */}
        <div className="lg:col-span-8 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Monthly Carbon Footprint: Baseline vs. Actual (Metric Tons CO2e)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tracks science-based target initiative (SBTi) emissions trajectory
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-600" /> Standard Grid Baseline
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-[#3DCD58]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#3DCD58]" /> EcoWise Actual Footprint
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={carbonTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3DCD58" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3DCD58" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.3} />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.3 }} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.3 }} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(val) => `${val} t`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', fontSize: '12px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} t CO2e`, '']}
                />
                <Area type="monotone" dataKey="baselineCO2" name="Baseline CO2" stroke="#94a3b8" strokeDasharray="4 4" fill="none" />
                <Area type="monotone" dataKey="actualCO2" name="Actual Footprint" stroke="#3DCD58" strokeWidth={2.5} fillOpacity={1} fill="url(#carbonGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carbon Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Scope 2 Carbon Sources
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Proportional emission drivers by subsystem
            </p>

            <div className="h-48 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carbonSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {carbonSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(value: any) => [`${value}%`, 'Share']} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {carbonSourceData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Decarbonization Recommendations */}
      <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#3DCD58]" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
              AI Decarbonization Opportunities (High Marginal Grid Impact)
            </h3>
          </div>
          <button
            onClick={onNavigateToAdvisor}
            className="text-xs font-bold text-[#228035] dark:text-[#3DCD58] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ask Copilot for Plan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiCarbonRecs.map((rec) => (
            <div key={rec.id} className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{rec.title}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold shrink-0 border border-emerald-300 dark:border-emerald-700/60">
                  {rec.impact}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {rec.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
