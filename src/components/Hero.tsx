import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 transition-colors duration-300">

      {/* Background subtle effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-black dark:text-white max-w-5xl mx-auto leading-[1.06] text-balance transition-colors"
        >
          Unify Operations.
          <span className="block text-[#103651] dark:text-[#8FC6F2]">
            Innovate Faster.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-8 text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed transition-colors"
        >
          An engineering-first team for manufacturers and engineering firms, building ERP, custom software,
          and AI-assisted CAD systems that fit real operations from finance to product delivery.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-12 flex flex-col items-center justify-center"
        >
          <div className="relative inline-flex">
            <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-black/10 blur-xl dark:bg-white/10" />
            <a
              href="#what-we-do"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black px-8 py-4 text-white dark:bg-white dark:text-black font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[0_14px_36px_rgba(10,10,10,0.24)] dark:hover:bg-neutral-200 dark:hover:shadow-[0_14px_36px_rgba(250,250,250,0.2)]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[120%] dark:via-black/15" />
              <span className="relative">Show Me The Workflow</span>
              <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
