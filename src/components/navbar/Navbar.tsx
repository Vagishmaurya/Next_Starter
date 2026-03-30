'use client';

import { FileText, FolderKanban, Menu, Moon, Sun, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from '@/components/ui/motion';
import { useThemeStore } from '@/store/themeStore';

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Sync theme with document element for standard Tailwind dark mode support
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Hide navbar on sign-in page
  if (pathname === '/sign-in') {
    return null;
  }

  const isLanding = pathname === '/';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const mockUser = {
    name: 'Admin User',
    email: 'admin@calance.com',
  };

  const navLinks = [
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Docs', href: '/docs', icon: FileText },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 z-40 w-full border-b transition-all duration-500 ease-in-out py-0 ${
          isLanding
            ? 'bg-transparent border-transparent'
            : theme === 'dark'
              ? 'bg-zinc-950 border-zinc-800'
              : 'bg-white border-zinc-200'
        }`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 ease-in-out max-w-7xl">
          <div className="flex justify-between items-center h-16 px-6 transition-all duration-500">
            {/* Logo */}
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-3 group">
                <motion.div
                  className="relative w-8 h-8"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                  <Image
                    src="/calance_logo.png"
                    alt="Calance Logo"
                    fill
                    className="object-contain"
                  />
                </motion.div>
                <div className="flex flex-col">
                  <span
                    className={`font-bold text-lg leading-none tracking-tight transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    Calance
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500 mt-0.5">
                    Workflow
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1 relative">
                {navLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 group ${
                        isActive
                          ? theme === 'dark'
                            ? 'text-white'
                            : 'text-purple-700'
                          : theme === 'dark'
                            ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'
                      }`}
                    >
                      {/* Sliding active background with layoutId */}
                      {isActive && (
                        <motion.div
                          layoutId="nav-active-pill"
                          className={`absolute inset-0 rounded-full ${
                            theme === 'dark' ? 'bg-zinc-800/50' : 'bg-purple-50'
                          }`}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon
                          className={`h-4 w-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                        />
                        {link.name}
                      </span>

                      {/* Active Indicator Dot */}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-dot"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Theme toggle with spin animation */}
              <motion.div whileTap={{ rotate: 360 }} transition={{ duration: 0.4 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className={`rounded-full w-10 h-10 transition-all duration-300 ${
                    theme === 'dark'
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {theme === 'light' ? (
                      <motion.div
                        key="moon"
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="h-[18px] w-[18px]" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sun"
                        initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="h-[18px] w-[18px]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              {/* Profile */}
              <div
                className={`hidden md:block pl-2 ml-1 ${
                  theme === 'dark' ? 'border-l border-white/10' : 'border-l border-black/5'
                }`}
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center justify-center p-0.5 rounded-full transition-all duration-300 ring-2 ring-transparent hover:ring-purple-500/30 ${
                    theme === 'dark' ? 'bg-zinc-800/50' : 'bg-purple-100/50'
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-zinc-800 text-zinc-200'
                        : 'bg-white text-purple-700 shadow-sm'
                    }`}
                  >
                    {getInitials(mockUser.name)}
                  </div>
                </motion.button>
              </div>

              {/* Mobile menu button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                className={`md:hidden p-2 rounded-xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile menu with spring animation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`md:hidden fixed inset-x-4 top-20 shadow-2xl z-40 rounded-2xl overflow-hidden border ${
                theme === 'dark'
                  ? 'bg-zinc-950/95 border-white/10 backdrop-blur-xl'
                  : 'bg-white/95 border-black/5 backdrop-blur-xl'
              }`}
            >
              <div className="px-4 py-6 space-y-2">
                {navLinks.map((link, index) => {
                  const isActive = pathname.startsWith(link.href);
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                          isActive
                            ? theme === 'dark'
                              ? 'bg-zinc-800 text-white'
                              : 'bg-purple-50 text-purple-700'
                            : theme === 'dark'
                              ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}

                <div
                  className={`h-px w-full my-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}
                />

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold ${
                      theme === 'dark'
                        ? 'bg-zinc-800 text-zinc-300'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {getInitials(mockUser.name)}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {mockUser.name}
                    </span>
                    <span
                      className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}
                    >
                      {mockUser.email}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
