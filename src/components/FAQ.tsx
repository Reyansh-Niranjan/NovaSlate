import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown, HelpCircle, ShieldCheck, Lock, WifiOff } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "free-access",
    question: "Is NovaSlate truly 100% free for students and educators?",
    answer:
      "Yes. The NovaSlate web platform, Class 1–12 textbook catalog, watermark-sanitized reader, and AI study tools are 100% free forever. There are no paywalls, no locked chapters, and no subscription tiers for students. We sustain our engineering through one-time physical Atlas hardware sales and institutional school deployments.",
  },
  {
    id: "ads-removal",
    question: "Why did you remove all advertisements from the platform?",
    answer:
      "In our earliest version, we tested basic display banners that earned approximately ₹20 in total profit. Recognizing that commercial advertising exploits student attention, distracts from difficult conceptual study, and injects third-party trackers, we permanently removed all ads. NovaSlate is strictly dedicated to public student welfare.",
  },
  {
    id: "atlas-offline",
    question: "How does the Atlas ESP32 hardware reader work without any internet?",
    answer:
      "The Atlas reader runs on a dedicated ESP32 dual-core microcontroller equipped with a FAT32 MicroSD card pre-flashed with the complete Class 1–12 NCERT library. It renders high-contrast monochrome pages directly to its low-power e-ink display using custom embedded C++ drivers, requiring zero Wi-Fi, zero 4G/5G, and zero SIM cards.",
  },
  {
    id: "atlas-permanence",
    question: "Will the Atlas hardware device change, or how does NovaSlate evolve?",
    answer:
      "The Atlas hardware will not change—it is engineered as a permanent, reliable physical constant. Its microcontroller, physical D-pad, and offline storage are built to last for years without planned obsolescence. NovaSlate (the cloud web software, AI models, and catalog pipelines) evolves continuously to feed new curriculum material into this permanent hardware foundation.",
  },
  {
    id: "syllabus-coverage",
    question: "Which syllabus and grades are currently supported?",
    answer:
      "NovaSlate currently indexes the complete Class 1–12 NCERT curriculum across Mathematics, Science, Social Sciences, and Humanities, aligned with NEP 2020 guidelines. We are currently testing regional State Board curriculum ingestion (such as ICSE and State Education Boards) for upcoming releases.",
  },
  {
    id: "school-deployments",
    question: "How can schools, tutoring centers, or NGOs order campus deployments?",
    answer:
      "Educational institutions can order bulk classroom bundles of Atlas handheld readers along with a local network caching appliance. This allows entire computer labs or rural classrooms to sync textbooks with zero bandwidth costs. Contact our deployment team at deployments@novaslate.org for custom quotes.",
  },
];

export default function FAQ() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(faqs[0].id);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".faq-header-item",
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
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "all",
          }
        );

        gsap.fromTo(
          ".faq-accordion-item",
          { y: 20, autoAlpha: 0 },
          {
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
              once: true,
            },
            y: 0,
            autoAlpha: 1,
            duration: 0.35,
            stagger: 0.06,
            ease: "power3.out",
            clearProps: "all",
          }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      ref={containerRef}
      className="py-16 sm:py-28 bg-background border-t border-border relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="faq-header-item inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-secondary text-primary border border-border mb-3 font-heading">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>

          <h2 className="faq-header-item text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4 font-heading leading-tight">
            Everything you need to know about NovaSlate.
          </h2>

          <p className="faq-header-item text-sm sm:text-base text-muted-foreground leading-relaxed font-body">
            Common questions regarding our open-access student commitment, offline Atlas hardware, and institutional deployments.
          </p>

          {/* Trust Chips */}
          <div className="faq-header-item flex flex-wrap items-center justify-center gap-3 pt-6 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              NEP 2020 Aligned
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border">
              <Lock className="w-3.5 h-3.5 text-primary" />
              100% Student Privacy
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border">
              <WifiOff className="w-3.5 h-3.5 text-[var(--pomelli-gold)]" />
              Offline Hardware Resilient
            </span>
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`faq-accordion-item rounded-2xl border transition-colors ${
                  isOpen ? "bg-card border-primary/40 shadow-xs" : "bg-card/70 border-border hover:border-border/80"
                }`}
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-foreground font-heading">
                    {faq.question}
                  </span>
                  <div
                    className={`p-1.5 rounded-full border transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                    <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed border-t border-border pt-3">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
