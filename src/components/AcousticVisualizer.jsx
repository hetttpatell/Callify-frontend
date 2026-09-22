import { useEffect, useRef } from "react";

/**
 * AcousticVisualizer
 * High-performance HTML5 Canvas audio waveform renderer.
 * Embodies the "Living Acoustic Thread" brand metaphor with fluid sinusoidal wave physics.
 */
export default function AcousticVisualizer({
  isActive = true,
  height = 90,
  lineColor = "#FFC300",
  secondaryColor = "rgba(245, 158, 11, 0.35)",
  glowColor = "rgba(255, 195, 0, 0.4)",
  interactive = true,
}) {
  const canvasRef = useRef(null);
  const mousePosRef = useRef({ x: null, y: null, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let phase = 0;
    let targetAmplitude = isActive ? 24 : 6;
    let currentAmplitude = targetAmplitude;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const onMouseLeave = () => {
      mousePosRef.current.active = false;
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const h = rect.height;
      const centerY = h / 2;

      ctx.clearRect(0, 0, width, h);

      // Smooth amplitude lerp
      targetAmplitude = isActive ? 24 : 6;
      currentAmplitude += (targetAmplitude - currentAmplitude) * 0.08;

      phase += isActive ? 0.05 : 0.015;

      // Draw secondary background wave
      ctx.beginPath();
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x += 3) {
        const norm = (x / width) * Math.PI * 4;
        let y = centerY + Math.sin(norm + phase * 0.7) * (currentAmplitude * 0.6) * Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw main harmonic wave with glow
      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;

      for (let x = 0; x < width; x += 2) {
        const norm = (x / width) * Math.PI * 6;
        let envelope = Math.sin((x / width) * Math.PI); // Windowing to pin ends
        let waveY = Math.sin(norm - phase) * currentAmplitude * envelope;
        let harmonic = Math.cos(norm * 1.5 + phase * 1.2) * (currentAmplitude * 0.4) * envelope;

        // Interactive mouse influence
        if (mousePosRef.current.active && mousePosRef.current.x !== null) {
          const dist = Math.abs(x - mousePosRef.current.x);
          const maxDist = 90;
          if (dist < maxDist) {
            const pull = (1 - dist / maxDist) * 16 * Math.sin(phase * 3);
            waveY += pull;
          }
        }

        const y = centerY + waveY + harmonic;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [isActive, height, lineColor, secondaryColor, glowColor, interactive]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: `${height}px` }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
