import React from 'react';
import { PatternCanvas } from './PatternCanvas';

interface FinalCtaProps {
  onOpenContact?: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = () => {
  return (
    <section className="s-final-cta relative z-10 bg-[var(--color-bg)]">
      <div className="u-container">
        <div className="s-final-cta__card relative overflow-hidden border-2 border-[var(--color-primary)]/25 bg-[var(--color-white-darker)] shadow-xs">
          {/* Static Dithered Hero Pattern Layer with Architectural Tint */}
          <div className="b-fluid b-fluid--cta-v2 opacity-60 pointer-events-none absolute inset-0 w-full h-full z-0" aria-hidden="true">
            <PatternCanvas immediate={true} staticFlow={true} />
          </div>
          <div className="absolute inset-0 bg-linear-to-r from-white/85 via-white/65 to-transparent pointer-events-none z-[1]" />

          {/* Heading */}
          <h2 className="s-final-cta__heading t-h-2xl relative z-10">
            Learning.<br />Finally, in one place
          </h2>

          {/* Action Row */}
          <div className="s-final-cta__actions relative z-10 mt-2">
            <a
              href="https://github.com/Reyansh-Niranjan/NovaSlate"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-main btn-main--primary btn-main--black btn-main--md s-final-cta__btn shadow-sm"
            >
              <span className="btn-main__outer">
                <span className="btn-main__inner">
                  <span className="btn-main__text u-height-fix">Verify it yourself</span>
                </span>
                <span className="btn-main__hover" aria-hidden="true">
                  <span className="btn-main__text u-height-fix" data-text="Verify it yourself"></span>
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
