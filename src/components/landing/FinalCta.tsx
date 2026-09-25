import React from 'react';
import { siteContent } from '@/data/content';
import { PatternCanvas } from './PatternCanvas';

interface FinalCtaProps {
  onOpenContact: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onOpenContact }) => {
  return (
    <section className="s-final-cta">
      <div className="u-container">
        <div className="s__inner">
          <h2
            className="s__title t-h-3xl"
            dangerouslySetInnerHTML={{ __html: siteContent.finalCTA.title }}
          />
          <button
            type="button"
            onClick={onOpenContact}
            className="btn-main btn-main--primary btn-main--black btn-main--lg s__btn"
          >
            <span className="btn-main__outer">
              <span className="btn-main__inner">
                <span className="btn-main__text u-height-fix">{siteContent.finalCTA.button}</span>
              </span>
              <span className="btn-main__hover" aria-hidden="true">
                <span className="btn-main__text u-height-fix" data-text={siteContent.finalCTA.button}></span>
              </span>
            </span>
          </button>
        </div>
      </div>

      <div className="s__background-wrapper">
        <div className="b-fluid s__background" aria-hidden="true">
          <PatternCanvas immediate={true} staticFlow={true} />
        </div>
      </div>
    </section>
  );
};
