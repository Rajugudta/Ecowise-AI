import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Thermometer, 
  Users, 
  Zap, 
  Wind, 
  Lightbulb, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Sun, 
  Battery, 
  Car,
  X,
  Sliders
} from 'lucide-react';
import { FloorTelemetry } from '../../types';
import { EXPANDED_FLOORS } from '../../services/telemetryStore';

interface DigitalTwinPageProps {
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onOpenAdvisor: () => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({
  onShowToast,
  onOpenAdvisor,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<FloorTelemetry>(EXPANDED_FLOORS[2]); // Floor 6 default
  const [activeSubsystemFilter, setActiveSubsystemFilter] = useState<'all' | 'hvac' | 'lighting' | 'plug'>('all');
  const [floorsData, setFloorsData] = useState<FloorTelemetry[]>(EXPANDED_FLOORS);
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);

  const getStatusColor = (status: FloorTelemetry['status'], kw: number) => {
    if (status === 'critical' || kw > 90) return { bg: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-400 dark:border-rose-800', badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300' };
    if (status === 'warning' || kw > 75) return { bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-400 dark:border-amber-800', badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' };
    if (status === 'standby') return { bg: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-300 dark:border-slate-700', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
    return { bg: 'bg-[#3DCD58]', text: 'text-emerald-700 dark:text-[#3DCD58]', border: 'border-[#3DCD58]', badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#3DCD58]' };
  };

  const handleSelectFloor = (floor: FloorTelemetry) => {
    setSelectedFloor(floor);
    setIsFloorModalOpen(true);
  };

  const handleAdjustFloorSetpoint = (delta: number) => {
    if (!selectedFloor) return;
    const current = selectedFloor.zoneSetPointF || 72.0;
    const updatedF = current + delta;
    const updatedKw = delta > 0 ? selectedFloor.kwDraw * 0.94 : selectedFloor.kwDraw * 1.06;
    
    const updated = {
      ...selectedFloor,
      zoneSetPointF: parseFloat(updatedF.toFixed(1)),
      kwDraw: parseFloat(updatedKw.toFixed(1)),
    };
    setSelectedFloor(updated);
    setFloorsData(floorsData.map((f) => (f.floor === updated.floor ? updated : f)));
    onShowToast(`Adjusted Floor ${updated.floor} setpoint to ${updated.zoneSetPointF}°F`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#228035] dark:text-[#3DCD58]">
              <Building2 className="w-4 h-4 text-[#3DCD58]" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#228035] dark:text-[#3DCD58]">
              Virtual Facility Twin
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Interactive Building Digital Twin
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-floor BIM geometry, thermal loads, occupancy sensors, and Schneider BACnet endpoints.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-bold bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3DCD58]" /> Optimal (&lt;40 kW)
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Elevated (40-75 kW)
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Load (&gt;75 kW)
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Standby
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Building View (Left) & Detailed Floor Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Building Floor Stack (SVG & 3D Cards) */}
        <div className="lg:col-span-7 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#3DCD58]" />
              EcoTower Delta Structure (Click any floor to inspect)
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">9 Zones Active</span>
          </div>

          {/* Interactive Floors Stack */}
          <div className="space-y-2.5 pt-2">
            {floorsData.map((floor) => {
              const colors = getStatusColor(floor.status, floor.kwDraw);
              const isSelected = selectedFloor?.floor === floor.floor;

              return (
                <div
                  key={floor.floor}
                  onClick={() => handleSelectFloor(floor)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-[#3DCD58] shadow-sm ring-2 ring-[#3DCD58]/20'
                      : 'bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status indicator bar */}
                    <div className={`w-3 h-10 rounded-full ${colors.bg} shrink-0 transition-transform group-hover:scale-110`} />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{floor.label}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${colors.badge}`}>
                          {floor.kwDraw} kW
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-rose-500" /> {floor.zoneSetPointF || 72}°F ({floor.tempCelsius}°C)
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-500" /> {floor.occupancyCount} Occupants
                        </span>
                        <span className="flex items-center gap-1">
                          <Wind className="w-3 h-3 text-teal-500" /> {floor.ahuAirflowCfm || 6000} CFM
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 hidden sm:inline">
                      View Zone
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#3DCD58] transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Floor Deep Analytics Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Floor Inspection Mode
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                  {selectedFloor.label}
                </h3>
              </div>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl ${getStatusColor(selectedFloor.status, selectedFloor.kwDraw).badge}`}>
                Status: {selectedFloor.status.toUpperCase()}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Power Demand
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {selectedFloor.kwDraw} kW
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Current load</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-500" /> Active Occupancy
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {selectedFloor.occupancyCount}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">People present</span>
              </div>
            </div>

            {/* Subsystem breakdown */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Subsystem Load Distribution
              </span>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">HVAC VAV Airflow</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedFloor.subsystemLoads?.hvacKW || 22} kW</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3DCD58] rounded-full" style={{ width: '55%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">LED Lighting</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedFloor.subsystemLoads?.lightingKW || 10} kW</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Plug & Workstation Loads</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedFloor.subsystemLoads?.plugKW || 15} kW</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Direct BMS Controls for this floor */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Direct BACnet BMS Controls
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAdjustFloorSetpoint(+1.0)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Trim Setpoint +1.0°F (Save 4%)
                </button>
                <button
                  onClick={() => handleAdjustFloorSetpoint(-1.0)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Lower Setpoint -1.0°F
                </button>
              </div>

              <button
                onClick={onOpenAdvisor}
                className="w-full py-2.5 rounded-2xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Ask Copilot to Optimize {selectedFloor.label.split('–')[0]}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
