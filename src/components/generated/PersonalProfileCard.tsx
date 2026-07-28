import React, { useState, useEffect } from 'react';
import arrowRight from '../../assets/arrow-right.svg';
import arrowLeft from '../../assets/arrow-left.svg';
import arrowDown from '../../assets/arrow-down.svg';
import profileImg from '../../assets/profile.png';

const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  onHoverChange?: (hovered: boolean) => void;
  isFocused?: boolean;
  isMobile?: boolean;
}> = ({ children, style, onClick, onHoverChange, isFocused, isMobile }) => (
  <div
    onClick={onClick}
    className={`dashed-card${onClick ? ' dashed-card--clickable' : ''}${isFocused ? ' is-focused' : ''}`}
    style={{
      backgroundColor: 'rgba(31,31,31,1)',
      boxShadow: '0px 4px 17.5px rgba(0,0,0,0.8)',
      borderRadius: '8px',
      boxSizing: 'border-box',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: onClick ? 'pointer' : 'default',
      position: 'absolute',
      pointerEvents: (isMobile && !isFocused) ? 'none' : 'auto',
      ...style,
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.dataset.hovered = '1';          // mark as currently hovered
      el.style.zIndex = '100';
      el.style.transform = 'translateY(-4px) scale(1.01)';
      el.style.boxShadow = '0px 20px 50px rgba(0,0,0,0.95)';
      onHoverChange?.(true);
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLDivElement;
      delete el.dataset.hovered;         // unmark before the timer
      el.style.transform = 'translateY(0) scale(1)';
      el.style.boxShadow = '0px 4px 17.5px rgba(0,0,0,0.8)';
      onHoverChange?.(false);
      // Only clear zIndex if the card hasn't been re-entered by the time
      // the overlay finishes fading (350ms). Fixes the A→B→A rapid bug.
      setTimeout(() => { if (!el.dataset.hovered) el.style.zIndex = ''; }, 350);
    }}
  >
    {children}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: 'rgba(74,74,74,1)', fontSize: 20, fontFamily: '"Outfit",sans-serif', fontWeight: 600, display: 'block', marginBottom: 5 }}>
    {children}
  </span>
);

