"use client";

import { useEffect, useRef } from "react";

/**
 * Full-page animated dot field. White dots drift slowly upward-right,
 * twinkle, and gently repel from the cursor. Fixed behind all content.
 */
export default function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const mouse = { x: -9999, y: -9999 };

    type Dot = {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      base: number; // base opacity
      phase: number; // twinkle phase
    };
    let dots: Dot[] = [];

    const spawn = () => {
      const count = Math.min(160, Math.floor((w * h) / 14000));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.4,
        vx: 0.05 + Math.random() * 0.15,
        vy: -(0.03 + Math.random() * 0.12),
        base: 0.08 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawn();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const t = Date.now() / 1000;
      const ink = document.documentElement.classList.contains("light")
        ? "0,0,0"
        : "255,255,255";

      for (const d of dots) {
        if (!prefersReduced) {
          d.x += d.vx;
          d.y += d.vy;

          // gentle cursor repulsion
          const dx = d.x - mouse.x;
          const dy = d.y - mouse.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 16900) {
            const dist = Math.sqrt(dist2) || 1;
            const force = ((130 - dist) / 130) * 0.6;
            d.x += (dx / dist) * force;
            d.y += (dy / dist) * force;
          }

          // wrap around edges
          if (d.x > w + 4) d.x = -4;
          if (d.x < -4) d.x = w + 4;
          if (d.y < -4) d.y = h + 4;
          if (d.y > h + 4) d.y = -4;
        }

        const twinkle = prefersReduced
          ? 1
          : 0.65 + 0.35 * Math.sin(t * 1.5 + d.phase);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink},${(d.base * twinkle).toFixed(3)})`;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReduced) raf = requestAnimationFrame(draw);
    };

    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("mouseout", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
