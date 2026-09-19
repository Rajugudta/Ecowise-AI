import { GoogleGenAI } from "@google/genai";

// Lazy-loaded Gemini AI client instance
let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  
  return aiClient;
}

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== "MY_GEMINI_API_KEY" && key.trim().length > 0);
}

// Recommended model candidate list prioritizing official active models
export const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-2.5-flash",
].filter(Boolean) as string[];

/**
 * Robust execution helper that tries active models sequentially if one is deprecated/not found
 */
async function callGeminiWithFallback<T>(
  action: (ai: GoogleGenAI, model: string) => Promise<T>,
  fallbackFn: () => T,
  operationName: string
): Promise<{ result: T; source: "gemini" | "simulation_fallback"; modelUsed: string; apiError?: string }> {
  if (!isGeminiConfigured()) {
    return {
      result: fallbackFn(),
      source: "simulation_fallback",
      modelUsed: "local-simulation",
    };
  }

  const ai = getGeminiClient();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const result = await action(ai, model);
      return {
        result,
        source: "gemini",
        modelUsed: model,
      };
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini ${operationName}] Warning with model ${model}:`, errMsg);
      // If error indicates model is retired, not found, or 404, continue to next candidate model
      const isModelNotFound = errMsg.includes("404") || 
                              errMsg.includes("no longer available") || 
                              errMsg.includes("NOT_FOUND") ||
                              errMsg.includes("is not supported");
      if (!isModelNotFound) {
        // If it's a rate-limit or quota error, break early to avoid hammering
        if (errMsg.includes("resource_exhausted") || errMsg.includes("429")) {
          break;
        }
      }
    }
  }

  console.error(`[Gemini ${operationName}] All models failed, falling back to local dataset simulation:`, lastError?.message);
  return {
    result: fallbackFn(),
    source: "simulation_fallback",
    modelUsed: "local-fallback",
    apiError: lastError?.message || "Gemini API unavailable",
  };
}

const DEFAULT_BUILDING_CONTEXT = `
Facility: EcoTower Delta (Commercial Class-A High-Rise)
Location: San Francisco, CA
Gross Floor Area: 450,000 sq ft (24 floors)
BMS Platform: Schneider Electric EcoStruxure Building Operation v4.1
Central Plant: 2x 450-Ton Magnetic Bearing Centrifugal Chillers (York/Carrier) + 1x 250-Ton Variable Speed Screw Chiller
Microgrid: 120 kW Rooftop Bifacial Solar PV Array + 100 kWh Tesla Megapack BESS
Tariff Structure (PG&E E-19 TOU):
- On-Peak ($0.24/kWh): 14:00 - 18:00 (Mon-Fri)
- Partial-Peak ($0.16/kWh): 08:30 - 14:00 & 18:00 - 21:30
- Off-Peak ($0.09/kWh): 21:30 - 08:30 & Weekends
- Demand Charge: $18.50 per peak kW draw
Current Live BMS Telemetry:
- Total Power Draw: 184.2 kW (Baseline: 216.0 kW, -14.8%)
- Daily Cumulative Consumption: 1,482.4 kWh
- Peak Draw Today: 284 kW at 13:15
- Indoor Air Quality: 485 ppm CO2, PMV +0.12, 71.4°F average setpoint
- Solar PV Output: 24.1 kW (Cloudy conditions, rated 42 kW)
- Scope 2 Avoided CO2: 384.2 kg today
`;

/**
 * Feature 1: Ask AI (Conversational Building Energy Copilot)
 */
export async function askAI(prompt: string, context?: any) {
  const buildingSummary = context?.facilitySummary || DEFAULT_BUILDING_CONTEXT;
  const runtimeContext = context ? JSON.stringify(context) : "Standard live telemetry";

  const { result, source, modelUsed, apiError } = await callGeminiWithFallback(
    async (ai, model) => {
      const systemInstruction = `You are the EcoWise AI Copilot, an elite BMS and Energy Management expert specializing in commercial high-rise building operations, Schneider Electric EcoStruxure systems, microgrids, and ASHRAE energy standards.
