import React, { useState } from 'react';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  Sun, 
  Sparkles, 
  Thermometer, 
  Activity, 
  ShieldCheck, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { WeatherData } from '../../types';

interface WeatherWidgetProps {
  weather: WeatherData;
  onShowAdvisor: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, onShowAdvisor }) => {
  const [showFullForecast, setShowFullForecast] = useState(false);

  const forecastDays = [
    { day: 'Today', tempHigh: 74, tempLow: 56, condition: 'Partly Sunny', solarKWh: 420, icon: CloudSun },
    { day: 'Tomorrow', tempHigh: 78, tempLow: 59, condition: 'Sunny / Warm', solarKWh: 490, icon: Sun },
    { day: 'Wed', tempHigh: 71, tempLow: 54, condition: 'Breezy Fog', solarKWh: 360, icon: Wind },
    { day: 'Thu', tempHigh: 68, tempLow: 52, condition: 'Overcast', solarKWh: 310, icon: CloudSun },
    { day: 'Fri', tempHigh: 73, tempLow: 55, condition: 'Optimal Clear', solarKWh: 460, icon: Sun },
  ];

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/30 dark:from-[#0f172a] dark:via-slate-900 dark:to-emerald-950/20 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group transition-colors">
      {/* Decorative ambient glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#3DCD58]/10 dark:bg-[#3DCD58]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 shadow-2xs">
            <CloudSun className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                San Francisco Microclimate
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#3DCD58] text-[10px] font-bold border border-emerald-200/50 dark:border-emerald-800/60">
                Live NOAA Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Station 94105 • Downtown Financial District
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFullForecast(!showFullForecast)}
          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
        >
          <span>{showFullForecast ? 'Close Forecast' : '5-Day Forecast'}</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showFullForecast ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Main Weather Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Temperature */}
        <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" /> Ambient Temp
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{weather.tempF}°F</span>
            <span className="text-xs font-bold text-slate-400">({weather.tempC}°C)</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-[#3DCD58] font-bold">PMV Comfort Index: +0.08</span>
        </div>

        {/* Humidity */}
        <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" /> Relative Humidity
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{weather.humidityPct}%</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Wet-bulb: 61.2°F</span>
        </div>

        {/* Wind Speed */}
        <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-teal-500" /> Wind Velocity
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{weather.windMph}</span>
            <span className="text-xs font-bold text-slate-400">mph WNW</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-[#3DCD58] font-bold">Natural Draft: Active</span>
        </div>

        {/* Solar Irradiance */}
        <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" /> Solar Irradiance
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{weather.solarIrradianceWm2}</span>
            <span className="text-xs font-bold text-slate-400">W/m²</span>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Rooftop Yield: 42.4 kW</span>
        </div>
      </div>

      {/* AI HVAC Impact & Advisory Banner */}
      <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-xl bg-[#3DCD58] text-slate-950 shrink-0 mt-0.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                AI Weather Intelligence Advisory
              </span>
              <span className="text-[10px] font-bold text-[#228035] dark:text-[#3DCD58] uppercase tracking-wide">
                Free-Cooling Opportunity
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
              {weather.aiRecommendation}
            </p>
          </div>
        </div>

        <button
          onClick={onShowAdvisor}
          className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs"
        >
          <span>Ask Copilot</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5-Day Forecast Dropdown */}
      {showFullForecast && (
        <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2.5 animate-in fade-in">
          {forecastDays.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{f.day}</span>
                <Icon className="w-5 h-5 mx-auto text-amber-500 my-1" />
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  {f.tempHigh}° <span className="text-slate-400 font-normal">/ {f.tempLow}°</span>
                </div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                  ~{f.solarKWh} kWh Solar
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
