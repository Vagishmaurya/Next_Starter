'use client';

import type { Variants } from 'framer-motion';
import { GitBranch, Github, Rocket, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';
import { motion, Spotlight } from '@/components/ui/motion';
import { useGitHubSignInViewModel } from '@/viewmodels/GitHubSignInViewModel';

/**
 * SignInPage Component
 *
 * View Layer in MVVM Pattern
 * Displays a premium GitHub sign-in UI with Framer Motion
 */
export default function SignInPage() {
  const { initiateGithubSignIn, isLoading, error, clearError } = useGitHubSignInViewModel();

  const handleGithubSignIn = async () => {
    clearError();
    try {
      console.log('[SignInPage] GitHub sign-in button clicked');
      await initiateGithubSignIn();
    } catch (err) {
      console.error('[SignInPage] Error:', err);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 350, damping: 25 },
    },
  };

  // Static array of particles to avoid hydration mismatches
  const particles = [
    { id: 'p1', x: '10%', y: '20%', size: 3, duration: 8, delay: 0 },
    { id: 'p2', x: '85%', y: '15%', size: 2, duration: 7, delay: 1 },
    { id: 'p3', x: '75%', y: '80%', size: 4, duration: 9, delay: 0.5 },
    { id: 'p4', x: '20%', y: '85%', size: 3, duration: 6, delay: 1.5 },
    { id: 'p5', x: '50%', y: '10%', size: 2, duration: 8, delay: 0.2 },
    { id: 'p6', x: '90%', y: '50%', size: 3, duration: 7, delay: 2 },
    { id: 'p7', x: '15%', y: '50%', size: 2, duration: 9, delay: 0.8 },
    { id: 'p8', x: '50%', y: '90%', size: 4, duration: 10, delay: 1.2 },
  ];

  return (
    <Spotlight color="rgba(168, 85, 247, 0.15)" size={800}>
      <div className="-mt-16 relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
        {/* Premium Spotlight Background */}

        {/* Animated Gradient Meshes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)',
            }}
          />
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 60%)',
            }}
          />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white/30 blur-[1px]"
              style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
              animate={{ y: [0, -40, 0], opacity: [0.3, 0.9, 0.3] }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: p.delay,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-md px-6"
        >
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-6">
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center justify-center"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.05 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full" />
                  <Image
                    src="/calance_logo.png"
                    alt="Calance Logo"
                    width={80}
                    height={80}
                    priority
                    className="relative h-20 w-20 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] ring-1 ring-white/20"
                  />
                </motion.div>
              </motion.div>

              <div className="space-y-3">
                <motion.h1
                  variants={itemVariants}
                  className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md"
                >
                  Calance DevOps
                </motion.h1>
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-center gap-2 text-cyan-400 font-semibold tracking-wide text-sm md:text-base"
                >
                  <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Secure CI/CD Manager</span>
                </motion.div>
              </div>

              <motion.p
                variants={itemVariants}
                className="text-[15px] text-slate-300 max-w-xs mx-auto leading-relaxed font-medium"
              >
                Deploy with confidence. Manage workflows seamlessly.
              </motion.p>
            </div>

            {/* Features Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: Rocket,
                  label: 'Deploy',
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-500/10',
                  hoverRing: 'hover:ring-cyan-500/40',
                },
                {
                  icon: GitBranch,
                  label: 'Workflows',
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10',
                  hoverRing: 'hover:ring-blue-500/40',
                },
                {
                  icon: Zap,
                  label: 'Automate',
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10',
                  hoverRing: 'hover:ring-amber-500/40',
                },
              ].map((feature) => (
                <motion.div
                  key={feature.label}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className={`rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/[0.1] p-4 text-center hover:bg-white/[0.08] transition-all duration-300 group cursor-default shadow-lg ring-1 ring-transparent ${feature.hoverRing}`}
                >
                  <div
                    className={`mx-auto mb-3 w-10 h-10 rounded-full ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-200 font-bold">
                    {feature.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Login Card */}
            <motion.div variants={itemVariants} className="relative group perspective-1000">
              {/* Ambient shadow glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-cyan-500/20 to-blue-500/30 rounded-[2rem] blur-xl group-hover:blur-2xl transition-all duration-500 opacity-70" />

              <motion.div
                whileHover={{ rotateX: 2, rotateY: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="relative rounded-[2rem] border border-white/[0.15] bg-slate-900/80 backdrop-blur-2xl shadow-2xl p-8 space-y-6 overflow-hidden"
              >
                {/* Card Inner Shadow highlight */}
                <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] pointer-events-none" />

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-xl border border-red-500/30 bg-red-500/20 p-4 space-y-1 relative z-20"
                  >
                    <p className="font-semibold text-sm text-red-300 drop-shadow-sm">
                      Authentication Error
                    </p>
                    <p className="text-sm text-red-200/90">{error}</p>
                  </motion.div>
                )}

                {/* GitHub Button - Removed MagneticButton so w-full works correctly */}
                <motion.button
                  onClick={handleGithubSignIn}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-[54px] relative flex items-center justify-center gap-3 text-[16px] font-bold rounded-2xl bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden z-20"
                >
                  {/* Button hover shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />

                  <div className="relative z-10 flex items-center gap-3">
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <Github className="h-[22px] w-[22px] transition-transform duration-300 group-hover:-rotate-12" />
                        <span>Continue with GitHub</span>
                      </>
                    )}
                  </div>
                </motion.button>

                <div className="pt-3 text-center relative z-20">
                  <p className="text-[12px] leading-relaxed text-slate-400">
                    By continuing, you agree to our{' '}
                    <span className="text-slate-300 hover:text-white transition-colors cursor-pointer border-b border-slate-600 hover:border-white">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-slate-300 hover:text-white transition-colors cursor-pointer border-b border-slate-600 hover:border-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Spotlight>
  );
}
