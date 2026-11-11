import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PatternCanvas } from './PatternCanvas';
import { siteContent } from '@/data/content';

gsap.registerPlugin(ScrollTrigger);

export const Hero: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fluidInnerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const fluidInner = fluidInnerRef.current;
    if (!section || !container || !fluidInner) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth <= 767;
      const initialRadius = isMobile ? '1rem' : '1.5rem';
      const targetRadius = isMobile ? '2.5rem' : '3.5rem';
      const targetScale = isMobile ? 0.95 : 0.93;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0,
        },
      });

      // Shrink card and curve borders on scroll away
      tl.fromTo(
        section,
        { scale: 1, borderRadius: initialRadius, transformOrigin: '50% 0%' },
        { scale: targetScale, borderRadius: targetRadius, ease: 'none', duration: 1 },
        0
      );

      // Parallax container content without fade out
      tl.fromTo(
        container,
        { y: 0 },
        { y: () => window.innerHeight * 0.3, ease: 'none', duration: 1 },
        0
      );

      // Parallax fluid canvas inside clipped fluid layer
      tl.fromTo(fluidInner, { y: 0 }, { y: () => window.innerHeight * 0.3, ease: 'none', duration: 1 }, 0);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="s-hero">
      <div className="s__fluid" aria-hidden="true">
        <div ref={fluidInnerRef} className="s__fluid-inner">
          <div className="b-fluid">
            <PatternCanvas />
          </div>
        </div>
      </div>

      <div ref={containerRef} className="u-container">
        <h1 className="s__title t-h-3xl">
          {siteContent.hero.title}
        </h1>

        <p className="s__text t-t-lg">
          {siteContent.hero.text}
        </p>
      </div>
    </section>
  );
};
