"use client";

import { useEffect, useRef } from "react";

/**
 * A brass radial glow that follows the pointer. Disabled automatically on
 * touch-only devices and under prefers-reduced-motion.
 */
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.background = `radial-gradient(640px circle at ${e.clientX}px ${e.clientY}px, rgba(217, 184, 119, 0.11), rgba(217, 184, 119, 0.035) 42%, transparent 70%)`;
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      id="pointer-spotlight"
      ref={ref}
      aria-hidden="true"
      className="pointer-spotlight"
    />
  );
}