Always ground your answers in the active facility context below:
${buildingSummary}
Additional live runtime telemetry: ${runtimeContext}

Requirements:
- Provide concise, highly actionable, and mathematically grounded answers.
- Format key operational steps with clear operational bullets.
- Mention direct BMS actions where applicable (e.g. setpoint trimming, pump VFD frequency, battery discharge, precooling).`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      return response.text || "No response generated from Gemini.";
    },
    () => generateFallbackAskAi(prompt).text,
    "AskAI"
  );

  return {
    success: true,
    text: result,
    model: modelUsed,
    source,
    timestamp: new Date().toISOString(),
    apiError,
  };
}

/**
 * Feature 1b: Ask AI Stream (Real-Time Token-by-Token Streaming)
 */
export async function askAIStream(
  prompt: string,
  context: any,
  onChunk: (chunkText: string) => void
): Promise<{ modelUsed: string; source: "gemini" | "simulation_fallback" }> {
  if (!isGeminiConfigured()) {
    // Stream simulated fallback tokens smoothly
    const fallbackText = generateFallbackAskAi(prompt).text;
    const words = fallbackText.split(" ");
    for (const word of words) {
      onChunk(word + " ");
      await new Promise((r) => setTimeout(r, 25));
    }
    return { modelUsed: "local-simulation", source: "simulation_fallback" };
  }

  const ai = getGeminiClient();
  const buildingSummary = context?.facilitySummary || DEFAULT_BUILDING_CONTEXT;
  const runtimeContext = context ? JSON.stringify(context) : "Standard live telemetry";

  const systemInstruction = `You are the EcoWise AI Copilot, an elite BMS and Energy Management expert specializing in commercial building operations, Schneider EcoStruxure, microgrid storage, and ASHRAE energy standards.
Ground your answers in this facility:
${buildingSummary}
Live runtime context: ${runtimeContext}
Be concise, practical, and provide operational instructions with metrics.`;

  for (const model of CANDIDATE_MODELS) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          onChunk(chunk.text);
        }
      }
      return { modelUsed: model, source: "gemini" };
    } catch (err: any) {
      console.warn(`[Gemini Stream] Model ${model} failed, trying next:`, err?.message);
    }
  }

  // Fallback stream if all API models fail
  const fallbackText = generateFallbackAskAi(prompt).text;
  const words = fallbackText.split(" ");
  for (const word of words) {
    onChunk(word + " ");
    await new Promise((r) => setTimeout(r, 25));
  }
  return { modelUsed: "local-fallback", source: "simulation_fallback" };
}

/**
 * Feature 2: Generate Energy Conservation Recommendations (ECMs)
 */
export async function generateRecommendations(telemetryData?: any, facilityContext?: string) {
  const ctx = facilityContext || DEFAULT_BUILDING_CONTEXT;

  const { result, source, modelUsed, apiError } = await callGeminiWithFallback(
    async (ai, model) => {
      const prompt = `Analyze the current building telemetry and time-of-use tariffs. Generate exactly 4 high-impact, prioritized Energy Conservation Measures (ECMs).
Context:
${ctx}
Telemetry: ${telemetryData ? JSON.stringify(telemetryData) : "Standard midday telemetry"}

Respond in valid JSON array matching this exact schema:
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "category": "HVAC" | "Chillers" | "Lighting" | "Solar/BESS" | "Plug Load",
    "impact": "High" | "Medium" | "Low",
    "estimatedKwhSaved": number,
    "estimatedCostSavedUsd": number,
    "carbonReductionKg": number,
    "confidenceScore": number (80-99),
    "actionCommand": "string",
    "paybackPeriod": "string"
  }
]`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "[]";
      return JSON.parse(text);
    },
    () => generateFallbackRecommendations().recommendations,
    "Recommendations"
  );

  return {
    success: true,
    recommendations: result,
    source,
    model: modelUsed,
    timestamp: new Date().toISOString(),
    apiError,
  };
}

/**
 * Feature 3: Summarize Energy Report
 */
export async function summarizeEnergyReport(
  reportData: {
    title?: string;
    type?: string;
    period?: string;
    metrics?: any;
    content?: string;
  },
  facilityContext?: string
) {
  const ctx = facilityContext || DEFAULT_BUILDING_CONTEXT;

  const { result, source, modelUsed, apiError } = await callGeminiWithFallback(
    async (ai, model) => {
      const prompt = `Please summarize the following Energy & Sustainability Statement for facility leadership and the CFO.
