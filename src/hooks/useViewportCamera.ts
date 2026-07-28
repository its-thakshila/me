import { useState, useEffect, useRef } from 'react';

export const useViewportCamera = (mobileSectionsLength: number) => {
  const [scale, setScale] = useState(1);
  const [viewportW, setViewportW] = useState(() => window.innerWidth);
  const [viewportH, setViewportH] = useState(() => window.innerHeight);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setScale(Math.min(w / 1440, h / 1024));
      setViewportW(w);
      setViewportH(h);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const isMobile = viewportW < 768 && viewportW < viewportH;
  const [mobileSection, setMobileSection] = useState(0);
  const gestureInProgress = useRef(false);

  useEffect(() => {
    if (!isMobile) return;

    const changeSection = (dir: 1 | -1) => {
      if (gestureInProgress.current) return;
      gestureInProgress.current = true;
      setMobileSection(s => (s + dir + mobileSectionsLength) % mobileSectionsLength);
      setTimeout(() => { gestureInProgress.current = false; }, 600);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      changeSection(e.deltaY > 0 ? 1 : -1);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 40) changeSection(diff > 0 ? 1 : -1);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, mobileSectionsLength]);

  return { scale, viewportW, viewportH, isMobile, mobileSection };
};
