/**
 * OAuth Callback Page
 * Route: /auth/callback
 */

'use client';

import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { motion, Spotlight } from '@/components/ui/motion';
import { setStoredTokens } from '@/lib/api/token-manager';
import { useUserStore } from '@/lib/stores/useUserStore';
import { useThemeStore } from '@/store/themeStore';

const particles = [
  { id: 'c1', x: '15%', y: '25%', size: 3, duration: 8, delay: 0 },
  { id: 'c2', x: '85%', y: '15%', size: 2, duration: 7, delay: 1 },
  { id: 'c3', x: '75%', y: '80%', size: 4, duration: 9, delay: 0.5 },
  { id: 'c4', x: '20%', y: '85%', size: 3, duration: 6, delay: 1.5 },
  { id: 'c5', x: '50%', y: '10%', size: 2, duration: 8, delay: 0.2 },
];

const BackgroundElements = ({ theme }: { theme: string }) => (
  <>
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        animate={{
          opacity: theme === 'dark' ? [0.3, 0.6, 0.3] : [0.6, 1, 0.6],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-60"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)'
              : 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)',
        }}
      />
      <motion.div
        animate={{
          opacity: theme === 'dark' ? [0.2, 0.5, 0.2] : [0.5, 0.9, 0.5],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-60"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 60%)'
              : 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 60%)',
        }}
      />
    </div>
    <div
      className={`absolute inset-0 bg-[size:40px_40px] pointer-events-none ${theme === 'dark' ? 'bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)]'}`}
    />
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full blur-[1px] ${theme === 'dark' ? 'bg-white/30' : 'bg-purple-500/20'}`}
          style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
          animate={{ y: [0, -40, 0], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  </>
);

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setUser = useUserStore((state: any) => state.setUser);
  const { theme } = useThemeStore();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('[CallbackPage] Processing OAuth callback');
        setIsProcessing(true);
        setError(null);

        const jwtToken = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const userParam = searchParams.get('user');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          setError(errorDescription || 'Authentication failed on backend');
          setIsProcessing(false);
          return;
        }

        if (!jwtToken) {
          setError('No authentication token received. Please try again.');
          setIsProcessing(false);
          return;
        }

        const finalRefreshToken = refreshToken || jwtToken;
        setStoredTokens(jwtToken, finalRefreshToken);

        if (userParam) {
          try {
            const userData = JSON.parse(decodeURIComponent(userParam));
            setUser(userData);
          } catch (parseError) {
            console.warn('[CallbackPage] Failed to parse user data:', parseError);
          }
        }

        console.log('[CallbackPage] Authentication successful, redirecting to projects');
        const timeoutId = setTimeout(() => {
          router.push('/projects');
        }, 500);

        return () => clearTimeout(timeoutId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setIsProcessing(false);
      }
    };
    processCallback();
  }, [router, searchParams, setUser]);

  const spotlightColor = theme === 'dark' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.05)';
  const containerStyle =
    theme === 'dark'
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white'
      : 'bg-gradient-to-br from-purple-50 via-white to-blue-50 text-slate-900';
  const cardStyle =
    theme === 'dark'
      ? 'bg-slate-900/80 border-white/[0.15] shadow-2xl'
      : 'bg-white/80 border-black/[0.05] shadow-xl';
  const textMutedStyle = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  if (isProcessing) {
    return (
      <Spotlight color={spotlightColor} size={800}>
        <div
          className={`relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden ${containerStyle}`}
        >
          <BackgroundElements theme={theme} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-sm px-6"
          >
            <div
              className={`relative rounded-[2rem] border backdrop-blur-2xl p-10 flex flex-col items-center text-center overflow-hidden ${cardStyle}`}
            >
              <div
                className={`absolute inset-0 rounded-[2rem] shadow-inner pointer-events-none ${theme === 'dark' ? 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]' : 'shadow-[inset_0_1px_1px_rgba(255,255,255,1)]'}`}
              />

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="relative w-24 h-24 mb-6"
              >
                <div className="absolute inset-0 rounded-full border-t-[3px] border-r-2 border-purple-500/80 opacity-70" />
                <div className="absolute inset-2 rounded-full border-b-[3px] border-l-2 border-cyan-400/80 opacity-70" />
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full">
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Image
                      src="/calance_logo.png"
                      alt="Calance"
                      width={48}
                      height={48}
                      className={`rounded-xl ${theme === 'dark' ? 'shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'shadow-md'}`}
                    />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h1
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-2xl font-bold tracking-tight mb-2"
              >
                Connecting...
              </motion.h1>
              <p className={`text-sm ${textMutedStyle}`}>Authenticating workspace securely.</p>
            </div>
          </motion.div>
        </div>
      </Spotlight>
    );
  }

  if (error) {
    return (
      <Spotlight color={spotlightColor} size={800}>
        <div
          className={`relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden ${containerStyle}`}
        >
          <BackgroundElements theme={theme} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-sm px-6"
          >
            <div
              className={`relative rounded-[2rem] border backdrop-blur-2xl p-8 flex flex-col items-center text-center overflow-hidden ${theme === 'dark' ? 'bg-slate-900/80 border-red-500/30' : 'bg-white/90 border-red-200'}`}
            >
              <div
                className={`absolute inset-0 rounded-[2rem] pointer-events-none ${theme === 'dark' ? 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'shadow-[inset_0_1px_1px_rgba(255,255,255,1)]'}`}
              />

              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'}`}
              >
                <AlertCircle
                  className={`w-8 h-8 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}
                />
              </div>

              <h1 className="text-xl font-bold mb-2">Authentication Failed</h1>
              <p className={`text-sm mb-8 ${textMutedStyle}`}>{error}</p>

              <motion.button
                onClick={() => router.push('/sign-in')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full h-12 relative flex items-center justify-center gap-2 text-[15px] font-bold rounded-xl transition-all duration-300 ${theme === 'dark' ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'bg-slate-900 text-white shadow-lg hover:shadow-xl'}`}
              >
                Back to Sign In
              </motion.button>
            </div>
          </motion.div>
        </div>
      </Spotlight>
    );
  }

  return null;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<CallbackLoadingFallback />}>
      <CallbackContent />
    </Suspense>
  );
}

function CallbackLoadingFallback() {
  const { theme } = useThemeStore();
  const containerStyle =
    theme === 'dark'
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950'
      : 'bg-gradient-to-br from-purple-50 via-white to-blue-50';

  return (
    <div
      className={`relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden ${containerStyle}`}
    >
      <div className="w-12 h-12 rounded-full border-t-[3px] border-r-[3px] border-purple-500/80 animate-spin" />
    </div>
  );
}
