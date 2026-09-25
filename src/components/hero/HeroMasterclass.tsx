import { useState } from "react";
import { ArrowRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Check, BookOpen, Layers, Cpu, Sparkles, Monitor, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroMasterclassProps {
  navigateToLogin?: () => void;
  scrollToNextSection?: () => void;
}

export default function HeroMasterclass({
  navigateToLogin = () => {
    window.history.pushState({}, "", "#login");
    window.dispatchEvent(new Event("hashchange"));
  },
  scrollToNextSection = () => {
    const el = document.getElementById("features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  },
}: HeroMasterclassProps) {
  const [activeSubject, setActiveSubject] = useState<"physics" | "math" | "chem" | "bio">("physics");
  const [isEinkPreview, setIsEinkPreview] = useState(false);

  const subjectData = {
    physics: {
      code: "PHY-10-04",
      title: "Light: Reflection & Refraction",
      grade: "Class 10 CBSE / ICSE",
      duration: "18 mins reading time",
      keyPoints: [
        "Concave vs Convex mirror ray diagrams with precision guides",
        "Refractive index & Snell's Law real-world proofs",
        "10-year board question solver with step-by-step marking",
      ],
      tag: "Board Exam High-Weightage",
      formula: "1/f = 1/v + 1/u",
    },
    math: {
      code: "MAT-10-08",
      title: "Introduction to Trigonometry",
      grade: "Class 10 NCERT",
      duration: "24 mins reading time",
      keyPoints: [
        "Pythagorean identities visualized with geometric unit circle",
        "Heights and distances angle-of-elevation blueprints",
        "Curated formula reference sheet ready for offline flashcards",
      ],
      tag: "Foundational STEM",
      formula: "sin²θ + cos²θ = 1",
    },
    chem: {
      code: "CHM-10-01",
      title: "Chemical Reactions & Equations",
      grade: "Class 10 NCERT",
      duration: "15 mins reading time",
      keyPoints: [
        "Balancing chemical equations via algebraic matrix method",
        "Oxidation-reduction colour indicators illustrated",
        "Laboratory safety & board practical experiment notes",
      ],
      tag: "Practical Science",
      formula: "2Mg + O₂ → 2MgO + Heat",
    },
    bio: {
      code: "BIO-10-06",
      title: "Life Processes: Nutrition & Respiration",
      grade: "Class 10 NCERT",
      duration: "22 mins reading time",
      keyPoints: [
        "High-definition anatomical vector illustrations (watermark-free)",
        "Aerobic vs Anaerobic pathways comparison matrix",
        "Nephron filtration flowcharts formatted for e-ink slates",
      ],
      tag: "Diagram Heavy",
      formula: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O",
    },
  };

  const current = subjectData[activeSubject];

  return (
    <section
      id="home"
      className="min-h-[100dvh] pt-20 sm:pt-24 pb-12 flex flex-col justify-between relative overflow-hidden bg-[#070B11] text-[#F1F5F9]"
    >
      {/* Editorial Luxury Ambient Gradient */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] pointer-events-none rounded-full blur-[140px] opacity-25"
        style={{
          background: "radial-gradient(ellipse at center, #E4B34C 0%, #1883B1 50%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      {/* Architectural Fine Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl flex-1 flex flex-col justify-center relative z-10 py-6 sm:py-10">
        {/* Eyebrow badge */}
        <div className="flex items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide bg-white/[0.05] border border-white/[0.12] text-[#E4B34C] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#E4B34C]" />
            <span className="font-semibold uppercase tracking-wider">Maven &amp; MasterClass Edition</span>
            <span className="text-white/20">|</span>
            <span className="text-white/70">Curated K–12 Curriculum</span>
          </div>
        </div>

        {/* 2-Column Split Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & High-Agency CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.04] text-white">
              Master every chapter.{" "}
              <span className="font-serif italic font-normal text-[#E4B34C] block mt-1">
                Zero distractions.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/70 font-body max-w-xl leading-relaxed font-light">
              High-resolution sanitized textbook diagrams, conceptual revision notes, and board exam solutions — engineered specifically for offline e-ink slates and distraction-free study.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                onClick={navigateToLogin}
                size="lg"
                className="h-12 px-7 rounded-full font-heading font-bold text-sm bg-[#E4B34C] text-[#070B11] hover:bg-[#F2C568] shadow-lg shadow-amber-500/15 transition-all active:scale-[0.97] cursor-pointer gap-2"
              >
                <span>Access Digital Library</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Button>

              <a
                href="https://github.com/Reyansh-Niranjan/novaslate"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 px-6 rounded-full font-heading font-semibold text-xs sm:text-sm border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white/90 transition-all active:scale-[0.97] cursor-pointer inline-flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Cpu className="w-4 h-4 text-[#E4B34C]" />
                <span>Atlas Hardware Spec</span>
                <span className="text-xs font-mono text-white/50">(ESP32)</span>
              </a>
            </div>

            {/* Micro proof badges */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-white/50 font-mono">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#E4B34C]" /> 100% Watermark-Free
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#E4B34C]" /> 12,800+ NCERT Pages
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#E4B34C]" /> Offline E-Ink Sync
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Curriculum Studio Card */}
          <div className="lg:col-span-5">
            <div
              className={`rounded-2xl border transition-all duration-300 backdrop-blur-xl relative shadow-2xl ${
                isEinkPreview
                  ? "bg-[#E6E8E6] text-[#121212] border-black/30 shadow-black/40 font-mono"
                  : "bg-white/[0.04] border-white/[0.12] text-white"
              }`}
            >
              {/* Card top bar with E-Ink toggle */}
              <div
                className={`flex items-center justify-between px-4 py-3 border-b text-xs ${
                  isEinkPreview ? "border-black/20 bg-[#D8DBD8]" : "border-white/[0.08] bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E4B34C]" />
                  <span className="font-mono tracking-tight font-semibold uppercase text-[11px] opacity-80">
                    Live Syllabus Deck
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEinkPreview(!isEinkPreview)}
                  className={`px-2.5 py-1 rounded-md text-[10.5px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    isEinkPreview
                      ? "bg-black text-white border-black font-bold"
                      : "bg-white/[0.06] hover:bg-white/[0.1] text-white/80 border-white/10"
                  }`}
                  title="Toggle simulation of Atlas E-Paper Slate display"
                >
                  {isEinkPreview ? <Tablet className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                  <span>{isEinkPreview ? "E-Paper Mode: ON" : "Simulate Slate"}</span>
                </button>
              </div>

              {/* Subject Tabs */}
              <div
                className={`grid grid-cols-4 gap-1 p-2 border-b text-center text-xs font-mono ${
                  isEinkPreview ? "border-black/15 bg-[#E1E4E1]" : "border-white/[0.06] bg-black/20"
                }`}
              >
                {(["physics", "math", "chem", "bio"] as const).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setActiveSubject(sub)}
                    className={`py-1.5 rounded-md text-[11px] font-medium uppercase transition-all cursor-pointer ${
                      activeSubject === sub
                        ? isEinkPreview
                          ? "bg-black text-white font-bold"
                          : "bg-[#E4B34C] text-black font-bold shadow-sm"
                        : isEinkPreview
                        ? "text-black/60 hover:bg-black/10"
                        : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* Card Main Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border inline-block mb-1.5 ${
                        isEinkPreview
                          ? "border-black/30 bg-black/5 text-black"
                          : "border-white/10 bg-white/[0.04] text-[#E4B34C]"
                      }`}
                    >
                      {current.code} • {current.grade}
                    </span>
                    <h3 className="text-lg font-heading font-semibold tracking-tight leading-snug">
                      {current.title}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-1 rounded text-right whitespace-nowrap ${
                      isEinkPreview ? "bg-black/10 text-black" : "bg-white/[0.06] text-white/60"
                    }`}
                  >
                    {current.duration}
                  </span>
                </div>

                {/* Formula Callout */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
                    isEinkPreview
                      ? "bg-white border-black/30 text-black"
                      : "bg-white/[0.03] border-white/[0.08] text-white/90"
                  }`}
                >
                  <span className="opacity-70 text-[11px]">Core Equation:</span>
                  <span className="font-bold tracking-wider text-sm">{current.formula}</span>
                </div>

                {/* Key Points */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-mono uppercase opacity-60 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>Curriculum Module Highlights</span>
                  </div>
                  {current.keyPoints.map((point) => (
                    <div key={point} className="flex items-start gap-2 text-xs leading-relaxed opacity-85">
                      <Check
                        className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                          isEinkPreview ? "text-black" : "text-[#E4B34C]"
                        }`}
                      />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                {/* Interactive Action Button inside the card */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={navigateToLogin}
                    className={`w-full py-2.5 rounded-xl font-heading text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isEinkPreview
                        ? "bg-black text-white hover:bg-neutral-800"
                        : "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Full Textbook Chapter (Watermark-Free)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metrics Bar */}
      <div className="metrics-ticker border-t border-white/[0.08] bg-[#05080D]/80 backdrop-blur-md py-3.5">
        <div className="container mx-auto px-4 max-w-6xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/90 font-semibold">NCERT Curriculum 2026 Ready</span>
          </div>
          <div>4.2M Pages Sanitized &amp; Verified</div>
          <div className="hidden sm:inline-block">Offline Slate Sync Protocol: v2.4</div>
          <button
            type="button"
            onClick={scrollToNextSection}
            className="flex items-center gap-1 hover:text-[#E4B34C] transition-colors cursor-pointer text-white/80"
          >
            <span>Explore Syllabus</span>
            <ChevronDownIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
