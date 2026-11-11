import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { PatternCanvas } from "./landing/PatternCanvas";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<"sign-in" | "create">("sign-in");
  const isCreate = mode === "create";

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

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
      // 1. Kill any active close timeline
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }

      // 2. Pause Lenis smooth scroll and lock body
      if (typeof window !== "undefined" && typeof (window as any).lenis?.stop === "function") {
        (window as any).lenis.stop();
      }
      document.body.style.overflow = "hidden";

      // 3. Mark visible immediately
      setIsVisible(true);
      isAnimatingRef.current = true;

      const tl = gsap.timeline();
      tlRef.current = tl;

      // Will-change optimization hints
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
      // Starts as: inset(100% 20% 0% 20% round 1.5rem)
      // Expands to: inset(0% 0% 0% 0% round 1.5rem) over 1.5s expo.inOut
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

      // On Open Complete: Clean up will-change and inline clip-path styles
      tl.call(() => {
        isAnimatingRef.current = false;
        modalOuter.style.clipPath = "";
        modalOuter.style.willChange = "";
        overlay.style.opacity = "";
        targets.forEach((el) => {
          el.style.clipPath = "";
          el.style.willChange = "";
        });
        // Auto-focus first interactive input
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

      // [Animation 2]: Modal Inner scales down and drops off screen (y: 100%, scale: 0.75 over 1s expo.inOut)
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

      // On Close Complete: Reset states, unlock Lenis and body scroll
      tl.call(() => {
        isAnimatingRef.current = false;
        setIsVisible(false);
        setRendered(false);
        setErrorMessage(null);
        setSuccessMessage(null);
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

  // Trap Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!rendered) return null;

  const handleOAuth = async () => {
    if (isOAuthLoading || isSubmitting) return;
    setErrorMessage(null);
    try {
      setIsOAuthLoading(true);
      const redirectTo = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        setErrorMessage(error.message);
        setIsOAuthLoading(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "OAuth authentication failed.";
      setErrorMessage(msg);
      setIsOAuthLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isOAuthLoading) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const fullName = String(formData.get("full_name") || "").trim();
    const grade = String(formData.get("grade") || "").trim();
    const passwordConfirm = String(formData.get("password_confirm") || "");

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      setIsSubmitting(false);
      return;
    }

    if (isCreate) {
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        setIsSubmitting(false);
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMessage("Passwords do not match.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (isCreate) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              grade: grade,
            },
          },
        });
        if (error) throw error;

        if (data.session) {
          setSuccessMessage("Account created successfully!");
          setTimeout(() => {
            onClose();
            onSuccess?.();
          }, 400);
        } else {
          setSuccessMessage("Confirmation link sent to your email address.");
          setIsSubmitting(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        setSuccessMessage("Signed in successfully!");
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 300);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={modalBlockRef}
      className={`s-modal ${isVisible ? "is-visible" : ""} ${isOpen ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
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
                      {/* Left Column (.js-form-left): Headline, description */}
                      <div className="b-form__left js-form-left flex flex-col justify-between">
                        <div>
                          {/* Typography: Fixed line-height, no overlap, generous margin */}
                          {(mode as string) === "forgot-password" ? (
                            <div>
                              <h2 className="t-h-xl font-heading text-[var(--color-heading)] tracking-tight leading-[1.06] mb-4">
                                Reset your<br />
                                <span className="text-[var(--color-primary)] font-heading font-bold tracking-tight">
                                    password.
                                  </span>
                              </h2>
                              <p className="t-t-sm text-[var(--color-gray-dark)] leading-relaxed max-w-sm mt-3 font-sans">
                                Enter your account email and we'll send you a password recovery link to get back to your bookshelf.
                              </p>
                            </div>
                          ) : isCreate ? (
                            <div>
                              <h2
                                id="login-modal-title"
                                className="t-h-xl font-heading text-[var(--color-heading)] tracking-tight leading-[1.06] mb-4"
                              >
                                Build your<br />
                                <span className="italic font-serif font-normal text-[var(--color-primary)]">
                                  personal shelf.
                                </span>
                              </h2>
                              <p className="t-t-sm text-[var(--color-gray-dark)] leading-relaxed max-w-sm mt-3 font-sans">
                                Set up your personal Class 1–12 bookshelf and sync your study notes across all your devices.
                              </p>
                            </div>
                          ) : (
                            <div>
                              <h2 className="t-h-xl font-heading text-[var(--color-heading)] tracking-tight leading-[1.06] mb-4">
                                Welcome to<br />
                                <span className="text-[var(--color-primary)] font-heading font-bold tracking-tight">
                                    NovaSlate.
                                  </span>
                              </h2>
                              <p className="t-t-sm text-[var(--color-gray-dark)] leading-relaxed max-w-sm mt-3 font-sans">
                                Access your digitized NCERT textbooks, chapter question banks, study notes, and offline library.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Calm, Clean Trust Note - Replaced Reeking AI Buzzword List */}
                        <div className="pt-6 border-t border-[var(--color-gray-lighter)] text-xs text-[var(--color-gray-dark)] font-sans">
                          Your textbooks, notes, and exam papers are saved automatically to your profile.
                        </div>
                      </div>

                      {/* Right Column (.js-form-right): Elevated white card with form */}
                      <div className="b-form__right u-white-box js-form-right">
                        {(mode as string) === "forgot-password" ? (
                          /* Actual Forgot Password Page / View */
                          <div>
                            <div className="mb-6">
                              <h3 className="font-heading font-bold text-lg text-[var(--color-heading)] tracking-tight">
                                Forgot your password?
                              </h3>
                              <p className="text-xs text-[var(--color-gray-dark)] mt-1 font-sans">
                                We'll email you a secure link to reset it.
                              </p>
                            </div>

                            {/* Feedback Alerts */}
                            {errorMessage && (
                              <div
                                role="alert"
                                className="p-3 mb-5 rounded-xl bg-red-50/80 border border-red-200/60 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
                              >
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                                <span className="leading-snug">{errorMessage}</span>
                              </div>
                            )}

                            {successMessage && (
                              <div
                                role="status"
                                className="p-3 mb-5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-emerald-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
                              >
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                                <span className="leading-snug">{successMessage}</span>
                              </div>
                            )}

                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const emailInput = form.elements.namedItem("forgot_email") as HTMLInputElement;
                                const email = emailInput?.value?.trim();
                                if (!email) return;

                                setIsSubmitting(true);
                                setErrorMessage(null);
                                setSuccessMessage(null);

                                try {
                                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                                    redirectTo: `${window.location.origin}/#reset-password`,
                                  });
                                  if (error) {
                                    setErrorMessage(error.message);
                                  } else {
                                    setSuccessMessage("Password reset email sent! Please check your inbox.");
                                  }
                                } catch (err: any) {
                                  setErrorMessage(err?.message || "Failed to send reset email.");
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                              className="space-y-4"
                            >
                              <div>
                                <label
                                  htmlFor="forgot_email"
                                  className="block text-xs font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5"
                                >
                                  Account Email Address
                                </label>
                                <input
                                  id="forgot_email"
                                  name="forgot_email"
                                  type="email"
                                  required
                                  autoComplete="email"
                                  placeholder="you@example.com"
                                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-darker)] text-xs text-[var(--color-black)] placeholder-[var(--color-gray-dark)] focus:bg-white focus:border-[var(--color-black)] focus:outline-none transition-colors"
                                />
                              </div>

                              <div className="pt-2">
                                <button
                                  type="submit"
                                  disabled={isSubmitting}
                                  className="btn-main btn-main--primary btn-main--black btn-main--md w-full justify-center shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                  <span className="btn-main__outer">
                                    <span className="btn-main__inner py-3">
                                      {isSubmitting ? (
                                        <span className="inline-flex items-center gap-2">
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          <span>Sending Link...</span>
                                        </span>
                                      ) : (
                                        <span className="btn-main__text">Send Reset Link</span>
                                      )}
                                    </span>
                                    <span className="btn-main__hover" aria-hidden="true">
                                      <span className="btn-main__text" data-text="Send Reset Link"></span>
                                    </span>
                                  </span>
                                </button>
                              </div>

                              <div className="text-center pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    (setMode as any)("sign-in");
                                    setErrorMessage(null);
                                    setSuccessMessage(null);
                                  }}
                                  className="text-xs font-mono text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  ← Back to Sign In
                                </button>
                              </div>
                            </form>

                            {/* Security Footer: Replaced with Secure, removed NCERT StudyOS */}
                            <div className="mt-5 pt-4 border-t border-[var(--color-gray-lighter)] flex items-center justify-between text-xs text-[var(--color-gray-dark)] font-mono">
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Secure</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Sign In / Create Account View */
                          <div>
                            {/* Mode Switcher Tabs */}
                            <nav
                              role="tablist"
                              aria-label="Authentication mode"
                              className="relative grid grid-cols-2 p-1 rounded-full bg-[var(--color-white-darker)] border border-[var(--color-gray-lighter)] mb-6 text-xs font-medium isolate items-center"
                            >
                              {/* Smooth sliding pill indicator */}
                              <div
                                className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-xs border border-[var(--color-gray-lighter)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none z-0"
                                style={{
                                  transform: isCreate ? "translateX(100%)" : "translateX(0%)",
                                }}
                                aria-hidden="true"
                              />

                              <button
                                type="button"
                                role="tab"
                                id="tab-sign-in"
                                aria-selected={mode === "sign-in"}
                                onClick={() => {
                                  setMode("sign-in");
                                  setErrorMessage(null);
                                  setSuccessMessage(null);
                                }}
                                className={`relative h-9 w-full flex items-center justify-center text-center rounded-full transition-colors duration-200 text-xs font-mono uppercase tracking-wider z-10 cursor-pointer touch-manipulation select-none active:scale-[0.98] ${
                                  mode === "sign-in"
                                    ? "text-[var(--color-heading)] font-semibold"
                                    : "text-[var(--color-gray-dark)] hover:text-[var(--color-black)]"
                                }`}
                              >
                                <span className="relative z-10 flex items-center justify-center text-center leading-none tracking-wider">Sign In</span>
                              </button>

                              <button
                                type="button"
                                role="tab"
                                id="tab-create"
                                aria-selected={mode === "create"}
                                onClick={() => {
                                  setMode("create");
                                  setErrorMessage(null);
                                  setSuccessMessage(null);
                                }}
                                className={`relative h-9 w-full flex items-center justify-center text-center rounded-full transition-colors duration-200 text-xs font-mono uppercase tracking-wider z-10 cursor-pointer touch-manipulation select-none active:scale-[0.98] ${
                                  mode === "create"
                                    ? "text-[var(--color-heading)] font-semibold"
                                    : "text-[var(--color-gray-dark)] hover:text-[var(--color-black)]"
                                }`}
                              >
                                <span className="relative z-10 flex items-center justify-center text-center leading-none tracking-wider">Create Account</span>
                              </button>
                            </nav>

                            {/* Google OAuth Button */}
                            <div className="mb-6">
                              <button
                                type="button"
                                onClick={handleOAuth}
                                aria-label="Sign in with Google"
                                disabled={isOAuthLoading || isSubmitting}
                                className="w-full flex items-center justify-center gap-2.5 h-11 px-4 rounded-full border border-[var(--color-gray-lighter)] bg-white hover:bg-[var(--color-white-darker)] text-xs font-mono uppercase tracking-wider text-[var(--color-heading)] font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                              >
                                {isOAuthLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-[var(--color-heading)]" />
                                ) : (
                                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                    <path
                                      fill="#4285F4"
                                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                      fill="#34A853"
                                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                      fill="#FBBC05"
                                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                    />
                                    <path
                                      fill="#EA4335"
                                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    />
                                  </svg>
                                )}
                                <span>Continue with Google</span>
                              </button>
                            </div>

                            {/* Divider */}
                            <div className="relative flex items-center justify-center my-6">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--color-gray-lighter)]" />
                              </div>
                              <span className="relative px-3 bg-white text-xs font-mono uppercase tracking-widest text-[var(--color-gray-dark)]">
                                or continue with email
                              </span>
                            </div>

                            {/* Feedback Alerts */}
                            {errorMessage && (
                              <div
                                role="alert"
                                className="p-3 mb-5 rounded-xl bg-red-50/80 border border-red-200/60 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
                              >
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                                <span className="leading-snug">{errorMessage}</span>
                              </div>
                            )}

                            {successMessage && (
                              <div
                                role="status"
                                className="p-3 mb-5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-emerald-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
                              >
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                                <span className="leading-snug">{successMessage}</span>
                              </div>
                            )}

                            {/* Authentication Form */}
                            <form onSubmit={handleSubmit}>
                              {/* Collapsible Name & Grade Section */}
                              <div
                                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                  isCreate
                                    ? "grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                                }`}
                                aria-hidden={!isCreate}
                              >
                                <div className="overflow-hidden pb-4 space-y-4">
                                  <div>
                                    <label
                                      htmlFor="full_name"
                                      className="block text-xs font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5"
                                    >
                                      Full Name
                                    </label>
                                    <input
                                      id="full_name"
                                      name="full_name"
                                      type="text"
                                      autoComplete="name"
                                      tabIndex={isCreate ? 0 : -1}
                                      placeholder="e.g. Reyansh Niranjan"
                                      className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-darker)] text-xs text-[var(--color-black)] placeholder-[var(--color-gray-dark)] focus:bg-white focus:border-[var(--color-black)] focus:outline-none transition-colors"
                                    />
                                  </div>

                                  <div>
                                    <label
                                      htmlFor="grade"
                                      className="block text-xs font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5"
                                    >
                                      Grade Level / Role
                                    </label>
                                    <div className="relative">
                                      <select
                                        id="grade"
                                        name="grade"
                                        defaultValue="Class 10"
                                        tabIndex={isCreate ? 0 : -1}
                                        className="w-full h-11 px-3.5 pr-10 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-darker)] text-xs text-[var(--color-black)] focus:bg-white focus:border-[var(--color-black)] focus:outline-none transition-colors appearance-none cursor-pointer"
                                      >
                                        <option value="Class 1–5">Class 1–5 (Primary)</option>
                                        <option value="Class 6">Class 6 (Middle)</option>
                                        <option value="Class 7">Class 7 (Middle)</option>
                                        <option value="Class 8">Class 8 (Middle)</option>
                                        <option value="Class 9">Class 9 (Secondary)</option>
                                        <option value="Class 10">Class 10 (Board Exam)</option>
                                        <option value="Class 11">Class 11 (Senior Secondary)</option>
                                        <option value="Class 12">Class 12 (Board Exam)</option>
                                        <option value="Educator">Educator / Teacher</option>
                                        <option value="Parent">Parent</option>
                                      </select>
                                      <ChevronDown className="w-4 h-4 text-[var(--color-gray-dark)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <label
                                    htmlFor="email"
                                    className="block text-xs font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5"
                                  >
                                    Email Address
                                  </label>
                                  <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-darker)] text-xs text-[var(--color-black)] placeholder-[var(--color-gray-dark)] focus:bg-white focus:border-[var(--color-black)] focus:outline-none transition-colors"
                                  />
                                </div>

                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <label
                                      htmlFor="password"
                                      className="block text-xs font-mono uppercase tracking-wider text-[var(--color-gray-dark)]"
                                    >
                                      Password
                                    </label>
                                    <div
                                      className={`transition-opacity duration-200 ${
                                        !isCreate ? "opacity-100" : "opacity-0 pointer-events-none"
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        tabIndex={!isCreate ? 0 : -1}
                                        onClick={() => {
                                          (setMode as any)("forgot-password");
                                          setErrorMessage(null);
                                          setSuccessMessage(null);
                                        }}
                                        className="text-xs font-mono text-[var(--color-primary)] hover:underline cursor-pointer"
                                      >
                                        Forgot password?
                                      </button>
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <input
                                      id="password"
                                      name="password"
                                      type={showPassword ? "text" : "password"}
                                      required
                                      value={passwordValue}
                                      onChange={(e) => setPasswordValue(e.target.value)}
                                      autoComplete={isCreate ? "new-password" : "current-password"}
                                      placeholder="••••••••"
                                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-darker)] text-xs text-[var(--color-black)] placeholder-[var(--color-gray-dark)] focus:bg-white focus:border-[var(--color-black)] focus:outline-none transition-colors"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      aria-label={showPassword ? "Hide password" : "Show password"}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-dark)] hover:text-[var(--color-black)] p-1 cursor-pointer"
                                    >
                                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Collapsible Confirm Password Section */}
                              <div
                                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                  isCreate
                                    ? "grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                                }`}
                                aria-hidden={!isCreate}
                              >
                                <div className="overflow-hidden pt-4">
                                  <label
                                    htmlFor="password_confirm"
                                    className="block text-xs font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5"
                                  >
                                    Confirm Password
                                  </label>
                                  <div className="relative mt-1.5">
                                    <input
                                      id="password_confirm"
                                      name="password_confirm"
                                      type={showConfirmPassword ? "text" : "password"}
                                      required={isCreate}
                                      tabIndex={isCreate ? 0 : -1}
                                      autoComplete="new-password"
                                      placeholder="••••••••"
                                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-darker)] text-xs text-[var(--color-black)] placeholder-[var(--color-gray-dark)] focus:bg-white focus:border-[var(--color-black)] focus:outline-none transition-colors"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                      tabIndex={isCreate ? 0 : -1}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-dark)] hover:text-[var(--color-black)] p-1 cursor-pointer"
                                    >
                                      {showConfirmPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Submit Button */}
                              <div className="pt-4">
                                <button
                                  type="submit"
                                  disabled={isSubmitting || isOAuthLoading}
                                  className="btn-main btn-main--primary btn-main--black btn-main--md w-full justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <span className="btn-main__outer">
                                    <span className="btn-main__inner py-3">
                                      {isSubmitting ? (
                                        <span className="inline-flex items-center gap-2">
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          <span>{isCreate ? "Creating..." : "Verifying..."}</span>
                                        </span>
                                      ) : (
                                        <span className="btn-main__text relative inline-block overflow-hidden h-[1.3em]">
                                          <span
                                            className="block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                                            style={{
                                              transform: isCreate ? "translateY(-50%)" : "translateY(0%)",
                                            }}
                                          >
                                            <span className="block h-[1.3em] leading-[1.3em]">Enter Workspace</span>
                                            <span className="block h-[1.3em] leading-[1.3em]">Create Workspace</span>
                                          </span>
                                        </span>
                                      )}
                                    </span>
                                    <span className="btn-main__hover" aria-hidden="true">
                                      <span
                                        className="btn-main__text"
                                        data-text={isCreate ? "Create Workspace" : "Enter Workspace"}
                                      ></span>
                                    </span>
                                  </span>
                                </button>
                              </div>
                            </form>

                            {/* Security Footer: Replaced with Secure, removed NCERT StudyOS */}
                            <div className="mt-5 pt-4 border-t border-[var(--color-gray-lighter)] flex items-center justify-between text-xs text-[var(--color-gray-dark)] font-mono">
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Secure</span>
                              </div>
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
                className="s__close btn-main btn-main--primary btn-main--white btn-main--sm cursor-pointer"
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
