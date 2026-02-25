import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GoogleGeminiEffectProps {
  className?: string;
  ctaText?: string;
}

interface ChaosStream {
  tag: string;
  color: string;
  path: string;
  startY: number;
}

const CHAOS_STREAMS: ChaosStream[] = [
  {
    tag: 'On Shop Floor Chaos',
    color: '#FF8FB1',
    path: 'M180 112 C292 112 388 182 520 274 C607 325 666 349 720 360',
    startY: 112,
  },
  {
    tag: 'Multiple Warehouses',
    color: '#FFBE74',
    path: 'M180 200 C298 200 396 243 532 304 C611 334 668 350 720 360',
    startY: 200,
  },
  {
    tag: 'Legacy Systems',
    color: '#8FB3FF',
    path: 'M180 288 C306 288 406 309 542 335 C619 347 673 354 720 360',
    startY: 288,
  },
  {
    tag: 'Unmanaged Workforces',
    color: '#4EA3FF',
    path: 'M180 430 C302 430 398 409 532 384 C613 371 670 365 720 360',
    startY: 430,
  },
  {
    tag: 'Chaotic Accounting',
    color: '#1F7BFF',
    path: 'M180 518 C292 518 388 468 522 414 C606 384 665 369 720 360',
    startY: 518,
  },
];

const UNIFIED_PATH = 'M720 360 C860 360 1045 360 1440 360';

const FLOW_TIMES = [0, 0.46, 0.78, 1];
const UNIFIED_TIMES = [0, 0.52, 0.72, 0.9, 1];

export function GoogleGeminiEffect({
  className,
  ctaText = 'Tailored Optimised Intelligently Engineered Solutions',
}: GoogleGeminiEffectProps) {
  return (
    <div
      className={cn(
        'relative h-full min-h-[340px] overflow-hidden rounded-xl border border-[#cad4e4] bg-gradient-to-br from-[#edf4ff] via-[#f7faff] to-[#ffffff] shadow-[0_20px_42px_rgba(24,54,93,0.15)] dark:border-white/10 dark:bg-gradient-to-br dark:from-[#040a15] dark:via-[#050d19] dark:to-[#02060d] dark:shadow-[0_28px_60px_rgba(6,15,32,0.42)]',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_85%_at_50%_50%,rgba(84,152,232,0.18)_0%,rgba(255,255,255,0)_48%,rgba(186,214,247,0.1)_100%)] dark:bg-[radial-gradient(100%_85%_at_50%_50%,rgba(83,163,255,0.22)_0%,rgba(7,18,36,0.08)_48%,rgba(2,8,19,0.88)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6db8ff]/30 blur-[76px] dark:bg-[#6db8ff]/38" />

      <div className="relative z-10 h-full min-h-[inherit]">
        <div className="pointer-events-none absolute inset-0">
          <svg
            width="1440"
            height="720"
            viewBox="0 0 1440 720"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <filter id="flowBlur">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" />
              </filter>
            </defs>

            {CHAOS_STREAMS.map((stream, index) => (
              <motion.path
                key={`stream-blur-${stream.tag}`}
                d={stream.path}
                stroke={stream.color}
                strokeWidth="4"
                strokeLinecap="butt"
                fill="none"
                filter="url(#flowBlur)"
                initial={{ pathLength: 0, opacity: 0.12 }}
                animate={{ pathLength: [0, 1, 1, 0], opacity: [0.12, 0.38, 0.38, 0.12] }}
                transition={{
                  duration: 7,
                  times: FLOW_TIMES,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.03,
                }}
              />
            ))}

            {CHAOS_STREAMS.map((stream, index) => (
              <motion.path
                key={`stream-main-${stream.tag}`}
                d={stream.path}
                stroke={stream.color}
                strokeWidth="2"
                strokeLinecap="butt"
                fill="none"
                initial={{ pathLength: 0, opacity: 0.22 }}
                animate={{ pathLength: [0, 1, 1, 0], opacity: [0.22, 0.95, 0.7, 0.22] }}
                transition={{
                  duration: 7,
                  times: FLOW_TIMES,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.03,
                }}
              />
            ))}

            <motion.path
              d={UNIFIED_PATH}
              stroke="#0A74FF"
              strokeWidth="3.2"
              strokeLinecap="butt"
              fill="none"
              filter="url(#flowBlur)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 0.9, 0.9, 0] }}
              transition={{ duration: 7, times: UNIFIED_TIMES, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path
              d={UNIFIED_PATH}
              stroke="#0755D8"
              strokeWidth="1.9"
              strokeLinecap="butt"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }}
              transition={{ duration: 7, times: UNIFIED_TIMES, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </div>

        <div className="pointer-events-none absolute inset-0 z-20">
          {CHAOS_STREAMS.map((stream, index) => (
            <motion.div
              key={`tag-${stream.tag}`}
              style={{ top: `${(stream.startY / 720) * 100}%` }}
              animate={{ opacity: [0.68, 1, 0.74] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.1 }}
              className="absolute left-1.5 -translate-y-1/2 sm:left-4"
            >
              <span
                className="relative z-10 inline-flex items-center gap-1 rounded-full border bg-white px-2 py-0.5 text-[7px] font-medium text-[#0A74FF] shadow-[0_4px_12px_rgba(10,116,255,0.18)] dark:bg-[#0c182a] dark:text-[#8ec5ff] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[9px]"
                style={{ borderColor: `${stream.color}66` }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stream.color }} />
                {stream.tag}
              </span>
            </motion.div>
          ))}

          {/* Quality Outputs tag — on the unified output line, right side */}
          <motion.div
            style={{ top: '50%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 1, 0] }}
            transition={{ duration: 7, times: UNIFIED_TIMES, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-1.5 -translate-y-1/2 sm:right-4"
          >
            <span className="inline-flex items-center gap-1 rounded-full border border-[#0A74FF]/40 bg-white px-2 py-0.5 text-[7px] font-medium text-[#0A74FF] shadow-[0_4px_12px_rgba(10,116,255,0.18)] dark:bg-[#0c182a] dark:text-[#58a6ff] dark:border-[#58a6ff]/40 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[9px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0A74FF] dark:bg-[#58a6ff]" />
              Quality Outputs
            </span>
          </motion.div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center px-3">
          <button
            type="button"
            className="max-w-[78%] rounded-full border border-[#bad0ea] bg-white/90 px-4 py-2 text-center text-[10px] font-semibold leading-tight tracking-[0.02em] text-[#122742] shadow-[0_8px_24px_rgba(36,80,131,0.22)] backdrop-blur-sm transition-transform hover:scale-[1.02] dark:border-white/20 dark:bg-white/10 dark:text-white dark:shadow-[0_8px_24px_rgba(6,15,32,0.5)] sm:max-w-[54%] sm:px-6 sm:py-2.5 sm:text-sm"
          >
            {ctaText}
          </button>
        </div>



      </div>
    </div>
  );
}
