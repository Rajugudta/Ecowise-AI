import React from 'react';
import { 
  Zap, 
  Calendar, 
  Leaf, 
  Award, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  ArrowUpRight,
  Info
} from 'lucide-react';

interface MetricCardsProps {
  todayUsageKWh?: number;
  monthlyUsageKWh?: number;
  carbonEmissionsKg?: number;
  energyScore?: number;
  costSavingsUSD?: number;
  isLoading?: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  todayUsageKWh = 1482.4,
  monthlyUsageKWh = 42850,
  carbonEmissionsKg = 384.2,
  energyScore = 94,
  costSavingsUSD = 3842.50,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs animate-pulse flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-850 rounded" />
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-850 rounded" />
                </div>
              </div>
              <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-850 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* 1. Today's Energy Usage */}
      <div
        id="card-today-energy"
        className="group relative bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#3DCD58]/50 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#3DCD58] flex items-center justify-center border border-emerald-100 dark:border-emerald-900 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-[#3DCD58] text-[#3DCD58]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Real-time Draw
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Today's Usage</h4>
            </div>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#228035] dark:text-[#3DCD58] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <TrendingDown className="w-3 h-3" />
            -14.8%
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {todayUsageKWh.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">kWh</span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Peak Demand: <strong className="text-slate-800 dark:text-slate-200 font-bold">284 kW</strong></span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Off-Peak</span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Energy Usage */}
      <div
        id="card-monthly-energy"
        className="group relative bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#3DCD58]/50 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                September 2026
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Monthly Usage</h4>
            </div>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            <TrendingDown className="w-3 h-3" />
            -8.2%
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {monthlyUsageKWh.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">kWh</span>
          </div>

          {/* Progress bar toward 50,000 monthly cap */}
          <div className="mt-2 space-y-1">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#3DCD58] h-full rounded-full transition-all duration-500"
                style={{ width: `${(monthlyUsageKWh / 50000) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>85.7% of target</span>
              <span>50,000 cap</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Carbon Emissions */}
      <div
        id="card-carbon-emissions"
        className="group relative bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#3DCD58]/50 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#3DCD58] flex items-center justify-center border border-emerald-100 dark:border-emerald-900 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-[#3DCD58]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                GHG Avoidance
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Carbon Emissions</h4>
            </div>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#228035] dark:text-[#3DCD58] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Active
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {carbonEmissionsKg.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">kg CO₂ avoided</span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Quarterly: <strong className="text-slate-800 dark:text-slate-200 font-bold">4.2 MT</strong></span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">≈ 184 Trees</span>
          </div>
        </div>
      </div>

      {/* 4. Energy Score */}
      <div
        id="card-energy-score"
        className="group relative bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#3DCD58]/50 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                LEED Rating
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Energy Score</h4>
            </div>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            Platinum
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {energyScore}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ 100</span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Trend: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">+3.2 pts</strong></span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Top 5%</span>
          </div>
        </div>
      </div>

      {/* 5. Estimated Cost Savings */}
      <div
        id="card-cost-savings"
        className="group relative bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#3DCD58]/50 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#3DCD58] flex items-center justify-center border border-emerald-100 dark:border-emerald-900 group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5 text-[#3DCD58]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tariff Arbitrage
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Cost Savings</h4>
            </div>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#228035] dark:text-[#3DCD58] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="w-3 h-3" />
            +18.4%
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              ${costSavingsUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Annual Projected:</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-bold">$46,100</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
