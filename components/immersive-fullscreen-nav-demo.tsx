"use client";

import ImmersiveFullscreenNav from "@/components/ui/immersive-full-screen-nav";

export default function ImmersiveFullscreenNavDemo() {
  return (
    <div className="w-full min-w-0">
      <ImmersiveFullscreenNav
        navConfig={{
          brand: "CXPulse",
          brandHref: "#",
          overlayBg: "#060913",
          clipOrigin: "bottom",
          openDuration: 0.8,
          closeDuration: 0.8,
        }}
        navContent={{
          agencyName: "CXPulse® Intelligence",
          tagline: "Autonomous Customer Experience & Neural Telemetry",
          location: "San Francisco & Global Enterprise Hubs",
          links: [
            { label: "Intelligence", href: "#features" },
            { label: "Global Telemetry", href: "#globe-telemetry" },
            { label: "CX Radar", href: "#radar-preview" },
            { label: "Executive Dashboard", href: "#app" },
          ],
          images: [
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
          ],
          socials: [
            { type: "instagram", href: "#" },
            { type: "twitter", href: "#" },
            { type: "linkedin", href: "#" },
          ],
        }}
      />

      <main className="flex h-screen flex-col items-center justify-center gap-4 bg-[#060913] px-6 text-center text-white">
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-400">Navigation</p>
        <h1 className="max-w-2xl text-[6vw] font-extrabold tracking-tight leading-tight max-md:text-[8vw]">
          Immersive Full Screen Nav
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
          Click the menu trigger — the panel wipes open via clip-path, then the brand block, links, images, and
          socials reveal in sequence.
        </p>
      </main>
    </div>
  );
}
