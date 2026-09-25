import React from 'react';
import { siteContent } from '@/data/content';

interface RecurringProps {
  onSelectPlan: (planName: string, price: string) => void;
}

export const Recurring: React.FC<RecurringProps> = ({ onSelectPlan }) => {
  const recurring = siteContent.pricing.recurring;
  const standard = recurring.services[0];
  const extended = recurring.services[1];

  return (
    <div className="b-recurring">
      {/* Top Banner Box */}
      <div className="b-recurring__top u-white-box js-top">
        <h3 className="b__title t-h-sm">{recurring.title}</h3>
        <div className="b__text t-t-2xs">{recurring.text}</div>
      </div>

      {/* Standard Plan Box */}
      <div className="u-white-box b-recurring__left js-left">
        <div className="b__name t-l-sm">{standard.name}</div>
        <div className="b__pricing">
          <span className="b__price t-pricing">₹{standard.price}</span>
          <span className="b__month t-t-md">{standard.period}</span>
        </div>
        <div className="b__text t-t-2xs">{standard.text}</div>
        <ul className="b__args t-t-3xs">
          {standard.args.map((arg, idx) => (
            <li key={idx} className="b__arg">{arg}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onSelectPlan(standard.name, standard.price)}
          className="btn-main btn-main--primary btn-main--black btn-main--md b__btn"
        >
          <span className="btn-main__outer">
            <span className="btn-main__inner">
              <span className="btn-main__text u-height-fix">Open Digital Library</span>
            </span>
            <span className="btn-main__hover" aria-hidden="true">
              <span className="btn-main__text u-height-fix" data-text="Open Digital Library"></span>
            </span>
          </span>
        </button>
      </div>

      {/* Extended Plan Box */}
      <div className="u-white-box b-recurring__right js-right">
        <div className="b__name t-l-sm">{extended.name}</div>
        <div className="b__pricing">
          <span className="b__price t-pricing">₹{extended.price}</span>
          <span className="b__month t-t-md">{extended.period}</span>
        </div>
        <div className="b__text t-t-2xs">{extended.text}</div>
        <ul className="b__args t-t-3xs">
          {extended.args.map((arg, idx) => (
            <li key={idx} className="b__arg">{arg}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onSelectPlan(extended.name, extended.price)}
          className="btn-main btn-main--primary btn-main--black btn-main--md b__btn"
        >
          <span className="btn-main__outer">
            <span className="btn-main__inner">
              <span className="btn-main__text u-height-fix">Request Atlas Hardware Kit</span>
            </span>
            <span className="btn-main__hover" aria-hidden="true">
              <span className="btn-main__text u-height-fix" data-text="Request Atlas Hardware Kit"></span>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};
