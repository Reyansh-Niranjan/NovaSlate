import { Github, ArrowUpRight, BookOpen, Heart, Cpu } from "lucide-react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navigateToLogin = () => {
    window.history.pushState({}, "", "#login");
    window.dispatchEvent(new Event("hashchange"));
  };

  const scrollToSection = (hash: string) => {
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t border-border bg-card text-foreground text-xs">
      {/* High-Impact Pre-Footer Conversion Banner */}
      <div className="border-b border-border py-12 sm:py-16 bg-secondary/40">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono block mb-2">
              START LEARNING TODAY · 100% FREE
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-heading text-foreground tracking-tight mb-2">
              Transform your K–12 study workflow.
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
              No ads, no subscription lockouts, and no tracking. Launch the open web library immediately or deploy Atlas hardware for zero-connectivity classrooms.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Button
              onClick={navigateToLogin}
              className="h-11 px-6 font-bold font-heading bg-primary text-primary-foreground hover:opacity-90 cursor-pointer shadow-xs gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Launch Free Library</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection("#pricing")}
              className="h-11 px-5 font-semibold font-heading border-border text-foreground hover:bg-secondary cursor-pointer"
            >
              <span>View Hardware &amp; Plans</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Multi-Column Sitemap */}
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand & Mission Statement Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <Logo className="h-6 w-auto" />
              <span className="font-extrabold text-base tracking-tight text-foreground font-heading">
                Nova<span className="text-primary font-serif italic font-normal">Slate</span>
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-[40ch] font-body">
              Automated curriculum curation, OpenCV watermark sanitization, and offline hardware delivery for Class 1–12 education across India.
            </p>

            <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-1 max-w-[40ch]">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary font-heading">
                <Heart className="w-3.5 h-3.5 fill-current text-[var(--pomelli-crimson)]" />
                <span>Student Welfare Commitment</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
                100% free web access. All commercial advertising was permanently removed after our early ₹20 ad experiment to safeguard distraction-free study.
              </p>
            </div>
          </div>

          {/* Column 1: Platform Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground font-heading">
              Platform
            </h4>
            <ul className="space-y-2 font-heading text-xs">
              <li>
                <a href="#home" onClick={() => scrollToSection("#home")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Overview
                </a>
              </li>
              <li>
                <a href="#features" onClick={() => scrollToSection("#features")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Study Tools &amp; AI
                </a>
              </li>
              <li>
                <a href="#hardware" onClick={() => scrollToSection("#hardware")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Atlas Hardware
                </a>
              </li>
              <li>
                <a href="#pricing" onClick={() => scrollToSection("#pricing")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing &amp; Plans
                </a>
              </li>
              <li>
                <a href="#faq" onClick={() => scrollToSection("#faq")} className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources & Source */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground font-heading">
              Resources &amp; Source
            </h4>
            <ul className="space-y-2 font-heading text-xs">
              <li>
                <a href="#timeline" onClick={() => scrollToSection("#timeline")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Evolution Timeline
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Reyansh-Niranjan/novaslate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <Github className="w-3 h-3" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Reyansh-Niranjan/novaslate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <Cpu className="w-3 h-3" />
                  <span>Atlas C++ Firmware</span>
                </a>
              </li>
              <li>
                <button
                  onClick={navigateToLogin}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  Digital Library Sign In
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Trust */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground font-heading">
              Legal &amp; Trust
            </h4>
            <ul className="space-y-2 font-heading text-xs">
              <li>
                <a href="#privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <span className="text-primary font-semibold block text-[11px]">
                  NCERT · CBSE · State Boards
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="pt-8 sm:pt-10 mt-8 sm:mt-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground font-mono text-[11px]">
          <div>
            © {currentYear} NovaSlate. Solo-Architected &amp; Engineered by{" "}
            <a
              href="https://github.com/Reyansh-Niranjan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-semibold hover:text-primary transition-colors underline"
            >
              Reyansh Niranjan
            </a>.
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-[var(--pomelli-crimson)] font-semibold">
              <Heart className="w-3 h-3 fill-current" />
              100% Ad-Free Public Welfare
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span>Open Access Education</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
