'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useThemeStore } from '@/store/themeStore';

export function HeroSection() {
  const { theme } = useThemeStore();
  const { ref: scrollRef, progress } = useScrollProgress();

  // Parallax: content fades out and scales down as you scroll past
  const parallaxOpacity = Math.max(0, 1 - progress * 1.5);
  const parallaxScale = 1 - progress * 0.08;
  const parallaxY = progress * 60;

  return (
    <section
      ref={scrollRef}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
    >
      {/* Gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        {theme === 'dark' ? (
          <>
            <div className="absolute inset-0 bg-zinc-950" />
            <div
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full animate-pulse-glow"
              style={{
                background: 'radial-gradient(circle, rgba(109,40,217,0.15) 0%, transparent 70%)',
              }}
            />
            <div
              className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full animate-pulse-glow"
              style={{
                background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
                animationDelay: '2s',
              }}
            />
            <div
              className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full animate-pulse-glow"
              style={{
                background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
                animationDelay: '4s',
              }}
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-white" />
            <div
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full animate-pulse-glow"
              style={{
                background: 'radial-gradient(circle, rgba(109,40,217,0.06) 0%, transparent 70%)',
              }}
            />
            <div
              className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full animate-pulse-glow"
              style={{
                background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
                animationDelay: '2s',
              }}
            />
          </>
        )}
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <div
          className={`absolute top-[15%] left-[8%] w-20 h-20 rounded-2xl rotate-12 animate-float ${
            theme === 'dark'
              ? 'border border-white/[0.04] bg-white/[0.02]'
              : 'border border-black/[0.04] bg-black/[0.01]'
          }`}
          style={{
            transform: `translateY(${progress * -30}px) rotate(${12 + progress * 15}deg)`,
          }}
        />
        <div
          className={`absolute top-[25%] right-[12%] w-14 h-14 rounded-full animate-float-reverse ${
            theme === 'dark'
              ? 'border border-purple-500/10 bg-purple-500/[0.03]'
              : 'border border-purple-500/10 bg-purple-500/[0.03]'
          }`}
          style={{
            transform: `translateY(${progress * -50}px)`,
          }}
        />
        <div
          className={`absolute bottom-[20%] left-[15%] w-16 h-16 rounded-xl animate-float ${
            theme === 'dark'
              ? 'border border-blue-500/10 bg-blue-500/[0.03]'
              : 'border border-blue-500/10 bg-blue-500/[0.02]'
          }`}
          style={{
            transform: `translateY(${progress * 20}px) rotate(${45 + progress * -20}deg)`,
          }}
        />
        <div
          className={`absolute bottom-[30%] right-[8%] w-24 h-24 rounded-3xl animate-float-reverse ${
            theme === 'dark'
              ? 'border border-white/[0.03] bg-white/[0.01]'
              : 'border border-black/[0.03] bg-black/[0.01]'
          }`}
          style={{
            transform: `translateY(${progress * 40}px) rotate(${-12 + progress * 10}deg)`,
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
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase mb-8 animate-fade-up ${
            theme === 'dark'
              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
              : 'bg-purple-50 text-purple-600 border border-purple-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Workflow Automation Platform
        </div>

        {/* Headline */}
        <h1
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6 animate-fade-up ${
            theme === 'dark' ? 'text-white' : 'text-zinc-900'
          }`}
          style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
        >
          Automate.
          <br />
          <span
            className={`bg-clip-text text-transparent animate-gradient ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600'
            }`}
            style={{ backgroundSize: '200% 200%' }}
          >
            Deploy.
          </span>
          <br />
          Scale.
        </h1>

        {/* Subtitle */}
        <p
          className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-light animate-fade-up ${
            theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
          }`}
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          Enterprise-grade CI/CD workflow automation for modern teams.
          <br className="hidden sm:block" />
          Build, test, and deploy with confidence.
        </p>

        {/* CTA */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: '0.45s', animationFillMode: 'both' }}
        >
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
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in"
        style={{
          animationDelay: '0.8s',
          animationFillMode: 'both',
          zIndex: 2,
          opacity: parallaxOpacity,
        }}
      >
        <div
          className={`w-6 h-10 rounded-full border-2 flex items-start justify-center p-1.5 ${
            theme === 'dark' ? 'border-zinc-700' : 'border-zinc-300'
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full animate-bounce ${
              theme === 'dark' ? 'bg-zinc-500' : 'bg-zinc-400'
            }`}
          />
        </div>
      </div>
    </section>
  );
}
