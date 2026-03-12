'use client';

import { Cloud, Gauge, Zap } from 'lucide-react';
import { useRef } from 'react';
import { useInView } from '@/hooks/useInView';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useThemeStore } from '@/store/themeStore';

const features = [
  {
    icon: Zap,
    title: 'One-Click Workflows',
    description:
      'Generate production-ready CI/CD pipelines with a single click. No YAML expertise required.',
    gradient: 'from-amber-500 to-orange-500',
    glowColor: 'rgba(245,158,11,0.12)',
  },
  {
    icon: Cloud,
    title: 'Multi-Cloud Deploy',
    description:
      'Deploy seamlessly to EC2, Kubernetes, or any cloud provider from a unified interface.',
    gradient: 'from-purple-500 to-indigo-500',
    glowColor: 'rgba(139,92,246,0.12)',
  },
  {
    icon: Gauge,
    title: 'Real-Time Monitoring',
    description:
      'Track every build, test, and deployment in real time with live status updates and logs.',
    gradient: 'from-cyan-500 to-blue-500',
    glowColor: 'rgba(6,182,212,0.12)',
  },
];

export function FeaturesSection() {
  const { theme } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const { isInView } = useInView({
    threshold: 0.1,
    once: false,
    externalRef: containerRef,
  });

  const { progress } = useScrollProgress({
    externalRef: containerRef,
  });

  return (
    <section
      ref={containerRef}
      className={`relative py-32 px-6 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50/50'}`}
    >
      {/* Section header */}
      <div className="max-w-5xl mx-auto text-center mb-20 will-change-transform">
        <p
          className={`text-xs font-semibold tracking-[0.2em] uppercase mb-4 transition-all duration-700 ${
            isInView ? 'animate-fade-up' : 'opacity-0'
          } ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}
        >
          Capabilities
        </p>
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-all duration-700 stagger-1 ${
            isInView ? 'animate-fade-up' : 'opacity-0'
          } ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}
          style={{ animationFillMode: 'both' }}
        >
          Everything you need.
          <br />
          <span className={theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}>
            Nothing you don&apos;t.
          </span>
        </h2>
      </div>

      {/* Feature cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          // Subtle parallax rise as we scroll
          const cardY = Math.max(0, (1 - progress) * 20);
          return (
            <div
              key={feature.title}
              className={`group relative rounded-2xl p-8 transition-all duration-700 cursor-default ${
                isInView ? 'animate-fade-up' : 'opacity-0'
              } ${
                theme === 'dark'
                  ? 'bg-zinc-900/50 border border-zinc-800/60 hover:border-zinc-700/80 hover:bg-zinc-900/80'
                  : 'bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-lg'
              }`}
              style={{
                animationDelay: `${0.15 + index * 0.12}s`,
                animationFillMode: 'both',
                transform: `translateY(${cardY}px)`,
                transition:
                  'transform 0.3s ease-out, border-color 0.3s, background 0.3s, box-shadow 0.3s',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${feature.glowColor} 0%, transparent 70%)`,
                }}
              />

              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 bg-gradient-to-br ${feature.gradient} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Title */}
              <h3
                className={`text-xl font-semibold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                }`}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className={`text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
