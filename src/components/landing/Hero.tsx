import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PatternCanvas } from './PatternCanvas';
import { siteContent } from '@/data/content';

gsap.registerPlugin(ScrollTrigger);

export const Hero: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fluidRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const fluid = fluidRef.current;
    if (!section || !container || !fluid) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0,
        },
      });

      tl.fromTo(container, { y: 0 }, { y: () => window.innerHeight * 0.5, ease: 'none', duration: 1 }, 0);
      tl.fromTo(fluid, { y: 0 }, { y: () => window.innerHeight * 0.5, ease: 'none', duration: 1 }, 0);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="s-hero">
      <div ref={fluidRef} className="s__fluid">
        <div className="b-fluid" aria-hidden="true">
          <PatternCanvas />
        </div>
      </div>

      <div ref={containerRef} className="u-container">
        <ul className="s__awards t-l-lg">
          {siteContent.hero.awards.map((award) => (
            <li key={award} className="s__award">
              <span className="u-height-fix">{award}</span>
            </li>
          ))}
        </ul>

        <h1 className="s__title t-h-3xl">
          {siteContent.hero.title}
        </h1>

        <p className="s__text t-t-lg">
          {siteContent.hero.text}
        </p>



        <div className="s__clients">
          <p className="s__clients-label t-l-md">
            {siteContent.hero.clients.label}
          </p>
          <ul className="s__logos">
            {siteContent.hero.clients.logos.map((c) => (
              <li key={c.name} className="s__logo-item">
                <img
                  className="s__logo"
                  src={c.logo}
                  alt={c.name}
                  loading="lazy"
                />
              </li>
            ))}
          </ul>
        </div>


      </div>
    </section>
  );
};