Report Details:
- Title: ${reportData.title || "Facility Energy & ESG Audit"}
- Type: ${reportData.type || "Monthly Executive Review"}
- Period: ${reportData.period || "Current Billing Cycle"}
- Key Metrics: ${JSON.stringify(reportData.metrics || {})}
- Raw Content: ${reportData.content || "Commercial building consumption of 42,850 kWh, 384 kg avoided CO2, peak demand 284 kW."}

Building Profile:
${ctx}

Please provide a comprehensive yet crisp structured summary in JSON with:
{
  "executiveSummary": "concise 2-sentence overview for leadership.",
  "keyFindings": ["3-4 bullet points highlighting usage spikes, efficiency trends, and savings."],
  "esgCompliance": "status regarding LEED Platinum EA credits, ISO 50001, and Scope 2 GHG protocol.",
  "financialOpportunities": "estimated monthly/annual utility bill reduction opportunities.",
  "urgentActions": ["2 immediate maintenance or BMS optimization items."]
}`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      return JSON.parse(response.text || "{}");
    },
    () => generateFallbackReportSummary(reportData).summary,
    "SummarizeReport"
  );

  return {
    success: true,
    summary: result,
    source,
    model: modelUsed,
    timestamp: new Date().toISOString(),
    apiError,
  };
}

/**
 * Feature 4: Predict Energy Usage
 */
export async function predictEnergyUsage(
  forecastHours: number = 24,
  telemetry?: any,
  facilityContext?: string
) {
  const ctx = facilityContext || DEFAULT_BUILDING_CONTEXT;

  const { result, source, modelUsed, apiError } = await callGeminiWithFallback(
    async (ai, model) => {
      const prompt = `You are a machine-learning energy forecasting model.
Generate a high-accuracy ${forecastHours}-hour energy demand prediction based on historical trends, weather fluctuations (high 76°F midday, 58°F overnight), and peak PG&E TOU tariff windows.
Facility Context:
${ctx}
Live Telemetry:
${JSON.stringify(telemetry || {})}

Respond in valid JSON with this exact structure:
{
  "projectedTotalKWh": number,
  "projectedPeakKW": number,
  "projectedPeakTime": "string",
  "projectedCostUSD": number,
  "projectedCarbonKg": number,
  "savingsPotentialUSD": number,
  "riskLevel": "Low" | "Moderate" | "High",
  "riskExplanation": "string",
  "hourlyForecast": [
    { "hour": "string (e.g. 00:00)", "predictedKW": number, "baselineKW": number, "confidenceLower": number, "confidenceUpper": number, "isPeakTariff": boolean }
  ],
  "proactiveRecommendations": [
    "string (action 1)",
    "string (action 2)"
  ]
}`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      return JSON.parse(response.text || "{}");
    },
    () => generateFallbackPrediction(forecastHours).prediction,
    "PredictEnergy"
  );

  return {
    success: true,
    prediction: result,
    source,
    model: modelUsed,
    timestamp: new Date().toISOString(),
    apiError,
  };
}

/**
 * Feature 5: Explain Charts
 */
export async function explainChart(
  chartType: string,
  chartData: any,
  focusArea?: string,
  facilityContext?: string
) {
  const ctx = facilityContext || DEFAULT_BUILDING_CONTEXT;

  const { result, source, modelUsed, apiError } = await callGeminiWithFallback(
    async (ai, model) => {
      const prompt = `As a building energy analyst, interpret and explain this chart for a facility manager.
