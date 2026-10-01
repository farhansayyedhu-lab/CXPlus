'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface HolographicBeamsProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: number;
  speed?: number;
  aberration?: number;
  opacity?: number;
  className?: string;
  glowColor?: string;
}

interface Beam {
  x: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
  hueOffset: number;
  phase: number;
  wavelength: number;
  verticalSpeed: number;
}

export function HolographicBeams({
  density = 18,
  speed = 0.55,
  aberration = 2,
  opacity = 30,
  className,
  ...props
}: HolographicBeamsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let beams: Beam[] = [];
    let time = 0;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const effectiveSpeed = prefersReducedMotion ? 0.05 : speed;

    const isMobile = window.innerWidth < 768;
    const effectiveDensity = isMobile ? Math.min(density, 10) : density;

    const createBeams = () => {
      beams = [];
      const count = Math.max(6, Math.floor((width / 100) * (effectiveDensity / 10)));
      for (let i = 0; i < count; i++) {
        beams.push({
          x: Math.random() * width,
          width: Math.random() * 90 + 35,
          height: height * (0.65 + Math.random() * 0.7),
          speed: (0.3 + Math.random() * 0.7) * effectiveSpeed,
          opacity: 0.15 + Math.random() * 0.4,
          hueOffset: Math.random() * 40 - 20,
          phase: Math.random() * Math.PI * 2,
          wavelength: 0.002 + Math.random() * 0.004,
          verticalSpeed: (0.2 + Math.random() * 0.5) * effectiveSpeed,
        });
      }
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      createBeams();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      time += 0.016;

      // Dark background fill
      ctx.fillStyle = '#030712'; // Deepest navy black
      ctx.fillRect(0, 0, width, height);

      // Global composite for RGB additive beam blending
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const masterAlpha = Math.min(1, Math.max(0, opacity / 100));

      for (let i = 0; i < beams.length; i++) {
        const b = beams[i];
        const driftX = b.x + Math.sin(time * b.speed + b.phase) * 60;
        const driftY = (time * b.verticalSpeed * 30 + b.phase * 50) % (height + 200) - 100;

        // Draw RGB chromatic channels (Red / Blue with Cyan / White core)
        // Red channel offset (-aberration)
        const redGrad = ctx.createLinearGradient(
          driftX - b.width * 0.45 - aberration,
          0,
          driftX + b.width * 0.45 - aberration,
          height
        );
        redGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
        redGrad.addColorStop(0.2, `rgba(239, 68, 68, ${0.28 * b.opacity * masterAlpha})`);
        redGrad.addColorStop(0.5, `rgba(244, 63, 94, ${0.42 * b.opacity * masterAlpha})`);
        redGrad.addColorStop(0.8, `rgba(225, 29, 72, ${0.25 * b.opacity * masterAlpha})`);
        redGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = redGrad;
        ctx.fillRect(driftX - b.width - aberration, 0, b.width * 2, height);

        // Blue / Indigo channel offset (+aberration)
        const blueGrad = ctx.createLinearGradient(
          driftX - b.width * 0.45 + aberration,
          0,
          driftX + b.width * 0.45 + aberration,
          height
        );
        blueGrad.addColorStop(0, 'rgba(59, 130, 246, 0)');
        blueGrad.addColorStop(0.2, `rgba(99, 102, 241, ${0.35 * b.opacity * masterAlpha})`);
        blueGrad.addColorStop(0.5, `rgba(139, 92, 246, ${0.45 * b.opacity * masterAlpha})`);
        blueGrad.addColorStop(0.8, `rgba(168, 85, 247, ${0.30 * b.opacity * masterAlpha})`);
        blueGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.fillStyle = blueGrad;
        ctx.fillRect(driftX - b.width + aberration, 0, b.width * 2, height);

        // Cyan / White Core beam
        const coreGrad = ctx.createLinearGradient(
          driftX - b.width * 0.15,
          0,
          driftX + b.width * 0.15,
          height
        );
        coreGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        coreGrad.addColorStop(0.3, `rgba(147, 197, 253, ${0.40 * b.opacity * masterAlpha})`);
        coreGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.55 * b.opacity * masterAlpha})`);
        coreGrad.addColorStop(0.7, `rgba(165, 243, 252, ${0.35 * b.opacity * masterAlpha})`);
        coreGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.fillStyle = coreGrad;
        ctx.fillRect(driftX - b.width * 0.35, 0, b.width * 0.7, height);
      }

      ctx.restore();

      // Subtle scanline overlay
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.012)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1);
      }
      ctx.restore();

      // Vignette around the edges
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.35,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(0.8, 'rgba(2, 6, 23, 0.45)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.85)');

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [density, speed, aberration, opacity]);

  return (
    <div
      className={cn('relative min-h-screen overflow-hidden bg-black pointer-events-none', className)}
      {...props}
    >
      {/* Holographic RGB Beams Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full block pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

export default HolographicBeams;
