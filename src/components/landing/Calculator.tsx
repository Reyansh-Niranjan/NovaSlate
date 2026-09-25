import React, { useState, useId } from 'react';

interface CalculatorProps {
  onStartConversation: (details: {
    gradeLevel: string;
    contentScope: string;
    deliveryMode: string;
    storage: string;
    cost: string;
  }) => void;
}

const STORAGE_MAP: Record<string, Record<string, number>> = {
  primary: { textbooks: 1.2, notes: 1.8, complete: 2.6 },
  middle: { textbooks: 2.4, notes: 3.8, complete: 5.2 },
  secondary: { textbooks: 3.8, notes: 6.2, complete: 9.5 },
  senior: { textbooks: 5.5, notes: 9.8, complete: 16.0 },
  all: { textbooks: 12.8, notes: 21.5, complete: 32.0 },
};

function calculateEstimate(grade: string, scope: string, mode: string) {
  const baseGB = STORAGE_MAP[grade]?.[scope];
  if (!baseGB || !mode) return null;

  const storageStr = `${baseGB.toFixed(1)} GB`;
  let costStr = '100% Free';
  let speedStr = 'Instant Stream';

  if (mode === 'web') {
    costStr = 'Free (Open Web)';
    speedStr = 'Zero-Egress Stream';
  } else if (mode === 'download') {
    costStr = 'Free (Direct DL)';
    speedStr = 'Batch Download';
  } else if (mode === 'atlas') {
    costStr = '₹899 (Hardware Kit)';
    speedStr = 'Zero Internet (MicroSD)';
  }

  return {
    storage: storageStr,
    cost: costStr,
    speed: speedStr,
  };
}

export const Calculator: React.FC<CalculatorProps> = ({ onStartConversation }) => {
  const [gradeLevel, setGradeLevel] = useState('');
  const [contentScope, setContentScope] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('');

  const gradeId = useId();
  const scopeId = useId();
  const modeId = useId();

  const estimate = calculateEstimate(gradeLevel, contentScope, deliveryMode);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGradeLevel(e.target.value);
    setContentScope('');
    setDeliveryMode('');
  };

  const handleScopeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setContentScope(e.target.value);
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeliveryMode(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimate) return;
    onStartConversation({
      gradeLevel,
      contentScope,
      deliveryMode,
      storage: estimate.storage,
      cost: estimate.cost,
    });
  };

  return (
    <div className="b-calculator">
      <div className="b__top u-white-box js-top">
        <h3 className="b__title t-h-sm">Resource & Offline Estimator</h3>
        <div className="b__text t-t-2xs">
          Calculate textbook archive footprint, Study Hub resources, and offline Atlas hardware requirements.
        </div>

        <form className="b__form" onSubmit={handleSubmit}>
          {/* Step 1: Grade Level */}
          <div className="b-form-step">
            <div className="b__header t-l-sm">
              <div className="b__index">1</div>
              <div className="b__line"></div>
              <div className="b__name">Target class / grade band</div>
            </div>
            <div className="b__fields">
              <label className="b-select" htmlFor={gradeId}>
                <span className="u-sr-only">Select target class</span>
                <div className="b-select__wrapper">
                  <select
                    id={gradeId}
                    className="b-select__field"
                    value={gradeLevel}
                    onChange={handleGradeChange}
                  >
                    <option value="">Select target class</option>
                    <option value="primary">Primary School (Class 1 to 5 — Foundational)</option>
                    <option value="middle">Middle School (Class 6 to 8 — Science & Social)</option>
                    <option value="secondary">Secondary Board Classes (Class 9 & 10)</option>
                    <option value="senior">Senior Secondary (Class 11 & 12 — STEM & Commerce)</option>
                    <option value="all">Complete K-12 Digital Archive (Class 1 to 12)</option>
                  </select>
                  <span className="b-select__arrow" aria-hidden="true">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                      <path d="M0 0.5L5 5.5L10 0.5H0Z" />
                    </svg>
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Step 2: Content Scope */}
          <div className={`b-form-step ${!gradeLevel ? 'is-inactive' : ''}`}>
            <div className="b__header t-l-sm">
              <div className="b__index">2</div>
              <div className="b__line"></div>
              <div className="b__name">Content & Study Hub selection</div>
            </div>
            <div className="b__fields">
              <label className="b-select" htmlFor={scopeId}>
                <span className="u-sr-only">Select content selection</span>
                <div className="b-select__wrapper">
                  <select
                    id={scopeId}
                    className="b-select__field"
                    disabled={!gradeLevel}
                    value={contentScope}
                    onChange={handleScopeChange}
                  >
                    <option value="">Select content selection</option>
                    <option value="textbooks">Official Textbooks Only (High-Density PDFs)</option>
                    <option value="notes">Textbooks + Chapter Mindmaps & Revision Notes</option>
                    <option value="complete">Complete Suite (Textbooks + Mindmaps + Board Exam PYQs)</option>
                  </select>
                  <span className="b-select__arrow" aria-hidden="true">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                      <path d="M0 0.5L5 5.5L10 0.5H0Z" />
                    </svg>
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Step 3: Access Mode */}
          <div className={`b-form-step ${!contentScope ? 'is-inactive' : ''}`}>
            <div className="b__header t-l-sm">
              <div className="b__index">3</div>
              <div className="b__line"></div>
              <div className="b__name">Delivery & access mode</div>
            </div>
            <div className="b__fields">
              <label className="b-select" htmlFor={modeId}>
                <span className="u-sr-only">Select delivery mode</span>
                <div className="b-select__wrapper">
                  <select
                    id={modeId}
                    className="b-select__field"
                    disabled={!contentScope}
                    value={deliveryMode}
                    onChange={handleModeChange}
                  >
                    <option value="">Select delivery mode</option>
                    <option value="web">Web Digital Library (Instant In-Browser Viewer — Free)</option>
                    <option value="download">Offline PDF Download (Direct High-Speed Archive — Free)</option>
                    <option value="atlas">Atlas ESP32 Hardware Kit (Zero-Internet MicroSD FAT32 Reader)</option>
                  </select>
                  <span className="b-select__arrow" aria-hidden="true">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                      <path d="M0 0.5L5 5.5L10 0.5H0Z" />
                    </svg>
                  </span>
                </div>
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* Results or Hint */}
      {estimate ? (
        <div className="b__bottom">
          <div className="b__results">
            <div className="b__result u-white-box js-result">
              <div className="b__subtitle t-t-2xs">Estimated storage footprint</div>
              <div className="b__timeline t-pricing">
                <span className="b__num">{estimate.storage}</span>
              </div>
            </div>
            <div className="b__result u-white-box js-result">
              <div className="b__subtitle t-t-2xs">Platform access cost</div>
              <div className="b__estimation t-pricing">
                <span className="b__num">{estimate.cost}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-main btn-main--primary btn-main--black btn-main--md b__btn"
            onClick={handleSubmit}
          >
            <span className="btn-main__outer">
              <span className="btn-main__inner">
                <span className="btn-main__text u-height-fix">Access Educational Library</span>
              </span>
              <span className="btn-main__hover" aria-hidden="true">
                <span className="btn-main__text u-height-fix" data-text="Access Educational Library"></span>
              </span>
            </span>
          </button>
        </div>
      ) : (
        <div className="b__hint t-t-3xs">
          Select target grade band and delivery preferences to estimate storage footprint and access mode.
        </div>
      )}
    </div>
  );
};
