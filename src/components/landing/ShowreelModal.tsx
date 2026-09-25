import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { siteContent } from '@/data/content';

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShowreelModal: React.FC<ShowreelModalProps> = ({ isOpen, onClose }) => {
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

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md transition-opacity duration-200 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close showreel"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video player */}
      <div
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.96)',
          transition: 'transform 0.22s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.2s ease-out',
        }}
        className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black"
      >
        <video
          className="w-full h-full object-cover"
          src={siteContent.work.showreel.src}
          poster={siteContent.work.showreel.poster}
          controls
          autoPlay
          playsInline
        />
      </div>
    </div>
  );
};
