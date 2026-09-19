import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  Menu,
  X,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  Cpu,
  ShieldCheck,
  History,
  HelpCircle,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

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
    { label: "Overview",       href: "#home",      icon: BookOpen },
    { label: "Study Tools",    href: "#features",  icon: Sparkles },
    { label: "Atlas Hardware", href: "#hardware",  icon: Cpu },
    { label: "Pricing",        href: "#pricing",   icon: ShieldCheck },
    { label: "Evolution",      href: "#timeline",  icon: History },
    { label: "FAQ",            href: "#faq",       icon: HelpCircle },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    gsap.to(window, {
      duration: 0.8,
      scrollTo: { y: href, offsetY: 64 },
      ease: "power2.inOut",
    });
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
          className="flex items-center gap-2.5 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <Logo className="h-7 w-auto transition-transform group-hover:scale-105" />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-foreground font-heading">
              Nova<span className="text-primary font-serif italic font-normal">Slate</span>
            </span>
            <span className="inline-flex items-center text-xs font-semibold font-mono px-2.5 py-1 rounded-full bg-secondary text-primary border border-border tracking-wide">
              Open K–12
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1 font-heading hover:scale-[1.02] active:scale-[0.98]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Conversion CTAs & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={navigateToLogin}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 cursor-pointer font-heading"
          >
            Log In
          </button>
          <Button
            size="sm"
            onClick={navigateToLogin}
            className="text-xs h-8 px-4 gap-1.5 font-bold cursor-pointer rounded-lg font-heading bg-primary text-primary-foreground hover:opacity-90 shadow-xs"
          >
            <span>Start Free</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                  className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50 p-6 shadow-xl lg:hidden flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Logo className="h-6 w-auto" />
                      <span className="font-bold text-sm text-foreground font-heading">
                        NovaSlate
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="w-5 h-5" />
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
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-foreground hover:bg-secondary transition-colors font-heading"
                        >
                          <div className="p-1 rounded-md bg-primary/10 text-primary">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span>{link.label}</span>
                        </a>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-border">
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigateToLogin();
                      }}
                      className="w-full h-10 font-bold font-heading bg-primary text-primary-foreground hover:opacity-90"
                    >
                      <span>Start Reading Free</span>
                      <ArrowUpRight className="w-4 h-4" />
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