Chart Type: ${chartType}
Chart Data: ${JSON.stringify(chartData)}
Focus Area: ${focusArea || "Overall consumption patterns and anomalies"}

Building Context:
${ctx}

Provide a structured JSON response with:
{
  "headline": "Short punchy observation (under 12 words)",
  "explanation": "Clear, jargon-free 2-3 paragraph explanation of what the trends mean, why peaks occurred, and how actual compares to baseline.",
  "keyObservations": ["bullet 1", "bullet 2", "bullet 3"],
  "recommendedAction": "Single highest priority operational change to make based on this chart.",
  "anomalyScore": number (1-100 where 1 is ideal and 100 is severe fault)
}`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      return JSON.parse(response.text || "{}");
    },
    () => generateFallbackChartExplanation(chartType, chartData).explanation,
    "ExplainChart"
  );

  return {
    success: true,
    explanation: result,
    source,
    model: modelUsed,
    timestamp: new Date().toISOString(),
    apiError,
  };
}

/**
 * Feature 6: Evaluate Energy Simulation Parameters
 */
export async function evaluateSimulation(
  params: {
    hvacSetpointF: number;
    lightingBrightnessPct: number;
    occupancyPct: number;
    workingHours: number;
    solarCapacityKW: number;
    batteryDischargeKW: number;
    evSmartShiftPct: number;
    chillerVsdEfficiency: string;
  },
  facilityContext?: string
) {
  const ctx = facilityContext || DEFAULT_BUILDING_CONTEXT;

  const { result, source, modelUsed, apiError } = await callGeminiWithFallback(
    async (ai, model) => {
      const prompt = `As a senior mechanical engineer and ASHRAE building thermodynamicist, evaluate this energy optimization simulation.
Simulation Parameters:
- HVAC Setpoint: ${params.hvacSetpointF}°F
- Lighting Level: ${params.lightingBrightnessPct}%
- Building Occupancy: ${params.occupancyPct}%
- Operating Hours: ${params.workingHours} hrs/day
- Solar PV Capacity: ${params.solarCapacityKW} kW
- Battery Peak Discharge: ${params.batteryDischargeKW} kW
- EV Charging Smart Shift: ${params.evSmartShiftPct}%
- Chiller VSD Efficiency Mode: ${params.chillerVsdEfficiency}

Building Profile:
${ctx}

Respond in valid JSON with:
{
  "evaluationSummary": "Concise 2-3 sentence executive thermodynamic and financial assessment.",
  "pmvComfortScore": number (between -0.5 and +0.5 for ASHRAE 55 compliance),
  "ashrae55Compliant": boolean,
  "estimatedMonthlySavingsUSD": number,
  "estimatedKwhReducedMonthly": number,
  "carbonReductionTonsYear": number,
  "gridStressReductionPct": number,
  "operationalAdvice": [
    "string advice item 1",
    "string advice item 2",
    "string advice item 3"
  ]
}`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      return JSON.parse(response.text || "{}");
    },
    () => ({
      evaluationSummary: `Gemini Thermodynamic Assessment: With setpoint adjusted to ${params.hvacSetpointF}°F and ${params.batteryDischargeKW} kW battery dispatch, coincident peak load is suppressed by 18.4%.`,
      pmvComfortScore: 0.14,
      ashrae55Compliant: true,
      estimatedMonthlySavingsUSD: 3840 + params.batteryDischargeKW * 45,
      estimatedKwhReducedMonthly: 21500,
      carbonReductionTonsYear: 58.4,
      gridStressReductionPct: 22.5,
      operationalAdvice: [
        `Pre-cool core thermal mass 90 minutes before the ${params.workingHours >= 10 ? "14:00" : "13:00"} peak tariff window.`,
        `Modulate Chiller VSD compressors in tandem with the ${params.batteryDischargeKW} kW BESS discharge rate.`,
        `Maintain minimum 400 lux at work surfaces while dimming ambient ballasts to ${params.lightingBrightnessPct}%.`
      ],
    }),
    "EvaluateSimulation"
  );

  return {
    success: true,
    data: result,
    source,
    model: modelUsed,
    timestamp: new Date().toISOString(),
    apiError,
  };
}

/**
 * Feature 7: Diagnose BMS Anomaly / Smart Alert
 */
export async function diagnoseAlert(
  alertData: {
    title: string;
    severity: string;
    location: string;
    equipment?: string;
    impact?: string;
  },
  facilityContext?: string
) {
  const ctx = facilityContext || DEFAULT_BUILDING_CONTEXT;

  const { result, source, modelUsed, apiError } = await callGeminiWithFallback(
    async (ai, model) => {
      const prompt = `As a Schneider Electric Certified BMS Engineer and Master Diagnostician, provide an instant root-cause diagnosis and automated remediation command for this active alert:
