import { useState, useEffect, useCallback } from 'react';
import { BuildingTelemetry, FloorTelemetry, WeatherData, AiRecommendation } from '../types';
import { INITIAL_TELEMETRY, BUILDING_FLOORS, AI_RECOMMENDATION_OF_THE_DAY } from '../data/mockData';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  timeAgo: string;
  source: 'BMS' | 'AI Copilot' | 'Schneider EcoStruxure' | 'Weather Engine' | 'Operator';
  message: string;
  type: 'success' | 'warning' | 'info' | 'critical';
  badge?: string;
}

export interface AnomalyAlert {
  id: string;
  title: string;
  location: string;
  subsystem: 'HVAC' | 'Solar' | 'Battery' | 'Chillers' | 'Grid' | 'Lighting';
  severity: 'critical' | 'warning' | 'advisory' | 'info';
  timestamp: string;
  value: string;
  impactUsdHour: number;
  recommendation: string;
  isResolved: boolean;
  isRead: boolean;
}

export const INITIAL_ALERTS: AnomalyAlert[] = [
  {
    id: 'alert-1',
    title: 'Zone 3 Chiller VSD Frequency Hunting',
    location: 'Central Plant Basement - Chiller #2',
    subsystem: 'Chillers',
    severity: 'warning',
    timestamp: '8m ago',
    value: '64.8 Hz (+14% oscillation)',
    impactUsdHour: 18.50,
    recommendation: 'Dampen PID loop gain on VFD-02 to stabilize refrigerant suction pressure.',
    isResolved: false,
    isRead: false,
  },
  {
    id: 'alert-2',
    title: 'Solar Inverter #3 String Degraded',
    location: 'Rooftop Canopy Zone East',
    subsystem: 'Solar',
    severity: 'critical',
    timestamp: '22m ago',
    value: 'Output dropped to 3.8 kW (Nominal: 12 kW)',
    impactUsdHour: 32.00,
    recommendation: 'Inspect DC disconnect switch on String 3B; bypass to redundant inverter bank.',
    isResolved: false,
    isRead: false,
  },
  {
    id: 'alert-3',
    title: 'High Simultaneous Heating & Cooling',
    location: 'Floor 4 Executive Boardroom (AHU-04B)',
    subsystem: 'HVAC',
    severity: 'advisory',
    timestamp: '45m ago',
    value: 'Reheat coil active while VAV damper 95% open',
    impactUsdHour: 12.40,
    recommendation: 'Enforce deadband offset from 1.0°F to 3.5°F via BACnet point write.',
    isResolved: false,
    isRead: true,
  },
  {
    id: 'alert-4',
    title: 'Battery Megapack Ready for Peak Shaving',
    location: 'BESS Enclosure South Yard',
    subsystem: 'Battery',
    severity: 'info',
    timestamp: '1h ago',
    value: 'State of Charge: 94.2% (94 kWh reserve)',
    impactUsdHour: 0,
    recommendation: 'Autonomous dispatch scheduled at 14:00 peak tariff window.',
    isResolved: true,
    isRead: true,
  },
];

export const INITIAL_WEATHER: WeatherData = {
  tempF: 72.4,
  tempC: 22.4,
  condition: 'Partly Sunny',
  humidityPct: 61,
  windMph: 8.5,
  rainProbabilityPct: 5,
  solarIrradianceWm2: 680,
  airQualityIndex: 28, // Good
  hvacImpactSummary: 'Mild afternoon ambient temp reduces chiller lift requirement by 9.2%.',
  aiRecommendation: 'Engage economizer air-side free cooling between 16:00 and 19:00 as ambient drops below 65°F.',
};

