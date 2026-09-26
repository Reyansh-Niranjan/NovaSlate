import React from 'react';
import { siteContent } from '@/data/content';
import { ArrowUpRight } from 'lucide-react';

interface FinalCtaProps {
  onOpenContact: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onOpenContact }) => {
  const { finalCTA } = siteContent;

  return (
    <section className="s-final-cta relative z-10 bg-[var(--color-bg)]">
      <div className="u-container">
        <div className="s-final-cta__card">
          {/* Top Telemetry Tag */}
          <div className="s-final-cta__eyebrow t-l-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] inline-block animate-pulse" />
            <span>{finalCTA.eyebrow}</span>
          </div>

          {/* Heading */}
          <h2
            className="s-final-cta__heading t-h-2xl"
            dangerouslySetInnerHTML={{ __html: finalCTA.title }}
          />

          {/* Subtitle */}
          <p className="s-final-cta__subtitle t-t-sm">
            {finalCTA.subtitle}
          </p>

          {/* Action Row */}
          <div className="s-final-cta__actions">
            <button
              type="button"
              onClick={onOpenContact}
              className="btn-main btn-main--primary btn-main--black btn-main--lg s-final-cta__btn"
            >
              <span className="btn-main__outer">
                <span className="btn-main__inner">
                  <span className="btn-main__text u-height-fix">{finalCTA.button}</span>
                </span>
                <span className="btn-main__hover" aria-hidden="true">
                  <span className="btn-main__text u-height-fix" data-text={finalCTA.button}></span>
                </span>
              </span>
            </button>

            {/* Quick Links */}
            <div className="s-final-cta__links">
              {finalCTA.links?.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="s-final-cta__link t-t-2xs group"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
