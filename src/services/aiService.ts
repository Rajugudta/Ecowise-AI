/**
 * EcoWise Gemini AI Service Client
 * 
 * Modular frontend client interfacing with server-side Google Gemini endpoints:
 * 1. Ask AI (BMS Copilot) & Ask Stream (Real-Time Token Streaming)
 * 2. Generate Recommendation (ECMs)
 * 3. Summarize Energy Report (Executive & ESG briefings)
 * 4. Predict Energy Usage (Demand & renewable generation forecasting)
 * 5. Explain Charts (Plain-language chart analytics)
 * 6. Evaluate Energy Simulation (Thermodynamic & ROI analysis)
 * 7. Diagnose BMS Anomaly / Smart Alert
 */

export interface AskAiResponse {
  success: boolean;
  text: string;
  model?: string;
  source: 'gemini' | 'simulation_fallback';
  timestamp: string;
  apiError?: string;
  isConfigured?: boolean;
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  category: 'HVAC' | 'Chillers' | 'Lighting' | 'Solar/BESS' | 'Plug Load';
  impact: 'High' | 'Medium' | 'Low';
  estimatedKwhSaved: number;
  estimatedCostSavedUsd: number;
  carbonReductionKg: number;
  confidenceScore: number;
  actionCommand: string;
  paybackPeriod?: string;
}

export interface RecommendationsResponse {
  success: boolean;
  recommendations: RecommendationItem[];
  source: 'gemini' | 'simulation_fallback';
  model?: string;
  timestamp: string;
  apiError?: string;
  isConfigured?: boolean;
}

export interface ReportSummary {
  executiveSummary: string;
  keyFindings: string[];
  esgCompliance: string;
  financialOpportunities: string;
  urgentActions: string[];
}

export interface ReportSummaryResponse {
  success: boolean;
  summary: ReportSummary;
  source: 'gemini' | 'simulation_fallback';
  model?: string;
  timestamp: string;
  apiError?: string;
  isConfigured?: boolean;
}

export interface HourlyForecastItem {
  hour: string;
  predictedKW: number;
  baselineKW: number;
  confidenceLower: number;
  confidenceUpper: number;
  isPeakTariff: boolean;
}

export interface EnergyPrediction {
  projectedTotalKWh: number;
  projectedPeakKW: number;
  projectedPeakTime: string;
  projectedCostUSD: number;
  projectedCarbonKg: number;
  savingsPotentialUSD: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  riskExplanation: string;
  hourlyForecast: HourlyForecastItem[];
  proactiveRecommendations: string[];
}

export interface PredictEnergyResponse {
  success: boolean;
  prediction: EnergyPrediction;
  source: 'gemini' | 'simulation_fallback';
  model?: string;
  timestamp: string;
  apiError?: string;
  isConfigured?: boolean;
}

export interface ChartExplanation {
  headline: string;
  explanation: string;
  keyObservations: string[];
  recommendedAction: string;
  anomalyScore: number;
}

export interface ExplainChartResponse {
  success: boolean;
  explanation: ChartExplanation;
  source: 'gemini' | 'simulation_fallback';
  model?: string;
  timestamp: string;
  apiError?: string;
  isConfigured?: boolean;
}

export interface SimulationEvaluation {
  evaluationSummary: string;
  pmvComfortScore: number;
  ashrae55Compliant: boolean;
  estimatedMonthlySavingsUSD: number;
  estimatedKwhReducedMonthly: number;
  carbonReductionTonsYear: number;
  gridStressReductionPct: number;
  operationalAdvice: string[];
}

export interface SimulationEvaluationResponse {
  success: boolean;
  data: SimulationEvaluation;
  source: 'gemini' | 'simulation_fallback';
  model?: string;
  timestamp: string;
  apiError?: string;
}

export interface AlertDiagnosis {
  rootCause: string;
  immediateRemediation: string;
  bmsControlCommand: string;
  avoidedLossDailyUSD: number;
  urgencyHours: number;
}

export interface AlertDiagnosisResponse {
  success: boolean;
  data: AlertDiagnosis;
  source: 'gemini' | 'simulation_fallback';
  model?: string;
  timestamp: string;
  apiError?: string;
}

export interface AiStatusResponse {
  configured: boolean;
  models: string[];
  features: string[];
  timestamp: string;
}