export const EXPANDED_FLOORS: FloorTelemetry[] = [
  {
    floor: 8,
    label: 'Rooftop Solar & Cooling Towers',
    hvacActive: true,
    lightingLevelPct: 20,
    tempCelsius: 19.5,
    occupancyCount: 4,
    kwDraw: 28.4,
    status: 'optimal',
    zoneSetPointF: 68.0,
    ahuAirflowCfm: 4200,
    subsystemLoads: { hvacKW: 24.2, lightingKW: 1.2, plugKW: 3.0 },
  },
  {
    floor: 7,
    label: 'Floor 7 – Executive C-Suite & Boardroom',
    hvacActive: true,
    lightingLevelPct: 65,
    tempCelsius: 22.1,
    occupancyCount: 32,
    kwDraw: 41.6,
    status: 'optimal',
    zoneSetPointF: 72.0,
    ahuAirflowCfm: 5800,
    subsystemLoads: { hvacKW: 22.1, lightingKW: 8.5, plugKW: 11.0 },
  },
  {
    floor: 6,
    label: 'Floor 6 – AI Research Labs & Compute Cluster',
    hvacActive: true,
    lightingLevelPct: 80,
    tempCelsius: 20.8,
    occupancyCount: 68,
    kwDraw: 84.2,
    status: 'warning',
    zoneSetPointF: 70.0,
    ahuAirflowCfm: 12400,
    subsystemLoads: { hvacKW: 38.2, lightingKW: 12.0, plugKW: 34.0 },
  },
  {
    floor: 5,
    label: 'Floor 5 – Software Engineering Workspace',
    hvacActive: true,
    lightingLevelPct: 70,
    tempCelsius: 22.4,
    occupancyCount: 94,
    kwDraw: 62.5,
    status: 'optimal',
    zoneSetPointF: 72.5,
    ahuAirflowCfm: 8600,
    subsystemLoads: { hvacKW: 28.0, lightingKW: 14.5, plugKW: 20.0 },
  },
  {
    floor: 4,
    label: 'Floor 4 – Marketing, Finance & Operations',
    hvacActive: true,
    lightingLevelPct: 60,
    tempCelsius: 22.8,
    occupancyCount: 78,
    kwDraw: 51.0,
    status: 'optimal',
    zoneSetPointF: 73.0,
    ahuAirflowCfm: 7200,
    subsystemLoads: { hvacKW: 23.5, lightingKW: 11.5, plugKW: 16.0 },
  },
  {
    floor: 3,
    label: 'Floor 3 – Conference Center & Auditorium',
    hvacActive: true,
    lightingLevelPct: 40,
    tempCelsius: 21.9,
    occupancyCount: 45,
    kwDraw: 38.2,
    status: 'optimal',
    zoneSetPointF: 71.5,
    ahuAirflowCfm: 6400,
    subsystemLoads: { hvacKW: 20.2, lightingKW: 8.0, plugKW: 10.0 },
  },
  {
    floor: 2,
    label: 'Floor 2 – Dining Commons & Wellness Center',
    hvacActive: true,
    lightingLevelPct: 75,
    tempCelsius: 23.0,
    occupancyCount: 120,
    kwDraw: 68.4,
    status: 'optimal',
    zoneSetPointF: 72.0,
    ahuAirflowCfm: 9800,
    subsystemLoads: { hvacKW: 32.4, lightingKW: 16.0, plugKW: 20.0 },
  },
  {
    floor: 1,
    label: 'Ground Level – Smart Lobby & EV Plaza (24 Bays)',
    hvacActive: false,
    lightingLevelPct: 50,
    tempCelsius: 23.4,
    occupancyCount: 28,
    kwDraw: 56.8,
    status: 'standby',
    zoneSetPointF: 74.0,
    ahuAirflowCfm: 4500,
    subsystemLoads: { hvacKW: 12.8, lightingKW: 10.0, plugKW: 34.0 },
  },
  {
    floor: 0,
    label: 'Basement Central Plant & Tesla Megapack BESS',
    hvacActive: true,
    lightingLevelPct: 40,
    tempCelsius: 18.2,
    occupancyCount: 6,
    kwDraw: 96.5,
    status: 'optimal',
    zoneSetPointF: 65.0,
    ahuAirflowCfm: 14000,
    subsystemLoads: { hvacKW: 78.5, lightingKW: 4.0, plugKW: 14.0 },
  },
];

export const INITIAL_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-1',
    timestamp: new Date().toLocaleTimeString(),
    timeAgo: 'Just now',
    source: 'AI Copilot',
    message: 'Calculated optimal chiller delta-T shift (+1.2°F). Avoided $185 in peak surge charge.',
    type: 'success',
    badge: 'Optimized',
  },
  {
    id: 'act-2',
    timestamp: '13:42',
    timeAgo: '18m ago',
    source: 'Schneider EcoStruxure',
    message: 'BMS automated setback initiated on Floor 4 conference rooms due to occupancy absence.',
    type: 'info',
    badge: 'BMS Trigger',
  },
  {
    id: 'act-3',
    timestamp: '13:15',
    timeAgo: '45m ago',
    source: 'BMS',
    message: 'Grid peak demand capped at 284 kW via Tesla Megapack 35 kW battery discharge.',
    type: 'success',
    badge: 'Peak Shave',
  },
  {
    id: 'act-4',
    timestamp: '12:30',
    timeAgo: '1h 30m ago',
    source: 'Weather Engine',
    message: 'Solar canopy yield peaked at 48.6 kW under high noon irradiance (820 W/m²).',
    type: 'info',
    badge: 'Renewable',
  },
  {
    id: 'act-5',
    timestamp: '11:10',
    timeAgo: '2h 50m ago',
    source: 'Operator',
    message: 'Facility manager verified ASHRAE 90.1 energy compliance certificate.',
    type: 'success',
    badge: 'Verified',
  },
];

export const DEFAULT_WEATHER = INITIAL_WEATHER;
export const DEFAULT_TELEMETRY = INITIAL_TELEMETRY;
export const RECENT_ACTIVITIES = INITIAL_ACTIVITIES;

