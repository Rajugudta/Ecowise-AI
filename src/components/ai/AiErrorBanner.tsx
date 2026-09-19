import React from 'react';
import { AlertTriangle, RefreshCw, Key, ExternalLink, X } from 'lucide-react';

interface AiErrorBannerProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  isFallbackActive?: boolean;
}

export const AiErrorBanner: React.FC<AiErrorBannerProps> = ({
  error,
  onRetry,
  onDismiss,
  isFallbackActive = false,
}) => {
  if (!error && !isFallbackActive) return null;

  const isMissingKey = error?.toLowerCase().includes('gemini_api_key') || error?.toLowerCase().includes('not configured');

  return (
    <div className="p-4 rounded-2xl border border-amber-200/90 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0">
          {isMissingKey ? <Key className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              {isMissingKey ? 'Gemini API Notice' : 'Gemini Request Notice'}
            </span>
            {isFallbackActive && (
              <span className="px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                Simulation Mode Active
              </span>
            )}
          </div>
          <p className="text-xs text-amber-800/90 dark:text-amber-200/90 leading-relaxed max-w-xl">
            {error || 'Live Gemini API is unavailable. Using calibrated BMS simulation fallback with real building metrics.'}
          </p>
          {isMissingKey && (
            <p className="text-[11px] text-amber-700 dark:text-amber-300/80 mt-1">
              Tip: You can attach your Gemini API key in the <strong>Settings &gt; Secrets</strong> menu to unlock real-time generative responses.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 rounded-xl bg-amber-200/80 dark:bg-amber-900/80 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