// Universal fetch helper with timeout and standardized error wrapping
async function fetchAiEndpoint<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 40000); // 40s timeout for AI operations

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data?.error || data?.detail || `AI Server Error: ${res.status} ${res.statusText}`;
      const err = new Error(errorMsg) as any;
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Gemini AI request timed out. Please try again.');
    }
    throw err;
  }
}

export const aiService = {
  /**
   * Check if Gemini API is configured and operational
   */
  checkStatus: async (): Promise<AiStatusResponse> => {
    return fetchAiEndpoint<AiStatusResponse>('/api/ai/status', { method: 'GET' });
  },

  /**
   * Feature 1: Ask AI (Standard Copilot)
   */
  ask: async (prompt: string, context?: any): Promise<AskAiResponse> => {
    return fetchAiEndpoint<AskAiResponse>('/api/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    });
  },

  /**
   * Feature 1b: Ask AI Stream (Real-Time SSE Streaming)
   */
  askStream: async (
    prompt: string,
    building: string = 'EcoTower Delta',
    onToken: (token: string) => void,
    onDone: (info: { model?: string; source?: string }) => void,
    onError: (err: any) => void
  ) => {
    const url = `/api/ai/stream?prompt=${encodeURIComponent(prompt)}&building=${encodeURIComponent(building)}`;
    
    try {
      const response = await fetch(url);
      if (!response.body) {
        throw new Error('ReadableStream not supported by browser/server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.replace(/^data:\s*/, '');
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.text) {
                onToken(parsed.text);
              }
              if (parsed.done) {
                onDone({ model: parsed.model, source: parsed.source });
                return;
              }
              if (parsed.error) {
                onError(new Error(parsed.error));
                return;
              }
            } catch (e) {
              // Non-JSON line or partial payload
            }
          }
        }
      }

      onDone({});
    } catch (err: any) {
      onError(err);
    }
  },

  /**
   * Feature 2: Generate Recommendation (ECMs)
   */
  generateRecommendations: async (telemetry?: any, facilityContext?: string): Promise<RecommendationsResponse> => {
    return fetchAiEndpoint<RecommendationsResponse>('/api/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify({ telemetry, facilityContext }),
    });
  },

  /**
   * Feature 3: Summarize Energy Report
   */
  summarizeReport: async (
    reportData: {
      title?: string;
      type?: string;
      period?: string;
      metrics?: any;
      content?: string;
    },
    facilityContext?: string
  ): Promise<ReportSummaryResponse> => {
    return fetchAiEndpoint<ReportSummaryResponse>('/api/ai/summarize-report', {
      method: 'POST',
      body: JSON.stringify({ ...reportData, facilityContext }),
    });
  },

  /**
   * Feature 4: Predict Energy Usage
   */
  predictUsage: async (
    forecastHours: number = 24,
    telemetry?: any,
    facilityContext?: string
  ): Promise<PredictEnergyResponse> => {
    return fetchAiEndpoint<PredictEnergyResponse>('/api/ai/predict', {
      method: 'POST',
      body: JSON.stringify({ forecastHours, telemetry, facilityContext }),
    });
  },

  /**
   * Feature 5: Explain Charts
   */
  explainChart: async (
    chartType: string,
    chartData: any,
    focusArea?: string,
    facilityContext?: string
  ): Promise<ExplainChartResponse> => {
    return fetchAiEndpoint<ExplainChartResponse>('/api/ai/explain-chart', {
      method: 'POST',
      body: JSON.stringify({ chartType, chartData, focusArea, facilityContext }),
    });
  },

  /**
   * Feature 6: Evaluate Energy Simulation
   */
  evaluateSimulation: async (
    params: any,
    facilityContext?: string
  ): Promise<SimulationEvaluationResponse> => {
    return fetchAiEndpoint<SimulationEvaluationResponse>('/api/ai/evaluate-simulation', {
      method: 'POST',
      body: JSON.stringify({ params, facilityContext }),
    });
  },

  /**
   * Feature 7: Diagnose BMS Anomaly / Smart Alert
   */
  diagnoseAlert: async (
    alert: {
      title: string;
      severity: string;
      location: string;
      equipment?: string;
      impact?: string;
    },
    facilityContext?: string
  ): Promise<AlertDiagnosisResponse> => {
    return fetchAiEndpoint<AlertDiagnosisResponse>('/api/ai/diagnose-alert', {
      method: 'POST',
      body: JSON.stringify({ alert, facilityContext }),
    });
  },
};

export default aiService;
