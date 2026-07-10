"use client";

import { motion, useMotionValue, type Variants } from "framer-motion";
import { useRef, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";

/** Fades + slides children up into view once, the first time they cross the viewport. */
const revealVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export function Reveal({
  children,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Staggers a group of children with Reveal-style fade/slide as they enter. */
const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export function RevealGroup({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={revealVariants}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** A card that tilts in 3D toward the cursor, for a tasteful non-static feel. */
export function TiltCard({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);

  function handleMove(e: ReactPointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 10);
    rotateX.set(py * -10);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerEnter={() => scale.set(1.02)}
      style={{ rotateX, rotateY, scale, transformPerspective: 900, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Animated, softly drifting color-blend blobs for a non-static hero backdrop. */
export function GradientBlend({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "60%",
          height: "70%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(214,54,43,0.22) 0%, rgba(214,54,43,0) 70%)",
          filter: "blur(40px)",
          animation: "blendDrift 18s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-25%",
          right: "-10%",
          width: "55%",
          height: "65%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(23,19,16,0.12) 0%, rgba(23,19,16,0) 70%)",
          filter: "blur(50px)",
          animation: "blendDrift 22s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}
