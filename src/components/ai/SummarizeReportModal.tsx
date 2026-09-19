import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Leaf, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw,
  Award,
  ArrowRight
} from 'lucide-react';
import { aiService, ReportSummary } from '../../services/aiService';
import { useFacility } from '../../context/FacilityContext';
import { AiLoadingAnimation } from './AiLoadingAnimation';
import { AiErrorBanner } from './AiErrorBanner';

interface SummarizeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    id?: string;
    name?: string;
    title?: string;
    type?: string;
    period?: string;
    metrics?: any;
    content?: string;
  };
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const SummarizeReportModal: React.FC<SummarizeReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onShowToast,
}) => {
  const { facilitySummaryPrompt } = useFacility();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const reportTitle = report.title || report.name || 'Executive Sustainability & Energy Audit';

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.summarizeReport({
        title: reportTitle,
        type: report.type || 'Monthly Energy Review',
        period: report.period || 'Current Billing Cycle',
        metrics: report.metrics,
        content: report.content,
      }, facilitySummaryPrompt);

      if (res.summary) {
        setSummary(res.summary);
        setIsFallback(res.source === 'simulation_fallback');
        if (res.apiError) {
          setError(res.apiError);
        }
      }
    } catch (err: any) {
      console.error('[Report Summary Error]:', err);
      setError(err.message || 'Failed to summarize report with Gemini');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
    } else {
      setSummary(null);
      setError(null);
    }
  }, [isOpen, report.id, report.title, report.name]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!summary) return;
    const textToCopy = `EXECUTIVE SUMMARY - ${reportTitle}
${summary.executiveSummary}

KEY FINDINGS:
${summary.keyFindings.map(f => `• ${f}`).join('\n')}

ESG & COMPLIANCE STATUS:
${summary.esgCompliance}

FINANCIAL & ROI OPPORTUNITIES:
${summary.financialOpportunities}

URGENT ACTIONS:
${summary.urgentActions.map(a => `• ${a}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    onShowToast('Copied executive briefing to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3DCD58] text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Gemini Report Briefing</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#228035] dark:text-[#3DCD58] text-[10px] font-bold">
                  Executive AI Summary
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-md">
                {reportTitle}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <AiErrorBanner
              error={error}
              isFallbackActive={isFallback}
              onRetry={fetchSummary}
              onDismiss={() => setError(null)}
            />
          )}

          {loading ? (
            <AiLoadingAnimation
              title="Gemini is Distilling Energy Report..."
              subtitle={`Synthesizing analytical telemetry and ESG audit data for ${reportTitle}`}
              steps={[
                'Parsing multi-page energy consumption logs...',
                'Correlating GHG Scope 2 emissions & LEED points...',
                'Extracting tariff optimization ROI opportunities...',
                'Formatting concise executive briefing for leadership...',
              ]}
              size="lg"
            />
          ) : summary ? (
            <div className="space-y-5">
              {/* Executive Summary Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5 text-[#228035] dark:text-[#3DCD58]" />
                  <span>Executive Overview</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {summary.executiveSummary}
                </p>
              </div>

              {/* Key Findings */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Key Audit Findings
                </h5>
                <div className="space-y-2">
                  {summary.keyFindings?.map((finding, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#3DCD58] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid: ESG & Financial Opportunities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Award className="w-4 h-4 text-[#228035] dark:text-[#3DCD58]" />
                    <span>ESG & LEED Compliance</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {summary.esgCompliance}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-[#3DCD58]" />
                    <span>Financial Opportunities</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {summary.financialOpportunities}
                  </p>
                </div>
              </div>

              {/* Urgent Action Items */}
              {summary.urgentActions && summary.urgentActions.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white shadow-md border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Priority Management Actions
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {summary.urgentActions.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                        <span className="text-[#3DCD58] font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#3DCD58]' : ''}`} />
            <span>Regenerate Summary</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!summary || loading}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#3DCD58]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Briefing'}</span>
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
    </div>
  );
};
