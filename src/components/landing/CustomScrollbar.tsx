import React, { useEffect, useState, useRef } from 'react';

interface CustomScrollbarProps {
  lenis?: any;
}

export const CustomScrollbar: React.FC<CustomScrollbarProps> = ({ lenis }) => {
  const [thumbHeight, setThumbHeight] = useState(60);
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startDragY = useRef(0);
  const startScrollTop = useRef(0);

  useEffect(() => {
    const updateScrollbar = () => {
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollY = window.scrollY;

      if (docHeight <= winHeight) {
        setThumbHeight(0);
        return;
      }

      const calculatedHeight = Math.max((winHeight / docHeight) * winHeight, 48);
      const maxScroll = docHeight - winHeight;
      const maxThumbTop = winHeight - calculatedHeight;
      const calculatedTop = (scrollY / maxScroll) * maxThumbTop;

      setThumbHeight(calculatedHeight);
      setThumbTop(calculatedTop);
    };

    window.addEventListener('scroll', updateScrollbar, { passive: true });
    window.addEventListener('resize', updateScrollbar);
    updateScrollbar();

    return () => {
      window.removeEventListener('scroll', updateScrollbar);
      window.removeEventListener('resize', updateScrollbar);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startDragY.current = e.clientY;
    startScrollTop.current = window.scrollY;
    document.documentElement.classList.add('is-scrollbar-dragging');

    const handleMouseMove = (ev: MouseEvent) => {
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const maxScroll = docHeight - winHeight;
      const maxThumbTop = winHeight - thumbHeight;

      const deltaY = ev.clientY - startDragY.current;
      const scrollRatio = deltaY / maxThumbTop;
      const targetScroll = Math.min(
        Math.max(startScrollTop.current + scrollRatio * maxScroll, 0),
        maxScroll
      );

      if (lenis) {
        lenis.scrollTo(targetScroll, { immediate: true });
      } else {
        window.scrollTo(0, targetScroll);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.documentElement.classList.remove('is-scrollbar-dragging');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (thumbHeight === 0) return null;

  return (
    <div className={`site-scrollbar ${isDragging ? 'is-dragging' : ''}`}>
      <div className="site-scrollbar__track" />
      <div
        className="site-scrollbar__thumb"
        onMouseDown={handleMouseDown}
        style={{
          height: `${thumbHeight}px`,
          transform: `translate3d(0, ${thumbTop}px, 0)`,
        }}
      />
    </div>
  );
};
