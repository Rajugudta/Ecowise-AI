import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Cpu, Zap } from 'lucide-react';

interface AiLoadingAnimationProps {
  title?: string;
  subtitle?: string;
  steps?: string[];
  size?: 'sm' | 'md' | 'lg';
}

const DEFAULT_STEPS = [
  'Connecting to Google Gemini 3.8 Flash...',
  'Analyzing building BMS telemetry & submeters...',
  'Evaluating Time-of-Use tariffs ($0.24/kWh peak)...',
  'Synthesizing mathematically grounded insights...',
];

export const AiLoadingAnimation: React.FC<AiLoadingAnimationProps> = ({
  title = 'Google Gemini is Thinking...',
  subtitle = 'Processing real-time commercial telemetry for EcoTower Delta',
  steps = DEFAULT_STEPS,
  size = 'md',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-[#3DCD58]/30 dark:border-[#3DCD58]/20 transition-all ${
      size === 'sm' ? 'py-4 px-3' : size === 'lg' ? 'py-12 px-8' : 'py-8 px-6'
    }`}>
      {/* Animated Glowing Icon Cluster */}
      <div className="relative mb-4">
        {/* Outer glowing pulsing halo */}
        <div className="absolute -inset-2 bg-gradient-to-r from-[#3DCD58]/30 via-emerald-400/20 to-teal-400/30 rounded-full blur-md animate-pulse" />
        
        {/* Central badge */}
        <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-[#3DCD58]/50 shadow-sm flex items-center justify-center text-[#228035] dark:text-[#3DCD58]">
          <Sparkles className="w-7 h-7 animate-spin text-[#228035] dark:text-[#3DCD58] [animation-duration:6s]" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#3DCD58] rounded-full flex items-center justify-center text-slate-950 text-[10px] shadow-xs">
            <Zap className="w-3 h-3 fill-slate-950" />
          </div>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
          <span>{title}</span>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#228035] dark:text-[#3DCD58]" />
        </h4>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {subtitle}
          </p>
        )}
      </div>

      {/* Rotating Progress Step */}
      <div className="mt-4 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs flex items-center gap-2 max-w-xs transition-all">
        <Cpu className="w-3.5 h-3.5 text-[#228035] dark:text-[#3DCD58] shrink-0" />
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
          {steps[currentStepIndex]}
        </span>
      </div>

      {/* Animated Step Dots */}
      <div className="flex items-center gap-1.5 mt-3">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentStepIndex
                ? 'w-6 bg-[#228035] dark:bg-[#3DCD58]'
                : 'w-1.5 bg-emerald-200 dark:bg-emerald-900/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
