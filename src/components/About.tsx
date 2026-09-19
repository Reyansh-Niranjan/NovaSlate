import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FileCheck2,
  Layers,
  Cpu,
  Zap,
} from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".study-header-item",
          { y: 20, autoAlpha: 0 },
          {
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%",
              once: true,
            },
            y: 0,
            autoAlpha: 1,
            duration: 0.4,
            stagger: 0.07,
            ease: "power3.out",
            clearProps: "all",
          }
        );

        gsap.fromTo(
          ".study-card-item",
          { y: 24, autoAlpha: 0 },
          {
            scrollTrigger: {
              trigger: ".study-grid-container",
              start: "top 80%",
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
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="features"
      ref={containerRef}
      className="py-16 sm:py-28 bg-background border-t border-border relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        {/* Centered Compact Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="study-header-item inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-secondary text-primary border border-border mb-3 font-heading">
            <Layers className="w-3.5 h-3.5" />
            Three-Stage Pipeline
          </div>
          <h2 className="study-header-item text-3xl sm:text-4xl font-black tracking-tight text-foreground font-heading">
            Raw curriculum data,{" "}
            <span className="text-primary font-serif italic font-normal">distilled.</span>
          </h2>
        </div>

        {/* Linear Metric Ribbon */}
        <div className="study-grid-container grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="p-3.5 rounded-xl border border-border bg-card text-center">
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-primary">97.1%</div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Bandwidth Saved</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-card text-center">
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-foreground">SHA-1</div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Digest Stripping</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-card text-center">
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-foreground">10,000+</div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Indexed Chapters</div>
          </div>
          <div className="p-3.5 rounded-xl border border-[var(--pomelli-gold)]/40 bg-card text-center">
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-[var(--pomelli-gold)]">0 kB</div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Internet on Atlas</div>
          </div>
        </div>

        {/* Sequential 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="study-card-item p-4 sm:p-5 rounded-2xl border border-border bg-card flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-secondary text-primary border border-border">
                  STAGE 01
                </span>
                <FileCheck2 className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-base text-foreground font-heading">Watermark Stripping</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-body">
                Parses PDF object tree directly. Repeated full-page agency watermarks are identified via SHA-1 hashes and excised at byte stream level.
              </p>
            </div>
            <div className="pt-4 border-t border-border mt-5 text-[11px] font-mono text-primary">
              ✓ 100% Vector Intact
            </div>
          </div>

          <div className="study-card-item p-4 sm:p-5 rounded-2xl border border-border bg-card flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-secondary text-primary border border-border">
                  STAGE 02
                </span>
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-base text-foreground font-heading">Lossless Compression</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-body">
                FlateDecode deflation, alpha-white background cleansing, and dictionary coalescing compress 40MB textbooks down to sub-1.5MB for fast loading.
              </p>
            </div>
            <div className="pt-4 border-t border-border mt-5 text-[11px] font-mono text-primary">
              ✓ Sub-100ms Page Stream
            </div>
          </div>

          <div className="study-card-item p-4 sm:p-5 rounded-2xl border border-[var(--pomelli-gold)]/40 bg-card flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--pomelli-gold)]/15 text-[var(--pomelli-gold)] border border-[var(--pomelli-gold)]/30">
                  STAGE 03
                </span>
                <Cpu className="w-4 h-4 text-[var(--pomelli-gold)]" />
              </div>
              <h3 className="font-bold text-base text-foreground font-heading">Universal Access</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-body">
                Read free in any modern web browser or load textbooks onto the physical Atlas ESP32 Handheld Slate for distraction-free offline studying.
              </p>
            </div>
            <div className="pt-4 border-t border-border mt-5 text-[11px] font-mono text-[var(--pomelli-gold)]">
              ✓ Free Web + Open Hardware
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
