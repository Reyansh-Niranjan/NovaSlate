import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Catchphrase: React.FC = () => {
  const elRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const updateHeight = () => {
      const activeContent =
        el.querySelector<HTMLElement>('[data-impeccable-variant]:not([style*="display: none"]) .s__content') ||
        el.querySelector<HTMLElement>('.s__content');
      if (activeContent && el) {
        el.style.setProperty('--content-height', `${activeContent.offsetHeight}px`);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    const ctx = gsap.context(() => {
      const titles = el.querySelectorAll<HTMLElement>('.s__title');
      titles.forEach((title) => {
        const lines = Array.from(title.querySelectorAll('.line')).reverse() as HTMLElement[];
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top -25%',
            end: 'bottom 50%',
            scrub: 0,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(title, { y: '-50%' }, { y: '0%', duration: 1, ease: 'expo.out' }, 0);

        lines.forEach((line, f) => {
          tl.fromTo(
            line,
            { scale: 0.75, opacity: 0 },
            { scale: 1, opacity: 1, ease: 'power4.out', duration: 0.7 },
            f * 0.05
          );
          tl.fromTo(
            line,
            { y: '200%' },
            { y: '0%', ease: 'power4.out', duration: 0.9 },
            f * 0.025
          );
        });
      });
    }, el);

    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener('resize', updateHeight);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={elRef} className="s-catchphrase relative">

      <div className="s__content">
        <h2 className="s__title t-h-3xl">
          <span className="line block">Curating</span>
          <span className="line block">future-ready</span>
          <span className="line block">learning for</span>
          <span className="line block">every student.</span>
        </h2>
      </div>

    </section>
  );
};
