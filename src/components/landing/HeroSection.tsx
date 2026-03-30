'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { MagneticButton, motion, Spotlight } from '@/components/ui/motion';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useThemeStore } from '@/store/themeStore';

export function HeroSection() {
  const { theme } = useThemeStore();
  const { ref: scrollRef, progress } = useScrollProgress();

  // Parallax: content fades out and scales down as you scroll past
  const parallaxOpacity = Math.max(0, 1 - progress * 1.5);
  const parallaxScale = 1 - progress * 0.08;
  const parallaxY = progress * 60;

  // Floating particle positions (static array, won't re-render)
  const particles = [
    { x: '10%', y: '20%', size: 3, delay: 0 },
    { x: '20%', y: '60%', size: 2, delay: 1.5 },
    { x: '35%', y: '15%', size: 4, delay: 0.8 },
    { x: '55%', y: '75%', size: 2, delay: 2.2 },
    { x: '70%', y: '30%', size: 3, delay: 0.5 },
    { x: '80%', y: '55%', size: 2, delay: 1.8 },
    { x: '90%', y: '20%', size: 3, delay: 1.2 },
    { x: '45%', y: '85%', size: 2, delay: 2.5 },
    { x: '15%', y: '80%', size: 3, delay: 0.3 },
    { x: '65%', y: '10%', size: 2, delay: 1.0 },
  ];

  return (
    <Spotlight
      color={theme === 'dark' ? 'rgba(139, 92, 246, 0.06)' : 'rgba(139, 92, 246, 0.04)'}
      size={600}
    >
      <section
        ref={scrollRef}
        className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
      >
        {/* Gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          {theme === 'dark' ? (
            <>
              <div className="absolute inset-0 bg-zinc-950" />
              <motion.div
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full"
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: 'radial-gradient(circle, rgba(109,40,217,0.15) 0%, transparent 70%)',
                }}
              />
              <motion.div
                className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full"
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 2,
                }}
                style={{
                  background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
                }}
              />
              <motion.div
                className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full"
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 4,
                }}
                style={{
                  background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
                }}
              />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-white" />
              <motion.div
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full"
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: 'radial-gradient(circle, rgba(109,40,217,0.06) 0%, transparent 70%)',
                }}
              />
              <motion.div
                className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full"
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 2,
                }}
                style={{
                  background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
                }}
              />
            </>
          )}
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                theme === 'dark' ? 'bg-white/[0.06]' : 'bg-purple-500/[0.06]'
              }`}
              style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: p.delay,
              }}
            />
          ))}
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
          <motion.div
            className={`absolute top-[15%] left-[8%] w-20 h-20 rounded-2xl ${
              theme === 'dark'
                ? 'border border-white/[0.04] bg-white/[0.02]'
                : 'border border-black/[0.04] bg-black/[0.01]'
            }`}
            animate={{
              y: [0, -20, 0],
              rotate: [12, 27, 12],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              transform: `translateY(${progress * -30}px)`,
            }}
          />
          <motion.div
            className={`absolute top-[25%] right-[12%] w-14 h-14 rounded-full ${
              theme === 'dark'
                ? 'border border-purple-500/10 bg-purple-500/[0.03]'
                : 'border border-purple-500/10 bg-purple-500/[0.03]'
            }`}
            animate={{
              y: [0, -25, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            style={{
              transform: `translateY(${progress * -50}px)`,
            }}
          />
          <motion.div
            className={`absolute bottom-[20%] left-[15%] w-16 h-16 rounded-xl ${
              theme === 'dark'
                ? 'border border-blue-500/10 bg-blue-500/[0.03]'
                : 'border border-blue-500/10 bg-blue-500/[0.02]'
            }`}
            animate={{
              y: [0, 15, 0],
              rotate: [45, 25, 45],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
          <motion.div
            className={`absolute bottom-[30%] right-[8%] w-24 h-24 rounded-3xl ${
              theme === 'dark'
                ? 'border border-white/[0.03] bg-white/[0.01]'
                : 'border border-black/[0.03] bg-black/[0.01]'
            }`}
            animate={{
              y: [0, 20, 0],
              rotate: [-12, -2, -12],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 3,
            }}
          />
        </div>

        {/* Content */}
        <div
          className="relative max-w-5xl mx-auto px-6 text-center will-change-transform"
          style={{
            zIndex: 2,
            opacity: parallaxOpacity,
            transform: `scale(${parallaxScale}) translateY(${parallaxY}px)`,
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase mb-8 ${
              theme === 'dark'
                ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                : 'bg-purple-50 text-purple-600 border border-purple-200'
            }`}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.span>
            Workflow Automation Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            }`}
          >
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
              className="inline-block"
            >
              Automate.
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
              className="inline-block"
            >
              <span
                className={`bg-clip-text text-transparent gradient-text-shimmer ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400'
                    : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600'
                }`}
                style={{ backgroundSize: '200% 200%' }}
              >
                Deploy.
              </span>
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
              className="inline-block"
            >
              Scale.
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-light ${
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            Enterprise-grade CI/CD workflow automation for modern teams.
            <br className="hidden sm:block" />
            Build, test, and deploy with confidence.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <MagneticButton strength={0.15}>
              <Link
                href="/projects"
                className={`group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-white text-zinc-900 hover:bg-zinc-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-[0_0_40px_rgba(0,0,0,0.2)]'
                }`}
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{
            zIndex: 2,
            opacity: parallaxOpacity,
          }}
        >
          <div
            className={`w-6 h-10 rounded-full border-2 flex items-start justify-center p-1.5 ${
              theme === 'dark' ? 'border-zinc-700' : 'border-zinc-300'
            }`}
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-1.5 h-1.5 rounded-full ${
                theme === 'dark' ? 'bg-zinc-500' : 'bg-zinc-400'
              }`}
            />
          </div>
        </motion.div>
      </section>
    </Spotlight>
  );
}
