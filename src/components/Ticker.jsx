import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Ticker({ backendStatus = 'checking' }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    // Check if clone already exists to prevent duplicates during React hot-reloads
    const existingClones = container.querySelectorAll('.ticker-clone');
    existingClones.forEach(el => el.remove());

    // Clone content for seamless looping
    const clone = content.cloneNode(true);
    clone.classList.add('ticker-clone');
    container.appendChild(clone);

    const width = content.offsetWidth;

    // Smooth continuous loop
    const tween = gsap.fromTo(
      [content, clone],
      { x: 0 },
      {
        x: -width,
        duration: 25, // Sleek, modern readable crawl speed
        ease: 'none',
        repeat: -1,
      }
    );

    return () => {
      tween.kill();
    };
  }, [backendStatus]);

  const getStatusText = () => {
    if (backendStatus === 'connected') return 'SYS_OK // BACKEND CONNECTED';
    if (backendStatus === 'offline' || backendStatus === 'error') return 'SYS_ERR // BACKEND OFFLINE';
    return 'SYS_PENDING // CONNECTING...';
  };

  const getStatusColor = () => {
    if (backendStatus === 'connected') return 'text-emerald-400';
    if (backendStatus === 'offline' || backendStatus === 'error') return 'text-rose-500';
    return 'text-accent-yellow';
  };

  const tickerItems = [
    { label: "RESOLUTION RATE", value: "99.98%" },
    { label: "AVG PICKUP SPEED", value: "0.8 SECONDS" },
    { label: "MINUTES SYNTHESIZED", value: "12,409,203 MIN" },
    { label: "ACTIVE AI RECEPTIONISTS", value: "4,321 ONLINE" },
    { label: "CONCURRENT PIPELINES", value: "1,842 / 2,000 max" },
    { label: "LATENCY BARRIER", value: "0.05 SECONDS" },
    { label: "PLATFORM STATE", value: "AUTONOMOUS VOICE RECEPTION desk IS DEPLOYED" }
  ];

  return (
    <div className="w-full overflow-hidden border-y border-white/10 bg-surface-card text-text-primary py-3 flex select-none font-mono-data uppercase text-[10px] sm:text-xs tracking-wider relative z-20 backdrop-blur-sm bg-opacity-80">
      <div ref={containerRef} className="flex whitespace-nowrap">
        <div ref={contentRef} className="flex items-center gap-12 px-6">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full bg-current ${getStatusColor()} animate-pulse`}></span>
            <span className={`font-bold ${getStatusColor()}`}>{getStatusText()}</span>
          </div>

          <span className="text-accent-yellow opacity-50">✦</span>

          {/* Ticker items */}
          {tickerItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-2">
                <span className="text-text-muted font-medium">{item.label}:</span>
                <span className="font-bold text-accent-yellow">{item.value}</span>
              </div>
              <span className="text-accent-yellow opacity-50">✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
