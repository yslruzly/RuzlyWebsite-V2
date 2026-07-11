"use client";

import { useEffect, useRef } from "react";
import { MASK_B64, MASK_H, MASK_W } from "@/lib/land-mask";

// The spinning ASCII earth in the contact section. The continents are real
// shapes (a land mask baked into lib/land-mask.ts) and there's a blinking
// MANILA marker on home.
export default function AsciiGlobe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // On phones the globe is one still frame instead of spinning. Drawing
    // ~110 rows of text every single frame is too heavy for mobile Safari,
    // after a few seconds iOS would just kill the tab. A frozen globe still
    // shows the continents and the Manila marker so it's an okay trade.
    const isSmall = window.matchMedia("(max-width: 768px)").matches;
    const staticOnly = prefersReduced || isSmall;

    // fewer points on phones too, cheaper to draw
    const COLS = 110;
    const ROWS = 110;
    const LON_STEPS = isSmall ? 220 : 340;
    const LAT_STEPS = isSmall ? 130 : 210;
    const N = LON_STEPS * LAT_STEPS;

    const bin = atob(MASK_B64);
    const maskBytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) maskBytes[i] = bin.charCodeAt(i);

    const isLand = (lonDeg: number, latDeg: number) => {
      let x = (((lonDeg + 180) / 360) * (MASK_W - 1) + 0.5) | 0;
      let y = (((90 - latDeg) / 180) * (MASK_H - 1) + 0.5) | 0;
      if (x < 0) x = 0;
      if (x >= MASK_W) x = MASK_W - 1;
      if (y < 0) y = 0;
      if (y >= MASK_H) y = MASK_H - 1;
      const bitIdx = y * MASK_W + x;
      return (maskBytes[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1;
    };

    const MX = new Float32Array(N);
    const MY = new Float32Array(N);
    const MZ = new Float32Array(N);
    const LAND = new Uint8Array(N);
    {
      let idx = 0;
      for (let j = 0; j < LAT_STEPS; j++) {
        const v = j / (LAT_STEPS - 1);
        const latRad = (v - 0.5) * Math.PI;
        const latDeg = (latRad * 180) / Math.PI;
        const cosLat = Math.cos(latRad);
        const sinLat = Math.sin(latRad);
        for (let i = 0; i < LON_STEPS; i++) {
          const lonRad = (i / LON_STEPS) * Math.PI * 2 - Math.PI;
          const lonDeg = (lonRad * 180) / Math.PI;
          MX[idx] = cosLat * Math.sin(lonRad);
          MY[idx] = sinLat;
          MZ[idx] = cosLat * Math.cos(lonRad);
          LAND[idx] = isLand(lonDeg, latDeg);
          idx++;
        }
      }
    }

    // Manila, Philippines: 14.5995 N, 120.9842 E
    const manilaLat = (14.5995 * Math.PI) / 180;
    const manilaLon = (120.9842 * Math.PI) / 180;
    const manX = Math.cos(manilaLat) * Math.sin(manilaLon);
    const manY = Math.sin(manilaLat);
    const manZ = Math.cos(manilaLat) * Math.cos(manilaLon);

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    let cellSize = 8;
    let fontSize = 8;
    let rowScaleX = 1;

    const setFont = () => {
      ctx.font = `${fontSize}px ui-monospace, Menlo, Consolas, 'Liberation Mono', monospace`;
      ctx.textBaseline = "alphabetic";
    };

    const measureRowScale = () => {
      let sample = "";
      for (let k = 0; k < COLS; k++) sample += "#";
      const natural = ctx.measureText(sample).width;
      rowScaleX = (COLS * cellSize) / natural;
    };

    const resize = () => {
      const box = canvas.parentElement?.getBoundingClientRect();
      if (!box) return;
      const size = Math.min(box.width, box.height);
      cellSize = size / COLS;
      fontSize = Math.round(cellSize * 1.15);
      canvas.width = Math.round(COLS * cellSize * dpr);
      canvas.height = Math.round(ROWS * cellSize * dpr);
      canvas.style.width = `${COLS * cellSize}px`;
      canvas.style.height = `${ROWS * cellSize}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setFont();
      measureRowScale();
    };
    resize();
    window.addEventListener("resize", resize);

    const zbuf = new Float32Array(COLS * ROWS);
    const grid = new Uint8Array(COLS * ROWS);

    let lightX = 0.42;
    let lightY = 0.55;
    let lightZ = 0.72;
    {
      const len = Math.sqrt(lightX * lightX + lightY * lightY + lightZ * lightZ);
      lightX /= len;
      lightY /= len;
      lightZ /= len;
    }

    const TWO_PI = Math.PI * 2;
    const ROT_SPEED = staticOnly ? 0 : 0.26; // radians per second
    // start rotated so Manila faces you
    let theta = ((-manilaLon % TWO_PI) + TWO_PI) % TWO_PI;
    let t = 0;
    let lastNow: number | null = null;
    let raf = 0;

    // only spin while the globe is actually on screen and the tab is active.
    // it sits at the very bottom of the page, so without this check the heavy
    // draw loop would be running the whole time you're reading the hero,
    // burning battery on something you can't even see yet
    let inView = false;
    let running = false;

    const start = () => {
      if (running || document.hidden || !inView) return;
      running = true;
      lastNow = null;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    function frame(now: number) {
      if (!ctx || !running) return;
      if (lastNow === null) lastNow = now;
      let dt = (now - lastNow) / 1000;
      lastNow = now;
      if (dt < 0) dt = 0;
      if (dt > 0.1) dt = 0.016;

      theta = (theta + dt * ROT_SPEED) % TWO_PI;
      t = (t + dt) % 3600;

      const tilt = 0.35;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const cosX = Math.cos(tilt);
      const sinX = Math.sin(tilt);

      const light = document.documentElement.classList.contains("light");
      const inkChar = light ? "20,22,28" : "235,238,245";
      const inkMark = light ? "0,0,0" : "255,255,255";

      zbuf.fill(-Infinity);
      grid.fill(0);

      const radiusCells = COLS * 0.41;
      const centerCol = COLS / 2;
      const centerRow = ROWS / 2;

      for (let i = 0; i < N; i++) {
        const mx = MX[i];
        const my = MY[i];
        const mz = MZ[i];

        const x1 = mx * cosT + mz * sinT;
        const z1 = -mx * sinT + mz * cosT;
        const y1 = my;

        const ry = y1 * cosX - z1 * sinX;
        const rz = y1 * sinX + z1 * cosX;
        const rx = x1;

        const sx = centerCol + rx * radiusCells;
        const sy = centerRow - ry * radiusCells;
        const col = (sx + 0.5) | 0;
        const row = (sy + 0.5) | 0;
        if (col < 0 || col >= COLS || row < 0 || row >= ROWS) continue;

        const cellIdx = row * COLS + col;
        if (rz > zbuf[cellIdx]) {
          zbuf[cellIdx] = rz;
          if (rz < 0) {
            grid[cellIdx] = 1;
            continue;
          }
          if (!LAND[i]) {
            grid[cellIdx] = 1;
            continue;
          }
          let diffuse = rx * lightX + ry * lightY + rz * lightZ;
          if (diffuse < 0) diffuse = 0;
          const brightness = 0.18 + diffuse * 0.9;
          let band: number;
          if (brightness < 0.34) band = 2;
          else if (brightness < 0.62) band = rx >= 0 ? 3 : 4;
          else band = 5;
          grid[cellIdx] = band;
        }
      }

      ctx.clearRect(0, 0, COLS * cellSize, ROWS * cellSize);
      ctx.fillStyle = `rgba(${inkChar},0.92)`;

      const baseline = fontSize * 0.92;
      const maskRadiusCells = radiusCells + 0.6;
      const maskRadiusSq = maskRadiusCells * maskRadiusCells;
      ctx.save();
      ctx.scale(rowScaleX, 1);
      for (let r = 0; r < ROWS; r++) {
        let s = "";
        const rowOff = r * COLS;
        const dy = r - centerRow;
        for (let c = 0; c < COLS; c++) {
          const dx = c - centerCol;
          if (dx * dx + dy * dy > maskRadiusSq) {
            s += " ";
            continue;
          }
          const b = grid[rowOff + c];
          s += b <= 1 ? "." : b === 2 ? ":" : b === 3 ? ">" : b === 4 ? "<" : "#";
        }
        ctx.fillText(s, 0, r * cellSize + baseline);
      }
      ctx.restore();

      // Manila marker
      const x1m = manX * cosT + manZ * sinT;
      const z1m = -manX * sinT + manZ * cosT;
      const y1m = manY;
      const rym = y1m * cosX - z1m * sinX;
      const rzm = y1m * sinX + z1m * cosX;
      const rxm = x1m;

      if (rzm > 0.02) {
        const px = centerCol * cellSize + rxm * radiusCells * cellSize;
        const py = centerRow * cellSize - rym * radiusCells * cellSize;

        const edgeFade = Math.min(1, rzm * 3);
        const blink = 0.5 + 0.5 * Math.sin(t * 4.2);
        const pulse = (t * 0.9) % 1;

        const ringR = (0.8 + pulse * 3.4) * cellSize;
        ctx.beginPath();
        ctx.arc(px, py, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${inkMark},${((1 - pulse) * 0.75 * edgeFade).toFixed(3)})`;
        ctx.lineWidth = Math.max(1, cellSize * 0.22);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, cellSize * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${inkMark},${((0.35 + 0.65 * blink) * edgeFade).toFixed(3)})`;
        ctx.fill();

        ctx.save();
        ctx.font = `600 ${Math.round(cellSize * 2.1)}px ui-monospace, Menlo, Consolas, monospace`;
        ctx.fillStyle = `rgba(${inkMark},${(0.85 * edgeFade).toFixed(3)})`;
        ctx.fillText("MANILA", px + cellSize * 2.0, py - cellSize * 1.5);
        ctx.restore();
        setFont();
      }

      // static mode only needs this one frame, stop here instead of looping
      if (staticOnly || !running) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, []);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="mx-auto block"
        role="img"
        aria-label="Rotating ASCII globe with a pulsing marker on Manila, Philippines"
      />
    </div>
  );
}
