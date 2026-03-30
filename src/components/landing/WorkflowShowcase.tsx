'use client';

import { Box, CheckCircle2, Code2, Play, Rocket } from 'lucide-react';
import { useRef } from 'react';
import { FadeIn, motion, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useThemeStore } from '@/store/themeStore';

const pipelineSteps = [
  { icon: Code2, label: 'Code', description: 'Push to repository' },
  { icon: Box, label: 'Build', description: 'Docker containerize' },
  { icon: Play, label: 'Test', description: 'Run CI pipeline' },
  { icon: Rocket, label: 'Deploy', description: 'Ship to production' },
  { icon: CheckCircle2, label: 'Live', description: 'Monitor & scale' },
];

export function WorkflowShowcase() {
  const { theme } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const { progress } = useScrollProgress({
    externalRef: containerRef,
  });

  return (
    <section
      ref={containerRef}
      className={`relative py-32 px-6 overflow-hidden ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div className="will-change-transform">
            <FadeIn direction="right" delay={0}>
              <p
                className={`text-xs font-semibold tracking-[0.2em] uppercase mb-4 ${
                  theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                }`}
              >
                How it works
              </p>
            </FadeIn>
            <FadeIn direction="right" delay={0.1}>
              <h2
                className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                }`}
              >
                From code to
                <br />
                <span
                  className={`bg-clip-text text-transparent bg-gradient-to-r ${
                    theme === 'dark' ? 'from-indigo-400 to-cyan-400' : 'from-indigo-600 to-cyan-600'
                  }`}
                >
                  production
                </span>
                <br />
                in minutes.
              </h2>
            </FadeIn>
            <FadeIn direction="right" delay={0.2}>
              <p
                className={`text-base leading-relaxed max-w-md ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                Define your workflow once and let Calance handle the rest. Our intelligent pipeline
                orchestrates every step — from code commit to live deployment — automatically.
              </p>
            </FadeIn>
          </div>

          {/* Right: Pipeline */}
          <div className="relative will-change-transform">
            <FadeIn direction="left" delay={0.2}>
              <div
                className={`rounded-2xl p-8 ${
                  theme === 'dark'
                    ? 'bg-zinc-900/40 border border-zinc-800/60'
                    : 'bg-zinc-50 border border-zinc-200'
                }`}
              >
                <StaggerContainer staggerDelay={0.12}>
                  {pipelineSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isLast = index === pipelineSteps.length - 1;

                    // Each step illuminates based on scroll progress
                    const stepProgress = Math.min(1, Math.max(0, (progress - 0.2) * 2));
                    const stepThreshold = index / pipelineSteps.length;
                    const isIlluminated = stepProgress > stepThreshold;

                    return (
                      <StaggerItem key={step.label}>
                        <div className="flex items-center gap-4 py-4">
                          {/* Step icon */}
                          <motion.div
                            animate={isIlluminated ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                            transition={{
                              duration: 0.4,
                              ease: 'easeOut',
                            }}
                            className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ${
                              isLast && isIlluminated
                                ? 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/20'
                                : isIlluminated
                                  ? theme === 'dark'
                                    ? 'bg-zinc-800 border border-zinc-600'
                                    : 'bg-white border border-zinc-300 shadow-sm'
                                  : theme === 'dark'
                                    ? 'bg-zinc-800/50 border border-zinc-800'
                                    : 'bg-zinc-100 border border-zinc-200'
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 transition-colors duration-500 ${
                                isLast && isIlluminated
                                  ? 'text-white'
                                  : isIlluminated
                                    ? theme === 'dark'
                                      ? 'text-white'
                                      : 'text-zinc-700'
                                    : theme === 'dark'
                                      ? 'text-zinc-600'
                                      : 'text-zinc-400'
                              }`}
                            />
                          </motion.div>

                          {/* Step content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm font-semibold transition-colors duration-500 ${
                                  isIlluminated
                                    ? theme === 'dark'
                                      ? 'text-white'
                                      : 'text-zinc-900'
                                    : theme === 'dark'
                                      ? 'text-zinc-500'
                                      : 'text-zinc-400'
                                }`}
                              >
                                {step.label}
                              </span>
                              <span
                                className={`text-xs transition-colors duration-500 ${
                                  isIlluminated
                                    ? theme === 'dark'
                                      ? 'text-zinc-400'
                                      : 'text-zinc-500'
                                    : theme === 'dark'
                                      ? 'text-zinc-700'
                                      : 'text-zinc-300'
                                }`}
                              >
                                {step.description}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Connector line */}
                        {!isLast && (
                          <div className="flex items-center pl-5">
                            <motion.div
                              initial={{ height: 0 }}
                              whileInView={{ height: 16 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: 0.1 * index }}
                              className={`w-[1px] transition-all duration-500 ${
                                isIlluminated
                                  ? theme === 'dark'
                                    ? 'bg-zinc-600'
                                    : 'bg-zinc-300'
                                  : theme === 'dark'
                                    ? 'bg-zinc-800'
                                    : 'bg-zinc-100'
                              }`}
                            />
                          </div>
                        )}
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </div>
            </FadeIn>

            {/* Glow */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-4 -z-10 rounded-3xl blur-3xl"
              style={{
                background:
                  theme === 'dark'
                    ? 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
