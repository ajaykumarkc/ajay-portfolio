"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

const sections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" },
  { id: "education", label: "Education" },
] as const;

const LAST_ID = sections[sections.length - 1].id;
const BOTTOM_THRESHOLD_PX = 160;
const SPY_LINE_RATIO = 0.3;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function documentScrollHeight() {
  const { body, documentElement: html } = document;
  return Math.max(
    html.scrollHeight,
    html.offsetHeight,
    body?.scrollHeight ?? 0,
    body?.offsetHeight ?? 0
  );
}

export function Nav() {
  const [active, setActive] = useState<string>("about");
  const lockRef = useRef<string | null>(null);
  const unlockTimer = useRef<number | null>(null);

  useEffect(() => {
    const syncActive = () => {
      if (lockRef.current) return;

      if (
        window.scrollY + window.innerHeight >=
        documentScrollHeight() - BOTTOM_THRESHOLD_PX
      ) {
        setActive(LAST_ID);
        return;
      }

      const threshold = window.innerHeight * SPY_LINE_RATIO;
      let current: string = sections[0].id;

      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= threshold) {
          current = id;
        }
      }

      const contact = document.getElementById("contact");
      if (contact && contact.getBoundingClientRect().top <= threshold) {
        current = LAST_ID;
      }

      setActive(current);
    };

    window.addEventListener("scroll", syncActive, { passive: true });
    window.addEventListener("resize", syncActive);
    syncActive();

    return () => {
      window.removeEventListener("scroll", syncActive);
      window.removeEventListener("resize", syncActive);
      if (unlockTimer.current !== null) window.clearTimeout(unlockTimer.current);
    };
  }, []);

  const onNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    lockRef.current = id;
    setActive(id);

    const reduced = prefersReducedMotion();
    el.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", `#${id}`);

    const unlock = () => {
      lockRef.current = null;
      if (unlockTimer.current !== null) {
        window.clearTimeout(unlockTimer.current);
        unlockTimer.current = null;
      }
      window.removeEventListener("scrollend", unlock);
    };

    if (reduced) {
      unlock();
      return;
    }

    window.addEventListener("scrollend", unlock, { once: true });
    unlockTimer.current = window.setTimeout(unlock, 1000);
  };

  return (
    <nav aria-label="In-page navigation" className="hidden lg:block">
      <ul className="mt-16 space-y-1">
        {sections.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(event) => onNavClick(event, id)}
                className="group flex items-center gap-4 py-2"
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className={`h-px transition-all duration-300 ${
                    isActive
                      ? "w-14 bg-accent"
                      : "w-7 bg-faint group-hover:w-14 group-hover:bg-foreground"
                  }`}
                />
                <span
                  className={`font-mono text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                    isActive
                      ? "text-foreground"
                      : "text-faint group-hover:text-foreground"
                  }`}
                >
                  {label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
