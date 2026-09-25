import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, initialData }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Student (Class 1–12)');
  const [inquiryType, setInquiryType] = useState('General Question / Feedback');
  const [gradeBand, setGradeBand] = useState('Full K-12 (Class 1–12)');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialData?.deliveryMode?.includes('Atlas') || initialData?.plan?.includes('Atlas')) {
      setInquiryType('Request Atlas ESP32 Hardware Kit');
      setMessage(
        `Hi Reyansh,\n\nI would like to request an Atlas ESP32 Offline Hardware Reader:\n- Target Classes: ${initialData.gradeLevel || 'Class 11–12'}\n- Content Scope: ${initialData.contentScope || 'Complete Exam Prep'}\n- Storage Required: ${initialData.storage || '32 GB MicroSD'}\n- Est. Cost: ${initialData.cost || '₹899 (Hardware cost)'}\n\nPlease share delivery details and MicroSD flashing instructions!`
      );
    } else if (initialData?.gradeLevel) {
      setGradeBand(initialData.gradeLevel);
      setMessage(
        `Hi Reyansh,\n\nI am inquiring about NovaSlate curriculum resources:\n- Grade Level: ${initialData.gradeLevel}\n- Content Scope: ${initialData.contentScope || 'All Textbooks & PYQs'}\n- Delivery Mode: ${initialData.deliveryMode || 'Free Web Digital Library'}\n\nLooking forward to using NovaSlate!`
      );
    } else if (initialData?.plan) {
      setMessage(
        `Hi Reyansh,\n\nI am interested in ${initialData.plan}. Could you provide more details on getting started?`
      );
    } else {
      setMessage(
        "Hi Reyansh,\n\nI would like to explore NovaSlate's digital textbook library and automated curriculum pipeline for our studies / school."
      );
    }
  }, [initialData]);

  const [rendered, setRendered] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const raf = requestAnimationFrame(() => {
        setVisible(true);
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setRendered(false);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!rendered) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Card */}
      <div
        style={{
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)',
          transition: 'transform 0.22s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.2s ease-out',
        }}
        className="relative z-10 w-full max-w-xl bg-[var(--color-white)] rounded-[2rem] p-8 md:p-10 shadow-2xl border border-[var(--color-gray-lighter)] max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[var(--color-gray)] hover:text-[var(--color-black)] hover:bg-[var(--color-white-darker)] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-12 text-center flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-[var(--color-accent)] mb-4" />
            <h3 className="t-h-sm text-[var(--color-heading)] font-medium">
              Inquiry Dispatched
            </h3>
            <p className="t-t-sm text-[var(--color-gray-dark)] mt-2 max-w-md leading-relaxed">
              Thank you, {name}. Your inquiry regarding <strong>{inquiryType}</strong> has been logged. Reyansh Niranjan will review your request and reach out to {email} shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 px-6 py-2.5 rounded-full bg-[var(--color-black)] text-white text-xs font-mono uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]"></span>
              <span className="text-xs uppercase tracking-widest font-mono text-[var(--color-secondary)]">Platform Inquiries</span>
            </div>
            <h3 className="t-h-sm text-[var(--color-heading)] font-medium mb-1">
              Connect with NovaSlate
            </h3>
            <p className="t-t-sm text-[var(--color-gray-dark)] mb-6 text-sm">
              Reach out regarding digital textbook access, syllabus scraping feedback, or the Atlas ESP32 offline reader.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-dark)] text-sm focus:outline-none focus:border-[var(--color-black)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5">
                    Your Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-dark)] text-sm focus:outline-none focus:border-[var(--color-black)] transition-colors"
                  >
                    <option value="Student (Class 1–12)">Student (Class 1–12)</option>
                    <option value="Teacher / Tutoring Educator">Teacher / Tutoring Educator</option>
                    <option value="School Principal / Administrator">School Principal / Admin</option>
                    <option value="Hardware / Embedded Developer">Hardware / Embedded Developer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5">
                    Inquiry Type
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-dark)] text-sm focus:outline-none focus:border-[var(--color-black)] transition-colors"
                  >
                    <option value="General Question / Feedback">General Question / Feedback</option>
                    <option value="Request Atlas ESP32 Hardware Kit">Request Atlas ESP32 Hardware Kit</option>
                    <option value="Digital Library & Study Hub Access">Digital Library & Study Hub</option>
                    <option value="Curriculum / Scraper Request">Curriculum / Scraper Request</option>
                    <option value="Rural Classroom Deployment">Rural Classroom Deployment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5">
                    Target Grade Band
                  </label>
                  <select
                    value={gradeBand}
                    onChange={(e) => setGradeBand(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-dark)] text-sm focus:outline-none focus:border-[var(--color-black)] transition-colors"
                  >
                    <option value="Full K-12 (Class 1–12)">Full K-12 (Class 1–12)</option>
                    <option value="Class 11–12 (Senior Secondary)">Class 11–12 (Senior Secondary)</option>
                    <option value="Class 9–10 (Secondary)">Class 9–10 (Secondary)</option>
                    <option value="Class 6–8 (Middle School)">Class 6–8 (Middle School)</option>
                    <option value="Class 1–5 (Primary)">Class 1–5 (Primary)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-dark)] text-sm focus:outline-none focus:border-[var(--color-black)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-gray-dark)] mb-1.5">
                  Message / Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-gray-lighter)] bg-[var(--color-white-dark)] text-sm focus:outline-none focus:border-[var(--color-black)] transition-colors resize-none font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-main btn-main--primary btn-main--black btn-main--md w-full"
                >
                  <span className="btn-main__outer">
                    <span className="btn-main__inner">
                      <span className="btn-main__text u-height-fix">Send message to Reyansh</span>
                    </span>
                    <span className="btn-main__hover" aria-hidden="true">
                      <span className="btn-main__text" data-text="Send message to Reyansh"></span>
                    </span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
