import { motion } from 'framer-motion';
import Logo from './Logo';

const navItems = [
  { href: '#what-we-do', label: 'What We Do' },
  { href: '#erp', label: 'ERP' },
  { href: '#custom', label: 'Custom Solutions' },
  { href: '#cad', label: 'CloudAICAD' },
];

export default function Navbar({ onContactOpen }: { onContactOpen: () => void }) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-white/65 dark:bg-black/55 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgba(10,10,10,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-colors duration-300"
    >
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="shrink-0 flex items-center gap-3 cursor-pointer"
      >
        <Logo className="h-10 w-auto" animated />
      </motion.div>

      <div className="hidden md:flex items-center gap-1 xl:gap-2">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="relative inline-flex shrink-0 items-center whitespace-nowrap px-2.5 xl:px-3 py-2 text-[13px] xl:text-sm font-medium tracking-[0.01em] text-neutral-500 dark:text-neutral-400 transition-colors duration-300 hover:text-black dark:hover:text-white"
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="shrink-0 flex items-center">
        <button
          type="button"
          onClick={onContactOpen}
          className="whitespace-nowrap px-5 py-2.5 text-sm font-semibold text-white bg-black dark:text-black dark:bg-white rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[0_10px_24px_rgba(10,10,10,0.22)] dark:hover:bg-neutral-200 dark:hover:shadow-[0_10px_24px_rgba(250,250,250,0.2)]"
        >
          Get in Touch
        </button>
      </div>
    </motion.nav>
  );
}
