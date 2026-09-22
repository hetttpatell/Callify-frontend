import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * MagneticButton
 * Micro-interaction wrapper providing magnetic cursor attraction and tactile spring physics.
 */
export default function MagneticButton({
  children,
  onClick,
  className = "",
  strength = 0.28,
  ...props
}) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 18 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = (clientX - centerX) * strength;
    const deltaY = (clientY - centerY) * strength;

    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: smoothX, y: smoothY }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative inline-flex items-center justify-center font-display font-semibold transition-colors duration-200 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
