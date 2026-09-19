import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  FileSpreadsheet, 
  Calendar, 
  Leaf, 
  Zap, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Share2, 
  X,
  Printer,
  History,
  ShieldCheck,
  ChevronRight,
  ArrowDownToLine,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { reportsApi, formatErrorMessage } from '../../services/api.js';
import { SummarizeReportModal } from '../ai/SummarizeReportModal';

interface ReportCardItem {
  id: string;
  title: string;
  category: 'weekly' | 'monthly' | 'energy' | 'carbon';
  period: string;
  summary: string;
  metrics: { label: string; value: string; note?: string }[];
  fileSizePDF: string;
  fileSizeCSV: string;
  auditStandard: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const REPORT_CARDS: ReportCardItem[] = [
  {
    id: 'rep-weekly',
    title: 'Weekly Facility Performance Report',
    category: 'weekly',
    period: 'Sep 04 - Sep 11, 2026',
    summary: 'Executive weekly roundup covering chiller efficiency, peak surge shaving, and floor-level variance.',
    metrics: [
      { label: 'Total Energy', value: '10,340 kWh', note: '-6.4% vs last week' },
      { label: 'Cost Savings', value: '$842.50', note: 'Tariff arbitrage' },
      { label: 'CO₂ Avoided', value: '1,024 kg', note: 'Solar + Battery' },
    ],
    fileSizePDF: '2.4 MB',
    fileSizeCSV: '148 KB',
    auditStandard: 'ASHRAE Guideline 14',
    icon: Calendar,
    accentColor: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'rep-monthly',
    title: 'Monthly Executive Energy & ESG Review',
    category: 'monthly',
    period: 'August 2026 Full Month',
    summary: 'Comprehensive C-level sustainability dossier detailing ISO 50001 compliance and utility invoice reconciliation.',
    metrics: [
      { label: 'Monthly Draw', value: '42,850 kWh', note: '85.7% of budget' },
      { label: 'Net Invoiced', value: '$7,284.10', note: '-$1,140 vs budget' },
      { label: 'LEED Score', value: '94 / 100', note: 'Platinum verified' },
    ],
    fileSizePDF: '5.8 MB',
    fileSizeCSV: '820 KB',
    auditStandard: 'ISO 50001:2018 Certified',
    icon: FileText,
    accentColor: 'text-[#228035] bg-emerald-50 border-emerald-200',
  },
  {
    id: 'rep-energy',
    title: 'Deep-Dive Energy Submetering & Demand Audit',
    category: 'energy',
    period: 'Q3 2026 (YTD)',
    summary: 'Subsystem load disaggregation: Chiller plants, VAV terminal units, smart lighting, and Level-2 EV charging bays.',
    metrics: [
      { label: 'HVAC Plant COP', value: '5.20 COP', note: 'Optimal' },
      { label: 'Peak kW Capped', value: '284 kW', note: '-38 kW shaved' },
      { label: 'Avg Power Factor', value: '0.96 Lag', note: 'No penalty' },
    ],
    fileSizePDF: '4.1 MB',
    fileSizeCSV: '1.2 MB',
    auditStandard: 'Schneider EcoStruxure Power',
    icon: Zap,
    accentColor: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'rep-carbon',
    title: 'Certified Scope 1 & Scope 2 GHG Carbon Accounting',
    category: 'carbon',
    period: 'Fiscal Year 2026',
    summary: 'Third-party auditable greenhouse gas statement compliant with the GHG Protocol Corporate Standard.',
    metrics: [
      { label: 'Avoided CO₂e', value: '12.8 MT', note: 'Rooftop Solar PV' },
      { label: 'Tree Equivalents', value: '184 Trees', note: '10-yr offset' },
      { label: 'Scope 2 Factor', value: '0.384 kg/kWh', note: 'Regional grid' },
    ],
    fileSizePDF: '3.6 MB',
    fileSizeCSV: '410 KB',
    auditStandard: 'GHG Protocol & CDP Verified',
    icon: Leaf,
    accentColor: 'text-[#3DCD58] bg-emerald-50 border-emerald-200',
  },
];

const HISTORICAL_LOGS = [
  {
    id: 'hist-1',
    name: 'Weekly_Energy_Summary_W36_2026.pdf',
    type: 'Weekly Report',
    date: 'Sep 04, 2026',
    size: '2.1 MB',
    format: 'PDF',
  },
  {
    id: 'hist-2',
    name: 'August_2026_Full_ESG_Carbon_Statement.pdf',
    type: 'Monthly ESG',
    date: 'Sep 01, 2026',
    size: '5.6 MB',
    format: 'PDF',
  },
  {
    id: 'hist-3',
    name: 'EcoTower_Submeter_15Min_Interval_Data.csv',
    type: 'Energy Submetering',
    date: 'Aug 28, 2026',
    size: '1.4 MB',
    format: 'CSV',
  },
  {
    id: 'hist-4',
    name: 'Q2_2026_Carbon_Offset_Certification.pdf',
    type: 'Carbon Accounting',
    date: 'Jul 01, 2026',
    size: '3.2 MB',
    format: 'PDF',
  },
];

interface ReportsPageProps {
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onShowToast }) => {
  const [reports, setReports] = useState<ReportCardItem[]>(REPORT_CARDS);
  const [historicalLogs, setHistoricalLogs] = useState(HISTORICAL_LOGS);
  const [activePreview, setActivePreview] = useState<ReportCardItem | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [summarizeModalOpen, setSummarizeModalOpen] = useState(false);
  const [selectedReportForSummary, setSelectedReportForSummary] = useState<ReportCardItem | null>(null);

  // Fetch reports and history from FastAPI
  const loadReportsData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoadingReports(true);

    try {
      const [fetchedReports, fetchedHistory] = await Promise.all([
        reportsApi.getAll(),
        reportsApi.getHistory(),
      ]);

      if (Array.isArray(fetchedReports) && fetchedReports.length > 0) {
        // Map backend icon strings to Lucide components if needed
        const mapped = fetchedReports.map((r: any) => ({
          ...r,
          icon: r.category === 'weekly' ? Calendar : r.category === 'monthly' ? FileText : r.category === 'carbon' ? Leaf : Zap,
        }));
        setReports(mapped);
      }

      if (Array.isArray(fetchedHistory) && fetchedHistory.length > 0) {
        setHistoricalLogs(fetchedHistory);
      }

      if (isManual) {
        onShowToast('Synced live audit datasets from FastAPI', 'success');
      }
    } catch (err) {
      onShowToast(`Using cached reports: ${formatErrorMessage(err)}`, 'info');
    } finally {
      setIsLoadingReports(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  const handleDownload = async (report: ReportCardItem, format: 'pdf' | 'csv') => {
    const key = `${report.id}-${format}`;
    setDownloadingKey(key);
    onShowToast(`Preparing ${format.toUpperCase()} export via FastAPI: ${report.title}...`, 'info');

    try {
      await reportsApi.download(report.id, format);
      onShowToast(`Successfully downloaded ${format.toUpperCase()} for ${report.title}`, 'success');
    } catch (err) {
      onShowToast(`Download error: ${formatErrorMessage(err)}`, 'error');
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleGenerateOnDemand = async () => {
    setIsGenerating(true);
    try {
      const res = await reportsApi.generate('energy');
      onShowToast(`Generated on-demand ESG audit: ${res.report?.title || 'Certified Statement'}`, 'success');
      // Append to history
      if (res.report) {
        setHistoricalLogs((prev) => [
          {
            id: `hist-${Date.now()}`,
            name: `${res.report.title.replace(/\s+/g, '_')}.pdf`,
            type: 'On-Demand Audit',
            date: 'Today',
            size: '3.1 MB',
            format: 'PDF',
          },
          ...prev,
        ]);
      }
    } catch (err) {
      onShowToast(`Report generation error: ${formatErrorMessage(err)}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-[#3DCD58]/20 text-[#228035] dark:text-[#3DCD58]">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Energy & Sustainability Reports</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export certified analytical statements, LEED compliance audits, and submetering interval records
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadReportsData(true)}
            disabled={isRefreshing || isLoadingReports}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#3DCD58]' : ''}`} />
            <span>Sync FastAPI</span>
          </button>

          <button
            onClick={handleGenerateOnDemand}
            disabled={isGenerating}
            className="px-3.5 py-1.5 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 fill-slate-950 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Audit...' : 'Generate New Statement'}</span>
          </button>
        </div>
      </div>

      {/* Main 4 Report Cards Grid */}
      {isLoadingReports ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/90 dark:bg-[#0f172a]/95 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse h-64 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="grid grid-cols-3 gap-2 pt-4">
                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            const isPdfDownloading = downloadingKey === `${report.id}-pdf`;
            const isCsvDownloading = downloadingKey === `${report.id}-csv`;

          return (
            <div
              key={report.id}
              className="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#3DCD58]/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Icon + Period + Standard */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl border ${report.accentColor} dark:bg-slate-900/60 dark:border-slate-700 shadow-2xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        {report.period}
                      </span>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                        {report.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {report.summary}
                </p>

                {/* Key Metrics Chips */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {report.metrics.map((m) => (
                    <div key={m.label} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">{m.label}</span>
                      <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{m.value}</div>
                      {m.note && (
                        <span className="text-[9px] font-bold text-[#228035] dark:text-[#3DCD58] block mt-0.5 truncate">
                          {m.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3DCD58]" />
                    {report.auditStandard}
                  </span>
                  <span>PDF: {report.fileSizePDF} • CSV: {report.fileSizeCSV}</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedReportForSummary(report);
                      setSummarizeModalOpen(true);
                    }}
                    className="px-2.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[#228035] dark:text-[#3DCD58] border border-emerald-200 dark:border-emerald-800/60 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Summarize report with Gemini"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-[#3DCD58] text-[#228035] dark:text-[#3DCD58]" />
                    <span>AI Briefing</span>
                  </button>

                  <button
                    onClick={() => setActivePreview(report)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={isCsvDownloading}
                    onClick={() => handleDownload(report, 'csv')}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <FileSpreadsheet className={`w-3.5 h-3.5 text-emerald-600 dark:text-[#3DCD58] ${isCsvDownloading ? 'animate-spin' : ''}`} />
                    <span>{isCsvDownloading ? 'CSV...' : 'CSV'}</span>
                  </button>

                  <button
                    disabled={isPdfDownloading}
                    onClick={() => handleDownload(report, 'pdf')}
                    className="px-3.5 py-2 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Download className={`w-3.5 h-3.5 ${isPdfDownloading ? 'animate-bounce' : ''}`} />
                    <span>{isPdfDownloading ? 'Downloading...' : 'PDF'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* History Section: Historical Generated Reports */}
      <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
              Export History & Audit Archives
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{historicalLogs.length} Archived Statements</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {historicalLogs.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-900/60 px-2 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                  {item.format === 'CSV' ? (
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-[#3DCD58]" />
                  ) : (
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                    <span>{item.type}</span>
                    <span>•</span>
                    <span>Generated on {item.date}</span>
                    <span>•</span>
                    <span>{item.size}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownload({ id: item.id, title: item.name } as any, (item.format?.toLowerCase() === 'csv' ? 'csv' : 'pdf') as any)}
                className="self-end sm:self-auto px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 dark:text-[#3DCD58] bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-[#3DCD58]" />
                <span>Re-Download</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Report Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#228035] dark:text-[#3DCD58] bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Official Statement Preview
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-2">
                  {activePreview.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activePreview.period} • {activePreview.auditStandard}</p>
              </div>

              <button
                onClick={() => setActivePreview(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content Simulation */}
            <div className="my-6 p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-4 text-xs text-slate-700 dark:text-slate-300 font-mono">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2 text-slate-800 dark:text-slate-200">
                <span>FACILITY: EcoTower Delta (Main HQ)</span>
                <span>STATUS: CERTIFIED</span>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-white font-sans text-sm">Executive Summary</p>
                <p className="font-sans leading-relaxed text-slate-600 dark:text-slate-300">{activePreview.summary}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {activePreview.metrics.map((m) => (
                  <div key={m.label} className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{m.label}</div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white font-sans mt-0.5">{m.value}</div>
                    <div className="text-[9px] text-[#228035] dark:text-[#3DCD58] mt-0.5">{m.note}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                Audited in accordance with International Energy Agency (IEA) standards. Inverter telemetry logged via Modbus TCP.
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
              <button
                onClick={() => {
                  setSelectedReportForSummary(activePreview);
                  setSummarizeModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[#228035] dark:text-[#3DCD58] border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-[#3DCD58] text-[#228035] dark:text-[#3DCD58]" />
                <span>Executive AI Briefing</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePreview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownload(activePreview, 'csv');
                    setActivePreview(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-[#3DCD58]" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    handleDownload(activePreview, 'pdf');
                    setActivePreview(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#3DCD58] hover:bg-[#34b64b] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Certified PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Summarize Report Modal */}
      {selectedReportForSummary && (
        <SummarizeReportModal
          isOpen={summarizeModalOpen}
          onClose={() => setSummarizeModalOpen(false)}
          report={selectedReportForSummary}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
