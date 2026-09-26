import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '@/data/content';
import { PatternCanvas } from './PatternCanvas';
import { ContinuityAsset } from './UspAssets/Continuity';
import { CapacityAsset } from './UspAssets/Capacity';
import { CollaborationAsset } from './UspAssets/Collaboration';
import { ExperienceAsset } from './UspAssets/Experience';
import { pauseUspRunner, resumeUspRunner } from './UspAssets/syncRunner';

gsap.registerPlugin(ScrollTrigger);

export const Usps: React.FC = () => {
  const elRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = elRef.current;
    const header = headerRef.current;
    const list = listRef.current;
    if (!el || !header || !list) return;

    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      const f = cards.length;
      const getCardHeight = () => (cards[0] ? cards[0].offsetHeight : 440);
      const getP = () => window.innerHeight * 0.5 + getCardHeight();

      // Initial card position (hidden below viewport)
      gsap.set(cards, { y: getP() });
      gsap.set(header, { left: 0, x: 0, xPercent: 0 });

      // Header entrance and subtle scale down
      const iTl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 0,
        },
      });
      iTl.fromTo(header, { y: () => window.innerHeight * 0.25 }, { y: 0, ease: 'power4.out', duration: 2 }, 0);
      iTl.fromTo(header, { scale: 1 }, { scale: 0.85, ease: 'none', duration: f }, 1);

      // Card stacking scrub timeline
      const tTl = gsap.timeline({
        scrollTrigger: {
          trigger: list,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 0,
        },
      });

      cards.forEach((card, g) => {
        tTl.fromTo(card, { y: getP() }, { y: 0, ease: 'power2.inOut', duration: 1.5 }, g);
        tTl.fromTo(card, { rotateX: 90, z: 750 }, { rotateX: 0, z: 0, ease: 'power2.inOut', duration: 1.2 }, g);

        for (let x = 0; x < g; x++) {
          const prevCard = cards[x];
          const m = g - x - 1;
          const S = g - x;
          const R = 0.125;
          tTl.fromTo(prevCard, { scale: 1 - m * R }, { scale: 1 - S * R, ease: 'none', duration: 1, immediateRender: false }, g);
          tTl.fromTo(prevCard, { '--fade': m * 0.1 }, { '--fade': S * 0.1, ease: 'none', duration: 0.5, immediateRender: false }, g + 0.75);
        }
      });

      // Exit timeline when scrolling into the next section
      const nTl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'bottom 150%',
          end: 'bottom -100%',
          scrub: 0,
        },
      });
      nTl.to(header, { y: () => -window.innerHeight * 0.5 - header.offsetHeight * 0.5, ease: 'power2.in', duration: 1.35 }, 0);
      nTl.to(header, { scale: 0, ease: 'power1.in', duration: 1 }, 0.25);
      nTl.to(cards, { y: () => -getP(), ease: 'power1.in', duration: 1, stagger: 0.075 }, 0);
      nTl.to(el, { opacity: 0, ease: 'power1.in', duration: 0.75 }, 0.15);

      // Visibility gating to prevent fixed overlays when completely out of range
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom -100%',
        onToggle: (self) => {
          const isVisible = self.isActive;
          gsap.set([header, ...Array.from(el.querySelectorAll('.s__usp-wrapper'))], {
            visibility: isVisible ? 'visible' : 'hidden',
          });
        },
      });
    }, el);

    // Pause SVG and GSAP ticker when architecture section is scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          resumeUspRunner();
        } else {
          pauseUspRunner();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  const getAsset = (key: string) => {
    switch (key) {
      case 'continuity':
        return <ContinuityAsset />;
      case 'capacity':
        return <CapacityAsset />;
      case 'collaboration':
        return <CollaborationAsset />;
      case 'experience':
        return <ExperienceAsset />;
      default:
        return null;
    }
  };

  return (
    <section ref={elRef} id="architecture" className="s-usps" style={{ ['--usps-count' as any]: siteContent.usps.items.length }}>
      <div className="s__outer">
        <div ref={headerRef} className="s__header" style={{ pointerEvents: 'none' }}>
          <h2 className="s__title t-h-2xl">{siteContent.usps.title}</h2>
          <p className="s__text t-t-md">{siteContent.usps.text}</p>
        </div>

        <div className="s__usps">
          <ul ref={listRef} className="s__list">
            {siteContent.usps.items.map((item, index) => (
              <li key={item.key} className="s__item">
                <span className="s__usp-wrapper">
                  <div
                    ref={(cardEl) => {
                      cardsRef.current[index] = cardEl;
                    }}
                    className="b-usp-card s__usp"
                  >
                    <div className="b__inner">
                      <div className="b__asset">
                        {getAsset(item.key)}
                        <div className="b-fluid" aria-hidden="true">
                          <PatternCanvas immediate={true} staticFlow={true} />
                        </div>
                      </div>
                      <div className="b__content">
                        <h3 className="b__title t-h-md">{item.title}</h3>
                        <p className="b__text t-t-sm">{item.text}</p>
                      </div>
                    </div>
                    <div className="b__overlay"></div>
                  </div>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
