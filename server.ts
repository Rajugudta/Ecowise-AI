import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  askAI,
  askAIStream,
  generateRecommendations,
  summarizeEnergyReport,
  predictEnergyUsage,
  explainChart,
  evaluateSimulation,
  diagnoseAlert,
  isGeminiConfigured,
  CANDIDATE_MODELS,
} from "./server/geminiService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Standard middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: isGeminiConfigured(),
      models: CANDIDATE_MODELS,
      timestamp: new Date().toISOString(),
    });
  });

  // AI Status Check
  app.get("/api/ai/status", (req, res) => {
    res.json({
      configured: isGeminiConfigured(),
      models: CANDIDATE_MODELS,
      features: [
        "Ask AI Copilot",
        "Real-Time Stream Copilot",
        "Generate Recommendation (ECMs)",
        "Summarize Energy Report",
        "Predict Energy Usage",
        "Explain Charts",
        "Evaluate Energy Simulation",
        "Diagnose BMS Alert",
      ],
      timestamp: new Date().toISOString(),
    });
  });

  // Feature 1: Ask AI (Standard)
  app.post("/api/ai/ask", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required and must be a string." });
      }
      const result = await askAI(prompt, context);
      res.json(result);
    } catch (err: any) {
      console.error("[API Error /api/ai/ask]:", err);
      res.status(500).json({ error: err.message || "Failed to process AI query", success: false });
    }
  });

  // Feature 1b: Ask AI Stream (Server-Sent Events for Real-Time Responses)
  app.get("/api/ai/stream", async (req, res) => {
    const prompt = (req.query.prompt as string) || "";
    const buildingContext = (req.query.building as string) || "EcoTower Delta";

    if (!prompt) {
      return res.status(400).json({ error: "Prompt query param is required." });
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    try {
      const streamInfo = await askAIStream(
        prompt,
        { facilitySummary: `Facility: ${buildingContext}` },
        (chunkText) => {
          res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }
      );

      res.write(`data: ${JSON.stringify({ done: true, model: streamInfo.modelUsed, source: streamInfo.source })}\n\n`);
      res.end();
    } catch (err: any) {
      console.error("[API Error /api/ai/stream]:", err);
      res.write(`data: ${JSON.stringify({ error: err.message || "Streaming interrupted", done: true })}\n\n`);
      res.end();
    }
  });

  // Feature 2: Generate Recommendations
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { telemetry, facilityContext } = req.body;
      const result = await generateRecommendations(telemetry, facilityContext);
      res.json(result);
    } catch (err: any) {
      console.error("[API Error /api/ai/recommendations]:", err);
      res.status(500).json({ error: err.message || "Failed to generate recommendations", success: false });
    }
  });

  // Feature 3: Summarize Energy Report
  app.post("/api/ai/summarize-report", async (req, res) => {
    try {
      const { title, type, period, metrics, content, facilityContext } = req.body;
      const result = await summarizeEnergyReport(
        { title, type, period, metrics, content },
        facilityContext
      );
      res.json(result);
    } catch (err: any) {
      console.error("[API Error /api/ai/summarize-report]:", err);
      res.status(500).json({ error: err.message || "Failed to summarize report", success: false });
    }
  });

  // Feature 4: Predict Energy Usage
  app.post("/api/ai/predict", async (req, res) => {
    try {
      const { forecastHours, telemetry, facilityContext } = req.body;
      const hours = parseInt(forecastHours, 10) || 24;
      const result = await predictEnergyUsage(hours, telemetry, facilityContext);
      res.json(result);
    } catch (err: any) {
      console.error("[API Error /api/ai/predict]:", err);
      res.status(500).json({ error: err.message || "Failed to predict energy usage", success: false });
    }
  });

  // Feature 5: Explain Charts
  app.post("/api/ai/explain-chart", async (req, res) => {
    try {
      const { chartType, chartData, focusArea, facilityContext } = req.body;
      if (!chartType) {
        return res.status(400).json({ error: "chartType is required." });
      }
      const result = await explainChart(chartType, chartData, focusArea, facilityContext);
      res.json(result);
    } catch (err: any) {
      console.error("[API Error /api/ai/explain-chart]:", err);
      res.status(500).json({ error: err.message || "Failed to explain chart", success: false });
    }
  });

  // Feature 6: Evaluate Energy Simulation
  app.post("/api/ai/evaluate-simulation", async (req, res) => {
    try {
      const { params, facilityContext } = req.body;
      if (!params) {
        return res.status(400).json({ error: "Simulation params are required." });
      }
      const result = await evaluateSimulation(params, facilityContext);
      res.json(result);
    } catch (err: any) {
      console.error("[API Error /api/ai/evaluate-simulation]:", err);
      res.status(500).json({ error: err.message || "Failed to evaluate simulation", success: false });
    }
  });

  // Feature 7: Diagnose BMS Anomaly / Smart Alert
  app.post("/api/ai/diagnose-alert", async (req, res) => {
    try {
      const { alert, facilityContext } = req.body;
      if (!alert || !alert.title) {
        return res.status(400).json({ error: "Alert data is required." });
      }
      const result = await diagnoseAlert(alert, facilityContext);
      res.json(result);
    } catch (err: any) {
      console.error("[API Error /api/ai/diagnose-alert]:", err);
      res.status(500).json({ error: err.message || "Failed to diagnose alert", success: false });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoWise Server with Gemini AI running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
