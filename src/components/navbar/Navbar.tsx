'use client';

import { BookOpen, FolderKanban, LayoutDashboard, Menu, Moon, Sun, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/themeStore';

const NavLink = ({
  href,
  icon: Icon,
  children,
  active,
}: {
  href: string;
  icon: any;
  children: React.ReactNode;
  active: boolean;
}) => {
  const { theme } = useThemeStore();

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        active
          ? theme === 'dark'
            ? 'bg-zinc-800 text-white'
            : 'bg-purple-50 text-purple-700'
          : theme === 'dark'
            ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon
        className={`h-4 w-4 ${active ? (theme === 'dark' ? 'text-white' : 'text-purple-600') : ''}`}
      />
      {children}
    </Link>
  );
};

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useThemeStore();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Hide navbar on sign-in page
  if (pathname === '/sign-in') {
    return null;
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/', label: 'Projects', icon: FolderKanban }, // Assuming Projects is home for now or /projects
    { href: '/docs', label: 'Docs', icon: BookOpen },
  ];

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
    avatar: '', // Add avatar URL if available
  };

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? theme === 'dark'
              ? 'bg-zinc-950/80 border-b border-zinc-800 backdrop-blur-md shadow-sm'
              : 'bg-white/80 border-b border-zinc-200 backdrop-blur-md shadow-sm'
            : theme === 'dark'
              ? 'bg-zinc-950 border-b border-transparent'
              : 'bg-white border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src="/calance_logo.png"
                    alt="Calance Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-bold text-lg leading-none tracking-tight ${
                      theme === 'dark' ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    Calance
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-medium ${
                      theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                    }`}
                  >
                    Workflow Automation
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    icon={link.icon}
                    active={
                      pathname === link.href ||
                      (link.href !== '/' && pathname.startsWith(link.href))
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={`rounded-full w-9 h-9 transition-colors ${
                  theme === 'dark'
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              {/* Profile Dropdown - Placeholder */}
              <div className="hidden md:block pl-2 border-l border-zinc-200 dark:border-zinc-800 ml-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 p-1 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-purple-100 text-purple-700'}`}
                  >
                    {getInitials(mockUser.name)}
                  </div>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                type="button"
                className={`md:hidden p-2 rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close menu overlay"
        />

        {/* Mobile Menu Content */}
        <div
          className={`md:hidden fixed top-16 left-0 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-lg transition-transform duration-300 ease-in-out z-40 origin-top transform ${
            isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
          }`}
        >
          <div className="px-4 py-6 space-y-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                      ? theme === 'dark'
                        ? 'bg-zinc-800 text-white'
                        : 'bg-purple-50 text-purple-700'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
            </div>

            <div className={`h-px w-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`} />

            <div className="flex items-center gap-3 px-3 py-2">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-purple-100 text-purple-700'}`}
              >
                {getInitials(mockUser.name)}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {mockUser.name}
                </span>
                <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  {mockUser.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16" />
    </>
  );
}
