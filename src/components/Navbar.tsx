import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';

const navItems = [
  { href: '#about', label: 'About' },
  { href: '#what-we-do', label: 'What We Do' },
  { href: '#erp', label: 'ERP' },
  { href: '#custom', label: 'Custom' },
  { href: '#cad', label: 'AI CAD' },
];

export default function Navbar({ onContactOpen }: { onContactOpen: () => void }) {
  const navRef = useRef<HTMLElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHref, setActiveHref] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId: number | null = null;

    const updateActiveLink = () => {
      rafId = null;
      const targets = navItems
        .map((item) => ({ href: item.href, element: document.querySelector<HTMLElement>(item.href) }))
        .filter((item): item is { href: string; element: HTMLElement } => Boolean(item.element));

      if (!targets.length) return;
      const navHeight = navRef.current?.getBoundingClientRect().height ?? 76;
      // Products anchors are positioned with a 96px top offset (76 nav + 20).
      // Keep navbar activation in sync, while still adapting if nav grows.
      const activationLine = Math.max(navHeight + 20, 96);
      const activationThreshold = activationLine + 8;

      let nextActiveHref = '';
      for (const target of targets) {
        const top = target.element.getBoundingClientRect().top;
        if (top <= activationThreshold) nextActiveHref = target.href;
        else break;
      }

      if (window.scrollY < 48) nextActiveHref = '';
      setActiveHref((current) => (current === nextActiveHref ? current : nextActiveHref));
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateActiveLink);
    };

    updateActiveLink();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('hashchange', scheduleUpdate);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('hashchange', scheduleUpdate);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen || typeof window === 'undefined') return;
    const closeOnDesktop = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };

    window.addEventListener('resize', closeOnDesktop);
    return () => window.removeEventListener('resize', closeOnDesktop);
  }, [mobileOpen]);

  const handleContactClick = () => {
    setMobileOpen(false);
    onContactOpen();
  };

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 md:px-12 md:py-4 bg-white/65 dark:bg-black/55 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgba(10,10,10,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-colors duration-300"
    >
      <motion.a
        href="#home"
        onClick={() => {
          setMobileOpen(false);
          setActiveHref('');
        }}
        aria-label="Go to top"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="shrink-0 flex items-center gap-3"
      >
        <Logo className="h-10 w-auto" animated />
      </motion.a>

      <div className="hidden md:flex items-center gap-1 xl:gap-2">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setActiveHref(item.href)}
            className={`relative inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 xl:px-3 py-2 text-[13px] xl:text-sm font-medium tracking-[0.01em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#103651]/40 dark:focus-visible:ring-[#8FC6F2]/50 ${
              activeHref === item.href
                ? 'bg-black/[0.06] text-black dark:bg-white/[0.12] dark:text-white'
                : 'text-neutral-500 hover:text-black hover:bg-black/[0.04] dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.08]'
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-neutral-700 transition-colors hover:text-black hover:bg-white md:hidden dark:border-white/10 dark:bg-black/60 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-black"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={handleContactClick}
          className="hidden md:inline-flex whitespace-nowrap px-5 py-2.5 text-sm font-semibold text-white bg-black dark:text-black dark:bg-white rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[0_10px_24px_rgba(10,10,10,0.22)] dark:hover:bg-neutral-200 dark:hover:shadow-[0_10px_24px_rgba(250,250,250,0.2)]"
        >
          Get in Touch
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-4 right-4 top-full mt-2 rounded-2xl border border-black/10 bg-white/95 p-2 shadow-[0_16px_42px_rgba(15,23,42,0.14)] md:hidden dark:border-white/10 dark:bg-black/92 dark:shadow-[0_16px_42px_rgba(0,0,0,0.5)]"
          >
            <div className="flex flex-col">
              {navItems.map((item) => (
                <a
                  key={`mobile-${item.href}`}
                  href={item.href}
                  onClick={() => {
                    setActiveHref(item.href);
                    setMobileOpen(false);
                  }}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeHref === item.href
                      ? 'bg-black/[0.06] text-black dark:bg-white/[0.14] dark:text-white'
                      : 'text-neutral-600 hover:bg-black/[0.04] hover:text-black dark:text-neutral-300 dark:hover:bg-white/[0.08] dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <button
                type="button"
                onClick={handleContactClick}
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Get in Touch
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.nav>
  );
}
