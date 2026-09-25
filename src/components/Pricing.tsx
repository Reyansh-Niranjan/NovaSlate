import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CheckIcon,
  HeartFilledIcon,
  ReaderIcon,
  ArrowRightIcon,
  Component1Icon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Pricing() {
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
            gsap.fromTo(
              ".pricing-header-item",
              { y: 18, autoAlpha: 0 },
              {
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top 85%",
                  once: true,
                },
                y: 0,
                autoAlpha: 1,
                duration: 0.4,
                stagger: 0.06,
                ease: "power3.out",
                clearProps: "all",
              }
            );

            gsap.fromTo(
              ".pricing-card-item",
              { y: 24, autoAlpha: 0 },
              {
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top 75%",
                  once: true,
                },
                y: 0,
                autoAlpha: 1,
                stagger: 0.09,
                duration: 0.42,
                ease: "power3.out",
                clearProps: "all",
              }
            );
          } else {
            gsap.set([".pricing-header-item", ".pricing-card-item"], {
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

  const navigateToLogin = () => {
    window.history.pushState({}, "", "#login");
    window.dispatchEvent(new Event("hashchange"));
  };

  return (
    <section
      id="pricing"
      ref={containerRef}
      className="py-16 sm:py-24 relative overflow-hidden bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        {/* Section Header (Restrained: No redundant eyebrow) */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <h2 className="pricing-header-item text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4 font-heading leading-tight">
            100% Free Software.{" "}
            <span className="text-primary font-serif italic font-normal text-2xl sm:text-3xl md:text-4xl">
              Permanent offline hardware.
            </span>
          </h2>

          <p className="pricing-header-item text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[55ch] font-body">
            NovaSlate is built for public student welfare. The online digital library will never charge a subscription or display an advertisement. Hardware and campus deployments sustain our engineering.
          </p>
        </div>

        {/* The Authentic ₹20 Ad Removal Welfare Story Banner */}
        <div className="pricing-header-item p-5 sm:p-6 rounded-2xl border border-[var(--pomelli-crimson)]/20 bg-[var(--pomelli-crimson)]/5 mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-2 text-[var(--pomelli-crimson)] shrink-0">
              <HeartFilledIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-foreground font-heading">
                  The ₹20 Ad Profit Story &amp; Our Public Welfare Pledge
                </h3>
                <span className="text-xs font-mono font-bold text-[var(--pomelli-crimson)]">
                  Guaranteed Ad-Free
                </span>
              </div>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-body max-w-[65ch]">
                In our earliest iteration, NovaSlate briefly experimented with small display ads that yielded approximately <strong>₹20 in total profit</strong>. Recognizing that commercial advertising exploits student focus and introduces intrusive surveillance trackers, we permanently purged all advertisements and paywalls. Today, NovaSlate's web platform is 100% free, tracker-free, and dedicated solely to educational equity for Indian students.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Tier SaaS Cards Grid with Duolingo-style fluid hover states */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {/* Tier 1: Open Scholar (₹0) */}
          <div className="pricing-card-item rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-primary/50 transition-fluid">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-mono font-bold tracking-wider text-muted-foreground">
                  Students &amp; Self-Learners
                </span>
                <span className="text-xs font-bold text-primary font-mono">
                  Public Good
                </span>
              </div>

              <h3 className="text-xl font-bold text-foreground font-heading mb-2">
                Open Scholar
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-body mb-6">
                Unlimited digital web reading across the entire Class 1–12 catalog for all students.
              </p>

              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground font-heading">₹0</span>
                  <span className="text-xs text-muted-foreground font-mono">/ Free Forever</span>
                </div>
                <span className="text-xs text-primary font-mono block mt-1">
                  No credit card · No account lockout
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2.5 text-xs text-foreground font-body">
                  <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Class 1–12 complete NCERT &amp; State Board catalog</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-foreground font-body">
                  <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Watermark-sanitized high-DPI in-browser reader</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-foreground font-body">
                  <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Interactive chapter notes &amp; formula indexes</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-foreground font-body">
                  <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Chapter PDF downloads &amp; offline browser caching</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-foreground font-body">
                  <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>100% ad-free, zero trackers, zero paywalls</strong></span>
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              onClick={navigateToLogin}
              className="w-full h-11 font-bold font-heading border-border text-foreground hover:bg-secondary hover:border-primary/50 transition-fluid cursor-pointer rounded-lg interactive-tap active:scale-[0.97]"
            >
              <ReaderIcon className="w-4 h-4 text-primary" />
              <span>Launch Free Library</span>
            </Button>
          </div>

          {/* Tier 2: Atlas ESP32 Reader (Featured Tier) */}
          <div className="pricing-card-item rounded-2xl border-2 border-primary bg-card p-6 sm:p-8 pt-8 sm:pt-10 flex flex-col justify-between shadow-md relative hover:shadow-lg transition-fluid">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold font-mono px-3.5 py-1 rounded-full shadow-md">
              ★ Physical Hardware · At-Cost
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-mono font-bold tracking-wider text-primary">
                  Offline Classroom
                </span>
                <span className="text-xs font-bold text-primary font-mono">
                  Permanent Device
                </span>
              </div>

              <h3 className="text-xl font-bold text-foreground font-heading mb-2">
                Atlas ESP32 Reader
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-body mb-6">
                Autonomous physical handheld reader preloaded with 12 years of textbooks for zero-connectivity study.
              </p>

              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground font-heading">₹1,499</span>
                  <span className="text-xs text-muted-foreground font-mono">one-time / device</span>
                </div>
                <span className="text-xs text-[var(--pomelli-gold)] font-mono block mt-1">
                  Zero recurring subscription · At manufacturing cost
                </span>
              </div>

              <div className="border-l-2 border-primary pl-3 py-1 mb-6">
                <span className="text-xs font-bold text-foreground font-heading block mb-0.5">
                  Fixed Hardware Architecture:
                </span>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  The Atlas hardware does not change—it is engineered as a permanent, reliable physical constant for low-connectivity India.
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2.5 text-xs text-foreground font-body">
                  <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>ESP-WROOM-32 Dual-Core embedded hardware unit</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-foreground font-body">
                  <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>32GB MicroSD pre-flashed with complete Class 1–12 library</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-foreground font-body">
                  <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>High-contrast monochrome e-paper display (zero eye strain)</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-foreground font-body">
                  <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Tactile physical D-pad for rapid page navigation</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-foreground font-body">
                  <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Zero internet, zero SIM card, 30-day battery endurance</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={() => {
                window.location.href = "mailto:deployments@novaslate.org?subject=Atlas%20Hardware%20Inquiry";
              }}
              className="w-full h-11 font-bold font-heading bg-primary text-primary-foreground hover:opacity-90 transition-fluid cursor-pointer shadow-xs gap-2 rounded-lg interactive-tap active:scale-[0.97]"
            >
              <Component1Icon className="w-4 h-4" />
              <span>Order Atlas Device</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Tier 3: Campus Deployment */}
          <div className="pricing-card-item rounded-2xl border border-border/60 bg-card p-6 sm:p-8 flex flex-col justify-between transition-fluid relative">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono tracking-wider text-muted-foreground">
                  Institutional Partnership
                </span>
                <span className="text-xs font-mono text-accent flex items-center gap-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Planned Feature
                </span>
              </div>

              <h3 className="text-xl font-bold text-foreground font-heading mb-2">
                Campus Deployment
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-body mb-6">
                Complete classroom reader hardware, zero-bandwidth local caching hubs, and board curriculum ingestion.
              </p>

              <div className="mb-6 pb-4 border-b border-border/40">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground font-heading tracking-tight">Planned Release</span>
                  <span className="text-xs text-muted-foreground font-mono">/ roadmap</span>
                </div>
                <p className="text-xs text-muted-foreground/90 font-mono mt-1.5">
                  Scheduled for upcoming development cycle for district school fleets
                </p>
              </div>

              {/* Micro-Deliverables Section - Clean Flat Layout */}
              <div className="divide-y divide-border/40 py-2 mb-6">
                <div className="py-2.5 text-xs font-body">
                  <div className="font-semibold text-foreground text-xs font-mono mb-0.5 text-primary">01. Bulk Atlas Readers</div>
                  <p className="text-xs text-muted-foreground leading-normal">Classroom hardware bundles with pre-flashed offline storage</p>
                </div>
                <div className="py-2.5 text-xs font-body">
                  <div className="font-semibold text-foreground text-xs font-mono mb-0.5 text-primary">02. Campus Cache Hub</div>
                  <p className="text-xs text-muted-foreground leading-normal">Local LAN server enabling zero-bandwidth textbook sync</p>
                </div>
                <div className="py-2.5 text-xs font-body">
                  <div className="font-semibold text-foreground text-xs font-mono mb-0.5 text-primary">03. Regional Boards</div>
                  <p className="text-xs text-muted-foreground leading-normal">State Boards, ICSE, and local vernacular curriculum ingestion</p>
                </div>
                <div className="py-2.5 text-xs font-body">
                  <div className="font-semibold text-foreground text-xs font-mono mb-0.5 text-primary">04. Engineer SLA</div>
                  <p className="text-xs text-muted-foreground leading-normal">On-site setup, hardware swap SLA, and telemetry monitoring</p>
                </div>
              </div>
            </div>

            {/* Minimalist Planned Status Footer */}
            <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs font-mono text-muted-foreground mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent/80" />
                <span>Availability:</span>
              </span>
              <span className="text-xs font-mono text-foreground font-semibold">
                Future Roadmap Item
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
