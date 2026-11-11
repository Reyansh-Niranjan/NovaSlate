import React from 'react';
import { Cpu, Layers, Settings, ShieldCheck, RefreshCw } from 'lucide-react';

interface WorkProps {
  onOpenShowreel?: () => void;
  onOpenContact?: () => void;
}

export const Work: React.FC<WorkProps> = () => {
  return (
    <section className="s-work" id="curriculum">
      <div className="u-container">
        <div className="w-full py-10">
          <div className="flex flex-col gap-8 w-full">
            {/* Top Monolithic Masthead Card - Original Grand Typography Restored */}
                <div className="py-6 sm:py-8 border-t border-[var(--color-gray-lighter)] transition-all duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-8">
                      <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#1883B1] mb-4 px-2.5 py-1 rounded-md bg-[#1883B1]/8 border border-[#1883B1]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1883B1]" />
                        <span>Atlas Hardware Edition · Offline Reader</span>
                      </div>
                      <h2 className="t-h-xl font-heading text-[var(--color-heading)] tracking-tight leading-[1.04] sm:leading-[1.0] mb-5">
                        No signal required.<br />
                        <span className="font-heading font-normal text-[#1883B1]">Every textbook on your desk.</span>
                      </h2>
                      <p className="t-t-md text-[var(--color-gray-dark)] leading-relaxed max-w-2xl font-sans">
                        Internet in India can be slow or drop right before exam season. Atlas is a dedicated offline reader that keeps your entire NCERT library on an SD card, so your revision never stops.
                      </p>
                    </div>

                    <div className="lg:col-span-4 flex flex-col justify-between gap-5 p-6 rounded-2xl bg-white border border-[var(--color-gray-lighter)] shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-full">
                      <div className="space-y-2">
                        <h3 className="font-heading font-bold text-[var(--color-heading)] text-lg sm:text-xl tracking-tight leading-snug">
                          Your entire school bag in one dedicated reader.
                        </h3>
                        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-sans">
                          Check out the Atlas open-source repository on GitHub to explore the hardware build, firmware code, and 3D-printable cases.
                        </p>
                      </div>
                      <a
                        href="https://github.com/Reyansh-Niranjan/Atlas"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-main btn-main--primary btn-main--black btn-main--md w-full justify-center inline-flex items-center"
                      >
                        <span className="btn-main__outer">
                          <span className="btn-main__inner">
                            <span className="btn-main__text">Explore on GitHub</span>
                          </span>
                          <span className="btn-main__hover" aria-hidden="true">
                            <span className="btn-main__text" data-text="Explore on GitHub"></span>
                          </span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Eye-Attracting & Highly Readable Student Benefits Strip */}
                <div className="py-6 sm:py-8 border-t border-[var(--color-gray-lighter)]">
                  <div className="flex items-center justify-between pb-5 mb-6 border-b border-[var(--color-gray-lighter)]">
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-[var(--color-heading)] tracking-tight">
                      How Atlas Makes Studying Easier
                    </h3>
                    <span className="font-mono text-xs font-semibold text-[#1883B1] tracking-wider hidden sm:inline-block">
                      100% Offline Hardware Architecture
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Card 1 */}
                    <div className="group relative p-5 rounded-2xl bg-white border border-[var(--color-gray-lighter)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(24,131,177,0.08)] hover:border-[#1883B1]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-9 h-9 rounded-xl bg-[#1883B1]/10 border border-[#1883B1]/20 flex items-center justify-center text-[#1883B1] group-hover:bg-[#1883B1] group-hover:text-white transition-all duration-300">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-[#1883B1] bg-[#1883B1]/8 px-2.5 py-0.5 rounded-full border border-[#1883B1]/15">
                            01 // SYLLABUS
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-base text-[var(--color-heading)] tracking-tight mb-2 group-hover:text-[#1883B1] transition-colors duration-200">
                          Complete NCERT Library
                        </h4>
                        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed font-sans">
                          Class 1 to 12 textbooks, exemplar problems, and syllabus guides ready to open instantly.
                        </p>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="group relative p-5 rounded-2xl bg-white border border-[var(--color-gray-lighter)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(24,131,177,0.08)] hover:border-[#1883B1]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-9 h-9 rounded-xl bg-[#1883B1]/10 border border-[#1883B1]/20 flex items-center justify-center text-[#1883B1] group-hover:bg-[#1883B1] group-hover:text-white transition-all duration-300">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-[#1883B1] bg-[#1883B1]/8 px-2.5 py-0.5 rounded-full border border-[#1883B1]/15">
                            02 // FOCUS
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-base text-[var(--color-heading)] tracking-tight mb-2 group-hover:text-[#1883B1] transition-colors duration-200">
                          Zero Distractions
                        </h4>
                        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed font-sans">
                          No social media alerts, ads, or browser tabs. You open the book and start reading.
                        </p>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="group relative p-5 rounded-2xl bg-white border border-[var(--color-gray-lighter)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(24,131,177,0.08)] hover:border-[#1883B1]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-9 h-9 rounded-xl bg-[#1883B1]/10 border border-[#1883B1]/20 flex items-center justify-center text-[#1883B1] group-hover:bg-[#1883B1] group-hover:text-white transition-all duration-300">
                            <Settings className="w-4 h-4" />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-[#1883B1] bg-[#1883B1]/8 px-2.5 py-0.5 rounded-full border border-[#1883B1]/15">
                            03 // DISPLAY
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-base text-[var(--color-heading)] tracking-tight mb-2 group-hover:text-[#1883B1] transition-colors duration-200">
                          Easy on the Eyes
                        </h4>
                        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed font-sans">
                          Paper-like screen readable under bright sunlight without harsh blue-light strain.
                        </p>
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div className="group relative p-5 rounded-2xl bg-white border border-[var(--color-gray-lighter)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(24,131,177,0.08)] hover:border-[#1883B1]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-9 h-9 rounded-xl bg-[#1883B1]/10 border border-[#1883B1]/20 flex items-center justify-center text-[#1883B1] group-hover:bg-[#1883B1] group-hover:text-white transition-all duration-300">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-[#1883B1] bg-[#1883B1]/8 px-2.5 py-0.5 rounded-full border border-[#1883B1]/15">
                            04 // BATTERY
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-base text-[var(--color-heading)] tracking-tight mb-2 group-hover:text-[#1883B1] transition-colors duration-200">
                          Days of Battery Life
                        </h4>
                        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed font-sans">
                          Charges with any standard phone charger and runs for days on a single charge.
                        </p>
                      </div>
                    </div>

                    {/* Card 5 */}
                    <div className="group relative p-5 rounded-2xl bg-white border border-[var(--color-gray-lighter)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(24,131,177,0.08)] hover:border-[#1883B1]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-9 h-9 rounded-xl bg-[#1883B1]/10 border border-[#1883B1]/20 flex items-center justify-center text-[#1883B1] group-hover:bg-[#1883B1] group-hover:text-white transition-all duration-300">
                            <RefreshCw className="w-4 h-4" />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-[#1883B1] bg-[#1883B1]/8 px-2.5 py-0.5 rounded-full border border-[#1883B1]/15">
                            05 // UPDATES
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-base text-[var(--color-heading)] tracking-tight mb-2 group-hover:text-[#1883B1] transition-colors duration-200">
                          Simple Offline Updates
                        </h4>
                        <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed font-sans">
                          Insert an SD card or plug into a laptop to load new revision notes and question papers.
                        </p>
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
