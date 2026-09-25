import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ComponentType } from "react";
import {
  MobileIcon,
  GlobeIcon,
  LayersIcon,
  MagicWandIcon,
  TargetIcon,
  CheckCircledIcon,
  GitHubLogoIcon,
} from "@radix-ui/react-icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Milestone {
  id: string;
  stage: string;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  icon: ComponentType<{ className?: string }>;
  badge: string;
  status: "completed" | "current" | "future";
}

const milestones: Milestone[] = [
  {
    id: "genesis",
    stage: "Starting Point · 2024",
    title: "EduScrapeApp",
    subtitle: "Manual Android Scraper · Zero UI",
    description:
      "A lightweight Android utility built with zero user interface. Its single mission was automating the recursive download and parsing of every NCERT textbook into raw device storage.",
    tech: ["Android Java", "HTTP Client", "Raw Storage"],
    icon: MobileIcon,
    badge: "GENESIS",
    status: "completed",
  },
  {
    id: "pwa",
    stage: "Phase Two · Early 2025",
    title: "Lightweight PWA",
    subtitle: "Web Interface & Book Selector",
    description:
      "Ported the scraping logic into a Progressive Web App, introducing the first visual interface that allowed students to search, filter, and choose specific books to download.",
    tech: ["PWA", "JavaScript", "Local Cache"],
    icon: GlobeIcon,
    badge: "WEB PIVOT",
    status: "completed",
  },
  {
    id: "chef-convex",
    stage: "Phase Three · Mid 2025",
    title: "Chef + Convex Architecture",
    subtitle: "In-Browser Viewer & Early AI Assistant",
    description:
      "Introduced an in-browser PDF rendering engine, real-time database syncing with Convex, and early generative AI prompts to help students understand tricky formula derivations.",
    tech: ["Convex DB", "PDF.js", "Gemini 1.5 Flash"],
    icon: LayersIcon,
    badge: "AI INGESTION",
    status: "completed",
  },
  {
    id: "novaslate-present",
    stage: "The Present · 2026",
    title: "NovaSlate & Atlas Ecosystem",
    subtitle: "React 19 + Supabase + Sanitizer + Atlas Hardware",
    description:
      "The modern production platform. Automated OpenCV watermark removal, Class 1–12 curriculum catalog, Gemini 2.0 Flash reasoning, and the autonomous Atlas ESP32 physical reader.",
    tech: ["React 19", "Supabase", "Watermark Scrubber", "Atlas ESP32-S3"],
    icon: MagicWandIcon,
    badge: "PRODUCTION",
    status: "current",
  },
  {
    id: "future-horizon",
    stage: "Future Horizon · Roadmap",
    title: "Regional State Boards & Offline Mesh",
    subtitle: "Atlas Hardware Remains the Permanent Constant",
    description:
      "Expanding to state education boards (ICSE, Maharashtra, UP Board) and local peer-to-peer classroom mesh caching, while the physical Atlas ESP32 reader remains the unchanged, reliable physical constant.",
    tech: ["Regional Boards", "Local Mesh", "Atlas Permanent Architecture"],
    icon: TargetIcon,
    badge: "ROADMAP",
    status: "future",
  },
];

