import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          ".hero-category-chip",
          { y: -10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.35, clearProps: "all" }
        )
          .fromTo(
            ".hero-title",
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.4, clearProps: "all" },
            "-=0.2"
          )
          .fromTo(
            ".hero-subtext",
            { y: 16, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.35, clearProps: "all" },
            "-=0.2"
          )
          .fromTo(
            ".hero-pillar-card",
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.1, clearProps: "all" },
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

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        {/* Wide MasterClass Category Title Strip */}
        <div className="max-w-3xl mb-12">
          <div className="hero-category-chip inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-secondary text-primary border border-border mb-3 font-heading">
            <span>CLASS 1–12 CURRICULUM</span>
            <span className="text-border">·</span>
            <span>OPEN ARCHITECTURE</span>
          </div>

          <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground font-heading leading-tight mb-3">
            Textbooks without barriers.
          </h1>

          <p className="hero-subtext text-sm sm:text-base text-muted-foreground max-w-[50ch] font-body leading-relaxed">
            Direct browser access for connected screens. 100% offline study on the physical Atlas Slate.
          </p>
        </div>

        {/* 2-Column Side-by-Side Cinematic Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Pillar 1: NovaSlate Cloud Web */}
          <div className="hero-pillar-card rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-primary/50 transition-fluid">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  100% FREE SOFTWARE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-primary border border-border">
                  INSTANT ACCESS
                </span>
              </div>

              <h3 className="text-xl font-bold text-foreground font-heading">
                NovaSlate Web Library
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
                Read Class 1–12 textbooks directly in any browser. Features PyMuPDF watermark sanitization, chapter search, and formula indexers.
              </p>

              <div className="p-4 rounded-xl bg-secondary/40 border border-border font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-foreground">
                  <span>• Subscription Cost:</span>
                  <span className="font-bold text-primary font-mono">₹0 Forever</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>• Commercial Ads:</span>
                  <span className="font-bold text-foreground font-mono">Zero Ads Guaranteed</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>• Delivery Mechanism:</span>
                  <span className="font-bold text-foreground font-mono">Instant Cloud CDN</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border mt-6">
              <Button
                onClick={navigateToLogin}
                className="w-full h-11 font-bold font-heading bg-primary text-primary-foreground hover:opacity-90 gap-2 cursor-pointer shadow-xs rounded-lg"
              >
                <BookOpen className="w-4 h-4" />
                <span>Launch Free Web Library</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Pillar 2: Atlas Physical Reader */}
          <div className="hero-pillar-card rounded-2xl border-2 border-[var(--pomelli-gold)]/40 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--pomelli-gold)]">
                  OPEN HARDWARE · PERMANENT CONSTANT
                </span>
                <span className="atlas-roadmap-badge text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--pomelli-gold)]/15 text-[var(--pomelli-gold)] border border-[var(--pomelli-gold)]/40">
                  UNIT 01 IN LAB
                </span>
              </div>

              <h3 className="text-xl font-bold text-foreground font-heading">
                Atlas ESP32 Handheld Slate
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
                Unit 01 is actively running in our hardware lab. All embedded C++ drivers and schematics are fully open source on GitHub. Mass production for rural school classrooms is planned for our roadmap.
              </p>

              <div className="p-4 rounded-xl bg-secondary/40 border border-border font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-foreground">
                  <span>• Current Status:</span>
                  <span className="font-bold text-[var(--pomelli-gold)] font-mono">Prototype 01 Active</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>• Future Horizon:</span>
                  <span className="font-bold text-foreground font-mono">Mass Classroom Production</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>• Source Code:</span>
                  <span className="font-bold text-primary font-mono">100% Open Embedded C++</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border mt-6">
              <a
                href="https://github.com/Reyansh-Niranjan/novaslate"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-lg border border-border bg-secondary hover:bg-muted text-xs sm:text-sm font-bold font-heading text-foreground cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <span>View C++ Firmware on GitHub</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </a>
            </div>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="text-center font-mono text-xs text-muted-foreground pt-4 border-t border-border/60">
          Architected by <strong>Reyansh Niranjan</strong> · Public Student Welfare Initiative
        </div>
      </div>
    </section>
  );
}
