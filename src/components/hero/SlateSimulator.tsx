import { useState, useTransition } from "react";
import { Sparkles, Monitor, Tablet, Check, ArrowRight } from "lucide-react";

type SubjectId = "physics" | "math" | "chem" | "bio";

interface SubjectData {
  title: string;
  code: string;
  grade: string;
  formula: string;
  diagramTitle: string;
  bullets: string[];
}

const subjects: Record<SubjectId, SubjectData> = {
  physics: {
    title: "Light: Reflection & Refraction",
    code: "PHY-10-04",
    grade: "Class 10 NCERT",
    formula: "1/f = 1/v + 1/u",
    diagramTitle: "Concave Focal Ray Convergence",
    bullets: [
      "Vector-rendered parabolic curvature",
      "Snell's Law refractive index matrix",
      "SHA-1 excised watermark vectors",
    ],
  },
  math: {
    title: "Introduction to Trigonometry",
    code: "MAT-10-08",
    grade: "Class 10 NCERT",
    formula: "sin²θ + cos²θ = 1",
    diagramTitle: "Geometric Unit Circle Projection",
    bullets: [
      "Angle-of-elevation blueprints",
      "Tabular radical ratios table (0°–90°)",
      "Offline memory flashcard ready",
    ],
  },
  chem: {
    title: "Chemical Reactions & Equations",
    code: "CHM-10-01",
    grade: "Class 10 NCERT",
    formula: "2Mg + O₂ → 2MgO + Heat",
    diagramTitle: "Exothermic Oxidation Flow",
    bullets: [
      "Algebraic stoichiometric balancing",
      "Redox precipitate color indicators",
      "CBSE board practical experiment notes",
    ],
  },
  bio: {
    title: "Life Processes: Cellular Respiration",
    code: "BIO-10-06",
    grade: "Class 10 NCERT",
    formula: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O",
    diagramTitle: "ATP Mitochondria Electron Matrix",
    bullets: [
      "High-contrast nephron filtration paths",
      "Aerobic vs Anaerobic pathway split",
      "Optimized for 16-level e-ink grayscale",
    ],
  },
};

