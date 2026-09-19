import React, { useState } from 'react';
import { Sun, BatteryCharging, Wind, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { BUILDING_FLOORS } from '../data/mockData';
import { FloorTelemetry } from '../types';

interface BuildingIllustrationProps {
  onSelectFloor?: (floor: FloorTelemetry) => void;
}

export const BuildingIllustration: React.FC<BuildingIllustrationProps> = ({ onSelectFloor }) => {
  const [activeFloorIndex, setActiveFloorIndex] = useState<number | null>(null);

  return (
    <div id="smart-building-illustration-container" className="relative w-full rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950 p-4 border border-slate-700/60 shadow-inner overflow-hidden text-white">
      {/* Background ambient grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#3DCD58_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      {/* Top telemetry bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DCD58] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3DCD58]"></span>
          </span>
          <span className="text-xs font-semibold tracking-wide text-slate-300 uppercase">IoT BMS Real-Time Feed</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#3DCD58] bg-[#3DCD58]/10 px-2.5 py-0.5 rounded-full font-medium border border-[#3DCD58]/20">
          <Zap className="w-3 h-3 text-[#3DCD58]" />
          <span>Microgrid Active</span>
        </div>
      </div>

      {/* Rooftop Solar and Battery Array */}
      <div className="mb-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200">Rooftop Solar PV Array</div>
            <div className="text-[10px] text-slate-400">High-efficiency bifacial panels</div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[#3DCD58] font-bold text-sm">+42.8 kW</span>
          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
            <BatteryCharging className="w-3 h-3 text-[#3DCD58]" />
            <span>92% Battery</span>
          </div>
        </div>
      </div>

      {/* Building Floors Stack */}
      <div className="space-y-1.5 relative">
        {BUILDING_FLOORS.map((floor) => {
          const isSelected = activeFloorIndex === floor.floor;
          return (
            <div
              key={floor.floor}
              id={`building-floor-${floor.floor}`}
              onClick={() => {
                setActiveFloorIndex(floor.floor);
                if (onSelectFloor) onSelectFloor(floor);
              }}
              className={`group cursor-pointer relative rounded-xl px-3 py-2 transition-all duration-200 border ${
                isSelected
                  ? 'bg-slate-800/95 border-[#3DCD58] shadow-[0_0_15px_rgba(61,205,88,0.25)]'
                  : 'bg-slate-800/50 hover:bg-slate-800/80 border-slate-700/40 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-700/60 text-slate-200 font-bold text-xs">
                    L{floor.floor}
                  </span>
                  <div>
                    <div className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                      {floor.label}
                      {floor.status === 'optimal' ? (
                        <CheckCircle2 className="w-3 h-3 text-[#3DCD58]" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Wind className="w-2.5 h-2.5 text-cyan-400" /> {floor.tempCelsius}°C
                      </span>
                      <span>•</span>
                      <span>{floor.occupancyCount} Occupants</span>
                      <span>•</span>
                      <span className="text-slate-300">Light {floor.lightingLevelPct}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-200">{floor.kwDraw} kW</div>
                  <div className="text-[10px] text-emerald-400 font-mono">HVAC Opt</div>
                </div>
              </div>

              {/* Progress Bar of Floor Load */}
              <div className="mt-1.5 w-full bg-slate-700/50 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#3DCD58] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (floor.kwDraw / 100) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Building Base & Infrastructure Status */}
      <div className="mt-2 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3DCD58]"></span>
          Basement Geothermal Heat Exchange
        </span>
        <span className="text-slate-300 font-mono">COP 4.6</span>
      </div>
    </div>
  );
};
