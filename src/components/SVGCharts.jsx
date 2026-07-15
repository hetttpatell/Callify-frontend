import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function SVGCharts({ data = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const chartContainerRef = useRef(null);

  const defaultData = [
    { date: 'JUL 09', calls: 142, cost: 9.94 },
    { date: 'JUL 10', calls: 185, cost: 12.95 },
    { date: 'JUL 11', calls: 95, cost: 6.65 },
    { date: 'JUL 12', calls: 64, cost: 4.48 },
    { date: 'JUL 13', calls: 215, cost: 15.05 },
    { date: 'JUL 14', calls: 289, cost: 20.23 },
    { date: 'JUL 15', calls: 342, cost: 23.94 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  const width = 600;
  const height = 180;
  const padding = 35;

  const maxVal = Math.max(...chartData.map(d => d.calls), 100) * 1.1;
  const minVal = 0;

  const getX = (index) => {
    return padding + (index * (width - padding * 2)) / (chartData.length - 1);
  };

  const getY = (value) => {
    return height - padding - ((value - minVal) * (height - padding * 2)) / (maxVal - minVal);
  };

  // Generate SVG path for line
  const points = chartData.map((d, i) => `${getX(i)},${getY(d.calls)}`).join(' ');
  const linePath = `M ${points}`;
  
  // Area path for gradient fill underneath
  const areaPath = `
    M ${getX(0)},${height - padding}
    L ${points}
    L ${getX(chartData.length - 1)},${height - padding}
    Z
  `;

  // Draw chart animation
  const pathRef = useRef(null);
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      gsap.fromTo(pathRef.current,
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 1.5, ease: 'power2.out' }
      );
    }
  }, [chartData]);

  const handleMouseMove = (e, d, i) => {
    const x = getX(i);
    const y = getY(d.calls);
    
    // Position tooltip relative to container
    setTooltipPos({
      x: x + 15,
      y: y - 55
    });
    setHoveredPoint({ ...d, index: i });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="w-full space-y-4" ref={chartContainerRef}>
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="text-xs font-mono-data uppercase text-text-muted tracking-wider">
          TELEPHONY LOAD INTERCEPT // 7 DAY RUN
        </h3>
        <div className="flex gap-4 text-[10px] font-mono-data uppercase text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-yellow"></span>
            TOTAL VOLUME: {chartData.reduce((acc, curr) => acc + curr.calls, 0)} CALLS
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            COST: ${chartData.reduce((acc, curr) => acc + curr.cost, 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="relative bg-black/30 border border-white/10 rounded-2xl p-4 overflow-visible h-[200px]">
        {/* Responsive Container */}
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD300" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FFD300" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const yVal = getY(ratio * maxVal);
            return (
              <line 
                key={idx}
                x1={padding}
                y1={yVal}
                x2={width - padding}
                y2={yVal}
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="1"
              />
            );
          })}

          {/* Area under the line */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Line Chart Path */}
          <path 
            ref={pathRef}
            d={linePath}
            fill="none"
            stroke="#FFD300"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive dots */}
          {chartData.map((d, i) => {
            const x = getX(i);
            const y = getY(d.calls);
            const isHovered = hoveredPoint?.index === i;

            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3.5}
                  className="fill-base-bg stroke-accent-yellow transition-all duration-150 cursor-pointer"
                  strokeWidth={isHovered ? 3.5 : 2}
                  onMouseEnter={(e) => handleMouseMove(e, d, i)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Invisible hover area target */}
                <circle
                  cx={x}
                  cy={y}
                  r={20}
                  className="fill-transparent cursor-pointer"
                  onMouseEnter={(e) => handleMouseMove(e, d, i)}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {chartData.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - 8}
              textAnchor="middle"
              className="fill-text-muted/50 font-mono-data text-[9px] uppercase tracking-wider"
            >
              {d.date}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="absolute z-30 pointer-events-none bg-surface-card border border-accent-yellow/40 rounded-xl px-3 py-2 shadow-xl font-mono-data text-[10px] leading-relaxed animate-fade-in transition-all duration-100"
            style={{ 
              left: `${(tooltipPos.x / width) * 100}%`, 
              top: `${(tooltipPos.y / height) * 100}%` 
            }}
          >
            <p className="text-accent-yellow font-bold">{hoveredPoint.date}</p>
            <p className="text-text-primary"><span className="text-text-muted">CALLS:</span> {hoveredPoint.calls}</p>
            <p className="text-emerald-400"><span className="text-text-muted">COST:</span> ${hoveredPoint.cost.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
