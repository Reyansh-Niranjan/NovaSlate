import React, { useState } from 'react';
import { siteContent } from '@/data/content';
import { Calculator } from './Calculator';
import { Recurring } from './Recurring';

interface PricingProps {
  onOpenContact: (initialData?: any) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onOpenContact }) => {
  const [activeTab, setActiveTab] = useState<'single' | 'recurring'>('single');

  return (
    <section id="pricing" className={`s-pricing u-container is-${activeTab}`}>
      {/* Left Column */}
      <div className="s-pricing__left">
        <h2 className="s__title t-h-2xl">{siteContent.pricing.title}</h2>
        <div className="s__text rte">
          {siteContent.pricing.texts.map((text, idx) => (
            <p key={idx}>{text}</p>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="s-pricing__right">
        {/* Animated Toggle */}
        <div className="b-pricing-toggle t-t-2xs" role="tablist">
          <span
            className="b__pill"
            style={{
              transform: activeTab === 'single' ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)',
              width: '50%',
              opacity: 1,
            }}
            aria-hidden="true"
          />
          <button
            type="button"
            role="tab"
            className={`b__option ${activeTab === 'single' ? 'is-active' : ''}`}
            aria-selected={activeTab === 'single'}
            onClick={() => setActiveTab('single')}
          >
            {siteContent.pricing.toggle.single}
          </button>
          <button
            type="button"
            role="tab"
            className={`b__option ${activeTab === 'recurring' ? 'is-active' : ''}`}
            aria-selected={activeTab === 'recurring'}
            onClick={() => setActiveTab('recurring')}
          >
            {siteContent.pricing.toggle.recurring}
          </button>
        </div>

        {/* Panels */}
        <div className="s-pricing__panels">
          <div className="s-pricing__panel s-pricing__panel--single">
            <Calculator
              onStartConversation={(details) =>
                onOpenContact({
                  gradeLevel: details.gradeLevel,
                  contentScope: details.contentScope,
                  deliveryMode: details.deliveryMode,
                  storage: details.storage,
                  cost: details.cost,
                })
              }
            />
          </div>

          <div className="s-pricing__panel s-pricing__panel--recurring">
            <Recurring
              onSelectPlan={(name, price) =>
                onOpenContact({
                  plan: price === '0' ? `${name} (Free Access)` : `${name} (₹${price})`,
                })
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};
