import { Mail, Phone } from 'lucide-react';
import Logo from './Logo';

const leadershipContacts = [
  {
    name: 'Jayraj (CEO)',
    email: 'ceojayraj@ietech.ai',
    phoneDisplay: '9558525296',
    phoneHref: 'tel:+919558525296',
  },
  {
    name: 'Aditya (CTO)',
    email: 'ctoaditya@ietech.ai',
    phoneDisplay: '9313523728',
    phoneHref: 'tel:+919313523728',
  },
];

export default function Footer({ onContactOpen }: { onContactOpen?: () => void }) {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-black/5 bg-neutral-50 py-12 transition-colors duration-300 dark:border-white/10 dark:bg-black"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-28 w-[720px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(103,171,235,0.2)_0%,rgba(103,171,235,0)_72%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(73,146,255,0.22)_0%,rgba(73,146,255,0)_72%)]" />
        <svg
          className="absolute bottom-0 left-0 h-24 w-full opacity-70 dark:opacity-50"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 146C230 128 340 100 520 108C700 116 760 150 930 152C1120 156 1260 110 1440 116"
            stroke="currentColor"
            strokeWidth="1.2"
            className="text-[#9cb8d6] dark:text-[#3f5f84]"
            fill="none"
          />
          <path
            d="M0 162C240 154 372 130 540 136C704 142 822 171 986 171C1148 171 1292 154 1440 158"
            stroke="currentColor"
            strokeWidth="1"
            className="text-[#bfd0e4] dark:text-[#2f4767]"
            fill="none"
          />
        </svg>
      </div>

      <div className="relative container mx-auto flex max-w-7xl flex-col gap-8 px-4">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-auto opacity-90" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Ready to transform operations? Contact leadership for demos, partnerships, and deployment planning.
            </p>
          </div>

          <button
            type="button"
            onClick={onContactOpen}
            className="inline-flex items-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Contact Us
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {leadershipContacts.map((contact) => (
            <div
              key={contact.email}
              className="rounded-2xl border border-black/10 bg-white/85 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]"
            >
              <p className="text-sm font-semibold text-black dark:text-white">{contact.name}</p>

              <a
                href={`mailto:${contact.email}`}
                className="mt-2 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-black dark:text-neutral-300 dark:hover:text-white"
              >
                <Mail className="h-4 w-4 text-[#103651] dark:text-[#8FC6F2]" />
                {contact.email}
              </a>

              <a
                href={contact.phoneHref}
                className="mt-1 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-black dark:text-neutral-300 dark:hover:text-white"
              >
                <Phone className="h-4 w-4 text-[#103651] dark:text-[#8FC6F2]" />
                {contact.phoneDisplay}
              </a>
            </div>
          ))}
        </div>

        <p className="text-sm text-neutral-400 dark:text-neutral-600">
          &copy; {new Date().getFullYear()} i.e tech. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
