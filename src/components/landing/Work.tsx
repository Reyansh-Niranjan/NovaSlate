import React from 'react';
import { Cpu, Layers, Settings, ShieldCheck, RefreshCw } from 'lucide-react';

interface WorkProps {
  onOpenShowreel?: () => void;
  onOpenContact?: () => void;
}

export const Work: React.FC<WorkProps> = ({ onOpenContact }) => {
  return (
    <section className="s-work" id="curriculum">
      <div className="u-container">
        <div className="w-full py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-8 items-stretch">
            {/* Left Column: Clean Distilled Overview */}
            <div className="bg-[var(--color-white)] border border-[var(--color-gray-lighter)] rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--color-primary)] mb-4 block">
                  NOVASLATE × ATLAS
                </span>
                <h2 className="t-h-xl font-heading text-[var(--color-heading)] tracking-tight leading-[0.95] mb-5">
                  An operating system.<br />
                  <span className="italic font-serif font-normal text-[var(--color-primary)]">A learning ecosystem.</span>
                </h2>
                <p className="t-t-md text-[var(--color-gray-dark)] leading-relaxed mb-4">
                  Atlas is a dedicated platform engineered to run offline educational tools beyond the browser. NovaSlate provides the organized Class 1–12 curriculum and reading environment.
                </p>
                <p className="t-t-sm text-[var(--color-gray-dark)] leading-relaxed">
                  Together, they deliver a self-contained learning computer that works reliably anywhere, with zero dependency on internet connectivity.
                </p>
              </div>

              <div className="pt-6 mt-8 border-t border-[var(--color-gray-lighter)] flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--color-heading)]">
                  Atlas OS · NovaSlate · Connected Ecosystem
                </p>
                <button
                  type="button"
                  className="btn-main btn-main--primary btn-main--black btn-main--sm"
                  onClick={onOpenContact}
                >
                  <span className="btn-main__outer">
                    <span className="btn-main__inner">
                      <span className="btn-main__text u-height-fix">Explore Platform</span>
                    </span>
                    <span className="btn-main__hover" aria-hidden="true">
                      <span className="btn-main__text u-height-fix" data-text="Explore Platform"></span>
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column: Flat Clean Architecture (No Nested Boxes) */}
            <div className="bg-[var(--color-white)] border border-[var(--color-gray-lighter)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div className="pb-3 mb-4 border-b border-[var(--color-gray-lighter)] flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-[var(--color-gray-dark)] uppercase tracking-wide">
                  System Architecture
                </span>
                <span className="text-[11px] font-mono text-[var(--color-primary)] font-semibold">
                  5 Subsystems
                </span>
              </div>

              <div className="divide-y divide-[var(--color-gray-lighter)]">
                <div className="py-3 flex items-start gap-3">
                  <Layers className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-[var(--color-heading)]">Home Launcher</h4>
                    <p className="text-xs text-[var(--color-gray-dark)] mt-0.5">Physical desktop and curriculum bookshelf for instant navigation.</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-3">
                  <Cpu className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-[var(--color-heading)]">Application Runtime</h4>
                    <p className="text-xs text-[var(--color-gray-dark)] mt-0.5">Sandboxed environment running the in-browser PDF reader and Study Hub.</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-3">
                  <Settings className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-[var(--color-heading)]">Display Pipeline</h4>
                    <p className="text-xs text-[var(--color-gray-dark)] mt-0.5">Zero-flicker e-paper waveforms and low-power contrast rendering.</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-[var(--color-heading)]">Recovery Engine</h4>
                    <p className="text-xs text-[var(--color-gray-dark)] mt-0.5">Dual-bank A/B firmware partitions with automatic failover rollback.</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-3">
                  <RefreshCw className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-[var(--color-heading)]">Offline Sync</h4>
                    <p className="text-xs text-[var(--color-gray-dark)] mt-0.5">Local MicroSD caching and zero-data peer update distribution.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
