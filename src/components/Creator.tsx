import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Smartphone,
  Globe,
  Layers,
  Sparkles,
  ShieldCheck,
  Github,
  Compass,
} from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Milestone {
  id: string;
  stage: string;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  icon: typeof Smartphone;
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
      "A small Android utility built manually with zero user interface. Its single mission was automating the recursive download of every NCERT textbook into raw device storage.",
    tech: ["Android Java", "HTTP Client", "Raw Storage"],
    icon: Smartphone,
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
    icon: Globe,
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
    icon: Layers,
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
    icon: Sparkles,
    badge: "CURRENT STANDARD",
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
    icon: Compass,
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

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".creator-header-item",
          { y: 18, autoAlpha: 0 },
          {
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%",
              once: true,
            },
            y: 0,
            autoAlpha: 1,
            duration: 0.38,
            stagger: 0.06,
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
          { y: 24, autoAlpha: 0 },
          {
            scrollTrigger: {
              trigger: ".timeline-container",
              start: "top 80%",
              once: true,
            },
            y: 0,
            autoAlpha: 1,
            duration: 0.4,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "all",
          }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="timeline"
      ref={containerRef}
      className="py-16 sm:py-28 relative"
    >
      <div id="creator" className="absolute -top-14" />
      <div id="evolution" className="absolute -top-14" />

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
        {/* Section Header & Founder Mission */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-secondary text-primary border border-border mb-3 font-heading">
            <ShieldCheck className="w-3.5 h-3.5" />
            Founder's Mission &amp; Evolution
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4 font-heading leading-tight">
            Built with integrity.{" "}
            <span className="text-primary font-serif italic font-normal text-2xl sm:text-3xl md:text-4xl">
              Engineered for public student welfare.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[55ch] font-body mb-6">
            NovaSlate was conceived and built solely by <strong className="text-foreground font-heading">Reyansh Niranjan</strong> as an independent, non-corporate initiative to bridge the educational divide across India.
          </p>

          {/* Founder Quote Card */}
          <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base text-foreground font-heading">
                  Reyansh Niranjan
                </span>
                <span className="text-xs font-mono text-primary font-bold">
                  Sole Architect
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-body">
                India · Creator of NovaSlate &amp; Atlas Hardware
              </p>
              <blockquote className="text-xs sm:text-sm text-foreground/90 font-serif italic pt-2 max-w-[60ch] leading-relaxed">
                "Education shouldn't depend on whether you have a 5G connection or whether you can afford an expensive subscription. NovaSlate pairs open-access software with the permanent Atlas offline reader so every student can study distraction-free."
              </blockquote>
            </div>

            <a
              href="https://github.com/Reyansh-Niranjan/novaslate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold font-heading border border-border bg-secondary text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              <Github className="w-3.5 h-3.5 text-primary" />
              <span>GitHub Profile</span>
            </a>
          </div>
        </div>

        {/* Alternating Spine Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border mb-12">
          <div>
            <span className="text-xs font-mono font-bold tracking-wide text-primary">
              GSAP Dual-Rail Spine
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground font-heading mt-1">
              How NovaSlate Evolved
            </h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block">
            Atlas Hardware Constant · NovaSlate Software Evolves
          </span>
        </div>

        {/* Alternating Two-Column Timeline with Central Spine */}
        <div className="relative">
          {/* Central Spine Line (desktop center, mobile left) */}
          <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-[2px] -translate-x-1/2 bg-border timeline-spine-line" />

          <div className="space-y-10 sm:space-y-12">
            {milestones.map((milestone, idx) => {
              const Icon = milestone.icon;
              const isCurrent = milestone.status === "current";
              const isFuture = milestone.status === "future";
              const isEven = idx % 2 === 1;

              return (
                <div
                  key={milestone.id}
                  className={`relative flex flex-col md:flex-row items-center ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Central Spine Node */}
                  <div className={`absolute left-4 md:left-1/2 -translate-x-1/2 top-6 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                    isCurrent
                      ? "bg-primary border-primary text-primary-foreground timeline-node-active"
                      : isFuture
                      ? "bg-background border-muted-foreground/40 text-muted-foreground"
                      : "bg-card border-primary text-primary"
                  }`}>
                    <span className="text-xs font-mono font-bold">{idx + 1}</span>
                  </div>

                  {/* Card container with alternating offset */}
                  <div className={`w-full md:w-[calc(50%-2.5rem)] pl-12 md:pl-0 ${
                    isEven ? "md:text-left" : "md:text-left"
                  }`}>
                    <div className={`timeline-card-v2 rounded-2xl border p-5 transition-fluid bg-card ${
                      isCurrent ? "border-primary/60 shadow-md ring-1 ring-primary/20" : "border-border shadow-xs hover:border-border/90"
                    }`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          {milestone.stage}
                        </span>
                        <span className={`text-xs font-mono font-bold tracking-wider ${
                          isCurrent
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}>
                          {milestone.badge}
                        </span>
                      </div>

                      <h4 className="text-lg sm:text-xl font-bold text-foreground font-heading flex items-center gap-2 mb-1.5 leading-snug">
                        <Icon className={`w-4 h-4 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                        <span>{milestone.title}</span>
                      </h4>

                      <div className="text-xs font-semibold text-primary font-heading mb-3">
                        {milestone.subtitle}
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body mb-5 max-w-[55ch]">
                        {milestone.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 border-t border-border/70 text-xs font-mono text-muted-foreground">
                        {milestone.tech.map((t) => (
                          <span key={t}>#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