Alert: ${alertData.title}
Severity: ${alertData.severity}
Location: ${alertData.location}
Equipment: ${alertData.equipment || "Central Plant / AHU"}
Impact: ${alertData.impact || "Energy drift"}

Facility Profile:
${ctx}

Respond in valid JSON:
{
  "rootCause": "Deep technical explanation of the failure mechanism (e.g. pneumatic valve diaphragm rupture, chilled water delta-T degradation, VFD harmonics).",
  "immediateRemediation": "Step-by-step immediate physical or software action to stabilize the zone.",
  "bmsControlCommand": "Exact BACnet / Modbus setpoint command to execute (e.g. WRITE_BACNET_AO_102(val=45)).",
  "avoidedLossDailyUSD": number,
  "urgencyHours": number
}`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      return JSON.parse(response.text || "{}");
    },
    () => ({
      rootCause: `Mechanical sensor or actuator calibration drift detected in ${alertData.location}. Modulating actuator feedback loop indicates 22% hunting oscillation.`,
      immediateRemediation: "Engage manual PID loop override and reset actuator stroke travel to 45% static position.",
      bmsControlCommand: "CMD_BACNET_OVERRIDE_RELAY(zone=3, state='AUTO_CAL')",
      avoidedLossDailyUSD: 145.20,
      urgencyHours: 4,
    }),
    "DiagnoseAlert"
  );

  return {
    success: true,
    data: result,
    source,
    model: modelUsed,
    timestamp: new Date().toISOString(),
    apiError,
  };
}

// -------------------------------------------------------------
// Fallback Generators (Resilient offline & missing-key modes)
// -------------------------------------------------------------

function generateFallbackAskAi(prompt: string) {
  const p = prompt.toLowerCase();
  let text = "";
  if (p.includes("high") || p.includes("spike") || p.includes("usage")) {
    text = `Based on submetering analysis at **EcoTower Delta**, demand peaked at **284 kW** at 13:15 today.
Key drivers identified:
1. **Chiller Plant Staging (+38 kW):** Elevated ambient humidity (78%) pushed Chiller #2 compressor frequency to 88 Hz.
2. **Floor 3 Bio-Cleanroom (+24 kW):** AHU-3B damper held 85% open despite low occupancy.
3. **Solar PV Intermittency (-18 kW):** Cloud cover throttled solar production to 24.1 kW.`;
  } else if (p.includes("cost") || p.includes("bill") || p.includes("save")) {
    text = `To minimize PG&E On-Peak billing ($0.24/kWh from 14:00 to 18:00):
1. **Pre-Cooling Protocol (-$380/mo):** Pre-cool the concrete core to 69°F before 13:30, floating to 73.5°F during peak hours.
2. **Battery Energy Storage Arbitrage (-$620/mo):** Discharge the 100 kWh Megapack at 25 kW between 14:15 and 17:45.
3. **EV Smart Throttling (-$145/mo):** Throttle Fleet EV chargers to 16A until 18:00.`;
  } else {
    text = `Analyzing query: "${prompt}".
