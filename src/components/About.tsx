import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FileTextIcon,
  LayersIcon,
  Component1Icon,
  LightningBoltIcon,
} from "@radix-ui/react-icons";

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
      className="py-16 sm:py-28 relative"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        {/* Centered Compact Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="study-header-item inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-secondary text-primary border border-border mb-3 font-heading">
            <LayersIcon className="w-3.5 h-3.5" />
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
            <div className="text-xs font-mono text-muted-foreground">Bandwidth Saved</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-card text-center">
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-foreground">SHA-1</div>
            <div className="text-xs font-mono text-muted-foreground">Digest Stripping</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-card text-center">
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-foreground">10,000+</div>
            <div className="text-xs font-mono text-muted-foreground">Indexed Chapters</div>
          </div>
          <div className="p-3.5 rounded-xl border border-[var(--pomelli-gold)]/40 bg-card text-center">
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-[var(--pomelli-gold)]">0 kB</div>
            <div className="text-xs font-mono text-muted-foreground">Internet on Atlas</div>
          </div>
        </div>

        {/* Sequential 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="study-card-item p-4 sm:p-5 rounded-2xl border border-border bg-card flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary">
                  Stage 01
                </span>
                <FileTextIcon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-base text-foreground font-heading">Watermark Stripping</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                Parses PDF object tree directly. Repeated full-page agency watermarks are identified via SHA-1 hashes and excised at byte stream level.
              </p>
            </div>
            <div className="pt-4 border-t border-border mt-5 text-xs font-mono text-primary font-semibold">
              ✓ 100% Vector Intact
            </div>
          </div>

          <div className="study-card-item p-4 sm:p-5 rounded-2xl border border-border bg-card flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary">
                  Stage 02
                </span>
                <LightningBoltIcon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-base text-foreground font-heading">Lossless Compression</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                FlateDecode deflation, alpha-white background cleansing, and dictionary coalescing compress 40MB textbooks down to sub-1.5MB for fast loading.
              </p>
            </div>
            <div className="pt-4 border-t border-border mt-5 text-xs font-mono text-primary font-semibold">
              ✓ Sub-100ms Page Stream
            </div>
          </div>

          <div className="study-card-item p-4 sm:p-5 rounded-2xl border border-[var(--pomelli-gold)]/40 bg-card flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[var(--pomelli-gold)]">
                  Stage 03
                </span>
                <Component1Icon className="w-4 h-4 text-[var(--pomelli-gold)]" />
              </div>
              <h3 className="font-bold text-base text-foreground font-heading">Universal Access</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                Read free in any modern web browser or load textbooks onto the physical Atlas ESP32 Handheld Slate for distraction-free offline studying.
              </p>
            </div>
            <div className="pt-4 border-t border-border mt-5 text-xs font-mono text-[var(--pomelli-gold)] font-semibold">
              ✓ Free Web + Open Hardware
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
