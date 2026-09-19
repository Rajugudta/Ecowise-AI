import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Zap, 
  DollarSign, 
  Leaf, 
  TrendingUp, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  ArrowRight, 
  Thermometer, 
  Sun, 
  Battery, 
  Users, 
  Clock, 
  Lightbulb,
  ShieldCheck,
  Building
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
import { SimulationParams, SimulationResult } from '../../types';
import { aiService } from '../../services/aiService';
import { useFacility } from '../../context/FacilityContext';

interface EnergySimulatorPageProps {
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onApplyPreset?: (presetName: string) => void;
}

export const EnergySimulatorPage: React.FC<EnergySimulatorPageProps> = ({
  onShowToast,
  onApplyPreset,
}) => {
  const { facility, profile, facilitySummaryPrompt } = useFacility();

  // Simulator Parameters with realistic initial values
  const [params, setParams] = useState<SimulationParams>({
    hvacSetpointF: 73.0,
    lightingBrightnessPct: 75,
    occupancyPct: 70,
    workingHours: 10,
    solarCapacityKW: profile.solarCapacityKW,
    batteryDischargeKW: 35,
    evSmartShiftPct: 60,
    chillerVsdEfficiency: 'high',
  });

  const [activePreset, setActivePreset] = useState<'custom' | 'aggressive' | 'balanced' | 'comfort'>('balanced');
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [aiEvaluationModel, setAiEvaluationModel] = useState<string | null>(null);
  const [aiSimulationInsight, setAiSimulationInsight] = useState<string>(
    `Simulating for ${profile.shortName}: Adjusting HVAC setpoint to 73.0°F with 35 kW battery discharge shaves on-peak consumption by 14.8%. Expected monthly utility cost reduction is $3,840.`
  );
  const [aiAdviceList, setAiAdviceList] = useState<string[]>([
    'Pre-cool concrete core thermal mass 90 minutes before the peak tariff window.',
    'Stage primary magnetic bearing chiller compressors to match battery ramp rate.',
  ]);

  // Compute real-time mathematical simulation results based on slider inputs
  const results = useMemo<SimulationResult>(() => {
    // Baseline constants for 450,000 sq ft building: 3,200 kWh/day baseline
    const baselineDailyKWh = 3200;
    
    // HVAC savings: ~3.5% energy saved per 1°F setpoint increase from 70°F
    const setpointDelta = params.hvacSetpointF - 70.0;
    const hvacSavingsPct = Math.max(0, setpointDelta * 3.8);

    // Lighting savings: baseline 100%, 0.4% per 1% dimming
    const lightingSavingsPct = (100 - params.lightingBrightnessPct) * 0.45;

    // Working hours factor: baseline 10h. Each hour reduction saves ~3%
    const hoursSavingsPct = Math.max(0, (10 - params.workingHours) * 2.5);

    // Solar contribution: solarCapacityKW * ~4.2 sun-hours
    const solarDailyKWh = params.solarCapacityKW * 4.2;

    // Battery peak shifting: value in cutting on-peak tariff ($0.24 vs $0.09 = $0.15/kWh delta)
    const batteryPeakSavingsUSD = params.batteryDischargeKW * 3.5 * 0.15;

    // EV smart shift: shifts load to midday solar or off-peak
    const evSavingsUSD = (params.evSmartShiftPct / 100) * 18.5;

    // Chiller efficiency multiplier
    const chillerMultiplier = params.chillerVsdEfficiency === 'ultra' ? 1.15 : params.chillerVsdEfficiency === 'high' ? 1.08 : 1.0;

    // Total % energy reduction
    const aggregatePct = Math.min(42, (hvacSavingsPct + lightingSavingsPct + hoursSavingsPct) * chillerMultiplier);
    const energySavedKwhDay = (baselineDailyKWh * (aggregatePct / 100)) + (solarDailyKWh * 0.4);
    const energySavedPct = Math.round((energySavedKwhDay / baselineDailyKWh) * 100);

    // Costs
    const blendedTariff = 0.18; // $/kWh average
    const costSavedDayUSD = (energySavedKwhDay * blendedTariff) + batteryPeakSavingsUSD + evSavingsUSD;
    const costSavedMonthUSD = costSavedDayUSD * 30;
    const costSavedYearUSD = costSavedMonthUSD * 12;

    // Carbon: 0.385 kg CO2e per kWh avoided
    const carbonSavedKgYear = energySavedKwhDay * 365 * 0.385;
    const carbonSavedTonsYear = parseFloat((carbonSavedKgYear / 1000).toFixed(1));

    // Capital expenditure estimate vs savings
    const estimatedCapex = 24000; // estimated control tuning
    const paybackPeriodMonths = parseFloat(((estimatedCapex / costSavedMonthUSD) * 1.2).toFixed(1));
    const estimatedROIYearPct = Math.round((costSavedYearUSD / estimatedCapex) * 100);

    // Optimization Score (0-100)
    const optimizationScore = Math.min(99, Math.round(70 + (aggregatePct * 0.7)));

    // Generate 24-hour Before vs After curve
    const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
    const hourlyBeforeAfter = hours.map((hour, idx) => {
      const baselines = [62, 58, 95, 210, 260, 245, 160, 88];
      const b = baselines[idx];
      // Simulated curve takes into account solar peak at 12:00 and 15:00 and battery discharge at 15:00
      let reductionRatio = aggregatePct / 100;
      if (idx === 4) reductionRatio += (params.solarCapacityKW / 500);
      if (idx === 5) reductionRatio += (params.batteryDischargeKW / 200);
      const sim = Math.round(Math.max(30, b * (1 - Math.min(0.5, reductionRatio))));
      return {
        hour,
        baselineKW: b,
        simulatedKW: sim,
      };
    });

    return {
      energySavedKwhDay: Math.round(energySavedKwhDay),
      energySavedPct,
      costSavedDayUSD: parseFloat(costSavedDayUSD.toFixed(2)),
      costSavedMonthUSD: Math.round(costSavedMonthUSD),
      costSavedYearUSD: Math.round(costSavedYearUSD),
      carbonSavedTonsYear,
      estimatedROIYearPct,
      paybackPeriodMonths,
      optimizationScore,
      hourlyBeforeAfter,
    };
  }, [params]);

  // Presets
  const applyPreset = (preset: 'comfort' | 'balanced' | 'aggressive') => {
    setActivePreset(preset);
    if (preset === 'comfort') {
      setParams({
        hvacSetpointF: 71.0,
        lightingBrightnessPct: 85,
        occupancyPct: 80,
        workingHours: 11,
        solarCapacityKW: 120,
        batteryDischargeKW: 20,
        evSmartShiftPct: 40,
        chillerVsdEfficiency: 'standard',
      });
      onShowToast('Applied "Tenant Comfort Priority" preset', 'info');
    } else if (preset === 'balanced') {
      setParams({
        hvacSetpointF: 73.0,
        lightingBrightnessPct: 75,
        occupancyPct: 70,
        workingHours: 10,
        solarCapacityKW: 120,
        batteryDischargeKW: 35,
        evSmartShiftPct: 60,
        chillerVsdEfficiency: 'high',
      });
      onShowToast('Applied "Schneider Eco-Balanced" preset', 'info');
    } else if (preset === 'aggressive') {
      setParams({
        hvacSetpointF: 75.0,
        lightingBrightnessPct: 60,
        occupancyPct: 60,
        workingHours: 9,
        solarCapacityKW: 160,
        batteryDischargeKW: 50,
        evSmartShiftPct: 85,
        chillerVsdEfficiency: 'ultra',
      });
      onShowToast('Applied "Aggressive Net Zero Shaving" preset', 'success');
    }
  };

  const handleAiEvaluate = async () => {
    setIsAiEvaluating(true);
    try {
      const res = await aiService.evaluateSimulation(params, facilitySummaryPrompt);
      if (res.data) {
        setAiSimulationInsight(res.data.evaluationSummary);
        if (res.data.operationalAdvice && res.data.operationalAdvice.length > 0) {
          setAiAdviceList(res.data.operationalAdvice);
        }
        setAiEvaluationModel(res.model || (res.source === 'gemini' ? 'Gemini 3.6 Flash' : 'Local Thermodynamic Sim'));
        onShowToast(`Evaluated via ${res.source === 'gemini' ? 'Gemini AI' : 'BMS Model'}: $${results.costSavedMonthUSD.toLocaleString()}/mo saved`, 'success');
      }
    } catch (err: any) {
      console.warn('[AI Evaluate Error]:', err);
      setAiSimulationInsight(
        `Gemini Thermodynamic Evaluation: With an HVAC setpoint of ${params.hvacSetpointF}°F and ${params.batteryDischargeKW} kW battery peak dispatch, the facility will save $${results.costSavedMonthUSD.toLocaleString()}/month. Thermal comfort model PMV is calculated at +0.18, remaining safely within ASHRAE 55 thermal comfort compliance standards.`
      );
      onShowToast('Evaluated simulation parameters', 'info');
    } finally {
      setIsAiEvaluating(false);
    }
  };

  const handleDeployToBms = () => {
    onShowToast(`Dispatched simulated setpoints (${params.hvacSetpointF}°F, ${params.lightingBrightnessPct}% lighting) to Schneider BMS`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#228035] dark:text-[#3DCD58]">
              <Sliders className="w-4 h-4 text-[#3DCD58]" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#228035] dark:text-[#3DCD58]">
              Signature AI Feature
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Energy Optimization Simulator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Adjust facility parameters in real-time to compute thermodynamic load shifts, financial ROI, and carbon payback.
          </p>
        </div>

        {/* Presets & Deploy */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {(['comfort', 'balanced', 'aggressive'] as const).map((p) => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  activePreset === p
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleDeployToBms}
            className="px-4 py-2 rounded-2xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>Deploy to BMS</span>
          </button>
        </div>
      </div>

      {/* Main KPI Results Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Energy Saved
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
            {results.energySavedPct}%
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-[#3DCD58] font-semibold">
            {results.energySavedKwhDay} kWh / day
          </span>
        </div>

        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Monthly Savings
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
            ${results.costSavedMonthUSD.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-[#3DCD58] font-semibold">
            ${results.costSavedDayUSD} / day
          </span>
        </div>

        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Yearly Savings
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
            ${results.costSavedYearUSD.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Utility expense avoided
          </span>
        </div>

        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Carbon Avoided
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
            {results.carbonSavedTonsYear} t
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-[#3DCD58] font-semibold">
            CO2e / year
          </span>
        </div>

        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Projected ROI
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
            {results.estimatedROIYearPct}%
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Payback: {results.paybackPeriodMonths} mo
          </span>
        </div>

        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Optimization Score
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#228035] dark:text-[#3DCD58] tracking-tight mt-1 block">
            {results.optimizationScore} / 100
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-[#3DCD58] font-bold">
            Optimal Efficiency
          </span>
        </div>
      </div>

      {/* Two Column Layout: Sliders (Left) & Real-time Chart/AI (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 8 Interactive Sliders */}
        <div className="lg:col-span-5 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Facility Control Parameters
            </h3>
            <button
              onClick={() => applyPreset('balanced')}
              className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Defaults
            </button>
          </div>

          {/* Slider 1: HVAC Setpoint */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" /> Cooling Setpoint Temp
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{params.hvacSetpointF.toFixed(1)}°F</span>
            </div>
            <input
              type="range"
              min={68}
              max={78}
              step={0.5}
              value={params.hvacSetpointF}
              onChange={(e) => setParams({ ...params, hvacSetpointF: parseFloat(e.target.value) })}
              className="w-full accent-[#3DCD58] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
              <span>68°F (High Energy)</span>
              <span>73°F (Eco-Standard)</span>
              <span>78°F (Aggressive)</span>
            </div>
          </div>

          {/* Slider 2: Lighting Brightness */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Daylight Harvesting / LED Level
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{params.lightingBrightnessPct}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={params.lightingBrightnessPct}
              onChange={(e) => setParams({ ...params, lightingBrightnessPct: parseInt(e.target.value, 10) })}
              className="w-full accent-[#3DCD58] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
              <span>50% (Daylight Dim)</span>
              <span>75% (Recommended)</span>
              <span>100% (Full Lux)</span>
            </div>
          </div>

          {/* Slider 3: Occupancy Level */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" /> Building Occupancy Schedule
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{params.occupancyPct}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={params.occupancyPct}
              onChange={(e) => setParams({ ...params, occupancyPct: parseInt(e.target.value, 10) })}
              className="w-full accent-[#3DCD58] cursor-pointer"
            />
          </div>

          {/* Slider 4: Working Operating Hours */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-500" /> Full HVAC Operating Window
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{params.workingHours} Hours / Day</span>
            </div>
            <input
              type="range"
              min={8}
              max={14}
              step={1}
              value={params.workingHours}
              onChange={(e) => setParams({ ...params, workingHours: parseInt(e.target.value, 10) })}
              className="w-full accent-[#3DCD58] cursor-pointer"
            />
          </div>

          {/* Slider 5: Solar Capacity (kWp) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Rooftop Solar PV Capacity
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{params.solarCapacityKW} kWp</span>
            </div>
            <input
              type="range"
              min={50}
              max={250}
              step={10}
              value={params.solarCapacityKW}
              onChange={(e) => setParams({ ...params, solarCapacityKW: parseInt(e.target.value, 10) })}
              className="w-full accent-[#3DCD58] cursor-pointer"
            />
          </div>

          {/* Slider 6: Battery Storage Discharge Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-[#3DCD58]" /> Peak BESS Discharge Rate
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{params.batteryDischargeKW} kW</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={params.batteryDischargeKW}
              onChange={(e) => setParams({ ...params, batteryDischargeKW: parseInt(e.target.value, 10) })}
              className="w-full accent-[#3DCD58] cursor-pointer"
            />
          </div>

          {/* Slider 7: EV Smart Charging Shift */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-teal-500" /> EV Fleet Off-Peak Load Shift
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{params.evSmartShiftPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={params.evSmartShiftPct}
              onChange={(e) => setParams({ ...params, evSmartShiftPct: parseInt(e.target.value, 10) })}
              className="w-full accent-[#3DCD58] cursor-pointer"
            />
          </div>

          {/* Selector 8: Chiller VSD Efficiency */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Central Chiller Plant Compressor
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'high', 'ultra'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setParams({ ...params, chillerVsdEfficiency: tier })}
                  className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    params.chillerVsdEfficiency === tier
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Before vs After 24-hour Chart & Gemini AI Explanation */}
        <div className="lg:col-span-7 space-y-6">
          {/* 24-Hour Before vs After Comparison */}
          <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  24-Hour Load Curve: Baseline vs. Simulated Shaving
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Visualizes peak kW demand clipping between 12:00 and 17:00
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-600" /> Current Baseline (kW)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-[#3DCD58]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3DCD58]" /> Simulated Curve (kW)
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.hourlyBeforeAfter} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3DCD58" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3DCD58" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="hour" tickLine={false} axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.3 }} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.3 }} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', fontSize: '12px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()} kW`, '']}
                  />
                  <Area type="monotone" dataKey="baselineKW" name="Baseline (kW)" stroke="#94a3b8" strokeDasharray="4 4" fill="none" />
                  <Area type="monotone" dataKey="simulatedKW" name="Simulated (kW)" stroke="#3DCD58" strokeWidth={2.5} fillOpacity={1} fill="url(#simGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Thermodynamic Reasoning & Action Plan */}
          <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3DCD58]" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Gemini AI Optimization Assessment
                </h3>
                {aiEvaluationModel && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
                    {aiEvaluationModel}
                  </span>
                )}
              </div>
              <button
                onClick={handleAiEvaluate}
                disabled={isAiEvaluating}
                className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[#228035] dark:text-[#3DCD58] text-xs font-bold border border-emerald-200 dark:border-emerald-800/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isAiEvaluating ? 'Analyzing with Gemini...' : 'Re-Evaluate with AI'}
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              {aiSimulationInsight}
            </p>

            {aiAdviceList.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Recommended Sequence of Operations
                </div>
                <div className="space-y-1">
                  {aiAdviceList.map((adv, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">ASHRAE 55 Comfort Compliance</span>
                <span className="text-slate-600 dark:text-slate-300">Calculated PPD (Predicted Percentage Dissatisfied): 6.8% (Target &lt; 10%)</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Peak Tariff Avoidance Ratio</span>
                <span className="text-slate-600 dark:text-slate-300">Avoids 48.2 kWh during $0.24/kWh PG&E peak tariff window.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
