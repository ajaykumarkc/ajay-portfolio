"use client";

import { useEffect, useRef, useState } from "react";

const ACCENT_RGB = "217, 184, 119";

const INTENTS = [
  "schedule_interview",
  "talk_voice_agents",
  "grab_a_coffee",
  "review_architecture",
  "transfer_to_human",
  "debug_in_production",
  "ship_it",
  "end_call_politely",
];

const BAR_WIDTH = 2;
const BAR_GAP = 3;
const STEP = BAR_WIDTH + BAR_GAP;

type Pulse = { x: number; start: number };

/**
 * Easter egg: a tiny "voice agent" waveform. The bars idle at a low murmur,
 * swell toward the pointer, and ripple outward on click/tap/Enter — each
 * activation "detects" a fake intent, a wink at converting conversations
 * into structured intents. Under prefers-reduced-motion the bars render as
 * a static waveform and only the caption reacts.
 */
export function VoiceWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerX = useRef<number | null>(null);
  const pulses = useRef<Pulse[]>([]);
  const staticSeed = useRef(0);
  const redrawStatic = useRef<(() => void) | null>(null);
  const reducedMotion = useRef(false);
  const intentIndex = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [detected, setDetected] = useState<{
    intent: string;
    confidence: string;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    const heights: number[] = [];

    const drawBars = (values: number[]) => {
      ctx.clearRect(0, 0, width, height);
      const mid = height / 2;
      for (let i = 0; i < values.length; i++) {
        const v = Math.min(1, Math.max(0.05, values[i]));
        const h = Math.max(2, v * (height - 4));
        ctx.fillStyle = `rgba(${ACCENT_RGB}, ${0.16 + v * 0.7})`;
        ctx.fillRect(i * STEP, mid - h / 2, BAR_WIDTH, h);
      }
    };

    const drawStatic = () => {
      const s = staticSeed.current;
      drawBars(
        Array.from(
          { length: heights.length },
          (_, i) =>
            0.1 +
            0.4 *
              Math.abs(Math.sin(i * 0.41 + s) * Math.sin(i * 0.153 + s * 1.7))
        )
      );
    };
    redrawStatic.current = drawStatic;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(1, Math.floor((width + BAR_GAP) / STEP));
      const prev = heights.length;
      heights.length = count;
      for (let i = prev; i < count; i++) heights[i] = 0;
      if (reducedMotion.current) drawStatic();
    };

    const frame = (now: number) => {
      const t = now / 1000;
      pulses.current = pulses.current.filter((p) => now - p.start < 1400);
      const px = pointerX.current;

      for (let i = 0; i < heights.length; i++) {
        const x = i * STEP + BAR_WIDTH / 2;
        // Layered slow sines give the idle "murmur".
        let target = Math.abs(
          0.06 +
            0.045 * Math.sin(t * 1.4 + i * 0.35) * Math.sin(t * 0.7 + i * 0.11) +
            0.03 * Math.sin(t * 2.3 - i * 0.18)
        );
        if (px !== null) {
          const d = x - px;
          target += 0.75 * Math.exp(-(d * d) / (2 * 42 * 42));
        }
        for (const p of pulses.current) {
          const age = (now - p.start) / 1000;
          const ringDist = Math.abs(x - p.x) - age * 260;
          target +=
            0.9 *
            Math.exp(-(ringDist * ringDist) / (2 * 26 * 26)) *
            Math.exp(-age * 2.4);
        }
        heights[i] += (Math.min(target, 1) - heights[i]) * 0.18;
      }

      drawBars(heights);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reducedMotion.current) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    // Only animate while the waveform is on screen.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    intersectionObserver.observe(canvas);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      redrawStatic.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const activate = (clientX: number | null) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x =
        clientX === null
          ? rect.width / 2
          : Math.min(rect.width, Math.max(0, clientX - rect.left));
      pulses.current.push({ x, start: performance.now() });
    }
    if (reducedMotion.current) {
      staticSeed.current += 1;
      redrawStatic.current?.();
    }

    const intent = INTENTS[intentIndex.current % INTENTS.length];
    intentIndex.current += 1;
    setDetected({
      intent,
      confidence: (0.9 + Math.random() * 0.09).toFixed(2),
    });

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setDetected(null), 4000);
  };

  return (
    <div>
      <button
        type="button"
        aria-label="Voice waveform easter egg — activate to detect an intent"
        onClick={(e) => activate(e.detail === 0 ? null : e.clientX)}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          pointerX.current = e.clientX - rect.left;
        }}
        onPointerLeave={() => {
          pointerX.current = null;
        }}
        className="block w-full cursor-pointer touch-manipulation rounded-md p-0 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent/50"
      >
        <canvas ref={canvasRef} aria-hidden="true" className="block h-16 w-full" />
      </button>
      <p
        aria-live="polite"
        className="mt-3 h-4 truncate font-mono text-[0.7rem] tracking-wide text-faint"
      >
        {detected ? (
          <>
            <span className="text-accent">✓</span> intent:{" "}
            <span className="text-muted">{detected.intent}</span> · confidence{" "}
            {detected.confidence}
          </>
        ) : (
          <>
            <span aria-hidden="true" className="caret-blink text-accent">
              ▍
            </span>{" "}
            listening…
          </>
        )}
      </p>
    </div>
  );
}
