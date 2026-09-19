import { BuildingTelemetry, EnergyHourlyPoint, AiRecommendation, FloorTelemetry } from '../types';

export const INITIAL_TELEMETRY: BuildingTelemetry = {
  currentLoadKW: 284.5,
  dailyUsageKWh: 1482,
  carbonSavedKg: 384.2,
  treesEquivalent: 16,
  peakDemandKW: 340.0,
  costSavedTodayUSD: 248.50,
  efficiencyScore: 94.2,
  activeSensorsCount: 328,
  anomalyDetected: false,
};

export const HOURLY_ENERGY_DATA: EnergyHourlyPoint[] = [
  { time: '00:00', actual: 48, baseline: 62 },
  { time: '03:00', actual: 42, baseline: 58 },
  { time: '06:00', actual: 78, baseline: 95 },
  { time: '09:00', actual: 165, baseline: 210, isPeak: true },
  { time: '12:00', actual: 212, baseline: 260, isPeak: true },
  { time: '15:00', actual: 198, baseline: 245, isPeak: true },
  { time: '18:00', actual: 124, baseline: 160 },
  { time: '21:00', actual: 72, baseline: 88 },
];

export const AI_RECOMMENDATION_OF_THE_DAY: AiRecommendation = {
  id: 'rec-peak-precool',
  title: 'Chiller Plant #2 Pre-Cooling Shift',
  impactSummary: 'Pre-chill thermal storage banks between 04:00–06:00 AM before peak grid tariff escalation. Automatically locks variable frequency drives to optimal RPM during 12:00–16:00 PM.',
  estimatedSavingUSD: 184.50,
  carbonReductionKg: 62.4,
  equipment: 'York Centrifugal Chillers & VAV Loops',
  confidence: 97,
  urgency: 'medium',
  applied: false,
};

export const BUILDING_FLOORS: FloorTelemetry[] = [
  {
    floor: 4,
    label: 'Penthouse & Executive Hub',
    hvacActive: true,
    lightingLevelPct: 60,
    tempCelsius: 22.2,
    occupancyCount: 38,
    kwDraw: 44.2,
    status: 'optimal',
  },
  {
    floor: 3,
    label: 'R&D Labs & Data Closets',
    hvacActive: true,
    lightingLevelPct: 85,
    tempCelsius: 21.0,
    occupancyCount: 72,
    kwDraw: 88.6,
    status: 'optimal',
  },
  {
    floor: 2,
    label: 'Collaborative Open Workspace',
    hvacActive: true,
    lightingLevelPct: 70,
    tempCelsius: 22.8,
    occupancyCount: 110,
    kwDraw: 76.1,
    status: 'optimal',
  },
  {
    floor: 1,
    label: 'Smart Lobby & EV Charging Plaza',
    hvacActive: false,
    lightingLevelPct: 45,
    tempCelsius: 23.5,
    occupancyCount: 24,
    kwDraw: 52.4,
    status: 'standby',
  },
];
