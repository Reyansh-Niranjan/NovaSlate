import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FileTextIcon,
  Component1Icon,
  LightningBoltIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const counterRef = useRef<HTMLSpanElement>(null);

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
            // Header reveal
            gsap.fromTo(
              ".sanitizer-header-item",
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

            // Metric counter rolling ticker
            const obj = { val: 0 };
            gsap.to(obj, {
              val: 97.1,
              duration: 1.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: ".sanitizer-metric-ribbon",
                start: "top 80%",
                once: true,
              },
              onUpdate: () => {
                if (counterRef.current) {
                  counterRef.current.innerText = obj.val.toFixed(1) + "%";
                }
              },
            });

            // 3 Stages staggered entrance
            gsap.fromTo(
              ".sanitizer-stage-card",
              { y: 26, autoAlpha: 0 },
              {
                scrollTrigger: {
                  trigger: ".sanitizer-stages-container",
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
            if (counterRef.current) counterRef.current.innerText = "97.1%";
            gsap.set([".sanitizer-header-item", ".sanitizer-stage-card"], {
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
      id="sanitizer"
      ref={containerRef}
      className="py-16 sm:py-24 relative bg-background border-b border-border/70"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Section Header (Restrained: No eyebrow) */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="sanitizer-header-item text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground font-heading">
            Raw curriculum data,{" "}
            <span className="text-primary font-serif italic font-normal">distilled.</span>
          </h2>
          <p className="sanitizer-header-item mt-3 text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-[50ch] mx-auto">
            Our byte-level pipeline parses government PDF streams, strips intrusive agency watermarks, and compiles distraction-free study notes.
          </p>
        </div>

        {/* ── Interactive Before / After Watermark Sanitizer Preview ── */}
        <div className="sanitizer-header-item mb-12 max-w-4xl mx-auto rounded-3xl border border-border bg-card overflow-hidden shadow-md">
          {/* Top telemetry bar */}
          <div className="p-3.5 sm:p-4 border-b border-border bg-secondary/50 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-foreground">Interactive Sanitizer Engine</span>
              <span className="text-muted-foreground hidden sm:inline">· SHA-1 Stream Slicer</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
              <span className="text-destructive font-semibold">◀ Drag to compare Raw</span>
              <span className="text-border">|</span>
              <span className="text-primary font-semibold">Sanitized Vector Stream ▶</span>
            </div>
          </div>

          {/* Interactive Comparison Canvas */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden select-none bg-background">
            {/* Sanitized Layer (Clean Background - Right) */}
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between bg-card text-foreground">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                  <CheckCircledIcon className="w-3.5 h-3.5" />
                  <span>SANITIZED VECTOR STREAM · 100% READABLE</span>
                </div>
                <h4 className="text-lg sm:text-2xl font-bold font-heading text-foreground">
                  Light: Reflection &amp; Refraction — Chapter 10
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-xl">
                  &ldquo;A concave mirror reflects parallel rays of light inward toward a single focal point (F). The relationship between focal length (f), object distance (u), and image distance (v) is given by the Mirror Formula: 1/f = 1/v + 1/u.&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-border/80 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Ray Equation:</span>
                  <span className="font-bold text-primary">sin(i) / sin(r) = n₂₁</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>✓ 0 Watermark Artifacts</span>
                </div>
              </div>
            </div>

            {/* Watermarked Layer (Obscured - Left) Clipped by Slider */}
            <div
              className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between bg-muted/60 text-muted-foreground pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              }}
            >
              {/* Intrusive diagonal agency watermark simulation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 rotate-[-22deg] select-none">
                <span className="text-4xl sm:text-7xl font-black font-mono tracking-widest text-destructive">
                  UNREGISTERED COPY • SAMPLE ONLY • ARCHIVE
                </span>
              </div>

              <div className="space-y-2 opacity-65">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-destructive/15 text-destructive font-mono text-[10px] font-bold">
                  <span>RAW UNPROCESSED SCAN · HEAVY WATERMARKS</span>
                </div>
                <h4 className="text-lg sm:text-2xl font-bold font-heading text-foreground/80 line-through">
                  Light: Reflection &amp; Refraction — Chapter 10
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-xl blur-[0.5px]">
                  &ldquo;A concave mirror reflects parallel rays of light inward toward a single focal point (F). The relationship between focal length (f), object distance (u), and image distance (v) is given by the Mirror Formula: 1/f = 1/v + 1/u.&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-destructive/30 font-mono text-xs text-destructive">
                <span>⚠ 48MB Bloated PDF</span>
                <span className="hidden sm:inline">⚠ Background Hash Clutter</span>
              </div>
            </div>

            {/* Draggable Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg pointer-events-none z-20"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground border-2 border-background shadow-md flex items-center justify-center text-[11px] font-bold">
                ◀▶
              </div>
            </div>

            {/* Invisible Native Accessible Slider Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              aria-label="Watermark Sanitizer Comparison Slider"
              className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full m-0"
            />
          </div>
        </div>

        {/* ── Metric Ribbon with Rolling Ticker ── */}
        <div className="sanitizer-metric-ribbon grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card text-center interactive-tap shadow-2xs hover:border-primary/40 transition-all">
            <div className="font-mono text-2xl sm:text-3xl font-black text-primary">
              <span ref={counterRef}>97.1%</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Bandwidth Saved</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card text-center interactive-tap shadow-2xs hover:border-primary/40 transition-all">
            <div className="font-mono text-2xl sm:text-3xl font-black text-foreground">SHA-1</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Digest Stripping</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card text-center interactive-tap shadow-2xs hover:border-primary/40 transition-all">
            <div className="font-mono text-2xl sm:text-3xl font-black text-foreground">10,000+</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Indexed Chapters</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--pomelli-gold)]/40 bg-card text-center interactive-tap shadow-2xs hover:border-[var(--pomelli-gold)] transition-all">
            <div className="font-mono text-2xl sm:text-3xl font-black text-[var(--pomelli-gold)]">0 kB</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Internet on Atlas</div>
          </div>
        </div>

        {/* ── Sequential 3 Pillars with Animated Line Connections ── */}
        <div className="sanitizer-stages-container grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="sanitizer-stage-card p-6 rounded-3xl border border-border bg-card flex flex-col justify-between shadow-xs transition-all hover:border-primary/50 hover:shadow-md interactive-tap">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 rounded bg-primary/10">
                  Stage 01
                </span>
                <FileTextIcon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground font-heading">Watermark Stripping</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                Parses PDF object tree directly. Repeated full-page agency watermarks are identified via SHA-1 hashes and excised at byte stream level.
              </p>
            </div>
            <div className="pt-4 border-t border-border mt-6 text-xs font-mono text-primary font-semibold flex items-center justify-between">
              <span>✓ 100% Vector Intact</span>
              <span className="text-[10px] opacity-70">STAGE COMPLETE</span>
            </div>
          </div>

          <div className="sanitizer-stage-card p-6 rounded-3xl border border-border bg-card flex flex-col justify-between shadow-xs transition-all hover:border-primary/50 hover:shadow-md interactive-tap">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 rounded bg-primary/10">
                  Stage 02
                </span>
                <LightningBoltIcon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground font-heading">Lossless Compression</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                FlateDecode deflation, alpha-white background cleansing, and dictionary coalescing compress 40MB textbooks down to sub-1.5MB for fast loading.
              </p>
            </div>
            <div className="pt-4 border-t border-border mt-6 text-xs font-mono text-primary font-semibold flex items-center justify-between">
              <span>✓ Sub-100ms Page Stream</span>
              <span className="text-[10px] opacity-70">DEFLATE OPTIMIZED</span>
            </div>
          </div>

          <div className="sanitizer-stage-card p-6 rounded-3xl border border-[var(--pomelli-gold)]/40 bg-card flex flex-col justify-between shadow-xs transition-all hover:border-[var(--pomelli-gold)] hover:shadow-md interactive-tap">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[var(--pomelli-gold)] px-2.5 py-1 rounded bg-[var(--pomelli-gold)]/10">
                  Stage 03
                </span>
                <Component1Icon className="w-5 h-5 text-[var(--pomelli-gold)]" />
              </div>
              <h3 className="font-bold text-lg text-foreground font-heading">Universal Access</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                Read free in any modern web browser or load textbooks onto the physical Atlas ESP32 Handheld Slate for distraction-free offline studying.
              </p>
            </div>
            <div className="pt-4 border-t border-border mt-6 text-xs font-mono text-[var(--pomelli-gold)] font-semibold flex items-center justify-between">
              <span>✓ Free Web + Open Hardware</span>
              <span className="text-[10px] opacity-70">DEPLOYMENT READY</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
