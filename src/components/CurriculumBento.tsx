import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  LayersIcon,
  CpuIcon,
  FolderIcon,
  SparklesIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface GradeInfo {
  grade: number;
  label: string;
  subjects: number;
  books: number;
  curriculum: string;
}

const grades: GradeInfo[] = [
  { grade: 1, label: "Class 1", subjects: 4, books: 8, curriculum: "NEP Foundational" },
  { grade: 2, label: "Class 2", subjects: 4, books: 8, curriculum: "NEP Foundational" },
  { grade: 3, label: "Class 3", subjects: 5, books: 12, curriculum: "NEP Preparatory" },
  { grade: 4, label: "Class 4", subjects: 5, books: 14, curriculum: "NEP Preparatory" },
  { grade: 5, label: "Class 5", subjects: 6, books: 16, curriculum: "NEP Preparatory" },
  { grade: 6, label: "Class 6", subjects: 7, books: 22, curriculum: "NEP Middle" },
  { grade: 7, label: "Class 7", subjects: 7, books: 24, curriculum: "NEP Middle" },
  { grade: 8, label: "Class 8", subjects: 8, books: 28, curriculum: "NEP Middle" },
  { grade: 9, label: "Class 9", subjects: 9, books: 34, curriculum: "NEP Secondary" },
  { grade: 10, label: "Class 10", subjects: 10, books: 42, curriculum: "CBSE / State Boards" },
  { grade: 11, label: "Class 11", subjects: 14, books: 68, curriculum: "Science / Commerce / Arts" },
  { grade: 12, label: "Class 12", subjects: 16, books: 76, curriculum: "Board Exam + CUET Spec" },
];

interface TreeNode {
  name: string;
  type: "folder" | "file";
  size?: string;
  children?: TreeNode[];
}

const fat32Tree: TreeNode = {
  name: "SD_ROOT:/",
  type: "folder",
  children: [
    {
      name: "NCERT_CLASS_12",
      type: "folder",
      children: [
        { name: "Physics_Part1_Clean.pdf", type: "file", size: "14.2 MB" },
        { name: "Chemistry_Part1_Clean.pdf", type: "file", size: "18.6 MB" },
        { name: "Mathematics_Part1_Clean.pdf", type: "file", size: "12.1 MB" },
      ],
    },
    {
      name: "CACHE_DITHERED",
      type: "folder",
      children: [
        { name: "page_001_1bit.raw", type: "file", size: "64 KB" },
        { name: "page_002_1bit.raw", type: "file", size: "64 KB" },
      ],
    },
    { name: "SYSTEM.CFG", type: "file", size: "1 KB" },
  ],
};

