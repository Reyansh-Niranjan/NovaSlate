import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Header } from './Header';
import { CustomScrollbar } from './CustomScrollbar';
import { Hero } from './Hero';
import { Usps } from './Usps';
import { Work } from './Work';
import { Catchphrase } from './Catchphrase';
import { Faq } from './Faq';
import { FinalCta } from './FinalCta';
import { Footer } from './Footer';
import { ContactModal } from './ContactModal';
import { ShowreelModal } from './ShowreelModal';
import { LoginModal } from '../LoginModal';

gsap.registerPlugin(ScrollTrigger);

export interface LandingPageProps {
  onNavigateToLogin?: () => void;
  onNavigateToDashboard?: () => void;
  isLoggedIn?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToDashboard,
  isLoggedIn = false,
}) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactInitialData, setContactInitialData] = useState<any>(null);
  const [isShowreelOpen, setIsShowreelOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(() => {
    return typeof window !== 'undefined' && window.location.hash.startsWith('#login');
  });

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.startsWith('#login')) {
        setIsLoginOpen(true);
    onNavigateToLogin?.();
      }
    };
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, []);

  useEffect(() => {
    // Landing page is an editorial light publication with #2b2b2b typography
    const hadDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');

    return () => {
      const savedTheme = localStorage.getItem('theme');
      if (hadDark || savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    setLenisInstance(lenis);

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  const handleOpenContact = (initialData?: any) => {
    setContactInitialData(initialData || null);
    setIsContactOpen(true);
  };

  const handleCloseContact = () => {
    setIsContactOpen(false);
  };

  const handleOpenLogin = () => {
    try {
      if (!window.location.hash.startsWith('#login')) {
        window.history.pushState({}, '', '#login');
      }
    } catch {
      // noop
    }
    setIsLoginOpen(true);
    onNavigateToLogin?.();
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
    if (window.location.hash.startsWith('#login')) {
      try {
        window.history.replaceState({}, '', window.location.pathname + window.location.search);
      } catch {
        window.location.hash = '';
      }
    }
  };

  return (
    <div className="landing-page-root relative min-h-screen bg-[var(--color-white-darker)] text-[#2b2b2b] selection:bg-[var(--color-accent)] selection:text-white">
      {/* Custom Draggable Scrollbar */}
      <CustomScrollbar lenis={lenisInstance} />

      {/* Header */}
      <Header
        onOpenContact={() => handleOpenContact()}
        onNavigateToLogin={handleOpenLogin}
        onNavigateToDashboard={onNavigateToDashboard}
        isLoggedIn={isLoggedIn}
      />

      {/* Main Page Content */}
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <Usps />
        <Work
          onOpenShowreel={() => setIsShowreelOpen(true)}
          onOpenContact={() => handleOpenContact()}
        />
        <Catchphrase />
        <Faq onOpenContact={() => handleOpenContact()} />
        <FinalCta onOpenContact={() => handleOpenContact()} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Contact Booking Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={handleCloseContact}
        initialData={contactInitialData}
      />

      {/* Fullscreen Showreel Modal */}
      <ShowreelModal
        isOpen={isShowreelOpen}
        onClose={() => setIsShowreelOpen(false)}
      />

      {/* Login / Auth Modal with incredibles.dev scale-blur animation */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={handleCloseLogin}
        onSuccess={onNavigateToDashboard}
      />
    </div>
  );
};

export default LandingPage;
