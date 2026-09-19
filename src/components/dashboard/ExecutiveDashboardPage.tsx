import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Leaf, 
  Award, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  ArrowUpRight, 
  CheckCircle2, 
  BarChart3, 
  Building, 
  RefreshCw,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { BuildingTelemetry } from '../../types';

interface ExecutiveDashboardProps {
  telemetry: BuildingTelemetry;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onNavigateToReports: () => void;
}

export const ExecutiveDashboardPage: React.FC<ExecutiveDashboardProps> = ({
  telemetry,
  onShowToast,
  onNavigateToReports,
}) => {
  const [timeRange, setTimeRange] = useState<'MTD' | 'YTD' | 'Q3'>('MTD');
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  const [executiveSummaryText, setExecutiveSummaryText] = useState(
    'EcoTower Delta is executing 14.8% below baseline energy consumption for Q3, driven by autonomous chiller plant VSD modulation and mid-day solar canopy dispatch. Net operating savings stand at $14,820 MTD with an annualized carbon reduction of 142.6 metric tons CO2e, maintaining active tracking for LEED Platinum v4.1 certification.'
  );

  const monthlyFinancialData = [
    { month: 'Jan', baselineSpend: 24500, actualSpend: 21200, savings: 3300, roi: 14.2 },
    { month: 'Feb', baselineSpend: 23800, actualSpend: 20100, savings: 3700, roi: 15.6 },
    { month: 'Mar', baselineSpend: 25200, actualSpend: 21400, savings: 3800, roi: 16.0 },
    { month: 'Apr', baselineSpend: 26100, actualSpend: 21900, savings: 4200, roi: 17.1 },
    { month: 'May', baselineSpend: 28400, actualSpend: 23600, savings: 4800, roi: 18.2 },
    { month: 'Jun', baselineSpend: 31200, actualSpend: 25800, savings: 5400, roi: 19.5 },
    { month: 'Jul', baselineSpend: 33500, actualSpend: 27400, savings: 6100, roi: 20.8 },
    { month: 'Aug', baselineSpend: 32800, actualSpend: 26900, savings: 5900, roi: 20.1 },
  ];

  const esgMilestones = [
    { name: 'Scope 2 Decarbonization', target: '40% Reduction by 2026', current: '34.8% achieved', status: 'Ahead of Target', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { name: 'LEED Platinum EA Credits', target: '33 / 35 Energy Points', current: '31 verified', status: 'Compliant', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { name: 'On-Site Renewable Ratio', target: '25% of gross consumption', current: '28.4% achieved', status: 'Exceeded', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { name: 'Peak Demand Shaving', target: 'Cap below 300 kW', current: '284 kW recorded', status: 'Under Control', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  ];

  const handleRefreshAiSummary = () => {
    setIsGeneratingAiSummary(true);
    setTimeout(() => {
      setIsGeneratingAiSummary(false);
      setExecutiveSummaryText(
        `Automated C-Suite Energy Intelligence: Building operations across 450,000 sq ft have preserved $14,820 this month. Peak tariff avoidance algorithm prevented $2,450 in demand ratchet fees today. Projected annualized energy return on investment stands at 20.8%, outperforming the commercial real estate benchmark by 6.4%. Recommended board action: Approve microgrid battery expansion to capture 100% of midday solar surplus.`
      );
      onShowToast('Executive AI Summary updated with latest audited financial metrics', 'success');
    }, 900);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* C-Suite Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3DCD58]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-[#3DCD58]/20 text-[#3DCD58] text-[10px] font-extrabold uppercase tracking-widest border border-[#3DCD58]/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3DCD58] animate-pulse" />
                C-Suite Executive Overview
              </span>
              <span className="text-xs text-slate-400 font-medium">EcoTower Delta HQ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Chief Executive & CFO Briefing
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time financial return, portfolio decarbonization velocity, and equipment reliability metrics aligned with science-based net zero commitments.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center flex-wrap">
            <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
              {(['MTD', 'Q3', 'YTD'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    timeRange === r
                      ? 'bg-[#3DCD58] text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={onNavigateToReports}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#3DCD58]" />
              <span>Download Board Pack</span>
            </button>
          </div>
        </div>

        {/* Executive AI Summary Box */}
        <div className="mt-6 pt-6 border-t border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#3DCD58] text-slate-950 shrink-0 mt-0.5">
              <Sparkles className={`w-4 h-4 ${isGeneratingAiSummary ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#3DCD58] uppercase tracking-wider block">
                Executive AI Intelligence
              </span>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed font-normal">
                {executiveSummaryText}
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshAiSummary}
            disabled={isGeneratingAiSummary}
            className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            title="Re-query latest financial telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAiSummary ? 'animate-spin text-[#3DCD58]' : ''}`} />
            <span>{isGeneratingAiSummary ? 'Refreshing...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Financial Savings */}
        <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Financial Savings
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-[#3DCD58]">
              <DollarSign className="w-4 h-4 text-[#3DCD58]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">$14,820</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-[#228035] dark:text-[#3DCD58] flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">vs Q2 utility bill</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Projected Annual:</span>
            <span className="font-bold text-slate-900 dark:text-white">$182,400</span>
          </div>
        </div>

        {/* Monthly ROI */}
        <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Energy Investment ROI
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">20.8%</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-[#228035] dark:text-[#3DCD58] flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +2.6%
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">capital efficiency</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Payback Velocity:</span>
            <span className="font-bold text-slate-900 dark:text-white">1.8 Years</span>
          </div>
        </div>

        {/* Carbon Reduction */}
        <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Carbon Avoided
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#228035] dark:text-[#3DCD58]">
              <Leaf className="w-4 h-4 text-[#3DCD58]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">38.4 t</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-[#228035] dark:text-[#3DCD58] flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> -22.1%
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Scope 2 emissions</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Trees Equivalent:</span>
            <span className="font-bold text-slate-900 dark:text-white">1,620 Mature Trees</span>
          </div>
        </div>

        {/* Operational Reliability */}
        <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Equipment Health Index
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">98.4%</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-[#228035] dark:text-[#3DCD58] flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3DCD58]" /> Zero Unplanned
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">downtime MTD</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Chiller COP Efficiency:</span>
            <span className="font-bold text-slate-900 dark:text-white">0.54 kW/ton (Grade A)</span>
          </div>
        </div>
      </div>

      {/* Financial Comparison & ROI Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Spend vs Baseline Chart */}
        <div className="lg:col-span-2 bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Utility Expenditure: Actual vs. Historical Baseline ($)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Demonstrates monthly dollar savings generated by Schneider BMS & AI Copilot
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-700" /> Baseline Spend
              </span>
              <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#3DCD58]" /> Actual Spend
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinancialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#475569' }} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={{ stroke: '#475569' }} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', fontSize: '12px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Bar dataKey="baselineSpend" name="Baseline Budget" fill="#64748b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="actualSpend" name="Actual Expenditure" fill="#3DCD58" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ESG Science-Based Net Zero Progress */}
        <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Net Zero 2030 Roadmap
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-[#3DCD58] text-[10px] font-extrabold">
                Phase 2
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Portfolio decarbonization velocity towards 2030 target
            </p>

            <div className="mt-6 space-y-4">
              {esgMilestones.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${item.color} dark:bg-emerald-950/60 dark:text-[#3DCD58] dark:border-emerald-800/60`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Target: {item.target}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.current}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-700 dark:text-slate-300">Cumulative Decarbonization</span>
              <span className="text-emerald-700 dark:text-[#3DCD58] font-extrabold">64.2%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#3DCD58] rounded-full" style={{ width: '64.2%' }} />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block text-right">
              Audited by Schneider Electric Sustainability Bureau
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
