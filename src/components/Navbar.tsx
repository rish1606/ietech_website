import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MessageCircle, ChevronDown } from 'lucide-react';
import Logo from './Logo';

const navItems = [
  { href: '#about', label: 'ABOUT' },
  { href: '#services', label: 'SERVICE' },
  { href: '#/blogs', label: 'BLOGS' },
  { href: '#/projects', label: 'CUSTOMERS' },
];

const contacts = [
  {
    name: 'Jayraj',
    role: 'CEO',
    email: 'ceojayraj@ietech.ai',
    phone: '+919558525296',
    phoneDisplay: '+91 95585 25296',
    whatsapp: '919558525296',
  },
  {
    name: 'Aditya',
    role: 'CTO',
    email: 'ctoaditya@ietech.ai',
    phone: '+919313523728',
    phoneDisplay: '+91 93135 23728',
    whatsapp: '919313523728',
  },
];

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-black border-b border-white/10 shadow-lg transition-colors duration-300"
    >
      <motion.a
        href="#/"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="shrink-0 flex items-center gap-3 cursor-pointer"
      >
        <Logo className="h-8 md:h-10 w-auto" animated />
      </motion.a>

      <div className="hidden md:flex items-center gap-6 xl:gap-8 absolute left-1/2 -translate-x-1/2">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => {
              if (item.href.startsWith('#/')) {
                return; // Let native routing handle page changes
              }
              const targetId = item.href.replace('#', '');
              const element = document.getElementById(targetId);
              if (element) {
                e.preventDefault();
                element.scrollIntoView({ behavior: 'smooth' });
                // Update URL without triggering the hashchange jump
                window.history.pushState(null, '', item.href);
              }
            }}
            className="inline-flex items-center text-[11px] xl:text-xs font-bold tracking-[0.15em] text-white/70 hover:text-white transition-colors duration-200"
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="shrink-0 flex items-center relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-[0.1em] text-black bg-white uppercase rounded-none transition-all duration-300 hover:bg-neutral-200"
        >
          CONTACT US
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full mt-3 w-72 border border-white/10 bg-black shadow-2xl overflow-hidden rounded-none"
            >
              <div className="px-4 pt-4 pb-2 border-b border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Reach out directly
                </p>
              </div>

              {contacts.map((contact, idx) => (
                <div key={contact.name}>
                  {idx > 0 && <div className="mx-4 h-px bg-white/5" />}
                  <div className="px-4 py-4 hover:bg-white/5 transition-colors">
                    <p className="text-xs font-bold text-white mb-3">
                      {contact.name} <span className="text-neutral-500 font-medium">· {contact.role}</span>
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between group">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(contact.email);
                            // Visual feedback is handled by the text change
                            const el = document.getElementById(`copy-text-${contact.email}`);
                            if (el) {
                              el.innerText = "Copied to clipboard!";
                              setTimeout(() => { el.innerText = contact.email; }, 2000);
                            }
                          }}
                          className="inline-flex items-center gap-3 text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                          <Mail className="h-4 w-4 text-[#4A72A4]" />
                          <span id={`copy-text-${contact.email}`}>{contact.email}</span>
                        </button>
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}&su=Inquiry%20from%20IETech%20Website`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide bg-white hover:bg-neutral-200 text-black px-2.5 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                          onClick={() => setDropdownOpen(false)}
                          title="Open in Gmail"
                        >
                          <svg className="h-3 w-3" viewBox="0 0 24 24" aria-hidden>
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          GMAIL
                        </a>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="inline-flex items-center gap-3 text-xs text-neutral-400 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Phone className="h-4 w-4 text-[#4A72A4]" />
                        {contact.phoneDisplay}
                      </a>
                      <a
                        href={`https://wa.me/${contact.whatsapp}?text=Hi%20${contact.name},%20I'm%20interested%20in%20IETech's%20services.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 text-xs text-neutral-400 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <MessageCircle className="h-4 w-4 text-green-500" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                <p className="text-[10px] text-neutral-400 text-center tracking-widest uppercase">
                  We respond within 24 hours
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