export const PersonalProfileCard = () => {
  const [time, setTime] = useState(new Date());
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState(1);
  const [cardHovered, setCardHovered] = useState(false);
  // Debounce the overlay fade-out so card→card transitions don't cause a flicker
  const hoverOffTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCardHover = React.useCallback((hovered: boolean) => {
    if (hovered) {
      if (hoverOffTimer.current) clearTimeout(hoverOffTimer.current);
      setCardHovered(true);
    } else {
      hoverOffTimer.current = setTimeout(() => setCardHovered(false), 50);
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fit the 1440×1024 canvas into the visible viewport, track viewport size for overlay
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

  // Mobile portrait: wheel + touch gesture-driven canvas panning (no page scroll)
  const isMobile = viewportW < 768 && viewportW < viewportH;
  const [mobileSection, setMobileSection] = useState(0);
  // Each keyframe defines the canvas coordinate to center on (cx, cy) and the zoom level.
  // You can adjust these values visually to perfect the framing of each card.
  const mobileSections = [
    { id: 'hero', cx: 720, cy: 512, zoom: 1.0 },
    { id: 'about', cx: 250, cy: 376, zoom: 1.1 },
    { id: 'tagline', cx: 355, cy: 177, zoom: 1.2 },
    { id: 'skills', cx: 271, cy: 727, zoom: 1.15 },
    { id: 'project1', cx: 1114, cy: 207, zoom: 1.2 },
    { id: 'project2', cx: 1176, cy: 337, zoom: 1.2 },
    { id: 'project3', cx: 1120, cy: 487, zoom: 1.2 },
    { id: 'achievement', cx: 526, cy: 894, zoom: 1.2 },
    { id: 'education', cx: 1180, cy: 723, zoom: 1.15 },
  ];
  const gestureInProgress = React.useRef(false);

  useEffect(() => {
    if (!isMobile) return;

    const changeSection = (dir: 1 | -1) => {
      if (gestureInProgress.current) return;
      gestureInProgress.current = true;
      setMobileSection(s => Math.max(0, Math.min(mobileSections.length - 1, s + dir)));
      setTimeout(() => { gestureInProgress.current = false; }, 600);
    };

    // Wheel (mouse / trackpad / desktop testing)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      changeSection(e.deltaY > 0 ? 1 : -1);
    };

    // Touch swipe
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
  }, [isMobile, mobileSections.length]);

  const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleCopy = () => {
    navigator.clipboard.writeText('thakshilabandara@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Solid-line grid background — 2px lines, lighter colour
  const gridBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(44,44,44,1)' stroke-width='2'/%3E%3C/svg%3E")`;

  const activeSection = mobileSections[mobileSection];
  const activeScale = (viewportH / 1024) * activeSection.zoom;
  const mobileTx = viewportW / 2 - activeSection.cx * activeScale;
  const mobileTy = viewportH / 2 - activeSection.cy * activeScale;
  const isOverlayActive = cardHovered || (isMobile && activeSection.id !== 'hero');

  return (
    <div style={isMobile ? {
      position: 'fixed', inset: 0, backgroundColor: 'rgba(24,24,24,1)', overflow: 'hidden', touchAction: 'none',
    } : {
      width: '100vw', height: '100vh', backgroundColor: 'rgba(24,24,24,1)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Level 2 */}
      <div style={isMobile ? {
        position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'none',
      } : {
        position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1,
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: gridBg, backgroundSize: '40px 40px', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)', WebkitMaskComposite: 'source-in', maskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)', maskComposite: 'intersect' } as React.CSSProperties} />
        {/* Level 3 */}
        <div style={isMobile ? {
          position: 'absolute', transformOrigin: '0 0',
          transform: `translate(${mobileTx}px, ${mobileTy}px) scale(${activeScale})`,
          transition: 'transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 1,
        } : {
          flexShrink: 0, transform: `scale(${scale})`, transformOrigin: 'center center',
        }}>
          {/* Level 4: 1440×1024 canvas */}
          <div style={{ width: 1440, height: 1024, position: 'relative' }}>

            {(() => { 
              return <div style={{ 
                position: 'absolute', left: -4000, top: -4000, 
                width: 10000, height: 10000, zIndex: 50, pointerEvents: 'none', 
                backgroundColor: isOverlayActive ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0)', 
                backdropFilter: isOverlayActive ? 'blur(3px)' : 'blur(0px)', 
                WebkitBackdropFilter: isOverlayActive ? 'blur(3px)' : 'blur(0px)', 
                transition: 'background-color 0.35s ease, backdrop-filter 0.35s ease, -webkit-backdrop-filter 0.35s ease' 
              } as React.CSSProperties} />; 
            })()}

          {/* ── Header ── */}
          <header style={{ position: 'absolute', left: 77, top: 59, width: 1286, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, backgroundColor: '#616161', borderRadius: '50%' }} />
              <span style={{ color: 'rgba(97,97,97,1)', fontSize: 18, fontFamily: '"Outfit",sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>Online &nbsp;|&nbsp; Sri Lanka &nbsp;|&nbsp; {fmt(time)}</span>
            </div>
            <span style={{ color: 'rgba(97,97,97,1)', fontSize: 18, fontFamily: '"Outfit",sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>Open to Opportunities</span>
          </header>

          <h1 style={{ width: 260, color: 'rgba(217,217,217,1)', fontSize: 64, fontFamily: '"Galada",cursive', fontWeight: 400, lineHeight: '68px', textAlign: 'center', position: 'absolute', left: 590, top: 275, margin: 0 }}>Thakshila<br />Bandara</h1>
          <img src={profileImg} alt="Thakshila Bandara" style={{ width: 278, height: 278, position: 'absolute', left: 581, top: 400, objectFit: 'cover', borderRadius: 4 }} />
          <p style={{ width: 310, color: 'rgba(180,180,180,1)', fontSize: 22, fontFamily: '"Outfit",sans-serif', fontWeight: 500, lineHeight: '29px', textAlign: 'center', position: 'absolute', left: 565, top: 680, whiteSpace: 'pre-line', margin: 0 }}>{'Embedded Systems Engineer\n& IoT Developer\nFounder @ Nodamic'}</p>

          <Card isMobile={isMobile} isFocused={isMobile && activeSection.id === 'tagline'} onHoverChange={onCardHover} style={{ width: 367, height: 118, left: 171, top: 118, padding: '18px 21px', zIndex: 10 }}>
            <p className="sweep-text" style={{ fontSize: 26, fontFamily: '"Libre Baskerville",serif', fontStyle: 'italic', fontWeight: 700, lineHeight: '40px', margin: 0 }}>I enjoy turning ideas into practical products</p>
          </Card>

          <Card isMobile={isMobile} isFocused={isMobile && activeSection.id === 'about'} onHoverChange={onCardHover} style={{ width: 358, height: 328, left: 71, top: 212, padding: '22px 21px' }}>
            <Label>About</Label>
            <p className="sweep-text" style={{ fontSize: 24, fontFamily: '"Libre Baskerville",serif', fontStyle: 'italic', fontWeight: 700, lineHeight: '40px', margin: 0 }}>I design and build embedded systems and IoT solutions that connect hardware, software and real world impact.</p>
          </Card>

          <Card isMobile={isMobile} isFocused={isMobile && activeSection.id === 'skills'} onHoverChange={onCardHover} style={{ width: 320, height: 338, left: 111, top: 558, padding: '18px 21px' }}>
            <Label>Skills</Label>
            <div className="card-skills">
              {[{ label: 'Embedded Systems', value: 'C/C++, Arduino, ESP32' }, { label: 'Protocols', value: 'CAN, MQTT, Wi-Fi, Bluetooth' }, { label: 'Tools and Platforms', value: 'PlatformIO, VS Code, Git' }, { label: 'Cloud and IoT', value: 'Firebase, Supabase' }].map((s, i) => (
                <div key={i} style={{ marginTop: i === 0 ? 4 : 13 }}>
                  <span className="sweep-text" style={{ color: 'rgba(111,111,111,1)', fontSize: 15, fontFamily: '"Libre Baskerville",serif', fontStyle: 'italic', fontWeight: 700, display: 'block' }}>{s.label}</span>
                  <span className="sweep-text-bright" style={{ color: 'rgba(164,164,164,1)', fontSize: 19, fontFamily: '"Outfit",sans-serif', fontWeight: 600, display: 'block' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card isMobile={isMobile} isFocused={isMobile && activeSection.id === 'project1'} onHoverChange={onCardHover} style={{ width: 389, height: 148, left: 919, top: 133, padding: '17px 21px' }}>
            <Label>Project 1</Label>
            <div className="card-project">
              <span className="sweep-text-bright" style={{ color: 'rgba(164,164,164,1)', fontSize: 21, fontFamily: '"Libre Baskerville",serif', fontStyle: 'italic', fontWeight: 700, lineHeight: '32px', display: 'block' }}>Node 1 - Smart Power Socket</span>
              <span className="sweep-text" style={{ color: 'rgba(111,111,111,1)', fontSize: 17, fontFamily: '"Outfit",sans-serif', fontWeight: 500, lineHeight: 1.3, display: 'block' }}>IoT Smart Socket with real-time monitoring, scheduling and alerts.</span>
            </div>
          </Card>

          <Card isMobile={isMobile} isFocused={isMobile && activeSection.id === 'project2'} onHoverChange={onCardHover} style={{ width: 389, height: 148, left: 981, top: 263, padding: '17px 21px' }}>
            <Label>Project 2</Label>
            <div className="card-project">
              <span className="sweep-text-bright" style={{ color: 'rgba(164,164,164,1)', fontSize: 21, fontFamily: '"Libre Baskerville",serif', fontStyle: 'italic', fontWeight: 700, lineHeight: '32px', display: 'block' }}>Drivora - ADAS</span>
              <span className="sweep-text" style={{ color: 'rgba(111,111,111,1)', fontSize: 17, fontFamily: '"Outfit",sans-serif', fontWeight: 500, lineHeight: 1.3, display: 'block' }}>Advanced Driver Assistance System for old vehicles.</span>
            </div>
          </Card>

          <Card isMobile={isMobile} isFocused={isMobile && activeSection.id === 'project3'} onHoverChange={onCardHover} style={{ width: 402, height: 148, left: 919, top: 413, padding: '17px 21px' }}>
            <Label>Project 3</Label>
            <div className="card-project">
              <span className="sweep-text-bright" style={{ color: 'rgba(164,164,164,1)', fontSize: 21, fontFamily: '"Libre Baskerville",serif', fontStyle: 'italic', fontWeight: 700, lineHeight: '32px', display: 'block' }}>MPSoC JPEG Encoder Pipeline</span>
              <span className="sweep-text" style={{ color: 'rgba(111,111,111,1)', fontSize: 17, fontFamily: '"Outfit",sans-serif', fontWeight: 500, lineHeight: 1.3, display: 'block' }}>Multi-processor JPEG encoder implemented on FPGA.</span>
            </div>
          </Card>

          <Card isMobile={isMobile} isFocused={isMobile && activeSection.id === 'education'} onHoverChange={onCardHover} style={{ width: 359, height: 286, left: 1000, top: 580, padding: '18px 21px' }}>
            <Label>Education</Label>
            <div className="card-education">
              <div style={{ marginBottom: 18 }}>
                <span className="sweep-text-bright" style={{ color: 'rgba(164,164,164,1)', fontSize: 21, fontFamily: '"Libre Baskerville",serif', fontStyle: 'italic', fontWeight: 700, lineHeight: '32px', display: 'block' }}>BSc (Hons) in Computer Engineering</span>
                <span className="sweep-text" style={{ color: 'rgba(111,111,111,1)', fontSize: 15, fontFamily: '"Outfit",sans-serif', fontWeight: 500, display: 'block' }}>University of Peradeniya (2023 - Present)</span>
                <span className="sweep-text" style={{ color: 'rgba(111,111,111,1)', fontSize: 15, fontFamily: '"Outfit",sans-serif', fontWeight: 500, display: 'block' }}>GPA - 3.88/4.00</span>
              </div>
              <div>
                <span className="sweep-text-bright" style={{ color: 'rgba(164,164,164,1)', fontSize: 21, fontFamily: '"Libre Baskerville",serif', fontStyle: 'italic', fontWeight: 700, lineHeight: '32px', display: 'block' }}>G.C.E. Advanced Level</span>
                <span className="sweep-text" style={{ color: 'rgba(111,111,111,1)', fontSize: 15, fontFamily: '"Outfit",sans-serif', fontWeight: 500, display: 'block' }}>Physical Science Stream (3As)</span>
                <span className="sweep-text" style={{ color: 'rgba(111,111,111,1)', fontSize: 15, fontFamily: '"Outfit",sans-serif', fontWeight: 500, display: 'block' }}>Z-Score - 2.0124</span>
              </div>
            </div>
          </Card>

          <Card isMobile={isMobile} isFocused={isMobile && activeSection.id === 'achievement'} onHoverChange={onCardHover} style={{ width: 389, height: 148, left: 331, top: 820, padding: '18px 21px' }}>
            <Label>Achievement</Label>
            <div className="card-achievement">
              <span className="sweep-text-bright" style={{ color: 'rgba(164,164,164,1)', fontSize: 22, fontFamily: '"Libre Baskerville",serif', fontStyle: 'italic', fontWeight: 700, display: 'block' }}>Champions - Game Fest 2026</span>
              <span className="sweep-text" style={{ color: 'rgba(111,111,111,1)', fontSize: 17, fontFamily: '"Outfit",sans-serif', fontWeight: 500, display: 'block' }}>8-Hour Game Dev Hackathon</span>
              <span className="sweep-text" style={{ color: 'rgba(111,111,111,1)', fontSize: 17, fontFamily: '"Outfit",sans-serif', fontWeight: 500, display: 'block' }}>Organized by SLIIT Kandy Uni</span>
            </div>
          </Card>

          <img src={arrowRight} alt="" style={{ position: 'absolute', width: 82, left: 790, top: 172 }} />
          <img src={arrowLeft} alt="" style={{ position: 'absolute', width: 85, left: 488, top: 422 }} />
          <img src={arrowDown} alt="" style={{ position: 'absolute', width: 72, left: 786, top: 782 }} />

          <div style={{ position: 'absolute', left: 580, top: 912, width: 800, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 22 }}>
            <a href="https://github.com/thakshilabandara" target="_blank" rel="noreferrer" title="GitHub" style={{ color: 'rgba(97,97,97,1)', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(180,180,180,1)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(97,97,97,1)')}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.625-5.48 5.92.43.37.814 1.102.814 2.222 0 1.606-.015 2.896-.015 3.286 0 .32.216.694.825.577C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" /></svg>
            </a>
            <a href="https://linkedin.com/in/thakshilabandara" target="_blank" rel="noreferrer" title="LinkedIn" style={{ color: 'rgba(97,97,97,1)', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(180,180,180,1)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(97,97,97,1)')}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
            <a href="https://facebook.com/thakshilabandara" target="_blank" rel="noreferrer" title="Facebook" style={{ color: 'rgba(97,97,97,1)', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(180,180,180,1)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(97,97,97,1)')}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" /></svg>
            </a>
            <a href="https://instagram.com/thakshilabandara" target="_blank" rel="noreferrer" title="Instagram" style={{ color: 'rgba(97,97,97,1)', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(180,180,180,1)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(97,97,97,1)')}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
            </a>
            <button onClick={handleCopy} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(97,97,97,1)', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(180,180,180,1)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(97,97,97,1)')}>
              <span style={{ fontSize: 22, fontFamily: '"Outfit",sans-serif', fontWeight: 500, color: 'inherit' }}>{copied ? 'Email Copied!' : 'Connect via Email'}</span>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </button>
          </div>

          </div>{/* /canvas-1440 */}
        </div>{/* /level-3 */}
      </div>{/* /level-2 */}
    </div>
  );
};