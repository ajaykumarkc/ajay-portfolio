"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" },
  { id: "education", label: "Education" },
] as const;

export function Nav() {
  const [active, setActive] = useState<string>("about");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      // A narrow horizontal band near the top of the viewport decides the
      // active section, which feels right while scrolling in either direction.
      { rootMargin: "-20% 0px -70% 0px" }
    );

    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="In-page navigation" className="hidden lg:block">
      <ul className="mt-16 space-y-1">
        {sections.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
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
