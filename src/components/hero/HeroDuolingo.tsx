import { useState } from "react";
import { ArrowRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Flame, Zap, CheckCircle2, Award, ArrowUpRight, HelpCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroDuolingoProps {
  navigateToLogin?: () => void;
  scrollToNextSection?: () => void;
}

export default function HeroDuolingo({
  navigateToLogin = () => {
    window.history.pushState({}, "", "#login");
    window.dispatchEvent(new Event("hashchange"));
  },
  scrollToNextSection = () => {
    const el = document.getElementById("features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  },
}: HeroDuolingoProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [xpEarned, setXpEarned] = useState<number>(140);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);

  const quiz = {
    subject: "Class 10 Physics • Daily Sprint",
    question: "Why does the sky appear clear blue on a sunny day?",
    options: [
      {
        id: 1,
        text: "Rayleigh scattering: shorter blue wavelengths scatter more in air",
        correct: true,
        explanation: "Correct! Blue light has shorter wavelength (λ) and scatters ~10x more than red (1/λ⁴).",
      },
      {
        id: 2,
        text: "Reflection of ocean water waves into the upper troposphere",
        correct: false,
        explanation: "Incorrect: Earth's atmosphere is what scatters the sunlight directly.",
      },
      {
        id: 3,
        text: "Absorption of infrared rays by water vapor clouds",
        correct: false,
        explanation: "Incorrect: Water vapor absorbs infrared, but doesn't produce the blue color.",
      },
    ],
  };

  const handleSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedOption(index);
    setHasAnswered(true);
    if (quiz.options[index].correct) {
      setXpEarned((prev) => prev + 25);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setHasAnswered(false);
  };

  return (
    <section
      id="home"
      className="min-h-[100dvh] pt-20 sm:pt-24 pb-10 flex flex-col justify-between relative overflow-hidden bg-[#FAFCFF] dark:bg-[#0B111A] text-foreground border-b border-border/70"
    >
      {/* Playful Dotted Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, #0284C7 1.5px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      {/* Cheerful ambient bubbles */}
      <div
        className="absolute -top-24 right-10 w-96 h-96 rounded-full blur-[120px] bg-emerald-400/15 dark:bg-emerald-500/10 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-4 w-80 h-80 rounded-full blur-[100px] bg-sky-400/15 dark:bg-sky-500/10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl flex-1 flex flex-col justify-center relative z-10 py-6 sm:py-8">
        {/* Eyebrow gamification pills */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold tracking-wide bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
            <span>14-DAY REVISION STREAK</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold tracking-wide bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            <span>{xpEarned} XP TODAY</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-medium tracking-wide bg-secondary/80 text-muted-foreground border border-border">
            <span>Duolingo &amp; Khan Academy Edition</span>
          </div>
        </div>

        {/* 2-Column Bento Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Playful Hook & Motivation */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-foreground">
              Make textbook study feel like a{" "}
              <span className="text-emerald-600 dark:text-emerald-400 underline decoration-wavy decoration-emerald-500/40 decoration-2 underline-offset-6">
                daily streak.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground font-body leading-relaxed max-w-lg">
              Bite-sized chapter sprints, instant concept check quizzes, and 100% offline sync on e-ink slates. Complete your daily 15-minute goal — completely free, forever.
            </p>

            {/* Daily Quest Progress Bar */}
            <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs max-w-md space-y-2">
              <div className="flex items-center justify-between text-xs font-heading font-semibold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Award className="w-4 h-4 text-emerald-500" />
                  Daily Goal: 2 / 3 Chapters Mastered
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">67%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: "67%" }}
                />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Button
                onClick={navigateToLogin}
                size="lg"
                className="h-12 px-7 rounded-2xl font-heading font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:translate-y-0.5 transition-all cursor-pointer gap-2 border-b-4 border-emerald-800"
              >
                <span>Start Today&apos;s Quest Free</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Button>

              <a
                href="https://github.com/Reyansh-Niranjan/novaslate"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 px-5 rounded-2xl font-heading font-semibold text-xs sm:text-sm border-2 border-border bg-card hover:bg-secondary text-foreground active:translate-y-0.5 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Atlas E-Ink Slate</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Right Column: Live Interactive Daily Quick-Check Quiz Card */}
          <div className="lg:col-span-6">
            <div className="quiz-card-dock rounded-3xl bg-card border-2 border-border/90 p-5 sm:p-7 shadow-xl relative overflow-hidden transition-all">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
                    ⚡
                  </div>
                  <div>
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      {quiz.subject}
                    </h2>
                    <p className="text-sm font-heading font-bold text-foreground">
                      Interactive Practice Check
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  +25 XP
                </span>
              </div>

              {/* Question */}
              <div className="py-4 space-y-1">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <p className="font-heading font-semibold text-base sm:text-lg text-foreground leading-snug">
                    {quiz.question}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {quiz.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  let btnStyle = "border-border hover:border-emerald-500/60 bg-card hover:bg-secondary/40 text-foreground";

                  if (hasAnswered) {
                    if (opt.correct) {
                      btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold";
                    } else if (isSelected && !opt.correct) {
                      btnStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                    } else {
                      btnStyle = "opacity-50 border-border bg-card text-muted-foreground";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(idx)}
                      disabled={hasAnswered}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-snug">{opt.text}</span>
                      {hasAnswered && opt.correct && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback footer */}
              {hasAnswered && selectedOption !== null && (
                <div
                  className={`mt-4 p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
                    quiz.options[selectedOption].correct
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
                  }`}
                >
                  <p className="flex-1 font-medium">{quiz.options[selectedOption].explanation}</p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Retry question"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Bottom Card Footer */}
              <div className="mt-5 pt-3 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Free NCERT Bank • 1,200+ Practice Qs</span>
                <button
                  type="button"
                  onClick={navigateToLogin}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  See all quizzes →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Anchor */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={scrollToNextSection}
          className="group inline-flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Scroll to curriculum features"
        >
          <div className="w-7 h-7 rounded-full bg-secondary/80 border border-border flex items-center justify-center transition-transform group-hover:translate-y-0.5 shadow-2xs">
            <ChevronDownIcon className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </section>
  );
}
