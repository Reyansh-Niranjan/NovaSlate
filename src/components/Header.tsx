import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  HamburgerMenuIcon,
  Cross2Icon,
  ArrowTopRightIcon,
  ReaderIcon,
  MagicWandIcon,
  Component1Icon,
  CheckCircledIcon,
  CounterClockwiseClockIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollToPlugin);

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Close mobile drawer on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Track scroll state for elevation shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Overview",       href: "#home",      icon: ReaderIcon },
    { label: "Study Tools",    href: "#features",  icon: MagicWandIcon },
    { label: "Atlas Hardware", href: "#hardware",  icon: Component1Icon },
    { label: "Pricing",        href: "#pricing",   icon: CheckCircledIcon },
    { label: "Evolution",      href: "#timeline",  icon: CounterClockwiseClockIcon },
    { label: "FAQ",            href: "#faq",       icon: QuestionMarkCircledIcon },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      gsap.to(window, {
        duration: 0.6,
        scrollTo: { y: href, offsetY: 64 },
        ease: "power2.out",
      });
    }
  };

  const navigateToLogin = () => {
    window.history.pushState({}, "", "#login");
    window.dispatchEvent(new Event("hashchange"));
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-xs"
          : "bg-background/70 backdrop-blur-xs border-b border-border/50"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl h-16 flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="flex items-center gap-3 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full interactive-tap"
        >
          <img
            src="/novaslate_icon.png"
            alt="NovaSlate"
            className="w-8 h-8 object-contain transform group-hover:scale-105 transition-transform duration-200"
          />
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-lg tracking-tight text-foreground">
              NovaSlate
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold font-mono px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border/80 tracking-wide">
              Open K–12
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3.5 py-1.5 rounded-full text-xs font-heading font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={navigateToLogin}
            className="text-xs font-semibold font-heading text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-secondary cursor-pointer interactive-tap active:scale-[0.97]"
          >
            Log In
          </button>
          <Button
            size="sm"
            onClick={navigateToLogin}
            className="text-xs h-8 px-4 gap-1.5 font-bold cursor-pointer rounded-full font-heading bg-foreground text-background hover:opacity-90 shadow-xs interactive-tap active:scale-[0.97]"
          >
            <span>Start Free</span>
            <ArrowTopRightIcon className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full border border-border/80 text-foreground hover:bg-secondary transition-colors cursor-pointer interactive-tap active:scale-[0.97]"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <Cross2Icon className="w-5 h-5" /> : <HamburgerMenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Portal) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
                />
                <motion.div
                  initial={{ y: "-100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 280 }}
                  className="fixed top-0 left-0 right-0 bg-card border-b border-border/80 z-50 p-6 shadow-2xl lg:hidden flex flex-col gap-4 rounded-b-3xl"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border/80">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/novaslate_icon.png"
                        alt="NovaSlate"
                        className="w-7 h-7 object-contain"
                      />
                      <span className="font-heading font-semibold text-base text-foreground">
                        NovaSlate
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 rounded-full border border-border/80 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Cross2Icon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 py-1">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={(e) => handleNavClick(e, link.href)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-heading font-medium text-foreground hover:bg-secondary transition-colors"
                        >
                          <div className="p-1.5 rounded-lg bg-secondary text-foreground">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span>{link.label}</span>
                        </a>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-border/80">
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigateToLogin();
                      }}
                      className="w-full h-11 font-bold font-heading rounded-full bg-foreground text-background hover:opacity-90 shadow-sm"
                    >
                      <span>Start Reading Free</span>
                      <ArrowTopRightIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}
