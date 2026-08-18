import {
  ArrowUpRightIcon,
  GitHubIcon,
  LeetCodeIcon,
  LinkedInIcon,
  MailIcon,
} from "@/components/icons";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/reveal";
import { Spotlight } from "@/components/spotlight";
import { VoiceWaveform } from "@/components/voice-waveform";
import {
  about,
  achievements,
  education,
  experience,
  site,
  skills,
} from "@/lib/data";

const socials = [
  { label: "GitHub", href: site.links.github, Icon: GitHubIcon },
  { label: "LinkedIn", href: site.links.linkedin, Icon: LinkedInIcon },
  { label: "LeetCode", href: site.links.leetcode, Icon: LeetCodeIcon },
  { label: "Email", href: `mailto:${site.email}`, Icon: MailIcon },
];

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="mb-8 font-mono text-xs uppercase tracking-[0.25em] text-accent lg:sr-only">
      {children}
    </h2>
  );
}

export default function Home() {
  return (
    <div className="relative">
      <Spotlight />

      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded focus:bg-surface focus:px-4 focus:py-2 focus:text-foreground"
      >
        Skip to content
      </a>

      <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 py-14 md:px-12 md:py-20 lg:flex lg:justify-between lg:gap-6 lg:px-16 lg:py-0">
        {/* Left column — sticky intro */}
        <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[44%] lg:flex-col lg:justify-between lg:py-24">
          <div>
            <Reveal>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-accent">
                {site.location}
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-[1.1]">
                {site.name.split(" ").slice(0, 2).join(" ")}
                <span className="block text-faint">
                  {site.name.split(" ").slice(2).join(" ")}
                </span>
              </h1>
              <h2 className="mt-4 text-lg font-medium text-foreground/90">
                {site.title}{" "}
                <span className="text-muted">at</span>{" "}
                <a
                  href={site.companyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline text-foreground transition-colors hover:text-accent"
                >
                  {site.company}
                </a>
              </h2>
              <p className="mt-4 max-w-sm leading-relaxed text-muted">
                {site.tagline}
              </p>
            </Reveal>

            <Reveal delay={150}>
              <Nav />
            </Reveal>
          </div>

          <Reveal delay={250}>
            <ul className="mt-12 flex items-center gap-5 lg:mt-0">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="block text-faint transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </header>

        {/* Right column — content */}
        <main className="pt-20 pb-24 lg:w-[50%] lg:pt-24 lg:pb-[45vh]">
          {/* About */}
          <Reveal as="section" id="about" className="scroll-mt-28">
            <SectionHeading>About</SectionHeading>
            <div className="space-y-4 leading-relaxed">
              {about.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          {/* Experience */}
          <section id="experience" className="mt-24 scroll-mt-28">
            <SectionHeading>Experience</SectionHeading>
            <ol className="space-y-14">
              {experience.map((job, i) => (
                <Reveal as="li" key={job.company} delay={i * 60}>
                  <article className="group">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="font-medium text-foreground">
                        <a
                          href={job.companyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-baseline gap-1.5 transition-colors hover:text-accent"
                        >
                          <span>
                            {job.role}{" "}
                            <span className="text-faint">·</span> {job.company}
                          </span>
                          <ArrowUpRightIcon className="h-3.5 w-3.5 shrink-0 translate-y-0.5 transition-transform duration-300 group-hover:-translate-y-0 group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-px" />
                        </a>
                      </h3>
                      <p className="shrink-0 font-mono text-xs uppercase tracking-wider text-faint">
                        {job.period}
                      </p>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-faint">
                      {job.location}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed">
                      {job.summary}
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {job.highlights.map((highlight) => (
                        <li
                          key={highlight.slice(0, 32)}
                          className="flex gap-3 text-sm leading-relaxed"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[0.55rem] h-px w-3 shrink-0 bg-faint"
                          />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-edge bg-surface px-3 py-1 font-mono text-[0.7rem] text-muted transition-colors duration-300 group-hover:border-accent/30 group-hover:text-accent"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </ol>
          </section>

          {/* Skills */}
          <section id="skills" className="mt-24 scroll-mt-28">
            <SectionHeading>Skills</SectionHeading>
            <dl className="space-y-6 border-l border-edge pl-6">
              {skills.map((group, i) => (
                <Reveal key={group.label} delay={i * 50}>
                  <dt className="font-mono text-xs uppercase tracking-[0.2em] text-faint">
                    {group.label}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-foreground/85">
                    {group.items.join("  ·  ")}
                  </dd>
                </Reveal>
              ))}
            </dl>
          </section>

          {/* Achievements */}
          <section id="achievements" className="mt-24 scroll-mt-28">
            <SectionHeading>Achievements</SectionHeading>
            <ul className="space-y-4">
              {achievements.map((item, i) => (
                <Reveal as="li" key={item.title} delay={i * 60}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block rounded-lg border border-edge bg-surface/60 p-6 transition-all duration-300 hover:border-accent/30 hover:bg-surface"
                  >
                    <h3 className="flex items-baseline gap-2 font-medium text-foreground transition-colors group-hover:text-accent">
                      {item.title}
                      <ArrowUpRightIcon className="h-3.5 w-3.5 shrink-0 translate-y-0.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0" />
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed">
                      {item.description}
                    </p>
                    <p className="mt-3 font-mono text-xs text-faint transition-colors group-hover:text-muted">
                      {item.linkLabel} ↗
                    </p>
                  </a>
                </Reveal>
              ))}
            </ul>
          </section>

          {/* Education */}
          <section id="education" className="mt-24 scroll-mt-28">
            <SectionHeading>Education</SectionHeading>
            <Reveal>
              <div>
                <h3 className="font-medium text-foreground">
                  {education.school}
                </h3>
                <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-sm text-foreground/85">
                    {education.degree}{" "}
                    <span className="text-faint">·</span> {education.detail}
                  </p>
                  <p className="shrink-0 font-mono text-xs uppercase tracking-wider text-faint">
                    {education.period}
                  </p>
                </div>
                <p className="mt-0.5 font-mono text-xs text-faint">
                  {education.location}
                </p>
              </div>
            </Reveal>
          </section>

          {/* Contact */}
          <Reveal as="section" id="contact" className="mt-28">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Get in touch
            </h2>
            <p className="mt-3 max-w-md leading-relaxed">
              I&apos;m always happy to talk about production AI systems,
              event-driven architecture, or interesting engineering problems.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="group mt-6 inline-flex items-center gap-2 rounded-full border border-edge px-5 py-2.5 font-mono text-sm text-foreground transition-all duration-300 hover:border-accent/50 hover:text-accent"
            >
              {site.email}
              <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Reveal>

          {/* Easter egg — interactive voice waveform */}
          <footer className="mt-24">
            <Reveal delay={100}>
              <VoiceWaveform />
            </Reveal>
          </footer>
        </main>
      </div>
    </div>
  );
}
