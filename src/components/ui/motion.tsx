'use client';

import type { Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React, { useCallback, useRef, useState } from 'react';

// ─── Shared Variants ────────────────────────────────────────────────

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24, delay },
  }),
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay: number = 0.08) => ({
    opacity: 1,
    transition: { staggerChildren: staggerDelay, delayChildren: 0.1 },
  }),
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
  },
};

// ─── FadeIn ─────────────────────────────────────────────────────────

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  className?: string;
  once?: boolean;
};

export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  distance = 20,
  duration = 0.5,
  className,
  once = true,
}: FadeInProps) {
  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-50px' }}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── ScaleIn ────────────────────────────────────────────────────────

export function ScaleIn({
  children,
  delay = 0,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, margin: '-50px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerContainer + StaggerItem ─────────────────────────────────

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  className,
  once = true,
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-30px' }}
      custom={staggerDelay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// ─── AnimatedCard (3D tilt on hover) ────────────────────────────────

export function AnimatedCard({
  children,
  className,
  tiltDegree = 5,
}: {
  children: ReactNode;
  className?: string;
  tiltDegree?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltDegree, -tiltDegree]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltDegree, tiltDegree]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) {
        return;
      }
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Modal Overlay + Content ────────────────────────────────────────

export function ModalOverlay({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`absolute inset-0 bg-black/60 cursor-default ${className || ''}`}
    />
  );
}

export function ModalContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28, mass: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── PageTransition ─────────────────────────────────────────────────

export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── MagneticButton ─────────────────────────────────────────────────

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) {
        return;
      }
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
      y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
    },
    [x, y, strength]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
      className={`inline-block ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// ─── CountUp ────────────────────────────────────────────────────────

export function CountUp({
  target,
  duration = 1.5,
  prefix = '',
  suffix = '',
  className,
  decimals = 0,
}: {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  React.useEffect(() => {
    const start = performance.now();
    const animate = (time: number) => {
      const elapsed = (time - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(eased * target);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  const formatted =
    decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

// ─── TextReveal ─────────────────────────────────────────────────────

export function TextReveal({
  text,
  className,
  delay = 0,
  staggerDelay = 0.04,
  once = true,
  by = 'word' as 'word' | 'character',
}: {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
  by?: 'word' | 'character';
}) {
  const items = by === 'word' ? text.split(' ') : text.split('');
  const sep = by === 'word' ? '\u00A0' : '';

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-30px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay, delayChildren: delay } },
      }}
      className={className}
      style={{ display: 'inline-flex', flexWrap: 'wrap' }}
    >
      {items.map((item, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
            visible: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
            },
          }}
          style={{ display: 'inline-block' }}
        >
          {item}
          {sep}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ─── Spotlight (cursor-following radial gradient) ────────────────────

export function Spotlight({
  children,
  className,
  color = 'rgba(120, 80, 255, 0.08)',
  size = 400,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  size?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${className || ''}`}
    >
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: `radial-gradient(${size}px circle at ${mousePos.x}px ${mousePos.y}px, ${color}, transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─── GradientBorder ─────────────────────────────────────────────────

export function GradientBorder({
  children,
  className,
  borderWidth = 1,
  gradient = 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)',
  borderRadius = '12px',
  animate: shouldAnimate = true,
}: {
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  gradient?: string;
  borderRadius?: string;
  animate?: boolean;
}) {
  return (
    <div
      className={`relative ${className || ''}`}
      style={{ padding: borderWidth, borderRadius, overflow: 'hidden' }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: gradient, backgroundSize: '300% 300%', borderRadius }}
        animate={
          shouldAnimate ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : undefined
        }
        transition={shouldAnimate ? { duration: 4, repeat: Infinity, ease: 'linear' } : undefined}
      />
      <div className="relative" style={{ borderRadius }}>
        {children}
      </div>
    </div>
  );
}

// ─── Re-exports ─────────────────────────────────────────────────────
export { AnimatePresence, motion };
export type { Variants };
