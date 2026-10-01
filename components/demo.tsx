"use client";

import * as React from "react";
import { BeamSearch } from "@/components/ui/beam-search";

const CX_AUTONOMOUS_ENTITIES = [
  "Sentiment Drift & Latent Distress",
  "P1 Churn Risk Prevention Matrix",
  "Autonomous Courtesy Credit Resolution",
  "Predictive SLA & Retention Vector",
  "Neural Intent Clustering (15ms)",
  "Real-Time Orbital Customer Mesh",
  "Executive Churn Causality Breakdown",
  "Gemini Multi-Turn Response Composer",
  "Voice & Telemetry Anomaly Detection",
  "High-Value ARR Account Safeguard",
];

export default function BeamSearchDemo() {
  const [query, setQuery] = React.useState("");
  const matches = CX_AUTONOMOUS_ENTITIES.filter((item) =>
    item.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="flex w-full flex-col items-center gap-5 py-10 bg-white text-neutral-900 rounded-2xl shadow-2xl p-8 border border-black/10">
      <div className="w-full max-w-[540px]">
        <div className="mb-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Autonomous CX Intelligence</span>
          <h3 className="text-xl font-bold text-neutral-900 mt-1">Real-Time Telemetry & Entity Search</h3>
        </div>

        <BeamSearch
          placeholder="Search autonomous intelligence, sentiment, SLA..."
          onChange={setQuery}
          trailing={
            <kbd className="rounded-md border border-black/10 px-1.5 py-0.5 font-mono text-[11px] text-neutral-500">
              ⌘K
            </kbd>
          }
        />

        <ul className="mt-4 grid grid-cols-2 gap-1.5 text-sm text-neutral-700">
          {matches.slice(0, 6).map((item) => (
            <li key={item} className="truncate rounded-lg bg-neutral-50 border border-black/5 px-2.5 py-1.5 font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer">
              ✨ {item}
            </li>
          ))}
          {matches.length === 0 && (
            <li className="col-span-2 px-3 py-2 text-neutral-400 text-center">
              No matching CX intelligence records found
            </li>
          )}
        </ul>
      </div>
      <p className="text-xs text-neutral-500">
        Focus the field — the traveling beam lights up along the bottom edge in real-time.
      </p>
    </div>
  );
}
