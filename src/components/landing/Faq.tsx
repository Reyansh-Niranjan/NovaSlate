import React, { useState } from 'react';
import { siteContent } from '@/data/content';

interface FaqProps {
  onOpenContact: () => void;
}

export const Faq: React.FC<FaqProps> = ({ onOpenContact }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="s-faq u-container">
      <div className="s__inner">
        <div className="s__top">
          <h2 className="s__title t-h-lg">{siteContent.faq.title}</h2>
          <p className="s__text rte">
            Need more information?<br />
            Feel free to{' '}
            <button
              type="button"
              onClick={onOpenContact}
              className="hover:underline text-[var(--color-primary)] font-medium bg-transparent border-0 p-0 cursor-pointer inline text-inherit"
            >
              reach out.
            </button>
          </p>
        </div>

        <div className="s__questions">
          {siteContent.faq.questions.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`b-faq s__question ${isOpen ? 'is-open' : ''}`}
              >
                <h3 className="t-t-md b__title">
                  <button
                    type="button"
                    className="b__toggle"
                    aria-expanded={isOpen}
                    onClick={() => toggle(idx)}
                  >
                    {item.question}
                  </button>
                </h3>
                <div
                  className="b__wrapper"
                  style={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                  }}
                >
                  <div
                    className="b__text"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
