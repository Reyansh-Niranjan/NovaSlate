import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Cpu, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubjectShelf } from "./hero/SubjectShelf";
import { SlateSimulator } from "./hero/SlateSimulator";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

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
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
              ".hero-eyebrow-item",
              { y: -12, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.35, clearProps: "all" }
            )
              .fromTo(
                ".hero-title-line",
                { y: 32, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.1, clearProps: "all" },
                "-=0.15"
              )
              .fromTo(
                ".hero-subtext-el",
                { y: 16, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.38, clearProps: "all" },
                "-=0.2"
              )
              .fromTo(
                ".hero-cta-wrap",
                { y: 16, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.38, clearProps: "all" },
                "-=0.2"
              )
              .fromTo(
                ".hero-simulator-wrap",
                { scale: 0.95, autoAlpha: 0, y: 20 },
                { scale: 1, autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", clearProps: "all" },
                "-=0.3"
              )
              .fromTo(
                ".hero-curriculum-dock",
                { y: 20, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.45, clearProps: "all" },
                "-=0.2"
              );
          } else {
            gsap.set(
              [
                ".hero-eyebrow-item",
                ".hero-title-line",
                ".hero-subtext-el",
                ".hero-cta-wrap",
                ".hero-simulator-wrap",
                ".hero-curriculum-dock",
              ],
              { autoAlpha: 1, y: 0, scale: 1, clearProps: "all" }
            );
          }
        }
      );

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  const navigateToLogin = () => {
    window.history.pushState({}, "", "#login");
    window.dispatchEvent(new Event("hashchange"));
  };

  const scrollToNext = () => {
    const el = document.getElementById("sanitizer");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      ref={containerRef}
      className="min-h-[100dvh] pt-16 sm:pt-20 pb-0 flex flex-col justify-between relative overflow-hidden bg-background border-b border-border/70"
    >
      {/* Subtle Architectural Grid & Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Main 12-Column Hero Stage */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl flex-1 flex flex-col justify-center relative z-10 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Value Proposition & High-Agency CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Eyebrow (Restrained: Exactly 1 for the hero) */}
            <div className="hero-eyebrow-item inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide bg-secondary text-primary border border-border">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-bold tracking-tight">01 / ARCHITECTURE</span>
              <span className="text-border">·</span>
              <span className="text-muted-foreground">OPEN K–12 REPOSITORY</span>
            </div>

            {/* Display Headline */}
            <div className="space-y-1">
              <h1 className="hero-title-line font-heading font-black text-4xl sm:text-6xl lg:text-[4.75rem] tracking-tight leading-[1.03] text-foreground">
                Learn{" "}
                <span className="font-serif italic font-normal text-primary">
                  without limits.
                </span>
              </h1>
            </div>

            {/* Disciplined Subtext (Under 20 Words) */}
            <p className="hero-subtext-el text-sm sm:text-base text-muted-foreground font-body max-w-xl leading-relaxed">
              Curated K–12 textbooks, byte-level sanitized notes, and offline e-ink hardware. 100% free forever.
            </p>

            {/* High-Agency CTAs with Tactile Feedback */}
            <div className="hero-cta-wrap flex flex-wrap items-center gap-3 pt-1">
              <Button
                onClick={navigateToLogin}
                size="lg"
                className="h-11 px-6 rounded-full font-heading font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all active:scale-[0.97] cursor-pointer gap-2 interactive-tap"
              >
                <span>Launch Free Library</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Button>

              <a
                href="#hardware"
                className="h-11 px-5 rounded-full font-heading font-semibold text-xs sm:text-sm border border-border bg-card hover:bg-secondary text-foreground transition-all active:scale-[0.97] cursor-pointer inline-flex items-center justify-center gap-2 backdrop-blur-xs interactive-tap shadow-2xs"
              >
                <Cpu className="w-4 h-4 text-primary" />
                <span>Atlas Hardware Spec</span>
                <span className="text-xs font-mono text-primary font-bold">(ESP32)</span>
              </a>
            </div>

            {/* Micro Proof Badges */}
            <div className="hero-subtext-el pt-3 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Ad-Free Pledge</span>
              </span>
              <span className="text-border hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary" />
                <span>12,800+ NCERT Pages</span>
              </span>
              <span className="text-border hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[var(--pomelli-gold)]" />
                <span>Offline E-Ink Ready</span>
              </span>
            </div>
          </div>

          {/* Right Column: Live Interactive Slate Simulator (5 Cols) */}
          <div className="hero-simulator-wrap lg:col-span-5">
            <SlateSimulator />
          </div>
        </div>

        {/* Scroll cue button */}
        <div className="flex justify-center pt-4 sm:pt-6">
          <button
            onClick={scrollToNext}
            className="group flex flex-col items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer interactive-tap"
            aria-label="Scroll to curriculum sanitizer engine"
          >
            <div className="w-6 h-6 rounded-full bg-secondary/80 border border-border flex items-center justify-center transition-transform group-hover:translate-y-0.5 shadow-2xs">
              <ChevronDownIcon className="w-3.5 h-3.5 text-primary" />
            </div>
          </button>
        </div>
      </div>

      {/* ── Bottom Docked Curriculum Bar ── */}
      <div className="hero-curriculum-dock w-full mt-auto">
        <SubjectShelf onSelectSubject={() => navigateToLogin()} />
      </div>
    </section>
  );
}
