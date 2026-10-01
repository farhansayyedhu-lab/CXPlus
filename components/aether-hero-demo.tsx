import { AetherHero } from "@/components/ui/aether-hero";

export default function DemoOne() {
  return (
    <AetherHero
      title="Build launch-grade UI in hours."
      subtitle="Animated WebGL backdrop, crisp type, and accessible CTAs. Drop it into any Next.js page."
      ctaLabel="Explore Docs"
      ctaHref="#docs"
      secondaryCtaLabel="GitHub"
      secondaryCtaHref="https://github.com/rahil1202"
      align="left"
      overlayGradient="linear-gradient(180deg, #000000bb 0%, #00000055 40%, transparent)"
    />
  );
}
