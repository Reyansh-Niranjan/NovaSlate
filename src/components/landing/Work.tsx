import React from 'react';
import { ExecutionCanvas } from './ExecutionCanvas';
import { PatternCanvas } from './PatternCanvas';
import { siteContent } from '@/data/content';

interface WorkProps {
  onOpenShowreel: () => void;
  onOpenContact: () => void;
}

export const Work: React.FC<WorkProps> = ({ onOpenShowreel, onOpenContact }) => {
  return (
    <section className="s-work" id="curriculum">


      <div className="u-container">
            {/* 1. Execution Canvas */}
            <div className="s__execution">
              <div className="b-execution">
                <h2 className="b__title t-h-xl">
                  {siteContent.work.execution.title}
                </h2>
                <div className="b-fluid" aria-hidden="true">
                <PatternCanvas immediate={true} staticFlow={true} />
              </div>
              <ExecutionCanvas />
              </div>
            </div>

            {/* 2. Quote */}
            <div className="s__quote">
              <div className="b-quote">
                <blockquote className="b__content t-h-xl">
                  <p className="b__text">
                    {siteContent.work.quote.text}
                  </p>
                  <footer className="b__author t-t-sm">
                    {siteContent.work.quote.author}
                  </footer>
                </blockquote>
              </div>
            </div>

            {/* 3. Showreel */}
            <div className="s__showreel">
              <div className="b-showreel">
                <div className="b__thumbnail">
                  <button
                    type="button"
                    className="btn-main btn-main--secondary btn-main--white btn-main--sm b__link"
                    onClick={onOpenShowreel}
                  >
                    <span className="btn-main__outer">
                      <span className="btn-main__inner">
                        <span className="btn-main__text u-height-fix">{siteContent.work.showreel.label}</span>
                      </span>
                      <span className="btn-main__hover" aria-hidden="true">
                        <span className="btn-main__text u-height-fix" data-text={siteContent.work.showreel.label}></span>
                      </span>
                    </span>
                  </button>
                  <video
                    className="b__thumb"
                    preload="metadata"
                    poster={siteContent.work.showreel.poster}
                    controlsList="nodownload noremoteplayback"
                    disablePictureInPicture
                    muted
                    loop
                    playsInline
                    autoPlay
                    src={siteContent.work.showreel.loopSrc}
                  />
                </div>
              </div>
            </div>

            {/* 4. Latest Delivery */}
            <div className="s__delivery">
              <div className="b-delivery">
                <div className="b__header">
                  <div className="b__header__top">
                    <h2 className="b__title t-h-xs">{siteContent.work.delivery.title}</h2>
                    <p className="b__text t-t-2xs">{siteContent.work.delivery.text}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-main btn-main--primary btn-main--black btn-main--sm b__cta"
                    onClick={onOpenContact}
                  >
                    <span className="btn-main__outer">
                      <span className="btn-main__inner">
                        <span className="btn-main__text u-height-fix">{siteContent.work.delivery.cta}</span>
                      </span>
                      <span className="btn-main__hover" aria-hidden="true">
                        <span className="btn-main__text u-height-fix" data-text={siteContent.work.delivery.cta}></span>
                      </span>
                    </span>
                  </button>
                </div>
                <ul className="b__projects">
                  {siteContent.work.delivery.projects.map((p, index) => (
                    <li key={index} className="sb-project">
                      <p className="sb__description t-t-sm">{p.description}</p>
                      <div className="sb__footer">
                        <div className="sb__meta">
                          <span className="sb__pill sb__localisation">
                            <span className="u-height-fix">{p.localisation}</span>
                          </span>
                          <span className="sb__pill sb__duration">
                            <span className="u-height-fix">{p.duration}</span>
                          </span>
                        </div>
                        {p.link ? (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sb__link"
                          >
                            <span className="sb__link__icon" />
                            <span className="u-sr-only">View project</span>
                          </a>
                        ) : (
                          <span className="sb__nda">
                            <span className="u-height-fix">NDA</span>
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
    </section>
  );
};
