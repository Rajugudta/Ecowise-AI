import { BuildingTelemetry, EnergyHourlyPoint, FloorTelemetry } from '../types';

export declare class ApiError extends Error {
  status: number;
  detail: any;
  isNetworkError: boolean;
  constructor(message: string, status?: number, detail?: any, isNetworkError?: boolean);
}

export declare const getApiBaseUrl: () => string;
export declare const setApiBaseUrl: (newUrl: string) => void;
export declare const formatErrorMessage: (error: any, fallbackMessage?: string) => string;

export interface FetchOptions extends RequestInit {
  params?: Record<string, any> | null;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  ok: boolean;
}

export declare function apiFetch<T = any>(endpoint: string, options?: FetchOptions): Promise<ApiResponse<T>>;
export declare function get<T = any>(endpoint: string, params?: Record<string, any> | null, options?: FetchOptions): Promise<ApiResponse<T>>;
export declare function post<T = any>(endpoint: string, body?: any, options?: FetchOptions): Promise<ApiResponse<T>>;
export declare function put<T = any>(endpoint: string, body?: any, options?: FetchOptions): Promise<ApiResponse<T>>;
export declare function patch<T = any>(endpoint: string, body?: any, options?: FetchOptions): Promise<ApiResponse<T>>;
export declare function del<T = any>(endpoint: string, options?: FetchOptions): Promise<ApiResponse<T>>;

export interface HealthCheckResult {
  connected: boolean;
  data?: any;
  fallback?: boolean;
}

export declare const healthApi: {
  check: () => Promise<HealthCheckResult>;
};

export declare const telemetryApi: {
  get: (buildingId?: string) => Promise<BuildingTelemetry>;
  getHourlyEnergy: (timeframe?: string) => Promise<EnergyHourlyPoint[]>;
};

export declare const floorsApi: {
  getAll: () => Promise<FloorTelemetry[]>;
  update: (floorNumber: number, data: Partial<FloorTelemetry>) => Promise<any>;
};

export declare const advisorApi: {
  getRecommendations: () => Promise<any[]>;
  applyRecommendation: (recId: string) => Promise<any>;
  chat: (userMessage: string, context?: Record<string, any>) => Promise<{
    text: string;
    metrics?: { label: string; value: string; change?: string }[];
    actionRecommendation?: string;
  }>;
};

export declare const alertsApi: {
  getAll: (params?: Record<string, any>) => Promise<any[]>;
  resolve: (alertId: string, action?: string) => Promise<any>;
  dismiss: (alertId: string) => Promise<any>;
};

export declare const reportsApi: {
  getAll: () => Promise<any[]>;
  generate: (reportType: string, period?: string) => Promise<any>;
  download: (reportId: string, format?: string) => Promise<any>;
  getHistory: () => Promise<any[]>;
};

export declare const settingsApi: {
  get: () => Promise<any>;
  updateProfile: (profileData: any) => Promise<any>;
  updateOrganization: (orgData: any) => Promise<any>;
  updateBuilding: (buildingData: any) => Promise<any>;
  updateNotifications: (notifData: any) => Promise<any>;
  updateAppearance: (appearanceData: any) => Promise<any>;
  updateSecurity: (securityData: any) => Promise<any>;
  update: (allSettings: any) => Promise<any>;
};

declare const api: {
  getBaseUrl: () => string;
  setBaseUrl: (newUrl: string) => void;
  fetch: typeof apiFetch;
  get: typeof get;
  post: typeof post;
  put: typeof put;
  patch: typeof patch;
  del: typeof del;
  health: typeof healthApi;
  telemetry: typeof telemetryApi;
  floors: typeof floorsApi;
  advisor: typeof advisorApi;
  alerts: typeof alertsApi;
  reports: typeof reportsApi;
  settings: typeof settingsApi;
  formatErrorMessage: typeof formatErrorMessage;
};

export default api;