export function SlateSimulator() {
  const [mode, setMode] = useState<"cloud" | "eink">("cloud");
  const [activeSubject, setActiveSubject] = useState<SubjectId>("physics");
  const [isPending, startTransition] = useTransition();

  const current = subjects[activeSubject];

  const handleSubjectChange = (id: SubjectId) => {
    startTransition(() => {
      setActiveSubject(id);
    });
  };

  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      {/* Glow Refraction Behind Card */}
      <div
        className={`absolute -inset-1 rounded-3xl blur-xl opacity-35 transition-all duration-500 pointer-events-none ${
          mode === "eink"
            ? "bg-stone-500/20"
            : "bg-gradient-to-r from-primary/30 to-amber-500/20"
        }`}
        aria-hidden="true"
      />

      {/* Simulator Device Frame */}
      <div
        className={`relative rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xl ${
          mode === "eink"
            ? "bg-[#E7E9E8] text-[#121413] border-stone-400 font-mono shadow-stone-900/10 dark:bg-[#1E2022] dark:text-[#E8EAE9] dark:border-stone-700"
            : "bg-card/95 text-card-foreground border-border/80 backdrop-blur-md"
        }`}
      >
        {/* Device Topbar & Mode Switcher */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b text-xs transition-colors duration-200 ${
            mode === "eink"
              ? "border-stone-300 dark:border-stone-700 bg-stone-200/50 dark:bg-stone-800/50"
              : "border-border/60 bg-secondary/50"
          }`}
        >
          {/* Status Telemetry */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                mode === "eink"
                  ? "bg-emerald-600 animate-pulse"
                  : "bg-primary animate-pulse"
              }`}
            />
            <span className="font-mono text-[11px] font-bold tracking-tight">
              {mode === "eink" ? "ATLAS HARDWARE · OFFLINE SLATE" : "NOVASLATE CLOUD · WEB ENGINE"}
            </span>
          </div>

          {/* Mode Pill Toggle (Cloud vs E-Ink) */}
          <div className="flex items-center p-0.5 rounded-full bg-background/80 border border-border shadow-xs">
            <button
              onClick={() => setMode("cloud")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold transition-all duration-200 cursor-pointer interactive-tap ${
                mode === "cloud"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Switch to Cloud Web High-DPI Mode"
            >
              <Monitor className="w-3 h-3" />
              <span>Cloud</span>
            </button>

            <button
              onClick={() => setMode("eink")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold transition-all duration-200 cursor-pointer interactive-tap ${
                mode === "eink"
                  ? "bg-stone-800 text-stone-100 dark:bg-stone-200 dark:text-stone-900 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Switch to Atlas Physical E-Ink Offline Mode"
            >
              <Tablet className="w-3 h-3" />
              <span>E-Ink Slate</span>
            </button>
          </div>
        </div>

        {/* Subject Pill Selector Tabs */}
        <div
          className={`flex items-center gap-1.5 px-3 py-2 border-b overflow-x-auto no-scrollbar transition-colors ${
            mode === "eink" ? "border-stone-300 dark:border-stone-700" : "border-border/50"
          }`}
        >
          {(Object.keys(subjects) as SubjectId[]).map((id) => {
            const isActive = activeSubject === id;
            return (
              <button
                key={id}
                onClick={() => handleSubjectChange(id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer shrink-0 interactive-tap ${
                  isActive
                    ? mode === "eink"
                      ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-bold"
                      : "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {id}
              </button>
            );
          })}
        </div>

        {/* Card Screen Canvas with Emil Kowalski Blur Crossfade Bridge */}
        <div
          className={`p-5 sm:p-6 space-y-4 transition-all duration-200 ${
            isPending ? "blur-bridge-entering" : "blur-bridge-settled"
          }`}
        >
          {/* Subject Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded border border-current opacity-70">
                  {current.code}
                </span>
                <span className="text-xs opacity-75 font-heading">{current.grade}</span>
              </div>
              <h3 className="font-heading font-black text-lg sm:text-xl tracking-tight leading-snug">
                {current.title}
              </h3>
            </div>

            <div
              className={`px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold shrink-0 ${
                mode === "eink"
                  ? "border border-current opacity-80"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              NEP 2020
            </div>
          </div>

          {/* Interactive Formula Card with Shimmer Sweep */}
          <div
            className={`relative p-3.5 rounded-xl border overflow-hidden ${
              mode === "eink"
                ? "border-stone-400 bg-stone-100/60 dark:bg-stone-900/60 dark:border-stone-700"
                : "border-primary/30 bg-primary/5 dark:bg-primary/10"
            }`}
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="opacity-70 font-semibold">{current.diagramTitle}</span>
              <span className="text-[10px] font-bold opacity-60">FORMULA PROOF</span>
            </div>
            <div className="mt-1 font-mono text-base sm:text-lg font-extrabold tracking-tight text-primary dark:text-primary">
              {current.formula}
            </div>
          </div>

          {/* Conceptual Bullet Highlights */}
          <ul className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
            {current.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="p-0.5 rounded bg-primary/20 text-primary mt-0.5 shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span className="opacity-85 font-body">{b}</span>
              </li>
            ))}
          </ul>

          {/* Simulator Footer Micro-Action */}
          <div
            className={`pt-3.5 border-t flex items-center justify-between text-xs font-mono ${
              mode === "eink" ? "border-stone-300 dark:border-stone-700" : "border-border/60"
            }`}
          >
            <div className="flex items-center gap-1.5 opacity-75">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{mode === "eink" ? "32GB MicroSD FAT32" : "Cloud Vector Stream"}</span>
            </div>

            <a
              href="#login"
              className="inline-flex items-center gap-1 font-bold text-primary hover:underline cursor-pointer interactive-tap"
            >
              <span>Explore Chapter</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
