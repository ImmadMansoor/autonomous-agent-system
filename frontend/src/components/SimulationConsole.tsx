import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CloudSun, CalendarCheck, Zap, Flame, Smile, AlertCircle, ArrowRight } from "lucide-react";

interface SimulationEvent {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  weather: string;
  pedestrians: string;
  impactColor: string;
  menuModifier: {
    [key: string]: {
      priceChangePercent: number;
      reason: string;
      stockLevel: number;
    };
  };
}

export default function SimulationConsole() {
  const eventsList: SimulationEvent[] = [
    {
      id: "heatwave_shift",
      name: "Heatwave Emergency Surge",
      icon: Flame,
      description: "Severe local temperature spike detected (+12°C). High humidity triggers massive thermal offsets.",
      weather: "34°C, Radiant Heat",
      pedestrians: "Sparse Outdoors, High Transit Hub density",
      impactColor: "from-amber-500 to-orange-600",
      menuModifier: {
        "Iced Matcha Latte": { priceChangePercent: 35, reason: "Hydration peak demand; inventory at optimal temperature limit.", stockLevel: 72 },
        "Double Espresso": { priceChangePercent: -15, reason: "Reduced hot extraction demand; automated downward balancing.", stockLevel: 98 },
        "Warm Butter Croissant": { priceChangePercent: -10, reason: "Breakfast bakery clearance trigger activated early.", stockLevel: 15 },
        "Cold Brew Tonic": { priceChangePercent: 40, reason: "Extreme cold extractions priority surge active.", stockLevel: 44 }
      }
    },
    {
      id: "rainy_slumber",
      name: "Rainy Sunday Stall",
      icon: CloudSun,
      description: "Unplanned morning thunderstorm. Outdoor foot traffic plunges, but indoor localized dwelling spikes.",
      weather: "14°C, Continuous Rain",
      pedestrians: "Ultra Dwell (+45 mins average)",
      impactColor: "from-blue-500 to-indigo-600",
      menuModifier: {
        "Iced Matcha Latte": { priceChangePercent: -20, reason: "Chilled matcha demand reallocation discount active.", stockLevel: 92 },
        "Double Espresso": { priceChangePercent: 25, reason: "High-density thermal comfort coffee spike.", stockLevel: 55 },
        "Warm Butter Croissant": { priceChangePercent: 30, reason: "Companion pastry demand surges by 45%.", stockLevel: 8 },
        "Cold Brew Tonic": { priceChangePercent: -15, reason: "Reduced iced beverage priority calibration.", stockLevel: 80 }
      }
    },
    {
      id: "transit_strike",
      name: "Transit Strike Delay",
      icon: AlertCircle,
      description: "Local subway bypass line closed. Hundreds of commuters bottleneck adjacent to cafe parameters.",
      weather: "20°C, Overcast",
      pedestrians: "Bottleneck Surge (+320%)",
      impactColor: "from-rose-500 to-red-600",
      menuModifier: {
        "Iced Matcha Latte": { priceChangePercent: 18, reason: "High throughput beverage priority queue engaged.", stockLevel: 30 },
        "Double Espresso": { priceChangePercent: 20, reason: "Instant fuel espresso queue prioritizing speed.", stockLevel: 25 },
        "Warm Butter Croissant": { priceChangePercent: 15, reason: "Grab-and-go stock levels dropping rapidly.", stockLevel: 19 },
        "Cold Brew Tonic": { priceChangePercent: 22, reason: "Nitro taps optimized for high processing velocity.", stockLevel: 38 }
      }
    }
  ];

  const [activeEvent, setActiveEvent] = useState<SimulationEvent>(eventsList[0]);
  const [selectedItemName, setSelectedItemName] = useState<string>("Cold Brew Tonic");

  const basePrices: { [key: string]: number } = {
    "Iced Matcha Latte": 5.50,
    "Double Espresso": 3.20,
    "Warm Butter Croissant": 4.50,
    "Cold Brew Tonic": 6.00
  };

  return (
    <section id="simulator" className="py-20 px-4 sm:px-6 relative bg-[#f7f9fb] border-y border-[#bcc9c6]/40">
      <div className="max-w-[1100px] mx-auto">
        
        {/* Core Header with Smooth Reveals */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1 shadow-xs border border-[#bcc9c6]/50 text-xs font-semibold text-[#00628d] uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Telemetry Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#191c1e]">
              Watch MenuMind think <br className="hidden sm:inline" />
              and <span className="font-serif italic text-[#00628d]">reconfigure</span> prices
            </h2>
            <p className="mt-4 text-[#3d4947] text-sm sm:text-base font-medium">
              Activate real-world variables. Observe how our state-space agent dynamically parses sensor feeds into Instant Menu pricing and stock re-routing.
            </p>
          </div>

          {/* Selector Switch with Premium Pill layout */}
          <div className="flex flex-col sm:flex-row gap-2 bg-white/80 p-1.5 rounded-2xl border border-[#bcc9c6] shadow-xs">
            {eventsList.map((evt) => {
              const Icon = evt.icon;
              const isSelected = activeEvent.id === evt.id;
              return (
                <button
                  key={evt.id}
                  onClick={() => {
                    setActiveEvent(evt);
                    // Select item present in the list
                    const firstItem = Object.keys(evt.menuModifier)[0];
                    if (firstItem) setSelectedItemName(firstItem);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-[#191c1e] text-white shadow-xs"
                      : "text-[#3d4947] hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{evt.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Simulator Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Active Event Environmental telemetry board (4 columns) */}
          <div className="lg:col-span-4 bg-white border border-[#bcc9c6] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${activeEvent.impactColor} animate-ping`} />
                <span className="text-xs font-bold text-[#3d4947] uppercase tracking-widest">
                  Live Sensor Feed
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#191c1e] tracking-tight leading-snug">
                {activeEvent.name}
              </h3>
              <p className="text-xs text-[#3d4947] mt-2 mb-6 leading-relaxed font-medium">
                {activeEvent.description}
              </p>

              <div className="space-y-4">
                <div className="bg-neutral-50 rounded-xl p-3 border border-[#bcc9c6]/30">
                  <span className="text-[10px] font-bold text-[#3d4947] block uppercase tracking-wider mb-0.5">
                    Micro-climate Status
                  </span>
                  <span className="text-sm font-bold text-[#00685f]">
                    {activeEvent.weather}
                  </span>
                </div>

                <div className="bg-neutral-50 rounded-xl p-3 border border-[#bcc9c6]/30">
                  <span className="text-[10px] font-bold text-[#3d4947] block uppercase tracking-wider mb-0.5">
                    Pedestrian Cohort Shift
                  </span>
                  <span className="text-sm font-bold text-[#00628d]">
                    {activeEvent.pedestrians}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Interactive SVG Flow visualizer line representing API stream */}
            <div className="mt-8 border-t border-[#bcc9c6]/20 pt-4">
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#3d4947] uppercase block mb-2">
                Neural Optimization Matrix (Dwell Factor)
              </span>
              <div className="h-10 bg-[#f2f4f6] rounded-xl flex items-center justify-around px-2 relative overflow-hidden">
                <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${activeEvent.impactColor} opacity-10 animate-pulse w-full`} />
                <svg className="w-full h-6 text-[#bcc9c6]" viewBox="0 0 200 40">
                  <path
                    d={`M 0 20 Q 30 ${activeEvent.id === 'heatwave_shift' ? '5 M 80 35 M 130 5 M 200 20' : activeEvent.id === 'rainy_slumber' ? '35 M 80 5 M 130 35 M 200 20' : '15 M 80 25 M 130 10 M 200 20'}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="stroke-[#00685f]/40"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Interactive Live Menu Item adjusting (8 columns) */}
          <div className="lg:col-span-8 bg-white border border-[#bcc9c6] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#bcc9c6]/30 pb-4 mb-6">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#3d4947] uppercase tracking-wider block">
                    Telemetry Dispatch Board
                  </span>
                  <h4 className="text-lg font-bold text-[#191c1e]">
                    Optimized Menu Yields
                  </h4>
                </div>
                <span className="text-xs bg-[#e0f1ee] text-[#00685f] px-3 py-1 rounded-full font-bold">
                  Autopilot Enabled
                </span>
              </div>

              {/* Items Table Grid */}
              <div className="space-y-3">
                {Object.keys(activeEvent.menuModifier).map((itemName) => {
                  const modifier = activeEvent.menuModifier[itemName];
                  const direction = modifier.priceChangePercent > 0 ? "up" : "down";
                  const basePrice = basePrices[itemName];
                  const adjustedPrice = basePrice * (1 + modifier.priceChangePercent / 100);
                  const isSelected = selectedItemName === itemName;

                  return (
                    <div
                      key={itemName}
                      onClick={() => setSelectedItemName(itemName)}
                      className={`group p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? "bg-[#00685f]/5 border-[#00685f] hover:border-[#00685f]"
                          : "bg-neutral-50/50 hover:bg-neutral-50 border-[#bcc9c6]/30 hover:border-[#bcc9c6]/80"
                      }`}
                    >
                      {/* Name / Info */}
                      <div className="flex items-start gap-3">
                        <div 
                          className={`mt-1 w-2.5 h-2.5 rounded-full ${
                            direction === "up" ? "bg-amber-500" : "bg-[#00628d]"
                          }`} 
                        />
                        <div>
                          <p className="text-sm font-bold text-[#191c1e] group-hover:text-[#00685f] transition-colors">
                            {itemName}
                          </p>
                          <span className="block text-[10px] uppercase font-bold text-[#3d4947] tracking-wider mt-0.5">
                            Realtime Stock Level: {modifier.stockLevel}%
                          </span>
                        </div>
                      </div>

                      {/* Micro visualizer line graph */}
                      <div className="hidden md:block w-32 h-6">
                        <svg className="w-full h-full" viewBox="0 0 100 24">
                          <path
                            d={direction === "up" ? "M 0 18 Q 30 18 50 10 T 100 4" : "M 0 6 Q 30 6 50 14 T 100 20"}
                            fill="none"
                            stroke={direction === "up" ? "#00685f" : "#00628d"}
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      {/* Pricing shift math */}
                      <div className="flex items-center gap-6 justify-between sm:justify-end shrink-0">
                        <div className="text-right">
                          <span className="text-xs text-[#3d4947] font-medium line-through block">
                            ${basePrice.toFixed(2)}
                          </span>
                          <span className="text-base font-bold text-[#191c1e]">
                            ${adjustedPrice.toFixed(2)}
                          </span>
                        </div>

                        {/* Adjust badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold leading-none inline-flex items-center gap-0.5 ${
                            direction === "up"
                              ? "bg-amber-50/80 text-amber-800 border border-amber-200"
                              : "bg-blue-50/80 text-[#00628d] border border-blue-200"
                          }`}
                        >
                          {direction === "up" ? "+" : ""}
                          {modifier.priceChangePercent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deep reasoning analyzer panel for selected item (glassy style) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedItemName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 rounded-2xl bg-[#f2f4f6]/80 backdrop-blur-md border border-[#bcc9c6] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                <div className="flex-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#3d4947] block mb-1">
                    Telemetry Solver Logic: {selectedItemName}
                  </span>
                  <p className="text-xs text-[#191c1e] font-semibold leading-relaxed">
                    "{activeEvent.menuModifier[selectedItemName]?.reason || 'Autonomous balancing limits matching historical baseline values.'}"
                  </p>
                </div>
                <button
                  type="button"
                  className="bg-[#191c1e] text-white hover:bg-neutral-850 px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all"
                  onClick={() => alert(`MenuMind Autopilot updated ${selectedItemName} across G-13 Sector outlets successfully.`)}
                >
                  <span>Dispatch Policy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>

      </div>
    </section>
  );
}