export default function CurriculumBento() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedGrade, setSelectedGrade] = useState<number>(12);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "SD_ROOT:/": true,
    "NCERT_CLASS_12": true,
    "CACHE_DITHERED": false,
  });
  const [promptInput, setPromptInput] = useState<string>("Explain Lenz's Law in simple terms");
  const [aiOutput, setAiOutput] = useState<string>(
    "Lenz's Law states that an induced electric current always flows in such a direction that the magnetic field it creates opposes the magnetic field that produced it. Think of it as electromagnetic inertia — the circuit resists the change in magnetic flux."
  );
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const activeGrade = grades.find((g) => g.grade === selectedGrade) || grades[11];

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
              ".bento-header-item",
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
              ".bento-tile",
              { y: 30, autoAlpha: 0 },
              {
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top 75%",
                  once: true,
                },
                y: 0,
                autoAlpha: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: "power3.out",
                clearProps: "all",
              }
            );
          } else {
            gsap.set([".bento-header-item", ".bento-tile"], {
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

  const toggleFolder = (name: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSimulatePrompt = (query: string, explanation: string) => {
    if (isTyping) return;
    setPromptInput(query);
    setIsTyping(true);
    setAiOutput("");

    let i = 0;
    const interval = setInterval(() => {
      if (i < explanation.length) {
        setAiOutput(explanation.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 12);
  };

  return (
    <section
      id="curriculum"
      ref={containerRef}
      className="py-20 sm:py-32 relative overflow-hidden bg-background text-foreground"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-1/4 right-0 w-[450px] h-[450px] bg-primary/8 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 w-[450px] h-[450px] bg-accent/8 rounded-full blur-[140px]" />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="border-b border-border/80 pb-12 mb-16 bento-header-item">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-secondary/80 border border-primary/30 text-primary">
              <LayersIcon className="w-3.5 h-3.5" />
              <span>// 03_CURRICULUM_BENTO_MATRIX</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              NEP 2020 COMPLIANT · CLASS 1–12 DUAL ENGINE
            </div>
          </div>

          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight leading-[1.1] text-foreground mb-4">
              Everything indexed.{" "}
              <span className="font-serif italic font-normal text-primary">
                Engineered from the byte up.
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-body leading-relaxed max-w-2xl">
              Explore the four architectural pillars of NovaSlate: an exhaustive Class 1–12 curriculum catalog, direct ESP32 hardware telemetry, raw FAT32 offline storage, and generative AI concept synthesis.
            </p>
          </div>
        </div>

        {/* Bento Grid: 2-column or 3-column asymmetric layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Tile 1: Class 1–12 Interactive Grade Matrix (Span 12 on mobile, 8 on desktop) */}
          <div className="bento-tile md:col-span-8 rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">
                  Class 1–12 Catalog
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60">
                  {activeGrade.curriculum}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-2">
                Interactive Grade Selector
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-body mb-6 max-w-xl">
                Every NCERT textbook is parsed into chapters, scrubbed of government watermarks, and compiled for instant rendering or e-ink flash.
              </p>

              {/* Grade Tabs Slider */}
              <div className="flex flex-wrap gap-2 mb-6">
                {grades.map((g) => (
                  <button
                    key={g.grade}
                    onClick={() => setSelectedGrade(g.grade)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 interactive-tap active:scale-[0.97] cursor-pointer ${
                      selectedGrade === g.grade
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/30"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border/60"
                    }`}
                  >
                    Class {g.grade}
                  </button>
                ))}
              </div>

              {/* Selected Grade Metrics Card */}
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Subjects Covered</div>
                  <div className="text-lg font-bold text-foreground mt-0.5">{activeGrade.subjects} Subjects</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Watermark-Clean Books</div>
                  <div className="text-lg font-bold text-primary mt-0.5">{activeGrade.books} Volumes</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-muted-foreground uppercase">Platform Access</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">100% Free Forever</div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>Automatic Chapter Extraction</span>
              <span className="text-primary font-bold">100% Sanitized Vectors</span>
            </div>
          </div>

          {/* Tile 2: ESP32 Hardware Bus Telemetry (Span 12 on mobile, 4 on desktop) */}
          <div className="bento-tile md:col-span-4 rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-mono font-bold tracking-widest text-accent uppercase">
                  Atlas Hardware
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0">
                  <CpuIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-foreground">
                    ESP32-S3 Core
                  </h3>
                  <div className="text-xs font-mono text-muted-foreground">Hardware Bus Specs</div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground font-body mb-5 leading-relaxed">
                The Atlas reader executes low-power embedded C firmware with zero background listeners or trackers.
              </p>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60 flex justify-between items-center">
                  <span className="text-muted-foreground">Clock Speed:</span>
                  <span className="text-foreground font-bold">240 MHz Dual Xtensa</span>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60 flex justify-between items-center">
                  <span className="text-muted-foreground">Internal PSRAM:</span>
                  <span className="text-foreground font-bold">4 MB High-Speed</span>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60 flex justify-between items-center">
                  <span className="text-muted-foreground">Display Bus:</span>
                  <span className="text-primary font-bold">80MHz QSPI Monochrome</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-border/60 text-[11px] font-mono text-muted-foreground flex justify-between">
              <span>Deep Sleep: 15µA</span>
              <span className="text-emerald-400 font-bold">120-Day Standby</span>
            </div>
          </div>

          {/* Tile 3: FAT32 MicroSD Interactive Tree (Span 12 on mobile, 5 on desktop) */}
          <div className="bento-tile md:col-span-5 rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">
                  Storage Engine
                </span>
                <span className="text-xs font-mono text-muted-foreground">FAT32 Direct Block</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0">
                  <FolderIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-foreground">
                    FAT32 File Tree
                  </h3>
                  <div className="text-xs font-mono text-muted-foreground">Direct MicroSD Ingestion</div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground font-body mb-4 leading-relaxed">
                Click folders to inspect how books and pre-rendered 1-bit dither caches are structured for instant page turns.
              </p>

              {/* Interactive Tree View */}
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/80 font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
                {/* SD Root */}
                <div
                  onClick={() => toggleFolder(fat32Tree.name)}
                  className="flex items-center gap-2 text-foreground font-bold cursor-pointer hover:text-primary transition-colors py-0.5 select-none"
                >
                  {expandedFolders[fat32Tree.name] ? (
                    <ChevronDownIcon className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <FolderIcon className="w-3.5 h-3.5 text-accent" />
                  <span>{fat32Tree.name}</span>
                </div>

                {expandedFolders[fat32Tree.name] && (
                  <div className="pl-4 space-y-1.5 border-l border-border/60 ml-2">
                    {fat32Tree.children?.map((child) => (
                      <div key={child.name}>
                        {child.type === "folder" ? (
                          <div>
                            <div
                              onClick={() => toggleFolder(child.name)}
                              className="flex items-center gap-2 text-foreground font-semibold cursor-pointer hover:text-primary transition-colors py-0.5 select-none"
                            >
                              {expandedFolders[child.name] ? (
                                <ChevronDownIcon className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                              <FolderIcon className="w-3.5 h-3.5 text-primary" />
                              <span>{child.name}</span>
                            </div>

                            {expandedFolders[child.name] && (
                              <div className="pl-4 space-y-1 border-l border-border/40 ml-2 text-[11px] text-muted-foreground">
                                {child.children?.map((file) => (
                                  <div key={file.name} className="flex justify-between items-center py-0.5">
                                    <span className="truncate max-w-[180px]">{file.name}</span>
                                    <span className="text-[10px] text-primary">{file.size}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex justify-between items-center text-[11px] text-muted-foreground pl-5 py-0.5">
                            <span>{child.name}</span>
                            <span className="text-[10px] text-muted-foreground">{child.size}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-border/60 text-[11px] font-mono text-muted-foreground flex justify-between">
              <span>Zero Database Lag</span>
              <span className="text-primary font-bold">Direct Sector Read</span>
            </div>
          </div>

          {/* Tile 4: Gemini AI Concept Synthesizer (Span 12 on mobile, 7 on desktop) */}
          <div className="bento-tile md:col-span-7 rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">
                  Generative Reasoning
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Gemini 2.0 Flash
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-foreground">
                    Concept Explainer
                  </h3>
                  <div className="text-xs font-mono text-muted-foreground">Interactive Derivation Assistant</div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground font-body mb-4 leading-relaxed">
                Click a sample STEM topic below to watch how NovaSlate summarizes difficult NCERT formulas into digestible conceptual models.
              </p>

              {/* Sample Prompt Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() =>
                    handleSimulatePrompt(
                      "Explain Lenz's Law in simple terms",
                      "Lenz's Law states that an induced electric current always flows in such a direction that the magnetic field it creates opposes the magnetic field that produced it. Think of it as electromagnetic inertia — the circuit resists the change in magnetic flux."
                    )
                  }
                  className="px-3 py-1 rounded-xl text-xs font-mono bg-secondary hover:bg-secondary/80 text-foreground border border-border/60 transition-colors interactive-tap active:scale-[0.97] cursor-pointer"
                >
                  ⚡ Lenz&apos;s Law
                </button>
                <button
                  onClick={() =>
                    handleSimulatePrompt(
                      "Why does light bend in refraction?",
                      "Light travels at different speeds in different optical mediums. When a wavefront hits a boundary at an angle, one side slows down before the other, causing the entire wave direction to pivot towards the normal."
                    )
                  }
                  className="px-3 py-1 rounded-xl text-xs font-mono bg-secondary hover:bg-secondary/80 text-foreground border border-border/60 transition-colors interactive-tap active:scale-[0.97] cursor-pointer"
                >
                  🌈 Optical Refraction
                </button>
                <button
                  onClick={() =>
                    handleSimulatePrompt(
                      "What is Heisenberg's Uncertainty Principle?",
                      "You cannot simultaneously measure the exact position and momentum of a quantum particle. The more precisely you determine its position (Δx), the less precisely you can know its momentum (Δp), governed by Δx · Δp ≥ ℏ/2."
                    )
                  }
                  className="px-3 py-1 rounded-xl text-xs font-mono bg-secondary hover:bg-secondary/80 text-foreground border border-border/60 transition-colors interactive-tap active:scale-[0.97] cursor-pointer"
                >
                  ⚛️ Quantum Uncertainty
                </button>
              </div>

              {/* AI Terminal Output */}
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 font-mono text-xs space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span>&gt;</span>
                  <span>{promptInput}</span>
                </div>
                <div className="text-foreground/90 leading-relaxed font-body text-xs sm:text-sm min-h-[60px]">
                  {aiOutput}
                  {isTyping && <span className="inline-block w-1.5 h-4 bg-primary ml-1 animate-pulse" />}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-border/60 text-[11px] font-mono text-muted-foreground flex justify-between">
              <span>Grounding: Official NCERT Text</span>
              <span className="text-emerald-400 font-bold">Zero Hallucination Filter</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
