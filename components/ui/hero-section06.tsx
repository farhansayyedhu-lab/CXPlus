import { ArrowRightIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface OrbitingCirclesProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  iconSize?: number;
  speed?: number;
  stroke?: string;
}

export function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 20,
  radius = 160,
  path = true,
  iconSize = 30,
  speed = 1,
  stroke = "currentColor",
  ...props
}: OrbitingCirclesProps) {
  const calculatedDuration = duration / speed;
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className={cn("stroke-white/10 stroke-1", stroke && stroke)}
            strokeDasharray="5 5"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}
      {React.Children.map(children, (child, index) => {
        const angle = (360 / React.Children.count(children)) * index;
        return (
          <div
            style={
              {
                "--duration": calculatedDuration,
                "--radius": radius,
                "--angle": angle,
                "--icon-size": `${iconSize}px`,
              } as React.CSSProperties
            }
            className={cn(
              `absolute flex size-[var(--icon-size)] transform-gpu animate-orbit items-center justify-center rounded-full`,
              { "[animation-direction:reverse]": reverse },
              className,
            )}
            {...props}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}

export default function HeroSection_06() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full py-20 bg-[#060913] text-white overflow-hidden">
      <div className="absolute flex lg:hidden size-40 rounded-full bg-blue-500 blur-[10rem] top-0 left-1/2 -translate-x-1/2 -z-10"></div>
      <div className="flex flex-col items-center justify-center gap-y-8 relative max-w-7xl mx-auto px-4">
        <OrbitingCircles speed={0.5} radius={300}></OrbitingCircles>
        <OrbitingCircles speed={0.25} radius={400}></OrbitingCircles>
        <OrbitingCircles speed={0.1} radius={500}></OrbitingCircles>

        <div className="flex flex-col items-center justify-center text-center gap-y-4 bg-background/0 relative z-10">
          <button className="group relative grid overflow-hidden rounded-full px-2 py-1 shadow-[0_1000px_0_0_hsl(0_0%_15%)_inset] transition-colors duration-200 mx-auto">
            <span>
              <span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
            </span>
            <span className="backdrop absolute inset-[1px] rounded-full bg-[#0B0F19] transition-colors duration-200 group-hover:bg-neutral-800" />
            <span className="z-10 py-0.5 text-sm text-neutral-100 flex items-center">
              <span className="px-2 py-[0.5px] h-[18px] tracking-wide flex items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-teal-600 text-[9px] font-medium mr-2 text-white">
                NEW
              </span>
              CXPulse 2.0 with Real-Time Customer Radar is Live
            </span>
          </button>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-center !leading-tight max-w-4xl mx-auto">
            Supercharge customer retention with <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Smart AI Solutions</span>
          </h1>
          <p className="max-w-xl mx-auto mt-2 text-base lg:text-lg text-center text-slate-400">
            Intelligent neural telemetry designed to decode sentiment, prioritize tickets, automate workflows, and eliminate customer churn.
          </p>

          <div className="flex items-center justify-center mt-6 gap-x-4 z-20">
            <a href="#app" className="flex items-center gap-2 group">
              <Button size="lg" className="rounded-xl">
                Explore CXPulse Live
                <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-all duration-300" />
              </Button>
            </a>
            <a
              href="#login"
              className="flex items-center gap-2 group border border-white/10 rounded-xl"
            >
              <Button
                size="lg"
                className="rounded-xl bg-white/5 text-white hover:bg-white/10"
              >
                Create Free Account
              </Button>
            </a>
          </div>

          <div className="relative rounded-xl lg:rounded-[32px] border border-white/12 p-2 backdrop-blur-lg mt-10 max-w-6xl mx-auto shadow-2xl">
            <div className="absolute top-1/8 left-1/2 -z-10 bg-gradient-to-r from-sky-500 to-blue-600 w-1/2 lg:w-3/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[4rem] lg:blur-[10rem] animate-image-glow"></div>
            <div className="hidden lg:block absolute -top-1/8 left-1/2 -z-20 bg-blue-600 w-1/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[10rem] animate-image-glow"></div>

            <div className="rounded-lg lg:rounded-[22px] border border-white/10 bg-[#0B0F19] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&auto=format&fit=crop&q=80"
                alt="CXPulse AI Executive Dashboard"
                width={1920}
                height={1080}
                className="rounded-lg lg:rounded-[20px] object-cover w-full h-auto"
              />
            </div>
          </div>
          <div className="bg-gradient-to-t from-[#060913] to-transparent absolute bottom-0 inset-x-0 w-full h-1/3 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
