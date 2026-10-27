import React, { useState } from 'react';
import { siteContent } from '@/data/content';

interface FaqProps {
  onOpenContact?: () => void;
}

export const Faq: React.FC<FaqProps> = ({ onOpenContact: _onOpenContact }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="s-faq u-container relative z-10 bg-[var(--color-bg)] py-16 sm:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="t-h-lg text-[var(--color-heading)] font-heading mb-3">
            {siteContent.faq.title}
          </h2>
          <p className="t-t-sm text-[var(--color-gray-dark)]">
            Everything you need to know about the platform.
          </p>
        </div>

        <div className="faq-list divide-y divide-[var(--color-gray-lighter)] border-y border-[var(--color-gray-lighter)]">
          {siteContent.faq.questions.map((item, idx) => {
            const isOpen = openIndex === idx;
            const isAnyOpen = openIndex !== null;

            return (
              <div
                key={idx}
                className={`py-4 sm:py-5 px-3 -mx-3 rounded-lg transition-all duration-200 ease-out ${
                  isOpen
                    ? 'bg-[var(--color-primary)]/[0.03] opacity-100'
                    : isAnyOpen
                    ? 'opacity-45 hover:opacity-85 hover:bg-black/[0.01]'
                    : 'opacity-100 hover:bg-black/[0.015]'
                }`}
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left group cursor-pointer bg-transparent border-0 p-0"
                  aria-expanded={isOpen}
                  onClick={() => toggle(idx)}
                >
                  <span className="text-base sm:text-lg font-heading font-medium text-[var(--color-heading)] group-hover:text-[var(--color-primary)] transition-colors pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`text-sm font-mono shrink-0 select-none inline-block transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                      isOpen
                        ? 'rotate-180 text-[var(--color-primary)]'
                        : 'rotate-0 text-[var(--color-gray-dark)] group-hover:text-[var(--color-heading)]'
                    }`}
                  >
                    ↓
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`pt-3 pl-3 border-l-2 border-[var(--color-primary)]/40 text-sm text-[var(--color-gray-dark)] leading-relaxed pr-6 mt-1 transition-all duration-200 ease-out motion-reduce:transition-none ${
                        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
