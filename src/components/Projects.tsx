import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  GlobeIcon,
  Component1Icon,
  ArrowTopRightIcon,
  GitHubLogoIcon,
  CheckCircledIcon,
  RadiobuttonIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"all" | "web" | "hardware">("all");

  const ecosystemItems = [
    {
      id: "web-hub",
      type: "web" as const,
      name: "NovaSlate Cloud Web Platform",
      badge: "Cloud Platform · Evolving",
      tagline: "Universal access for every connected browser.",
      description:
        "High-performance web application providing instant high-DPI textbook rendering, Class 1–12 search, chapter bookmarking, and zero-distraction student workflows.",
      specs: [
        { label: "Frontend", value: "React 19 · Vite 8" },
        { label: "Auth & DB", value: "Supabase PostgreSQL" },
        { label: "Storage CDN", value: "Supabase Storage (PDF.js)" },
        { label: "AI Explainer", value: "Gemini 2.0 Flash" },
      ],
      icon: GlobeIcon,
      repoUrl: "https://github.com/Reyansh-Niranjan/novaslate",
      imageUrl: "/novaslate_site.png",
      actionText: "Open Digital Library",
      actionHash: "#login",
    },
    {
      id: "hardware-device",
      type: "hardware" as const,
      name: "Atlas ESP32 Physical Reader",
      badge: "Embedded Hardware · Permanent",
      tagline: "Autonomous physical reader for zero-connectivity classrooms.",
      description:
        "Engineered as a fixed physical constant: tactile D-pad navigation, high-contrast monochrome display, and MicroSD card storage pre-flashed with 12 years of textbooks.",
      specs: [
        { label: "Microcontroller", value: "ESP-WROOM-32 Dual Core" },
        { label: "Storage Bus", value: "MicroSD FAT32 (SPI)" },
        { label: "Display Driver", value: "Custom Embedded C++" },
        { label: "Battery Life", value: "18+ Hours Active Reading" },
      ],
      icon: Component1Icon,
      repoUrl: "https://github.com/Reyansh-Niranjan/novaslate",
      imageUrl: "/esp32_device.jpeg",
      actionText: "Order Atlas Device",
      actionHash: "#pricing",
    },
  ];

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
              ".ecosystem-header-el",
              { y: 20, autoAlpha: 0 },
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

            gsap.fromTo(
              ".gsap-ecosystem-card",
              { y: 28, autoAlpha: 0 },
              {
                scrollTrigger: {
                  trigger: ".ecosystem-cards-grid",
                  start: "top 80%",
                  once: true,
                },
                y: 0,
                autoAlpha: 1,
                stagger: 0.12,
                duration: 0.5,
                ease: "power3.out",
                clearProps: "all",
              }
            );
          } else {
            gsap.set([".ecosystem-header-el", ".gsap-ecosystem-card"], {
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

  const navigateTo = (hash: string) => {
    window.history.pushState({}, "", hash);
    window.dispatchEvent(new Event("hashchange"));
  };

  const filteredItems =
    activeTab === "all" ? ecosystemItems : ecosystemItems.filter((i) => i.type === activeTab);

  return (
    <section
      id="hardware"
      ref={containerRef}
      className="py-16 sm:py-24 relative overflow-hidden bg-background border-b border-border/70"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <h2 className="ecosystem-header-el text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4 font-heading leading-tight">
            Dual ecosystem:{" "}
            <span className="text-primary font-serif italic font-normal text-2xl sm:text-3xl md:text-4xl">
              Evolving software, permanent hardware.
            </span>
          </h2>

          <p className="ecosystem-header-el text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[55ch] font-body">
            NovaSlate delivers curriculum everywhere: a fast, evolving web application for connected devices, paired with the fixed, dependable <strong className="text-foreground font-heading">Atlas ESP32</strong> hardware reader for zero-connectivity rural classrooms.
          </p>

          {/* Interactive Filter Pills */}
          <div className="ecosystem-header-el flex items-center gap-2 pt-5">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all interactive-tap cursor-pointer ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              All Components (2)
            </button>
            <button
              onClick={() => setActiveTab("web")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all interactive-tap cursor-pointer ${
                activeTab === "web"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              Cloud Platform
            </button>
            <button
              onClick={() => setActiveTab("hardware")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all interactive-tap cursor-pointer ${
                activeTab === "hardware"
                  ? "bg-[var(--pomelli-gold)] text-[#121212] shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              Atlas Hardware
            </button>
          </div>
        </div>

        {/* The Permanence Philosophy Callout Banner */}
        <div className="ecosystem-header-el p-5 sm:p-6 rounded-3xl border border-border bg-card relative overflow-hidden shadow-xs mb-10 sm:mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4 max-w-2xl">
              <div className="p-3 rounded-2xl bg-primary text-primary-foreground shrink-0 mt-0.5">
                <CheckCircledIcon className="w-5 h-5" />
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

            <div className="flex items-center sm:self-auto self-stretch justify-between lg:flex-col lg:items-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/60 w-full lg:w-auto">
              <div className="flex items-center gap-2 font-mono text-xs text-foreground">
                <RadiobuttonIcon className="w-3.5 h-3.5 text-primary" />
                <span className="font-bold">0% Planned Obsolescence</span>
              </div>
              <div className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Permanent Open Hardware
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Showcase Grid */}
        <div className="ecosystem-cards-grid grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isAtlas = item.id === "hardware-device";
            return (
              <div
                key={item.id}
                className="gsap-ecosystem-card rounded-3xl border border-border bg-card overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-primary/50 hover:shadow-xl shadow-xs"
              >
                {/* Visual Preview Frame with Aspect Ratio */}
                <div className="relative aspect-[16/10] w-full border-b border-border overflow-hidden bg-secondary/40">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <span
                      className={`text-xs font-bold font-mono tracking-wider px-3 py-1 rounded-full backdrop-blur-md border ${
                        isAtlas
                          ? "bg-[var(--pomelli-gold)]/20 text-[var(--pomelli-gold)] border-[var(--pomelli-gold)]/40"
                          : "bg-primary/20 text-primary border-primary/40"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-1 flex items-center gap-2 font-heading">
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
                          <span className="text-muted-foreground block text-[11px] font-mono tracking-wider">
                            {spec.label}
                          </span>
                          <span className="font-semibold text-foreground font-mono">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tactile Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={() => navigateTo(item.actionHash)}
                      className="h-10 px-5 rounded-full text-xs font-bold font-heading bg-primary text-primary-foreground hover:opacity-90 gap-1.5 shadow-xs interactive-tap active:scale-[0.97] cursor-pointer"
                    >
                      <span>{item.actionText}</span>
                      <ArrowTopRightIcon className="w-3.5 h-3.5" />
                    </Button>
                    <a
                      href={item.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 px-4 rounded-full text-xs font-semibold font-heading border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors inline-flex items-center gap-1.5 interactive-tap active:scale-[0.97] cursor-pointer"
                    >
                      <GitHubLogoIcon className="w-3.5 h-3.5" />
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
