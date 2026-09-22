import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * TiltCard
 * Awwwards-grade 3D tilt container with spring physics and specular reflection sheen.
 */
export default function TiltCard({
  children,
  className = "",
  tiltMax = 10,
  glare = true,
  onClick,
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 260, damping: 24 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [tiltMax, -tiltMax]);
  const rotateY = useTransform(smoothX, [0, 1], [-tiltMax, tiltMax]);

  const glareX = useTransform(smoothX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(smoothY, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = (e.clientX - rect.left) / rect.width;
    const clientY = (e.clientY - rect.top) / rect.height;
    x.set(clientX);
    y.set(clientY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`perspective-1000 relative ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full relative will-change-transform"
      >
        {children}

        {glare && (
          <motion.div
            style={{
              background: `radial-gradient(circle 220px at ${glareX} ${glareY}, rgba(255, 195, 0, 0.16), transparent 70%)`,
            }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute inset-0 rounded-[inherit] z-20"
          />
        )}
      </motion.div>
    </div>
  );
}
