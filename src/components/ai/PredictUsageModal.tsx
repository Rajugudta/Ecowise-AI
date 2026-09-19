import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  Leaf, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  BarChart2,
  ShieldCheck
} from 'lucide-react';
import { aiService, EnergyPrediction } from '../../services/aiService';
import { AiLoadingAnimation } from './AiLoadingAnimation';
import { AiErrorBanner } from './AiErrorBanner';

interface PredictUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetryData?: any;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const PredictUsageModal: React.FC<PredictUsageModalProps> = ({
  isOpen,
  onClose,
  telemetryData,
  onShowToast,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<EnergyPrediction | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [forecastHours, setForecastHours] = useState<number>(24);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.predictUsage(forecastHours, telemetryData);
      if (res.prediction) {
        setPrediction(res.prediction);
        setIsFallback(res.source === 'simulation_fallback');
        if (res.apiError) {
          setError(res.apiError);
        }
      }
    } catch (err: any) {
      console.error('[Energy Prediction Error]:', err);
      setError(err.message || 'Failed to predict energy usage with Gemini');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPrediction();
    } else {
      setPrediction(null);
      setError(null);
    }
  }, [isOpen, forecastHours]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3DCD58] text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Gemini 24-Hour Energy Forecast</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#228035] dark:text-[#3DCD58] text-[10px] font-bold">
                  Predictive ML
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Predicting demand spikes, TOU tariff exposure, and weather impacts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <AiErrorBanner
              error={error}
              isFallbackActive={isFallback}
              onRetry={fetchPrediction}
              onDismiss={() => setError(null)}
            />
          )}

          {loading ? (
            <AiLoadingAnimation
              title="Gemini is Synthesizing Predictive Forecast..."
              subtitle="Processing thermodynamic load profiles, weather projections, and TOU tariff curves"
              steps={[
                'Ingesting historical BMS submeter interval series...',
                'Correlating ambient temperature curve (peak 76°F)...',
                'Simulating chiller compressor staging & solar PV output...',
                'Calculating coincident peak demand charge risk...',
              ]}
              size="lg"
            />
          ) : prediction ? (
            <div className="space-y-6">
              {/* Top 4 KPI Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Projected Total</span>
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                    {prediction.projectedTotalKWh.toLocaleString()} <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">kWh</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Peak Demand</span>
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                    {prediction.projectedPeakKW} <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">kW</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">at {prediction.projectedPeakTime}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-[#3DCD58]" />
                    <span>Est. Utility Bill</span>
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                    ${prediction.projectedCostUSD.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-[#3DCD58] font-medium">-${prediction.savingsPotentialUSD.toFixed(2)} opt.</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                    <Leaf className="w-3.5 h-3.5 text-[#228035] dark:text-[#3DCD58]" />
                    <span>Scope 2 CO₂</span>
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                    {prediction.projectedCarbonKg} <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">kg</span>
                  </div>
                </div>
              </div>

              {/* Risk Level Callout */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                prediction.riskLevel === 'High' 
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200' 
                  : prediction.riskLevel === 'Moderate'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
              }`}>
                <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 shrink-0 mt-0.5">
                  <AlertTriangle className={`w-4 h-4 ${
                    prediction.riskLevel === 'High' ? 'text-rose-600' : 'text-amber-600'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Grid Exposure Risk: {prediction.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {prediction.riskExplanation}
                  </p>
                </div>
              </div>

              {/* Projected Hourly Demand Bar Chart */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Forecasted Demand Curve</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#3DCD58]" /> Predicted
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 dark:bg-slate-700" /> Baseline
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-xs bg-amber-400" /> Peak TOU Window
                    </span>
                  </div>
                </div>

                <div className="h-44 flex items-end gap-1.5 sm:gap-2.5 pt-4">
                  {prediction.hourlyForecast?.map((item, idx) => {
                    const predHeight = Math.min(100, Math.max(12, (item.predictedKW / 240) * 100));
                    const baseHeight = Math.min(100, Math.max(12, (item.baselineKW / 240) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 z-20 pointer-events-none bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap shadow-md">
                          {item.hour}: {item.predictedKW} kW (Base: {item.baselineKW})
                          {item.isPeakTariff && ' • On-Peak ($0.24)'}
                        </div>

                        <div className="w-full flex items-end justify-center gap-1 h-32">
                          <div
                            style={{ height: `${baseHeight}%` }}
                            className="w-1/2 bg-slate-200/90 dark:bg-slate-700 rounded-t-xs"
                          />
                          <div
                            style={{ height: `${predHeight}%` }}
                            className={`w-1/2 rounded-t-xs transition-all ${
                              item.isPeakTariff ? 'bg-amber-500' : 'bg-[#3DCD58]'
                            }`}
                          />
                        </div>

                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                          {item.hour}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proactive Operational Recommendations */}
              {prediction.proactiveRecommendations && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#228035] dark:text-[#3DCD58]" />
                    <span>Proactive Grid Mitigation Schedule</span>
                  </h5>
                  <div className="space-y-2">
                    {prediction.proactiveRecommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-xs text-slate-700 dark:text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#3DCD58] shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-medium">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={fetchPrediction}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#3DCD58]' : ''}`} />
            <span>Recalculate Forecast</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
