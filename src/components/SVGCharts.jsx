import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

export default function SVGCharts({ data = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const chartContainerRef = useRef(null);

  const defaultData = [
    { date: "JUL 09", calls: 142, cost: 9.94 },
    { date: "JUL 10", calls: 185, cost: 12.95 },
    { date: "JUL 11", calls: 95, cost: 6.65 },
    { date: "JUL 12", calls: 64, cost: 4.48 },
    { date: "JUL 13", calls: 215, cost: 15.05 },
    { date: "JUL 14", calls: 289, cost: 20.23 },
    { date: "JUL 15", calls: 342, cost: 23.94 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  const width = 600;
  const height = 180;
  const padding = 35;

  const maxVal = Math.max(...chartData.map((d) => d.calls), 100) * 1.1;
  const minVal = 0;

  const getX = (index) => {
    return padding + (index * (width - padding * 2)) / (chartData.length - 1);
  };

  const getY = (value) => {
    return height - padding - ((value - minVal) * (height - padding * 2)) / (maxVal - minVal);
  };

  const points = chartData.map((d, i) => `${getX(i)},${getY(d.calls)}`).join(" ");
  const linePath = `M ${points}`;

  const areaPath = `
    M ${getX(0)},${height - padding}
    L ${points}
    L ${getX(chartData.length - 1)},${height - padding}
    Z
  `;

  const pathRef = useRef(null);
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      gsap.fromTo(
        pathRef.current,
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 1.4, ease: "power2.out" }
      );
    }
  }, [chartData]);

  const handleMouseMove = (e, d, i) => {
    const x = getX(i);
    const y = getY(d.calls);
    setTooltipPos({
      x: x + 15,
      y: y - 55,
    });
    setHoveredPoint({ ...d, index: i });
  };

  return (
    <div ref={chartContainerRef} className="space-y-4 font-mono-data">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFC300] animate-pulse" />
          TELEPHONY LOAD INTERCEPT // 7 DAY RUN
        </h3>
        <div className="flex gap-4 text-[10px] uppercase text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFC300]" />
            TOTAL VOLUME: {chartData.reduce((acc, curr) => acc + curr.calls, 0)} CALLS
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            DISPATCHED: 99.4%
          </span>
        </div>
      </div>

      <div className="relative bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 overflow-visible h-[200px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradientLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFC300" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#FFC300" stopOpacity="0.0" />
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
                stroke="rgba(226, 232, 240, 0.85)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Area gradient */}
          <path d={areaPath} fill="url(#chartGradientLight)" />

          {/* Line Chart Path */}
          <path
            ref={pathRef}
            d={linePath}
            fill="none"
            stroke="#FFC300"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive dots */}
          {chartData.map((d, i) => {
            const x = getX(i);
            const y = getY(d.calls);
            const isHovered = hoveredPoint?.index === i;

            return (
              <g key={i} className="cursor-pointer">
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="#FFC300"
                    fillOpacity="0.25"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? "#FFC300" : "#FFFFFF"}
                  stroke="#FFC300"
                  strokeWidth="2.5"
                  onMouseEnter={(e) => handleMouseMove(e, d, i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {chartData.map((d, i) => {
            const x = getX(i);
            return (
              <text
                key={i}
                x={x}
                y={height - 10}
                fill="#94A3B8"
                fontSize="9"
                textAnchor="middle"
                className="font-mono-data uppercase font-semibold"
              >
                {d.date}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 bg-[#0F172A] text-white rounded-xl px-3 py-2 text-[11px] shadow-xl pointer-events-none border border-[#334155] transition-all transform -translate-x-1/2"
            style={{
              left: `${(hoveredPoint.index * 100) / (chartData.length - 1)}%`,
              top: "15px",
            }}
          >
            <p className="font-bold text-[#FFC300]">{hoveredPoint.date}</p>
            <p className="text-white font-semibold">{hoveredPoint.calls} Inbound Calls</p>
            <p className="text-emerald-400 text-[10px]">Estimated Value: ₹{(hoveredPoint.calls * 45).toLocaleString("en-IN")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
