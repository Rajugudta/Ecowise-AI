import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Zap, 
  Leaf, 
  DollarSign, 
  TrendingDown, 
  Check, 
  Copy, 
  RefreshCw, 
  Building2, 
  ArrowUpRight,
  HelpCircle,
  Clock,
  ShieldCheck,
  Cpu,
  Mic,
  MicOff,
  Download,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { advisorApi, formatErrorMessage } from '../../services/api.js';
import { aiService } from '../../services/aiService';
import { useFacility } from '../../context/FacilityContext';
import { AiErrorBanner } from '../ai/AiErrorBanner';
import { AiLoadingAnimation } from '../ai/AiLoadingAnimation';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  source?: 'gemini' | 'simulation_fallback';
  metrics?: { label: string; value: string; change?: string }[];
  actionRecommendation?: string;
}

interface AiAdvisorPageProps {
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const PRESET_QUESTIONS = [
  {
    icon: Zap,
    title: 'Why is energy usage high today?',
    description: 'Break down demand spikes across Chillers, HVAC, and Labs',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    icon: DollarSign,
    title: 'Suggest ways to reduce electricity cost.',
    description: 'Evaluate peak-tariff shaving and battery arbitrage protocols',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    icon: Sparkles,
    title: 'Generate sustainability recommendations.',
    description: 'Identify actionable ECMs for LEED Platinum & ISO 50001',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    icon: Leaf,
    title: 'Explain carbon emissions.',
    description: 'Review Scope 2 intensity, grid factor, and daily avoidance',
    color: 'text-[#228035] bg-emerald-50 border-emerald-200',
  },
];

export const AiAdvisorPage: React.FC<AiAdvisorPageProps> = ({ onShowToast }) => {
  const { facility, profile, facilitySummaryPrompt } = useFacility();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello! I am your **EcoWise AI Energy Copilot**, grounded in real-time telemetry from **${profile.name}** (${profile.location}). 
Current load is **${facility.telemetry.currentLoadKW} kW** with active **${profile.tariffName}**. How can I assist you with HVAC trimming, peak shaving, or carbon mitigation today?`,
      time: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isFallbackActive, setIsFallbackActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState(false);
  const [ratings, setRatings] = useState<Record<string, 'up' | 'down'>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onShowToast('Voice speech recognition not supported in this browser.', 'info');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        onShowToast('Listening for voice prompt...', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        onShowToast(`Speech recognition: ${event.error || 'Check microphone'}`, 'info');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      onShowToast('Microphone access unavailable', 'info');
    }
  };

  const handleExportTranscript = () => {
    const lines = messages.map(
      (m) => `[${m.time}] ${m.sender === 'user' ? 'Operator' : 'EcoWise Copilot'}:\n${m.text}\n`
    );
    const blob = new Blob([lines.join('\n---\n\n')], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EcoWise_Advisor_Session_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Session transcript exported as Markdown', 'success');
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateAiResponse = (query: string): ChatMessage => {
    const q = query.toLowerCase();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (q.includes('why is energy usage high') || q.includes('high today') || q.includes('spike')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        time: timeStr,
        text: `Based on real-time submetering at **EcoTower Delta**, total facility draw peaked at **284 kW** at 13:15. Here is the operational root cause breakdown:

1. **Chiller #2 Overdrive (+38 kW):** Ambient relative humidity rose to 78%, forcing secondary compressor stage 2 to operate at 88 Hz instead of base 62 Hz.
2. **Floor 3 Bio-Research Cleanroom (+24 kW):** Modulating AHU-3B damper was left stuck at 85% open despite 22% room occupancy.
3. **Solar PV Intermittency (-18 kW):** Heavy cloud cover between 11:30 and 13:00 reduced rooftop generation from expected 42.4 kW to 24.1 kW, increasing net grid pull.`,
        metrics: [
          { label: 'Peak Demand', value: '284 kW', change: '+18.2%' },
          { label: 'Chiller Load', value: '112 kW', change: '+24 kW' },
          { label: 'Cleanroom HVAC', value: '46 kW', change: 'Alert' },
        ],
        actionRecommendation: 'Auto-calibrate AHU-3B damper and trim chilled water loop delta-T by 1.2°F.',
      };
    }

    if (q.includes('reduce electricity cost') || q.includes('cost') || q.includes('save money')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        time: timeStr,
        text: `Here is a 3-step strategy to minimize utility billing under your **Time-of-Use (TOU)** tariff structure ($0.24/kWh peak from 14:00 to 18:00 vs. $0.09/kWh off-peak):

1. **Pre-Cooling Thermal Mass (Projected: -$380/mo):**
   Pre-cool the concrete core and open floors to 69°F from 11:30 to 13:30, then float setpoint to 73.5°F during peak hours.
2. **Battery Energy Storage Discharge (Projected: -$620/mo):**
   Dispatch your 100 kWh on-site Tesla Megapack at 25 kW constant output starting at 14:15. This avoids the utility coincident peak surcharge.
3. **EV Smart Fleet Throttling (Projected: -$145/mo):**
   Cap EV Level-2 chargers in parking bay B to 16A until 18:00.`,
        metrics: [
          { label: 'Monthly Savings', value: '$1,145', change: 'Projected' },
          { label: 'Peak Reduction', value: '38 kW', change: '-13.4%' },
          { label: 'BMS Autonomy', value: 'Ready', change: 'Optimal' },
        ],
        actionRecommendation: 'Schedule automated battery peak shaving for 14:00-18:00 window.',
      };
    }

    if (q.includes('sustainability') || q.includes('recommendations') || q.includes('leed')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        time: timeStr,
        text: `Here are prioritized sustainability interventions to accelerate your **LEED Platinum** recertification and ISO 50001 targets:

- **DALI-2 Daylight Harvesting:** Sensors along the South and West facades detect 680 lux natural daylight. Dimming perimeter fixtures by 40% will save **28 kWh/day**.
- **HVAC Variable Frequency Drive (VFD) Optimization:** Cooling tower pump speed can be reduced from 55 Hz to 46 Hz during current 64°F wet-bulb conditions, saving **14 kWh/day**.
- **Standby Plug Load Power Strips:** Floor 2 workstation pods show 12.8 kW idle power overnight. Implementing automated 20:00 cutoff saves **62 kWh/night**.`,
        metrics: [
          { label: 'Avoided CO₂', value: '184 kg/day', change: '+22%' },
          { label: 'LEED EA Points', value: '31 / 33', change: 'Platinum' },
          { label: 'EUI Target', value: '48.2', change: '-18%' },
        ],
        actionRecommendation: 'Enable automated nighttime plug load cutoff policy on Floor 2.',
      };
    }

    if (q.includes('carbon') || q.includes('emissions') || q.includes('scope')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        time: timeStr,
        text: `**Carbon Accounting Analysis for EcoTower Delta:**

- **Scope 1 (Direct Fuels):** 0.0 MT CO₂e (Facility is 100% electrified heat pump architecture).
- **Scope 2 (Indirect Electricity):** Current regional grid emission factor is **0.384 kg CO₂e / kWh**.
- **Daily GHG Avoidance:** Today, your on-site rooftop solar (320 kWh generated) and battery storage prevented **146.8 kg of CO₂e** from entering the atmosphere.
- **YTD Performance:** 4.2 Metric Tons of CO₂ avoided, equivalent to preserving **184 mature trees** over a 10-year growth cycle.`,
        metrics: [
          { label: 'Scope 2 Factor', value: '0.384 kg/kWh', change: 'Regional' },
          { label: 'Today Avoided', value: '384.2 kg', change: 'Clean' },
          { label: 'Offset Trees', value: '184 Trees', change: 'Equivalent' },
        ],
        actionRecommendation: 'Download certified GHG Protocol compliant Scope 2 audit report.',
      };
    }

    // Default conversational reply
    return {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      time: timeStr,
      text: `I've analyzed your query regarding "${query}". 

Based on active Schneider BMS telemetry for **EcoTower Delta**:
- Real-time facility draw is **184.2 kW**, which is **14.8% below standard baseline**.
- Indoor air quality (CO₂ level: 485 ppm) and comfort indices (Predicted Mean Vote: +0.12) are well within ASHRAE 55 standards.
- Microgrid solar generation is operating at **94% inverter efficiency**.

Would you like me to simulate an energy conservation measure or adjust setpoint tolerances?`,
      actionRecommendation: 'Inspect real-time zone telemetry or trigger automated diagnostics.',
    };
  };

  const [executingActionId, setExecutingActionId] = useState<string | null>(null);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `ai-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: '',
      source: 'gemini',
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setInputValue('');
    setIsTyping(true);
    setApiError(null);

    let accumulatedText = '';

    await aiService.askStream(
      text,
      profile.name,
      (chunkToken) => {
        accumulatedText += chunkToken;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, text: accumulatedText }
              : msg
          )
        );
      },
      (doneInfo) => {
        setIsTyping(false);
        setIsFallbackActive(doneInfo.source === 'simulation_fallback');
        // If accumulated text is empty, fill with local response
        if (!accumulatedText.trim()) {
          const fallback = generateAiResponse(text);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, text: fallback.text, metrics: fallback.metrics, actionRecommendation: fallback.actionRecommendation, source: 'simulation_fallback' }
                : msg
            )
          );
        }
      },
      (err) => {
        console.warn('[AI Advisor Stream Error]:', err);
        setApiError(err?.message || 'Streaming interrupted, loaded local simulation fallback.');
        setIsTyping(false);
        setIsFallbackActive(true);
        if (!accumulatedText.trim()) {
          const fallback = generateAiResponse(text);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, text: fallback.text, metrics: fallback.metrics, actionRecommendation: fallback.actionRecommendation, source: 'simulation_fallback' }
                : msg
            )
          );
        }
      }
    );
  };

  const handleExecuteAction = async (msgId: string, actionName: string) => {
    setExecutingActionId(msgId);
    try {
      await advisorApi.applyRecommendation(msgId);
      onShowToast(`BMS Action deployed via FastAPI: ${actionName}`, 'success');
    } catch (err) {
      onShowToast(`Failed to deploy action: ${formatErrorMessage(err)}`, 'error');
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast('Copied response to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Top Header */}
      <div className="p-4 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#3DCD58] text-slate-950 flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">AI Energy Advisor Copilot</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#228035] dark:text-[#3DCD58] text-[10px] font-extrabold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-[#228035] dark:fill-[#3DCD58]" /> Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Autonomous enterprise energy advisor for EcoTower Delta</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTranscript}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download conversation log"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => {
              setMessages([
                {
                  id: 'msg-welcome-reset',
                  sender: 'assistant',
                  text: "Chat cleared. What facility systems, chillers, or tariffs would you like to explore?",
                  time: 'Just now',
                },
              ]);
              onShowToast('Advisor conversation reset', 'info');
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </div>

      {/* Error / Fallback Banner */}
      {apiError && (
        <div className="px-4 sm:px-6 pt-3">
          <AiErrorBanner
            error={apiError}
            isFallbackActive={isFallbackActive}
            onRetry={() => handleSendMessage()}
            onDismiss={() => setApiError(null)}
          />
        </div>
      )}

      {/* Main Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Suggested Questions banner on fresh chat */}
        {messages.length <= 2 && (
          <div className="mb-6 animate-in fade-in duration-300">
            <div className="text-center max-w-md mx-auto mb-5">
              <span className="inline-flex p-3 rounded-2xl bg-[#3DCD58]/15 dark:bg-[#3DCD58]/20 text-[#228035] dark:text-[#3DCD58] mb-2">
                <Zap className="w-6 h-6 fill-[#3DCD58]" />
              </span>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                How can I optimize your facility today?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select a standard inquiry below or prompt the AI Energy Advisor directly
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {PRESET_QUESTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => handleSendMessage(item.title)}
                    className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 hover:border-[#3DCD58] dark:hover:border-[#3DCD58] hover:shadow-xs transition-all text-left flex items-start gap-3 group cursor-pointer"
                  >
                    <div className={`p-2 rounded-xl border ${item.color} dark:bg-slate-800 dark:border-slate-700 shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-[#3DCD58] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            {msg.sender === 'assistant' ? (
              <div className="w-8 h-8 rounded-xl bg-[#3DCD58] text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-2xs">
                <Sparkles className="w-4 h-4 fill-slate-950" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs">
                You
              </div>
            )}

            {/* Bubble */}
            <div
              className={`rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 dark:bg-emerald-700 text-white rounded-tr-sm shadow-xs'
                  : 'bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  msg.sender === 'user' ? 'text-slate-400 dark:text-emerald-200' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {msg.sender === 'assistant' ? 'EcoWise Copilot' : 'Facility Manager'}
                </span>
                <span className={`text-[10px] ${
                  msg.sender === 'user' ? 'text-slate-400 dark:text-emerald-200' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {msg.time}
                </span>
              </div>

              {/* Text formatting */}
              <div className="whitespace-pre-line text-xs sm:text-[13px] leading-relaxed">
                {msg.text}
              </div>

              {/* Optional Key Metrics Chips */}
              {msg.metrics && msg.metrics.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800 grid grid-cols-3 gap-2">
                  {msg.metrics.map((m) => (
                    <div key={m.label} className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 block">{m.label}</span>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{m.value}</div>
                      {m.change && (
                        <span className="text-[10px] font-bold text-[#228035] dark:text-[#3DCD58] block mt-0.5">{m.change}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Optional Action recommendation banner */}
              {msg.actionRecommendation && (
                <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-emerald-950 dark:text-emerald-200 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#3DCD58] shrink-0" />
                    <span>{msg.actionRecommendation}</span>
                  </div>
                  <button
                    disabled={executingActionId === msg.id}
                    onClick={() => handleExecuteAction(msg.id, msg.actionRecommendation!)}
                    className="px-2.5 py-1 rounded-lg bg-[#3DCD58] hover:bg-[#34b64b] disabled:opacity-60 text-slate-950 font-extrabold text-[10px] shrink-0 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {executingActionId === msg.id ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-slate-950" />
                        <span>Deploying...</span>
                      </>
                    ) : (
                      <span>Execute via FastAPI</span>
                    )}
                  </button>
                </div>
              )}

              {/* Copy & Rating feedback buttons */}
              {msg.sender === 'assistant' && (
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setRatings((prev) => ({ ...prev, [msg.id]: 'up' }));
                        onShowToast('Feedback saved: Helpful', 'info');
                      }}
                      className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                        ratings[msg.id] === 'up'
                          ? 'text-[#228035] dark:text-[#3DCD58] bg-emerald-100 dark:bg-emerald-950'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                      title="Helpful recommendation"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setRatings((prev) => ({ ...prev, [msg.id]: 'down' }));
                        onShowToast('Feedback saved: Needs refinement', 'info');
                      }}
                      className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                        ratings[msg.id] === 'down'
                          ? 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                      title="Needs improvement"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-[#3DCD58]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading / Thinking Animation */}
        {isTyping && (
          <div className="max-w-md mr-auto animate-in fade-in py-1">
            <AiLoadingAnimation
              title="Google Gemini is Reasoning..."
              subtitle="Synthesizing BMS telemetry, chillers, and PG&E tariff schedules"
              steps={[
                'Querying Google Gemini 2.5 Flash model...',
                'Correlating actual demand vs baseline kW...',
                'Evaluating Chiller VSD & HVAC setpoint optimization...',
                'Formulating mathematically grounded recommendations...',
              ]}
              size="sm"
            />
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Fixed Bottom Input Area */}
      <div className="p-4 bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-slate-800 transition-colors">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative max-w-3xl mx-auto flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask EcoWise Copilot about HVAC, energy spikes, tariffs..."
            className="w-full pl-4 pr-24 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3DCD58] focus:bg-white dark:focus:bg-slate-850 transition-all shadow-2xs"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice input'}
              aria-label="Toggle voice input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`p-2 rounded-xl transition-all ${
                inputValue.trim() && !isTyping
                  ? 'bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 shadow-xs cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2">
          EcoWise Copilot analyzes submeters, chillers, and tariffs. Verify critical setpoints before deployment.
        </p>
      </div>
    </div>
  );
};
