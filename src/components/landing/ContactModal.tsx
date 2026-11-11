import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, CheckCircle2, ShieldCheck, Mail, Cpu, BookOpen } from 'lucide-react';
import { PatternCanvas } from './PatternCanvas';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, initialData }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Student (Class 1–12)');
  const [inquiryType, setInquiryType] = useState('General Question / Feedback');
  const [gradeBand, setGradeBand] = useState('Full K-12 (Class 1–12)');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // DOM Refs matching incredibles.dev SModal exact reverse-engineered structure
  const modalBlockRef = useRef<HTMLElement | null>(null);
  const modalOuterRef = useRef<HTMLDivElement | null>(null);
  const modalInnerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Active GSAP timeline reference & render gate
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isAnimatingRef = useRef(false);
  const [rendered, setRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (initialData?.deliveryMode?.includes('Atlas') || initialData?.plan?.includes('Atlas')) {
      setInquiryType('Request Atlas ESP32 Hardware Kit');
      setMessage(
        `Hi Reyansh,\n\nI would like to inquire about building / deploying an Atlas ESP32 Offline Reader:\n- Target Classes: ${initialData.gradeLevel || 'Class 11–12'}\n- Content Scope: ${initialData.contentScope || 'Complete Exam Prep'}\n- Storage Required: ${initialData.storage || '32 GB MicroSD'}\n\nPlease share open-source schematics, firmware and MicroSD flashing instructions!`
      );
    } else if (initialData?.gradeLevel) {
      setGradeBand(initialData.gradeLevel);
      setMessage(
        `Hi Reyansh,\n\nI am inquiring about NovaSlate curriculum resources:\n- Grade Level: ${initialData.gradeLevel}\n- Content Scope: ${initialData.contentScope || 'All Textbooks & PYQs'}\n- Delivery Mode: ${initialData.deliveryMode || 'Free Web Digital Library'}\n\nLooking forward to using NovaSlate!`
      );
    } else if (initialData?.plan) {
      setMessage(
        `Hi Reyansh,\n\nI am interested in ${initialData.plan}. Could you provide more details on getting started?`
      );
    } else {
      setMessage(
        "Hi Reyansh,\n\nI would like to explore NovaSlate's digital textbook library and automated curriculum pipeline for our studies / school."
      );
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
    }
  }, [isOpen]);

  // Exact incredibles.dev SModal GSAP animation lifecycle
  useEffect(() => {
    if (!rendered) return;

    const block = modalBlockRef.current;
    const modalOuter = modalOuterRef.current;
    const modalInner = modalInnerRef.current;
    const overlay = overlayRef.current;

    if (!block || !modalOuter || !modalInner || !overlay) return;

    const radius = window.getComputedStyle(modalInner).borderRadius || "1.5rem";
    const targets = Array.from(block.querySelectorAll<HTMLElement>(".js-form-left, .js-form-right"));

    if (isOpen) {
      // Kill any active close animation
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }

      // Freeze smooth scroll & lock body
      if (typeof window !== "undefined" && typeof (window as any).lenis?.stop === "function") {
        (window as any).lenis.stop();
      }
      document.body.style.overflow = "hidden";

      setIsVisible(true);
      isAnimatingRef.current = true;

      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.set(modalOuter, { willChange: "clip-path" }, 0);
      if (targets.length) {
        tl.set(targets, { willChange: "clip-path, transform" }, 0);
      }

      // [Animation 1]: Overlay fades in smoothly (0 -> 1 over 1.25s power3.out)
      tl.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: 1.25, ease: "power3.out" },
        0
      );

      // [Animation 2]: Outer shell unmasks from bottom-center slit up to full viewport
      // clip-path: inset(100% 20% 0% 20% round 1.5rem) -> inset(0% 0% 0% 0% round 1.5rem) over 1.5s expo.inOut
      tl.fromTo(
        modalOuter,
        { clipPath: `inset(100% 20% 0% 20% round ${radius})` },
        {
          clipPath: `inset(0% 0% 0% 0% round ${radius})`,
          duration: 1.5,
          ease: "expo.inOut",
        },
        0
      );

      // [Animation 3]: Staggered content reveal starting at t = 0.75s
      if (targets.length) {
        tl.fromTo(
          targets,
          { clipPath: `inset(0% 0% 100% 0% round ${radius})` },
          {
            clipPath: `inset(0% 0% 0% 0% round ${radius})`,
            duration: 1,
            ease: "expo.out",
            stagger: -0.025,
          },
          0.75
        );

        tl.fromTo(
          targets,
          { y: 50 },
          {
            y: 0,
            duration: 1.5,
            ease: "expo.out",
            stagger: -0.025,
          },
          0.75
        );
      }

      tl.call(() => {
        isAnimatingRef.current = false;
        modalOuter.style.clipPath = "";
        modalOuter.style.willChange = "";
        overlay.style.opacity = "";
        targets.forEach((el) => {
          el.style.clipPath = "";
          el.style.willChange = "";
        });
        block.querySelector<HTMLInputElement>("input, select, textarea")?.focus();
      });
    } else {
      // Close Animation (Reverse-Engineered from incredibles.dev SModal)
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }

      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.set(modalOuter, { willChange: "clip-path" }, 0);

      // [Animation 1]: Overlay fades out (1 -> 0 over 1s power1.out)
      tl.fromTo(
        overlay,
        { opacity: 1 },
        { opacity: 0, duration: 1, ease: "power1.out" },
        0
      );

      // [Animation 2]: Modal Inner scales down and drops (y: 100%, scale: 0.75 over 1s expo.inOut)
      tl.fromTo(
        modalInner,
        { y: 0, scale: 1 },
        {
          y: "100%",
          scale: 0.75,
          duration: 1,
          ease: "expo.inOut",
        },
        0
      );

      // [Animation 3]: Modal Outer clips back down to bottom-center slit
      tl.fromTo(
        modalOuter,
        { clipPath: `inset(0% 0% 0% 0% round ${radius})` },
        {
          clipPath: `inset(100% 20% 0% 20% round ${radius})`,
          duration: 1,
          ease: "expo.inOut",
        },
        0
      );

      tl.call(() => {
        isAnimatingRef.current = false;
        setIsVisible(false);
        setRendered(false);
        setIsSubmitted(false);
        modalInner.style.transform = "";
        modalOuter.style.clipPath = "";
        modalOuter.style.willChange = "";
        overlay.style.opacity = "";
        document.body.style.overflow = "";
        if (typeof window !== "undefined" && typeof (window as any).lenis?.start === "function") {
          (window as any).lenis.start();
        }
      });
    }
  }, [isOpen, rendered]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!rendered) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section
      ref={modalBlockRef}
      className={`s-modal ${isVisible ? "is-visible" : ""} ${isOpen ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      data-lenis-prevent=""
    >
      {/* Outer Shell: Controls the clipping slit expansion */}
      <div ref={modalOuterRef} className="s__outer">
        {/* Inner Shell: Controls scale & drop translation on close */}
        <div ref={modalInnerRef} className="s__inner">
          {/* Background Fluid Canvas */}
          <div className="s__fluid" aria-hidden="true">
            <PatternCanvas immediate staticFlow />
          </div>

          {/* Internal Scroller Area */}
          <div className="s__scroller">
            <div className="b-form__core">
              {/* Left Column (.js-form-left): Headline, badge, description, architectural notes */}
              <div className="b-form__left js-form-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-white)] border border-[var(--color-gray-lighter)] text-[11px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                  <span>Platform Inquiries</span>
                </div>

                <h2
                  id="contact-modal-title"
                  className="t-h-xl font-heading text-[var(--color-heading)] tracking-tight leading-[0.98]"
                >
                  Start a<br />
                  <span className="italic font-serif font-normal text-[var(--color-primary)]">
                    conversation.
                  </span>
                </h2>

                <p className="t-t-sm text-[var(--color-gray-dark)] leading-relaxed max-w-sm">
                  Reach out regarding digital textbook access, syllabus scraping feedback, offline Atlas ESP32 reader hardware, or rural school deployments.
                </p>

                {/* Specs / Meta Points */}
                <div className="space-y-3 pt-2 text-xs font-mono text-[var(--color-heading)]">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                    <span>NCERT Class 1–12 full digital curriculum</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                    <span>Atlas ESP32 reader open firmware schematics</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                    <span>Direct engineering line with Reyansh Niranjan</span>
                  </div>
                </div>

                <div className="pt-4 text-xs text-[var(--color-gray)] font-sans border-t border-[var(--color-gray-lighter)] w-full">
                  Usually responded to within 24 hours. Open-source educational initiative.
                </div>
              </div>

              {/* Right Column (.js-form-right): Elevated white card with form */}
              <div className="b-form__right u-white-box js-form-right">
                {isSubmitted ? (
                  <div className="py-10 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="t-h-sm text-[var(--color-heading)] font-medium">
                      Inquiry Dispatched
                    </h3>
                    <p className="t-t-sm text-[var(--color-gray-dark)] mt-2 max-w-md leading-relaxed">
                      Thank you, {name}. Your inquiry regarding <strong>{inquiryType}</strong> has been logged. Reyansh Niranjan will review your request and reach out to {email} shortly.
                    </p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-8 px-8 py-3 rounded-full bg-[var(--color-black)] text-white text-xs font-mono uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors cursor-pointer"
                    >
                      Close Conversation
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="t-h-xs font-heading font-medium text-[var(--color-heading)] tracking-tight mb-1">
                      Direct Inquiry Form
                    </h3>
                    <p className="t-t-sm text-[var(--color-gray-dark)] text-xs mb-6">
                      Tell us about your learning requirements, student grade, or school deployment.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Aarav Sharma"
                            className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-darker)] text-xs text-[var(--color-black)] placeholder-[var(--color-gray)] focus:bg-white focus:border-[var(--color-black)] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5">
                            Your Role
                          </label>
                          <div className="relative">
                            <select
                              value={role}
                              onChange={(e) => setRole(e.target.value)}
                              className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-darker)] text-xs text-[var(--color-black)] focus:bg-white focus:border-[var(--color-black)] focus:outline-none transition-colors appearance-none cursor-pointer"
                            >
                              <option value="Student (Class 1–12)">Student (Class 1–12)</option>
                              <option value="Teacher / Tutoring Educator">Teacher / Tutoring Educator</option>
                              <option value="School Principal / Administrator">School Principal / Admin</option>
                              <option value="Hardware / Embedded Developer">Hardware / Embedded Developer</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5">
                            Inquiry Type
                          </label>
                          <div className="relative">
                            <select
                              value={inquiryType}
                              onChange={(e) => setInquiryType(e.target.value)}
                              className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-darker)] text-xs text-[var(--color-black)] focus:bg-white focus:border-[var(--color-black)] focus:outline-none transition-colors appearance-none cursor-pointer"
                            >
                              <option value="General Question / Feedback">General Question / Feedback</option>
                              <option value="Request Atlas ESP32 Hardware Kit">Request Atlas ESP32 Hardware Kit</option>
                              <option value="Digital Library & Study Hub Access">Digital Library & Study Hub</option>
                              <option value="Curriculum / Scraper Request">Curriculum / Scraper Request</option>
                              <option value="Rural Classroom Deployment">Rural Classroom Deployment</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5">
                            Target Grade Band
                          </label>
                          <div className="relative">
                            <select
                              value={gradeBand}
                              onChange={(e) => setGradeBand(e.target.value)}
                              className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-darker)] text-xs text-[var(--color-black)] focus:bg-white focus:border-[var(--color-black)] focus:outline-none transition-colors appearance-none cursor-pointer"
                            >
                              <option value="Full K-12 (Class 1–12)">Full K-12 (Class 1–12)</option>
                              <option value="Class 11–12 (Senior Secondary)">Class 11–12 (Senior Secondary)</option>
                              <option value="Class 9–10 (Secondary)">Class 9–10 (Secondary)</option>
                              <option value="Class 6–8 (Middle School)">Class 6–8 (Middle School)</option>
                              <option value="Class 1–5 (Primary)">Class 1–5 (Primary)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="student@example.com"
                          className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-darker)] text-xs text-[var(--color-black)] placeholder-[var(--color-gray)] focus:bg-white focus:border-[var(--color-black)] focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5">
                          Message / Details
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-darker)] text-xs text-[var(--color-black)] placeholder-[var(--color-gray)] focus:bg-white focus:border-[var(--color-black)] focus:outline-none transition-colors resize-none font-mono leading-relaxed"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="btn-main btn-main--primary btn-main--black btn-main--md w-full justify-center shadow-sm"
                        >
                          <span className="btn-main__outer">
                            <span className="btn-main__inner py-3">
                              <span className="btn-main__text">Send message to Reyansh</span>
                            </span>
                            <span className="btn-main__hover" aria-hidden="true">
                              <span
                                className="btn-main__text"
                                data-text="Send message to Reyansh"
                              ></span>
                            </span>
                          </span>
                        </button>
                      </div>
                    </form>

                    {/* Security Footer */}
                    <div className="mt-5 pt-4 border-t border-[var(--color-gray-lighter)] flex items-center justify-between text-[11px] text-[var(--color-gray-dark)] font-mono">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Direct encrypted transmission</span>
                      </div>
                      <span>NovaSlate Curriculum</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Close Button: Positioned in top-right corner of s__inner */}
          <button
            type="button"
            onClick={onClose}
            className="s__close btn-main btn-main--primary btn-main--white btn-main--sm"
            aria-label="Close dialog"
          >
            <span className="btn-main__outer">
              <span className="btn-main__inner p-2.5">
                <X className="w-4 h-4" />
              </span>
              <span className="btn-main__hover" aria-hidden="true">
                <X className="w-4 h-4" />
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Backdrop Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="s__overlay"
        aria-hidden="true"
      />
    </section>
  );
};