export default function Creator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineLineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          hasMotion: "(prefers-reduced-motion: no-preference)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { hasMotion } = context.conditions as { hasMotion: boolean; reduceMotion: boolean };

          if (hasMotion) {
            // Header animation
            gsap.fromTo(
              ".creator-header-item",
              { y: 22, autoAlpha: 0 },
              {
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top 85%",
                  once: true,
                },
                y: 0,
                autoAlpha: 1,
                duration: 0.45,
                stagger: 0.08,
                ease: "power3.out",
                clearProps: "all",
              }
            );

            // Timeline animated line progress
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: ".timeline-container",
                start: "top 80%",
                end: "bottom 70%",
                scrub: 0.4,
              },
            });

            if (timelineLineRef.current) {
              tl.to(timelineLineRef.current, {
                scaleY: 1,
                ease: "none",
              });
            }

            // Timeline cards staggered reveal
            gsap.fromTo(
              ".timeline-card",
              { y: 28, autoAlpha: 0 },
              {
                scrollTrigger: {
                  trigger: ".timeline-container",
                  start: "top 80%",
                  once: true,
                },
                y: 0,
                autoAlpha: 1,
                duration: 0.45,
                stagger: 0.1,
                ease: "power3.out",
                clearProps: "all",
              }
            );
          } else {
            if (timelineLineRef.current) {
              gsap.set(timelineLineRef.current, { scaleY: 1 });
            }
            gsap.set([".creator-header-item", ".timeline-card"], {
              autoAlpha: 1,
              y: 0,
              clearProps: "all",
            });
          }
        }
      );

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="timeline"
      ref={containerRef}
      className="py-20 sm:py-32 relative overflow-hidden bg-background text-foreground"
    >
      <div id="creator" className="absolute -top-14" />
      <div id="evolution" className="absolute -top-14" />

      {/* Atmospheric lighting backdrop */}
      <div className="pointer-events-none absolute -top-40 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-10 left-10 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        {/* Section Header & Founder Mission */}
        <div className="border-b border-border/80 pb-12 sm:pb-16 mb-16 creator-header-item">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-secondary/80 border border-primary/30 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>// 05_ARCHITECTURAL_CHRONOLOGY</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground flex items-center gap-3">
              <span>PUBLIC BENEFIT INITIATIVE</span>
              <span className="text-border">·</span>
              <span className="text-primary font-bold">ZERO CORPORATE MONOPOLIES</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.08] font-heading mb-6">
                Built with integrity.{" "}
                <span className="font-serif italic font-normal text-primary block sm:inline">
                  Engineered for public welfare.
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-body leading-relaxed max-w-2xl">
                NovaSlate is designed and authored solely by <strong className="text-foreground font-heading">Reyansh Niranjan</strong> as an open educational utility. It decouples high-quality textbook access from private monopolies, high-speed 5G demands, and monetized paywalls across India.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-end">
              <div className="p-5 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm font-heading text-foreground">Reyansh Niranjan</div>
                    <div className="text-xs font-mono text-primary font-semibold">Architect &amp; Hardware Lead</div>
                  </div>
                  <a
                    href="https://github.com/Reyansh-Niranjan/novaslate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-border bg-secondary hover:bg-muted text-foreground transition-all duration-200 interactive-tap active:scale-[0.97]"
                  >
                    <GitHubLogoIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Source</span>
                  </a>
                </div>
                <p className="text-xs font-serif italic text-muted-foreground/90 border-t border-border/50 pt-2.5 leading-relaxed">
                  &ldquo;Every student deserves permanent, distraction-free books regardless of network access or hardware cost.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 12-Column Split: Left Sticky Telemetry HUD + Right Kinetic Spine */}
        <div className="timeline-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Sticky Hardware Constant Telemetry */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6 creator-header-item">
            <div className="p-6 rounded-2xl border border-border/90 bg-card/70 backdrop-blur-md space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border/70">
                <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
                  Telemetry Architecture
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  PHYSICAL SPEC LOCKED
                </span>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-mono text-muted-foreground leading-relaxed">
                  While NovaSlate&apos;s cloud scrapers and vector sanitizers continually evolve, the <span className="text-foreground font-semibold">Atlas Handheld Reader</span> remains the permanent, uncompromised hardware constant.
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">Microcontroller</div>
                    <div className="text-xs font-mono font-bold text-foreground mt-0.5">ESP32-S3 Dual 240MHz</div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">Display Engine</div>
                    <div className="text-xs font-mono font-bold text-foreground mt-0.5">1-Bit Dither Monochrome</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40 text-xs font-mono text-muted-foreground">
                  <div className="flex justify-between items-center py-1">
                    <span>Filesystem Format:</span>
                    <span className="text-foreground font-semibold">FAT32 MicroSD Raw</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Standby Consumption:</span>
                    <span className="text-primary font-bold">120h Deep Sleep / Instant Wake</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Cloud Dependency:</span>
                    <span className="text-emerald-400 font-bold">0% (Completely Autonomous)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-3">
              <CheckCircledIcon className="w-5 h-5 text-primary shrink-0" />
              <div className="text-xs font-mono text-foreground leading-snug">
                <strong>Public Welfare Commitment:</strong> No paywalls, zero trackers, byte-sanitized PDF output.
              </div>
            </div>
          </div>

          {/* Right Column: Kinetic Chronological Spine */}
          <div className="lg:col-span-7 relative">
            {/* Scrubbed Progress Spine Line */}
            <div className="absolute left-4 sm:left-6 top-6 bottom-6 w-[2px] bg-border">
              <div
                ref={timelineLineRef}
                className="w-full h-full bg-gradient-to-b from-primary via-accent to-primary origin-top scale-y-0"
              />
            </div>

            <div className="space-y-8 pl-12 sm:pl-16">
              {milestones.map((milestone, idx) => {
                const Icon = milestone.icon;
                const isCurrent = milestone.status === "current";
                const isFuture = milestone.status === "future";

                return (
                  <div key={milestone.id} className="timeline-card relative group">
                    {/* Node Beacon on the Spine */}
                    <div
                      className={`absolute -left-12 sm:-left-16 top-5 w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                        isCurrent
                          ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20"
                          : isFuture
                          ? "bg-background border-muted-foreground/40 text-muted-foreground"
                          : "bg-card border-primary text-primary group-hover:border-primary group-hover:scale-105"
                      }`}
                    >
                      0{idx + 1}
                    </div>

                    {/* Milestone Card */}
                    <div
                      className={`rounded-2xl border p-6 bg-card transition-all duration-300 hover:-translate-y-1 ${
                        isCurrent
                          ? "border-primary ring-1 ring-primary/40 shadow-lg shadow-primary/10"
                          : isFuture
                          ? "border-border/60 bg-card/50"
                          : "border-border hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3 text-xs font-mono">
                        <span className="text-muted-foreground font-bold">{milestone.stage}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                            isCurrent
                              ? "bg-primary text-primary-foreground"
                              : isFuture
                              ? "bg-secondary text-muted-foreground"
                              : "bg-secondary/80 text-primary border border-primary/20"
                          }`}
                        >
                          {milestone.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold font-heading text-foreground flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                        <span>{milestone.title}</span>
                      </h3>

                      <div className="text-xs font-mono font-semibold text-primary mb-3">
                        {milestone.subtitle}
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed mb-4">
                        {milestone.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
                        {milestone.tech.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-secondary/70 border border-border/40 hover:text-foreground transition-colors"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
