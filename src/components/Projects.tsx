import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Globe, Cpu, ArrowUpRight, Github, ShieldCheck, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);

  const ecosystemItems = [
    {
      id: "web-hub",
      name: "NovaSlate Cloud Web Platform",
      badge: "Cloud Platform · Evolving",
      badgeVariant: "blue" as const,
      tagline: "Universal access for every connected browser.",
      description:
        "High-performance web application providing instant high-DPI textbook rendering, Class 1–12 search, chapter bookmarking, and zero-distraction student workflows.",
      specs: [
        { label: "Frontend", value: "React 19 · Vite 8" },
        { label: "Auth & DB", value: "Supabase PostgreSQL" },
        { label: "Storage CDN", value: "Supabase Storage (PDF.js)" },
        { label: "AI Explainer", value: "Gemini 2.0 Flash" },
      ],
      icon: Globe,
      repoUrl: "https://github.com/Reyansh-Niranjan/novaslate",
      imageUrl: "/novaslate_site.png",
      actionText: "Open Digital Library",
      actionHash: "#login",
    },
    {
      id: "hardware-device",
      name: "Atlas ESP32 Physical Reader",
      badge: "Embedded Hardware · Permanent",
      badgeVariant: "amber" as const,
      tagline: "Autonomous physical reader for zero-connectivity classrooms.",
      description:
        "Engineered as a fixed physical constant: tactile D-pad navigation, high-contrast monochrome display, and MicroSD card storage pre-flashed with 12 years of textbooks.",
      specs: [
        { label: "Microcontroller", value: "ESP-WROOM-32 Dual Core" },
        { label: "Storage Bus", value: "MicroSD FAT32 (SPI)" },
        { label: "Display Driver", value: "Custom Embedded C++" },
        { label: "Battery Life", value: "18+ Hours Active Reading" },
      ],
      icon: Cpu,
      repoUrl: "https://github.com/Reyansh-Niranjan/novaslate",
      imageUrl: "/esp32_device.jpeg",
      actionText: "Order Atlas Device",
      actionHash: "#pricing",
    },
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".ecosystem-header-item",
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
          ".gsap-ecosystem-card",
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
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  const navigateTo = (hash: string) => {
    window.history.pushState({}, "", hash);
    window.dispatchEvent(new Event("hashchange"));
  };

  return (
    <section
      id="hardware"
      ref={containerRef}
      className="py-16 sm:py-28 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="ecosystem-header-item inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-secondary text-primary border border-border mb-3 font-heading">
            <Cpu className="w-3.5 h-3.5" />
            Hardware Companion &amp; Cloud Platform
          </div>

          <h2 className="ecosystem-header-item text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4 font-heading leading-tight">
            Dual ecosystem:{" "}
            <span className="text-primary font-serif italic font-normal text-2xl sm:text-3xl md:text-4xl">
              Evolving software, permanent hardware.
            </span>
          </h2>

          <p className="ecosystem-header-item text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[55ch] font-body">
            NovaSlate delivers curriculum everywhere: a fast, evolving web application for connected devices, paired with the fixed, dependable <strong className="text-foreground font-heading">Atlas ESP32</strong> hardware reader for zero-connectivity rural classrooms.
          </p>
        </div>

        {/* The Permanence Philosophy Callout Banner */}
        <div className="ecosystem-header-item p-4 sm:p-5 rounded-2xl border border-border bg-card relative overflow-hidden shadow-xs mb-10 sm:mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-5 relative z-10">
            {/* Left side: Icon + Content */}
            <div className="flex items-start gap-3.5 sm:gap-4 max-w-2xl">
              <div className="p-2.5 sm:p-3 rounded-xl bg-primary text-primary-foreground shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-primary">
                    The Atlas Permanence Principle
                  </span>
                  <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                    · Hardware is fixed · Software evolves
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground font-heading">
                  Hardware is fixed. <span className="text-primary font-serif italic font-normal">Software evolves.</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-[60ch]">
                  The physical Atlas reader will never be artificially obsoleted. Its ESP32 microcontroller, tactile physical buttons, and non-volatile offline flash are engineered as a permanent, reliable educational tool for rural classrooms.
                </p>
              </div>
            </div>

            {/* Right side: Hardware metrics badge */}
            <div className="flex items-center sm:self-auto self-stretch justify-between lg:flex-col lg:items-end gap-2.5 sm:gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/60 w-full lg:w-auto">
              <div className="flex items-center gap-2 font-mono text-xs text-foreground">
                <Radio className="w-3.5 h-3.5 text-primary" />
                <span className="font-bold">0% Planned Obsolescence</span>
              </div>
              <div className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Permanent Open Hardware
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {ecosystemItems.map((item) => {
            const Icon = item.icon;
            const isAtlas = item.id === "hardware-device";
            return (
              <div
                key={item.id}
                className="gsap-ecosystem-card rounded-2xl border border-border bg-card overflow-hidden flex flex-col justify-between transition-colors hover:border-primary/50 shadow-xs"
              >
                {/* Visual Preview Frame */}
                <div className="relative aspect-[16/10] w-full border-b border-border overflow-hidden bg-secondary/40">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`text-xs font-bold font-mono tracking-wider ${
                        isAtlas
                          ? "text-[var(--pomelli-gold)]"
                          : "text-primary"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mb-1 flex items-center gap-2 font-heading">
                      <Icon className="w-5 h-5 text-primary shrink-0" />
                      <span>{item.name}</span>
                    </h3>

                    <p className="text-xs font-semibold text-primary font-heading mb-3">
                      {item.tagline}
                    </p>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 font-body">
                      {item.description}
                    </p>

                    {/* Spec Grid */}
                    <div className="grid grid-cols-2 gap-3 py-4 border-y border-border mb-6">
                      {item.specs.map((spec) => (
                        <div key={spec.label} className="text-xs">
                          <span className="text-muted-foreground block text-xs font-mono tracking-wider">
                            {spec.label}
                          </span>
                          <span className="font-semibold text-foreground font-mono">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={() => navigateTo(item.actionHash)}
                      className="h-10 px-5 rounded-lg text-xs font-bold font-heading bg-primary text-primary-foreground hover:opacity-90 gap-1.5 shadow-xs"
                    >
                      <span>{item.actionText}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                    <a
                      href={item.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 px-4 rounded-lg text-xs font-semibold font-heading border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors inline-flex items-center gap-1.5"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Source</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
