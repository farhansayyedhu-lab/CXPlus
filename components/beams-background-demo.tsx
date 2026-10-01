import React from 'react';
import { HolographicBeams } from '@/components/ui/beams-background';

export default function BeamsBackgroundDemo() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Holographic background */}
      <HolographicBeams
        density={18}
        speed={0.55}
        aberration={2}
        opacity={30}
        className="fixed inset-0"
      />

      {/* Readability overlay */}
      <div className="fixed inset-0 z-[1] bg-black/55 pointer-events-none" />

      {/* Demo Dashboard Container */}
      <div className="relative z-10 p-8 max-w-7xl mx-auto text-white">
        <header className="p-6 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/[0.08] mb-8">
          <h1 className="text-2xl font-bold text-white">CXPulse Holographic Dashboard</h1>
          <p className="text-slate-400 text-sm">Autonomous CX Intelligence with Holographic RGB Beams</p>
        </header>
      </div>
    </div>
  );
}
