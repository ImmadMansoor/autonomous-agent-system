import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Shield, RefreshCw, Cpu, Database, Search } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  category: "PRICING" | "LOGISTICS" | "GUARDRAIL" | "TELEMETRY";
  sector: string;
  message: string;
  status: "SUCCESS" | "BLOCKED" | "INTERVENED";
}

export default function AgentLogs() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const staticLogs: LogEntry[] = [
    {
      id: "log-1",
      timestamp: "19:42:01",
      category: "PRICING",
      sector: "Sector G-13",
      message: "Optimized 'Iced Matcha Latte' base yield by +18% based on rising localized humidity vector (85% rh).",
      status: "SUCCESS"
    },
    {
      id: "log-2",
      timestamp: "19:41:45",
      category: "TELEMETRY",
      sector: "Sector F-11",
      message: "Received local demand signal array [410, 480, 520, 610] from event and weather context feeds.",
      status: "SUCCESS"
    },
    {
      id: "log-3",
      timestamp: "19:39:20",
      category: "GUARDRAIL",
      sector: "Sector S-22",
      message: "Blocked proposed surge rate (+55%) on espresso units. Max Surge Price Tolerance limit (25%) model breached.",
      status: "BLOCKED"
    },
    {
      id: "log-4",
      timestamp: "19:38:12",
      category: "LOGISTICS",
      sector: "Central Depot",
      message: "Triggered early stock transfer requisition (40 units) for bakery cold chain before buffer drops below 10%.",
      status: "SUCCESS"
    },
    {
      id: "log-5",
      timestamp: "19:37:05",
      category: "PRICING",
      sector: "Sector H-9",
      message: "Reduced cold brew extraction prices by 12% following local solar irradiance plunge (cloud ingress detected).",
      status: "SUCCESS"
    },
    {
      id: "log-6",
      timestamp: "19:35:40",
      category: "GUARDRAIL",
      sector: "Sector G-13",
      message: "Adjusted stock dispatch weights to favor automated resilience algorithm. Manual backup trigger averted.",
      status: "INTERVENED"
    },
    {
      id: "log-7",
      timestamp: "19:33:14",
      category: "TELEMETRY",
      sector: "Central Depot",
      message: "Calculated ambient local windchill factors corresponding to warm pastry demand spikes (+15%).",
      status: "SUCCESS"
    }
  ];

  const [logs, setLogs] = useState<LogEntry[]>(staticLogs);

  // Automatically insert a new random log every 7 seconds to simulate real-time stream
  useEffect(() => {
    const categories: ("PRICING" | "LOGISTICS" | "GUARDRAIL" | "TELEMETRY")[] = [
      "PRICING",
      "LOGISTICS",
      "GUARDRAIL",
      "TELEMETRY"
    ];
    const sectors = ["Sector G-G1", "Sector F-11", "Sector H-9", "Central Depot", "Zone Core-S"];
    const messages = [
      "Optimized croissant inventory multipliers using simulated demand elasticity forecasts.",
      "Inbound telemetry stream parsed: coffee bean temperatures consistent at 22.4°C.",
      "Stock buffer limits updated in the central planning model.",
      "Averted surge pricing bubble in espresso categories due to automated system baseline adjustments.",
      "Re-balanced stock thresholds based on weekend commuter bottleneck predictions."
    ];
    const statuses: ("SUCCESS" | "BLOCKED" | "INTERVENED")[] = ["SUCCESS", "SUCCESS", "BLOCKED", "INTERVENED"];

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        category: randomCategory,
        sector: sectors[Math.floor(Math.random() * sectors.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 14)]);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const categoryMatch = selectedCategory === "ALL" || log.category === selectedCategory;
    const searchMatch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.category.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <section id="agent-logs" className="py-20 px-4 sm:px-6 relative bg-[#f7f9fb] border-b border-[#bcc9c6]/40">
      <div className="max-w-[1100px] mx-auto">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1 shadow-xs border border-[#bcc9c6]/50 text-xs font-semibold text-[#ba1a1a] uppercase tracking-wider mb-4">
              <Terminal className="w-3.5 h-3.5" />
              <span>Realtime Audit Logs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#191c1e]">
              Telemetry & action <br className="hidden sm:inline" />
              stream <span className="font-serif italic text-emerald-800">autopilot</span> logs
            </h2>
            <p className="mt-4 text-[#3d4947] text-sm sm:text-base font-medium">
              Audit the core algorithm actions as they occur. Filter categories below to dissect individual mathematical operations, secure guardrails, or stream buffers.
            </p>
          </div>

          {/* Search bar & statistics overview */}
          <div className="bg-white rounded-2xl p-4 border border-[#bcc9c6] shadow-xs flex items-center gap-3 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-[#3d4947] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit parameters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-neutral-50 rounded-xl border border-neutral-250 text-xs font-semibold text-[#191c1e] w-[200px] sm:w-[240px] focus:outline-none focus:border-[#00685f] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Categories togglers */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {["ALL", "PRICING", "LOGISTICS", "GUARDRAIL", "TELEMETRY"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-[#191c1e] text-white"
                  : "bg-white text-[#3d4947] border border-[#bcc9c6] hover:bg-neutral-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Interactive Logging Output panel */}
        <div className="bg-white border border-[#bcc9c6] rounded-3xl overflow-hidden shadow-xs">

          {/* Mock Console Header */}
          <div className="bg-neutral-100 px-6 py-3 border-b border-[#bcc9c6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#00685f]" />
              <span className="font-mono text-[10px] uppercase font-bold text-[#3d4947] tracking-wider ml-2">
                MenuMind Central Solver Shell
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-[#3d4947] font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live Feed
              </span>
              <span>UTC [LOCAL TIME]</span>
            </div>
          </div>

          {/* Lines Loop */}
          <div className="divide-y divide-neutral-100 max-h-[460px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  let badgeColor = "text-[#00685f] bg-[#e0f1ee]/50";
                  if (log.category === "GUARDRAIL") badgeColor = "text-[#ba1a1a] bg-rose-50";
                  if (log.category === "LOGISTICS") badgeColor = "text-amber-800 bg-amber-50";
                  if (log.category === "TELEMETRY") badgeColor = "text-[#00628d] bg-blue-50";

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="px-6 py-4 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 hover:bg-neutral-50/50 transition-colors"
                    >
                      {/* Left: Time & Categories */}
                      <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 sm:gap-1.5 shrink-0 w-full sm:w-[130px]">
                        <span className="font-mono text-xs font-bold text-[#3d4947]">
                          {log.timestamp}
                        </span>
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeColor}`}>
                          {log.category}
                        </span>
                      </div>

                      {/* Middle: Log message content */}
                      <div className="flex-1">
                        <span className="inline-block text-[10px] font-mono font-bold text-[#3d4947] uppercase tracking-wider mb-0.5">
                          {log.sector}
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-[#191c1e] leading-relaxed">
                          {log.message}
                        </p>
                      </div>

                      {/* Right: Operational Status */}
                      <div className="shrink-0 pt-0.5">
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : log.status === "BLOCKED"
                              ? "bg-rose-50 text-[#ba1a1a] border-rose-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <span className="text-xs font-semibold text-[#3d4947]">
                    No corresponding audit operations detected. Try altering filters or search criteria.
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
