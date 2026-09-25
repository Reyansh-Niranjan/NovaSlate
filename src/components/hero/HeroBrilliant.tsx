import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  BarChartScrubber,
  LogicBlockStack,
  PhysicsParticleCloud,
  CalculusWaveNode,
  CoordinateAxis,
} from "./HeroWidgets";
import { SubjectShelf } from "./SubjectShelf";

gsap.registerPlugin(useGSAP);

/**
 * Hero V1 — Brilliant.org Inspired
 *
 * Dark immersive canvas. Massive serif "Learn" with interactive science widgets
 * woven through the letterforms. Bottom subject shelf as a curriculum dock.
 * Feels like an interactive textbook cover.
 */
export default function HeroBrilliant() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          ".hb-eyebrow",
          { y: -12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.35, clearProps: "all" }
        )
          .fromTo(
            ".hb-headline",
            { y: 35, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.12, clearProps: "all" },
            "-=0.15"
          )
          .fromTo(
            ".hb-widget",
            { scale: 0.95, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.45, stagger: 0.08, clearProps: "all" },
            "-=0.3"
          )
          .fromTo(
            ".hb-sub",
            { y: 16, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.4, clearProps: "all" },
            "-=0.2"
          )
          .fromTo(
            ".hb-cta",
            { y: 16, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.4, clearProps: "all" },
            "-=0.2"
          )
          .fromTo(
            ".hb-shelf",
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.45, clearProps: "all" },
            "-=0.15"
          );
      });
      return () => mm.revert();
    },
    { scope: containerRef }
  );

  const navigateToLogin = () => {
    window.history.pushState({}, "", "#login");
    window.dispatchEvent(new Event("hashchange"));
  };

  const scrollToNextSection = () => {
    const el = document.getElementById("features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectSubject = () => {
    window.history.pushState({}, "", "#login");
    window.dispatchEvent(new Event("hashchange"));
  };

  return (
    <section
      id="home"
      ref={containerRef}
      className="min-h-[100dvh] pt-16 sm:pt-18 pb-0 flex flex-col justify-between relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0B1519 0%, #0F1D24 40%, #132A33 100%)",
        color: "#F1F5F9",
      }}
    >
      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      {/* Ambient glow — top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(24,131,177,0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Main Stage */}
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl flex-1 flex flex-col items-center justify-center text-center relative z-10 py-3 sm:py-4">
        {/* Eyebrow */}
        <div className="hb-eyebrow inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10.5px] sm:text-xs font-mono font-medium tracking-wide bg-white/[0.06] text-white/60 border border-white/[0.08] mb-4 sm:mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse" />
          <span className="text-[#60A5FA] font-semibold">OPEN PLATFORM</span>
          <span className="text-white/20">·</span>
          <span>K–12 PUBLIC REPOSITORY</span>
        </div>

        {/* Typography + Widget Stage */}
        <div className="relative w-full max-w-4xl select-none my-1 sm:my-2">
          {/* Coordinate axes */}
          <div className="hb-widget absolute top-[36%] left-0 right-0 z-0 opacity-40">
            <CoordinateAxis ticks={13} />
          </div>

          {/* Line 1: "Learn" */}
          <div className="hb-headline relative z-10 flex items-center justify-center">
            <div className="relative inline-block">
              <div className="hb-widget">
                <BarChartScrubber />
              </div>
              <h1
                className="font-normal tracking-tight leading-[0.88]"
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: "clamp(4.5rem, 12vw, 9rem)",
                  color: "#F1F5F9",
                }}
              >
                Learn
              </h1>
              <div className="hb-widget">
                <PhysicsParticleCloud />
              </div>
            </div>
          </div>

          {/* Logic block interlude */}
          <div className="hb-widget flex justify-center -my-2.5 sm:-my-4 relative z-20">
            <LogicBlockStack />
          </div>

          {/* Bottom axis */}
          <div className="hb-widget absolute bottom-[32%] left-0 right-0 z-0 opacity-40">
            <CoordinateAxis ticks={13} />
          </div>

          {/* Line 2: "without limits" */}
          <div className="hb-headline relative z-10 flex items-center justify-center">
            <div className="relative inline-block">
              <h2
                className="font-normal tracking-tight leading-[0.88]"
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: "clamp(4.5rem, 12vw, 9rem)",
                  color: "#F1F5F9",
                }}
              >
                without limits
              </h2>
              <div className="hb-widget">
                <CalculusWaveNode />
              </div>
            </div>
          </div>
        </div>

        {/* Subtext */}
        <div className="hb-sub mt-5 sm:mt-7 max-w-xl mx-auto space-y-1.5">
          <p className="text-sm sm:text-base font-heading font-semibold text-white/90 tracking-tight">
            Interactive problem solving that&apos;s effective and fun.
          </p>
          <p className="text-xs sm:text-sm font-body text-white/50 leading-relaxed">
            Curated K–12 textbooks, smart revision notes, and offline slates.
            <br className="hidden sm:inline" />
            Get smarter in 15 minutes a day — 100% free, forever.
          </p>
        </div>

        {/* CTAs */}
        <div className="hb-cta mt-5 sm:mt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
            <Button
              onClick={navigateToLogin}
              size="lg"
              className="h-12 px-8 rounded-full font-heading font-bold text-sm bg-[#60A5FA] text-[#0B1216] hover:bg-[#93C5FD] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.97] cursor-pointer gap-2"
            >
              <span>Get started</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>

            <a
              href="https://github.com/Reyansh-Niranjan/novaslate"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-5 rounded-full font-heading font-semibold text-xs sm:text-sm border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-white/80 transition-all active:scale-[0.97] cursor-pointer inline-flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <span>Atlas Hardware</span>
              <span className="text-xs font-mono text-[#E4B34C] font-bold">ESP32</span>
            </a>
          </div>

          <button
            onClick={scrollToNextSection}
            className="group flex flex-col items-center text-white/40 hover:text-[#60A5FA] transition-colors cursor-pointer pt-1"
            aria-label="Scroll to curriculum and features"
          >
            <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center transition-transform group-hover:translate-y-0.5">
              <ChevronDownIcon className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Subject Shelf */}
      <div className="hb-shelf w-full mt-auto border-t border-white/[0.08]" style={{ background: "rgba(11,21,25,0.6)", backdropFilter: "blur(8px)" }}>
        <SubjectShelf onSelectSubject={handleSelectSubject} />
      </div>
    </section>
  );
}
