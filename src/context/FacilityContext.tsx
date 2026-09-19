import React, { createContext, useContext, useState, useEffect } from 'react';
import { FacilityDataset, FacilityProfile, BuildingTelemetry, FloorTelemetry, EnergyHourlyPoint } from '../types';
import { FACILITY_DATASETS, FACILITY_PROFILES } from '../data/facilityDatasets';

export type OperationalScenario = 'standard' | 'heatwave' | 'intermittent' | 'nighttime';

interface FacilityContextType {
  facilityId: string;
  facility: FacilityDataset;
  profile: FacilityProfile;
  activeScenario: OperationalScenario;
  isLiveSimulating: boolean;
  appliedRecIds: string[];
  setFacilityId: (id: string) => void;
  setScenario: (scenario: OperationalScenario) => void;
  toggleLiveSimulation: () => void;
  applyRecommendation: (recId: string) => void;
  facilitySummaryPrompt: string;
}

const FacilityContext = createContext<FacilityContextType | undefined>(undefined);

const FACILITY_STORAGE_KEY = 'ecowise_active_facility';

export const FacilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [facilityId, setFacilityIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FACILITY_STORAGE_KEY);
      if (saved && FACILITY_DATASETS[saved]) {
        return saved;
      }
    }
    return 'ecotower';
  });

  const [activeScenario, setScenarioState] = useState<OperationalScenario>('standard');
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [appliedRecIds, setAppliedRecIds] = useState<string[]>([]);
  const [liveTelemetryOffset, setLiveTelemetryOffset] = useState<number>(0);

  // Active facility dataset from multi-facility repository
  const baseFacility = FACILITY_DATASETS[facilityId] || FACILITY_DATASETS.ecotower;

  // Real-time micro-fluctuations for live simulation
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      // Gentle sine-wave jitter (-2.5 kW to +2.5 kW)
      setLiveTelemetryOffset((prev) => {
        const delta = (Math.random() - 0.49) * 2.2;
        const next = prev + delta;
        return Math.max(-8, Math.min(8, next));
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  // Adjust telemetry based on scenario and simulation jitter
  const adjustedTelemetry: BuildingTelemetry = {
    ...baseFacility.telemetry,
    currentLoadKW: Number((baseFacility.telemetry.currentLoadKW + liveTelemetryOffset).toFixed(1)),
    gridPowerKw: Number((((baseFacility.telemetry.gridPowerKw ?? 160) + liveTelemetryOffset)).toFixed(1)),
  };

  if (activeScenario === 'heatwave') {
    adjustedTelemetry.currentLoadKW = Number((adjustedTelemetry.currentLoadKW * 1.22).toFixed(1));
    adjustedTelemetry.peakDemandKW = Number((adjustedTelemetry.peakDemandKW * 1.15).toFixed(1));
  } else if (activeScenario === 'nighttime') {
    adjustedTelemetry.currentLoadKW = Number((adjustedTelemetry.currentLoadKW * 0.42).toFixed(1));
    adjustedTelemetry.efficiencyScore = 97.5;
  } else if (activeScenario === 'intermittent') {
    adjustedTelemetry.solarKw = Number(((adjustedTelemetry.solarKw ?? 24) * 0.35).toFixed(1));
  }

  const facility: FacilityDataset = {
    ...baseFacility,
    telemetry: adjustedTelemetry,
  };

  const setFacilityId = (newId: string) => {
    if (FACILITY_DATASETS[newId]) {
      setFacilityIdState(newId);
      localStorage.setItem(FACILITY_STORAGE_KEY, newId);
    }
  };

  const setScenario = (scen: OperationalScenario) => {
    setScenarioState(scen);
  };

  const toggleLiveSimulation = () => {
    setIsLiveSimulating((prev) => !prev);
  };

  const applyRecommendation = (recId: string) => {
    setAppliedRecIds((prev) => (prev.includes(recId) ? prev : [...prev, recId]));
  };

  // Build prompt string describing active building for Gemini
  const facilitySummaryPrompt = `
Facility Name: ${facility.profile.name} (${facility.profile.shortName})
Location: ${facility.profile.location}
Building Archetype: ${facility.profile.type}
Floor Area: ${facility.profile.floorAreaSqFt.toLocaleString()} sq ft (${facility.profile.floorsCount} floors/zones)
BMS Platform: ${facility.profile.bmsSystem}
HVAC / Chiller Capacity: ${facility.profile.chillerCapacityTons} Tons
Renewable Microgrid: ${facility.profile.solarCapacityKW} kW Solar Array + ${facility.profile.batteryCapacityKWh} kWh BESS Battery
Tariff Structure: ${facility.profile.tariffName} (On-Peak: $${facility.profile.peakRateUSD}/kWh during ${facility.profile.peakHours}, Off-Peak: $${facility.profile.offPeakRateUSD}/kWh, Demand Charge: $${facility.profile.demandChargeUSD}/kW)
Active Scenario: ${activeScenario.toUpperCase()}
Current Telemetry:
- Real-Time Load: ${facility.telemetry.currentLoadKW} kW
- Cumulative Usage: ${facility.telemetry.dailyUsageKWh} kWh
- Solar Generation: ${facility.telemetry.solarKw ?? 0} kW
- Battery SOC: ${facility.telemetry.batteryPct ?? 80}%
- Grid Import: ${facility.telemetry.gridPowerKw ?? 0} kW
- Carbon Emissions Avoided Today: ${facility.telemetry.carbonSavedKg} kg
- Ambient Conditions: ${facility.weather.tempF}°F, ${facility.weather.condition}, Humidity ${facility.weather.humidityPct}%
`;

  return (
    <FacilityContext.Provider
      value={{
        facilityId,
        facility,
        profile: facility.profile,
        activeScenario,
        isLiveSimulating,
        appliedRecIds,
        setFacilityId,
        setScenario,
        toggleLiveSimulation,
        applyRecommendation,
        facilitySummaryPrompt,
      }}
    >
      {children}
    </FacilityContext.Provider>
  );
};

export const useFacility = () => {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacility must be used within a FacilityProvider');
  }
  return context;
};