Facility baseline is running at **184.2 kW**, which is **14.8% below typical historical load**. HVAC loops are stable with 0.12 PMV comfort index and 485 ppm CO2. Inverter efficiency is 94%.`;
  }

  return {
    success: true,
    text,
    source: "simulation_fallback",
    isConfigured: false,
    timestamp: new Date().toISOString(),
  };
}

function generateFallbackRecommendations() {
  return {
    source: "simulation_fallback",
    isConfigured: false,
    recommendations: [
      {
        id: "ecm-1",
        title: "Pre-Cool Core Thermal Mass Ahead of 14:00 Peak Tariff",
        description: "Lower tenant floor setpoints to 69.5°F between 11:30 and 13:30, then float setpoint to 74°F during the $0.24/kWh window to avoid 38 kW coincident peak.",
        category: "HVAC" as const,
        impact: "High" as const,
        estimatedKwhSaved: 142.5,
        estimatedCostSavedUsd: 124.80,
        carbonReductionKg: 54.7,
        confidenceScore: 96,
        actionCommand: "SETPOINT_FLOAT_PRECOOL",
        paybackPeriod: "Immediate (Operational)",
      },
      {
        id: "ecm-2",
        title: "Dispatch 100 kWh BESS Battery During Peak Utility Window",
        description: "Inject 25 kW continuous storage from on-site Tesla Megapack between 14:30 and 17:30 to shave commercial demand ratchets.",
        category: "Solar/BESS" as const,
        impact: "High" as const,
        estimatedKwhSaved: 75.0,
        estimatedCostSavedUsd: 180.00,
        carbonReductionKg: 28.8,
        confidenceScore: 98,
        actionCommand: "DISCHARGE_BESS_PEAK",
        paybackPeriod: "Immediate",
      },
      {
        id: "ecm-3",
        title: "Calibrate AHU-3B Cleanroom Static Pressure & Dampers",
        description: "Floor 3 lab damper is stuck at 85% open despite 22% room occupancy. Modulate supply fan VFD from 58 Hz down to 42 Hz.",
        category: "Chillers" as const,
        impact: "Medium" as const,
        estimatedKwhSaved: 68.0,
        estimatedCostSavedUsd: 46.20,
        carbonReductionKg: 26.1,
        confidenceScore: 92,
        actionCommand: "TRIM_AHU3_VFD",
        paybackPeriod: "Immediate",
      },
      {
        id: "ecm-4",
        title: "Enforce Nighttime Standby Plug Load Cutoff on Floor 2",
        description: "Workstation clusters show 12.8 kW vampire draw overnight. Enable automated 20:00 relay cutoff on non-essential power circuits.",
        category: "Plug Load" as const,
        impact: "Medium" as const,
        estimatedKwhSaved: 62.0,
        estimatedCostSavedUsd: 38.50,
        carbonReductionKg: 23.8,
        confidenceScore: 89,
        actionCommand: "ENABLE_NIGHT_CUTOFF_F2",
        paybackPeriod: "Immediate",
      },
    ],
  };
}

function generateFallbackReportSummary(reportData: any) {
  return {
    source: "simulation_fallback",
    isConfigured: false,
    summary: {
      executiveSummary: "Facility demonstrated stellar energy conservation over the audit period, achieving a 14.8% reduction in grid power draw and avoiding 384.2 kg of Scope 2 greenhouse gas emissions daily.",
      keyFindings: [
        "Chiller efficiency averaged 0.54 kW/ton, beating ASHRAE 90.1 standards by 18%.",
        "Rooftop solar bifacial arrays provided 18.2% of total building daytime base load.",
        "Peak demand occurred at 13:15 (284 kW), driven by concurrent laboratory AHU damper cycling.",
        "Monthly cumulative consumption sits at 42,850 kWh, on track for 8.4% under budget.",
      ],
      esgCompliance: "LEED Platinum EA Credits: 31/33 points achieved. Scope 2 emissions are fully verified in accordance with the GHG Protocol Corporate Standard.",
      financialOpportunities: "Automated peak-tariff battery dispatch is estimated to yield an additional $1,145/month in avoided coincident demand charges.",
      urgentActions: [
        "Recalibrate AHU-3B modulating damper actuator to prevent cleanroom overcooling.",
        "Verify inverter firmware on Solar String 4 following recent cloud cover intermittency.",
      ],
    },
  };
}

function generateFallbackPrediction(hours: number) {
  const hourly = [
    { hour: "00:00", predictedKW: 48, baselineKW: 62, confidenceLower: 44, confidenceUpper: 52, isPeakTariff: false },
    { hour: "02:00", predictedKW: 42, baselineKW: 58, confidenceLower: 38, confidenceUpper: 46, isPeakTariff: false },
    { hour: "04:00", predictedKW: 45, baselineKW: 60, confidenceLower: 41, confidenceUpper: 49, isPeakTariff: false },
    { hour: "06:00", predictedKW: 76, baselineKW: 95, confidenceLower: 70, confidenceUpper: 82, isPeakTariff: false },
    { hour: "08:00", predictedKW: 138, baselineKW: 175, confidenceLower: 128, confidenceUpper: 148, isPeakTariff: false },
    { hour: "10:00", predictedKW: 182, baselineKW: 220, confidenceLower: 170, confidenceUpper: 194, isPeakTariff: false },
    { hour: "12:00", predictedKW: 208, baselineKW: 260, confidenceLower: 195, confidenceUpper: 221, isPeakTariff: false },
    { hour: "14:00", predictedKW: 192, baselineKW: 245, confidenceLower: 180, confidenceUpper: 204, isPeakTariff: true },
    { hour: "16:00", predictedKW: 175, baselineKW: 230, confidenceLower: 165, confidenceUpper: 185, isPeakTariff: true },
    { hour: "18:00", predictedKW: 130, baselineKW: 170, confidenceLower: 120, confidenceUpper: 140, isPeakTariff: false },
    { hour: "20:00", predictedKW: 92, baselineKW: 120, confidenceLower: 85, confidenceUpper: 99, isPeakTariff: false },
    { hour: "22:00", predictedKW: 64, baselineKW: 85, confidenceLower: 59, confidenceUpper: 69, isPeakTariff: false },
  ];

  return {
    source: "simulation_fallback",
    isConfigured: false,
    prediction: {
      projectedTotalKWh: 1420.5,
      projectedPeakKW: 208,
      projectedPeakTime: "12:00 PM",
      projectedCostUSD: 234.60,
      projectedCarbonKg: 368.4,
      savingsPotentialUSD: 48.20,
      riskLevel: "Moderate" as const,
      riskExplanation: "Ambient temperature reaching 76°F at 13:00 will trigger stage 2 chiller ramp-up right before the 14:00 peak PG&E tariff period.",
      hourlyForecast: hourly,
      proactiveRecommendations: [
        "Execute thermal pre-cooling from 11:30 - 13:30 to avoid coincident peak charges.",
        "Reserve 40 kWh BESS storage for immediate discharge between 14:30 and 16:30.",
      ],
    },
  };
}

function generateFallbackChartExplanation(chartType: string, chartData: any) {
  return {
    source: "simulation_fallback",
    isConfigured: false,
    explanation: {
      headline: "Optimized Morning Ramp with Controlled Midday Peak Avoidance",
      explanation: "This visualization illustrates the real-time power demand curve plotted against the ASHRAE baseline. Demand remains significantly below historical reference levels throughout the early morning and afternoon working hours.\n\nThe midday divergence reflects active chilled water delta-T management and rooftop solar PV generation, suppressing peak utility grid draw during the most expensive Time-of-Use tariff window.",
      keyObservations: [
        "Actual power draw tracked 14.8% below baseline across all operating hours.",
        "Peak midday draw was capped at 212 kW compared to baseline 260 kW.",
        "Solar generation contributed an average of 24.1 kW during peak irradiance.",
      ],
      recommendedAction: "Maintain currently configured 72.5°F setpoint tolerance on non-critical floors to preserve peak shave benefits.",
      anomalyScore: 12,
    },
  };
}
