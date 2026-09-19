export type DashboardTab = 
  | 'dashboard' 
  | 'executive'
  | 'prediction'
  | 'simulator'
  | 'digital-twin'
  | 'carbon'
  | 'insights'
  | 'analytics' 
  | 'advisor' 
  | 'alerts' 
  | 'reports' 
  | 'settings';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  organization: string;
  buildingAssigned: string;
  provider?: 'google' | 'email' | 'demo';
}

export type AuthViewMode = 'signin' | 'signup' | 'forgot_password';

export interface EnergyHourlyPoint {
  time: string;
  actual: number;
  baseline: number;
  isPeak?: boolean;
}

export interface BuildingTelemetry {
  currentLoadKW: number;
  dailyUsageKWh: number;
  carbonSavedKg: number;
  treesEquivalent: number;
  peakDemandKW: number;
  costSavedTodayUSD: number;
  efficiencyScore: number;
  activeSensorsCount: number;
  anomalyDetected: boolean;
  solarKw?: number;
  batteryPct?: number;
  gridPowerKw?: number;
  copChillers?: number;
}

export interface AiRecommendation {
  id: string;
  title: string;
  impactSummary: string;
  estimatedSavingUSD: number;
  carbonReductionKg: number;
  equipment: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
  applied: boolean;
  category?: 'HVAC' | 'Chillers' | 'Lighting' | 'Solar/BESS' | 'Plug Load';
}

export interface FloorTelemetry {
  floor: number;
  label: string;
  hvacActive: boolean;
  lightingLevelPct: number;
  tempCelsius: number;
  occupancyCount: number;
  kwDraw: number;
  status: 'optimal' | 'warning' | 'standby' | 'critical';
  zoneSetPointF?: number;
  ahuAirflowCfm?: number;
  subsystemLoads?: {
    hvacKW: number;
    lightingKW: number;
    plugKW: number;
  };
}

export interface WeatherData {
  tempF: number;
  tempC: number;
  condition: string;
  humidityPct: number;
  windMph: number;
  rainProbabilityPct: number;
  solarIrradianceWm2: number;
  airQualityIndex: number;
  hvacImpactSummary: string;
  aiRecommendation: string;
}

export interface SimulationParams {
  hvacSetpointF: number;
  lightingBrightnessPct: number;
  occupancyPct: number;
  workingHours: number;
  solarCapacityKW: number;
  batteryDischargeKW: number;
  evSmartShiftPct: number;
  chillerVsdEfficiency: 'standard' | 'high' | 'ultra';
}

export interface SimulationResult {
  energySavedKwhDay: number;
  energySavedPct: number;
  costSavedDayUSD: number;
  costSavedMonthUSD: number;
  costSavedYearUSD: number;
  carbonSavedTonsYear: number;
  estimatedROIYearPct: number;
  paybackPeriodMonths: number;
  optimizationScore: number;
  hourlyBeforeAfter: { hour: string; baselineKW: number; simulatedKW: number }[];
}

export interface FacilityProfile {
  id: string;
  name: string;
  shortName: string;
  location: string;
  type: string;
  floorAreaSqFt: number;
  floorsCount: number;
  climateZone: string;
  bmsSystem: string;
  chillerCapacityTons: number;
  solarCapacityKW: number;
  batteryCapacityKWh: number;
  tariffName: string;
  peakRateUSD: number;
  offPeakRateUSD: number;
  demandChargeUSD: number;
  peakHours: string;
  description: string;
  carbonGridFactorKgPerKwh: number;
}

export interface FacilityDataset {
  profile: FacilityProfile;
  telemetry: BuildingTelemetry;
  weather: WeatherData;
  hourly: EnergyHourlyPoint[];
  weekly: { day: string; actual: number; predicted: number; baseline: number; cost: number; solar: number }[];
  floors: FloorTelemetry[];
  subsystems: {
    hvacKW: number;
    hvacPct: number;
    lightingKW: number;
    lightingPct: number;
    plugKW: number;
    plugPct: number;
    evProcessKW: number;
    evProcessPct: number;
  };
  recommendations: AiRecommendation[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

