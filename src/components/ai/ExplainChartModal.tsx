import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Copy, 
  Check, 
  RefreshCw,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { aiService, ChartExplanation } from '../../services/aiService';
import { AiLoadingAnimation } from './AiLoadingAnimation';
import { AiErrorBanner } from './AiErrorBanner';

interface ExplainChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartType: string;
  chartTitle: string;
  chartData: any;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const ExplainChartModal: React.FC<ExplainChartModalProps> = ({
  isOpen,
  onClose,
  chartType,
  chartTitle,
  chartData,
  onShowToast,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<ChartExplanation | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.explainChart(chartType, chartData);
      if (res.explanation) {
        setExplanation(res.explanation);
        setIsFallback(res.source === 'simulation_fallback');
        if (res.apiError) {
          setError(res.apiError);
        }
      }
    } catch (err: any) {
      console.error('[Explain Chart Error]:', err);
      setError(err.message || 'Failed to explain chart with Gemini');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchExplanation();
    } else {
      setExplanation(null);
      setError(null);
    }
  }, [isOpen, chartType]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!explanation) return;
    const textToCopy = `Chart: ${chartTitle}
Headline: ${explanation.headline}
Analysis: ${explanation.explanation}
Key Observations:
${explanation.keyObservations.map(o => `• ${o}`).join('\n')}
Recommended Action: ${explanation.recommendedAction}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    onShowToast('Copied Gemini analysis to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3DCD58] text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Gemini Chart Explanation</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#228035] dark:text-[#3DCD58] text-[10px] font-bold">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Interpreting: <span className="text-slate-800 dark:text-slate-200 font-semibold">{chartTitle}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <AiErrorBanner
              error={error}
              isFallbackActive={isFallback}
              onRetry={fetchExplanation}
              onDismiss={() => setError(null)}
            />
          )}

          {loading ? (
            <AiLoadingAnimation
              title="Gemini is Interpreting Chart Telemetry..."
              subtitle={`Deconstructing data curves for ${chartTitle} against historical baselines`}
              steps={[
                'Ingesting hourly actual vs baseline load vectors...',
                'Detecting abnormal variance and peak spikes...',
                'Mapping load correlation to chillers, HVAC, and solar...',
                'Synthesizing plain-language executive explanation...',
              ]}
              size="lg"
            />
          ) : explanation ? (
            <div className="space-y-5">
              {/* Headline Callout */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-[#228035] dark:text-[#3DCD58] shrink-0 mt-0.5">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    Core Observation
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {explanation.headline}
                  </h4>
                </div>
              </div>

              {/* Narrative Analysis */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Detailed Operational Analysis
                </h5>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 whitespace-pre-line bg-slate-50/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  {explanation.explanation}
                </div>
              </div>

              {/* Key Observations */}
              {explanation.keyObservations && explanation.keyObservations.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Key Telemetry Observations
                  </h5>
                  <ul className="space-y-2">
                    {explanation.keyObservations.map((obs, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-2xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#3DCD58] shrink-0 mt-0.5" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Action Card */}
              {explanation.recommendedAction && (
                <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white shadow-md border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-[#3DCD58]">
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Recommended BMS Action
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {explanation.recommendedAction}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Click &quot;Re-analyze&quot; to prompt Gemini for this chart.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={fetchExplanation}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#3DCD58]' : ''}`} />
            <span>Re-analyze</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!explanation || loading}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#3DCD58]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Analysis'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
