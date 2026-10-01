import React from "react";

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  avatarUrl: string;
}

export interface TestimonialRow {
  id: string;
  speed: string;
  direction: "left" | "right";
  testimonials: Testimonial[];
}

export interface TestimonialsData {
  title: string;
  subtitle: string;
  rows: TestimonialRow[];
}

export interface TestimonialCardProps {
  quote: string;
  authorName: string;
  authorTitle: string;
  avatarUrl: string;
}

export interface HorizontalScrollerProps {
  children: React.ReactNode;
  speed?: string;
  direction?: "left" | "right";
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  authorName,
  authorTitle,
  avatarUrl,
}) => {
  return (
    <div className="testimonial-card flex w-96 flex-shrink-0 flex-col items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-indigo-500/40 hover:bg-white/[0.06]">
      <p className="text-base leading-relaxed text-slate-200">
        "{quote}"
      </p>

      <div className="mt-4 flex items-center gap-3.5">
        <img
          src={avatarUrl}
          alt={authorName}
          className="h-11 w-11 rounded-full border border-indigo-500/30 object-cover"
        />

        <div>
          <h4 className="text-sm font-bold text-white">
            {authorName}
          </h4>

          <p className="text-xs text-slate-400">
            {authorTitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export const HorizontalScroller: React.FC<HorizontalScrollerProps> = ({
  children,
  speed = "35s",
  direction = "left",
}) => {
  const animationClass =
    direction === "right"
      ? "animate-scroll-horizontal-reverse"
      : "animate-scroll-horizontal";

  return (
    <div className="group relative w-full overflow-hidden">
      <div
        className={`flex ${animationClass}`}
        style={
          {
            "--scroll-duration": speed,
          } as React.CSSProperties
        }
      >
        <div className="flex items-stretch justify-center gap-6 px-3">
          {children}
        </div>

        <div
          className="flex items-stretch justify-center gap-6 px-3"
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export const defaultCXPulseTestimonials: TestimonialsData = {
  title: "Trusted by Modern CX & Retention Leaders",
  subtitle: "See how fast-moving support and customer success teams eliminate churn with autonomous AI sentiment detection and instant proactive response.",
  rows: [
    {
      id: "row-1",
      speed: "32s",
      direction: "left",
      testimonials: [
        {
          id: "t-1",
          quote: "Seeing customer sentiment and risk in one place completely changed how our support team prioritizes critical enterprise tickets.",
          authorName: "Sarah Jenkins",
          authorTitle: "VP of Customer Experience at CloudScale",
          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
        },
        {
          id: "t-2",
          quote: "Instead of reading every conversation manually, we immediately identify which accounts have high churn probability before SLAs breach.",
          authorName: "David Chen",
          authorTitle: "Head of Support Engineering at NexusHQ",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
        },
        {
          id: "t-3",
          quote: "The AI response suggestions save our agents 18+ hours weekly while keeping tone empathetic and customized to client contract history.",
          authorName: "Elena Rostova",
          authorTitle: "Director of Retention at FinEdge Global",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        },
      ],
    },
    {
      id: "row-2",
      speed: "36s",
      direction: "right",
      testimonials: [
        {
          id: "t-4",
          quote: "The CX Radar identified a subtle delivery delay complaint pattern affecting 18 accounts that saved us over $380,000 in at-risk ARR.",
          authorName: "Marcus Vance",
          authorTitle: "Chief Customer Officer at ApexLogistics",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
        },
        {
          id: "t-5",
          quote: "Autonomous auto-resolve handles our repetitive tier-1 questions with 94% CSAT, freeing our team for strategic customer partnerships.",
          authorName: "Maya Patel",
          authorTitle: "Global CX Operations Lead at Omnia SaaS",
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
        },
        {
          id: "t-6",
          quote: "Real-time telemetry and 3D customer hub monitoring gave our executive team instant visibility during our peak Q4 season.",
          authorName: "Julian Thorne",
          authorTitle: "SVP of Operations at NovaCommerce",
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
        },
      ],
    },
  ],
};

export default function TestimonialsSection({
  data = defaultCXPulseTestimonials,
}: {
  data?: TestimonialsData;
}) {
  return (
    <section className="testimonials-section relative flex w-full max-w-7xl flex-col items-center gap-12 overflow-hidden px-4 py-16 sm:px-6 lg:px-10">
      <div className="z-10 flex max-w-2xl flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          Customer Voice & Retention Stories
        </div>

        <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
          {data.title}
        </h2>

        <p className="text-sm text-slate-400 sm:text-base">
          {data.subtitle}
        </p>
      </div>

      <div className="z-10 flex w-full max-w-6xl flex-col gap-6">
        {data.rows.map((row) => (
          <HorizontalScroller
            key={row.id}
            speed={row.speed}
            direction={row.direction}
          >
            {row.testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                quote={testimonial.quote}
                authorName={testimonial.authorName}
                authorTitle={testimonial.authorTitle}
                avatarUrl={testimonial.avatarUrl}
              />
            ))}
          </HorizontalScroller>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 85% 67% at 50% 100%, rgba(99,102,241,0.15) 0%, transparent 60%)",
          zIndex: 0,
        }}
      />
    </section>
  );
}
