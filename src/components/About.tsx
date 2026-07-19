import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Cpu, Wrench } from 'lucide-react';
import { ErpReplicaPreview, CadWorkspaceScene } from './Products';

/* ─── Animation helpers ─────────────────────────────────────── */
const EASE = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, margin: '-60px' },
    transition: { duration: 0.65, ease: EASE, delay },
});

/* ─── Code snippets — one per product, lines fade in then reset ─── */
const CODE_SETS = {
    erp: [
        [{ text: 'import', color: '#c792ea' }, { text: ' { erp } ', color: '#82aaff' }, { text: 'from', color: '#c792ea' }, { text: " 'ie-core'", color: '#c3e88d' }],
        [{ text: '', color: '' }],
        [{ text: 'async ', color: '#c792ea' }, { text: 'function', color: '#c792ea' }, { text: ' createOrder', color: '#82aaff' }, { text: '(data) {', color: '#eeffff' }],
        [{ text: '  const', color: '#c792ea' }, { text: ' wo ', color: '#eeffff' }, { text: '= await', color: '#c792ea' }, { text: ' erp', color: '#82aaff' }],
        [{ text: '    .workOrder', color: '#f78c6c' }, { text: '.create({', color: '#eeffff' }],
        [{ text: '      ...data,', color: '#eeffff' }, { text: ' status', color: '#f78c6c' }, { text: ":", color: '#eeffff' }, { text: " 'queued'", color: '#c3e88d' }],
        [{ text: '    });', color: '#eeffff' }],
        [{ text: '  await', color: '#c792ea' }, { text: ' notify', color: '#82aaff' }, { text: '(wo.id)', color: '#eeffff' }],
        [{ text: '  return', color: '#c792ea' }, { text: ' wo', color: '#f78c6c' }],
        [{ text: '}', color: '#eeffff' }],
    ],
    cad: [
        [{ text: 'import', color: '#c792ea' }, { text: ' { Sketch, AI } ', color: '#82aaff' }, { text: 'from', color: '#c792ea' }, { text: " 'ie-cad'", color: '#c3e88d' }],
        [{ text: '', color: '' }],
        [{ text: 'const', color: '#c792ea' }, { text: ' bracket ', color: '#eeffff' }, { text: '= new', color: '#c792ea' }, { text: ' Sketch', color: '#82aaff' }, { text: '()', color: '#eeffff' }],
        [{ text: '', color: '' }],
        [{ text: 'await', color: '#c792ea' }, { text: ' AI.generate', color: '#82aaff' }, { text: '({', color: '#eeffff' }],
        [{ text: "  prompt", color: '#f78c6c' }, { text: ': ', color: '#eeffff' }, { text: "'L-bracket, M6 bolts'", color: '#c3e88d' }, { text: ',', color: '#eeffff' }],
        [{ text: "  constraints", color: '#f78c6c' }, { text: ': [', color: '#eeffff' }, { text: "'ISO 4762'", color: '#c3e88d' }, { text: '],', color: '#eeffff' }],
        [{ text: "  fillets", color: '#f78c6c' }, { text: ': ', color: '#eeffff' }, { text: '3', color: '#f78c6c' }, { text: ', sketch: bracket', color: '#eeffff' }],
        [{ text: '});', color: '#eeffff' }],
        [{ text: '', color: '' }],
        [{ text: 'bracket', color: '#82aaff' }, { text: '.export', color: '#f78c6c' }, { text: "('STEP')", color: '#c3e88d' }],
    ],
} as const;

type ProductKey = keyof typeof CODE_SETS;

/* ─── Animated code pane ─── */
function CodePane({ productKey }: { productKey: ProductKey }) {
    const lines = CODE_SETS[productKey];
    const [visibleCount, setVisibleCount] = useState(0);

    // Reset and replay whenever the product changes
    useEffect(() => {
        setVisibleCount(0);
        let i = 0;
        const advance = () => {
            i += 1;
            setVisibleCount(i);
            if (i < lines.length) setTimeout(advance, 140);
        };
        const t = setTimeout(advance, 200);
        return () => clearTimeout(t);
    }, [productKey, lines.length]);

    const filename = productKey === 'erp' ? 'workOrder.ts' : 'generatePart.ts';

    return (
        <div className="flex flex-col h-full border-r border-white/[0.06]">
            {/* Titlebar */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-white/[0.06] shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
                <AnimatePresence mode="wait">
                    <motion.span
                        key={filename}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-2 text-[9px] font-mono text-neutral-500"
                    >
                        {filename}
                    </motion.span>
                </AnimatePresence>
            </div>
            {/* Code lines */}
            <div className="flex-1 px-2.5 py-2 overflow-hidden font-mono text-[9.5px] leading-[1.75]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={productKey}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-0"
                    >
                        {lines.map((tokens, i) => (
                            <div
                                key={i}
                                className="flex gap-0 whitespace-pre transition-opacity duration-100"
                                style={{ opacity: i < visibleCount ? 1 : 0 }}
                            >
                                <span className="select-none text-neutral-700 mr-2.5 text-[8px] w-3 text-right shrink-0 leading-[1.9]">
                                    {tokens[0]?.text ? i + 1 : ''}
                                </span>
                                <span className="flex flex-wrap">
                                    {tokens.map((tok, j) => (
                                        <span key={j} style={{ color: tok.color || 'transparent' }}>{tok.text}</span>
                                    ))}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
                {/* Blinking cursor */}
                <motion.span
                    className="inline-block h-[10px] w-[5px] bg-[#3F618C] rounded-sm ml-0.5 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.55, repeat: Infinity, repeatType: 'reverse' }}
                />
            </div>
        </div>
    );
}

/* ─── Product preview pane — the actual shipped UI components ─── */
function ProductPane({ productKey }: { productKey: ProductKey }) {
    const PREVIEW_BASE_WIDTH = 640;
    const PREVIEW_BASE_HEIGHT = 400;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [previewScale, setPreviewScale] = useState(0.42);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateScale = () => {
            const { width, height } = container.getBoundingClientRect();
            if (!width || !height) return;
            const fittedScale = Math.min(width / PREVIEW_BASE_WIDTH, height / PREVIEW_BASE_HEIGHT);
            setPreviewScale(Math.max(0.26, Math.min(1, fittedScale)));
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="relative h-full overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={productKey}
                    className="absolute inset-0 flex items-center justify-center overflow-hidden overscroll-none"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    style={{ transformOrigin: 'center center' }}
                >
                    {/* Scale down the full product mockup to fit the panel */}
                    <div
                        className="shrink-0"
                        style={{
                            width: PREVIEW_BASE_WIDTH,
                            height: PREVIEW_BASE_HEIGHT,
                            transformOrigin: 'center center',
                            transform: `scale(${previewScale})`,
                        }}
                    >
                        {productKey === 'erp'
                            ? <ErpReplicaPreview />
                            : <CadWorkspaceScene />
                        }
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

/* ═══ Master visual component ═══ */
function SoftwareJourneyVisual() {
    const [product, setProduct] = useState<ProductKey>('erp');

    // Flip between ERP and CAD every 5s (ERP has its own internal autoplay at 6.2s)
    useEffect(() => {
        const t = setInterval(() => setProduct(p => p === 'erp' ? 'cad' : 'erp'), 5000);
        return () => clearInterval(t);
    }, []);

    return (
        <div
            className="w-full h-full overflow-hidden absolute inset-0"
            style={{ background: '#0d1117' }}
        >
            <div className="grid h-full" style={{ gridTemplateColumns: '46% 54%' }}>
                <CodePane productKey={product} />
                <ProductPane productKey={product} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MECHANICAL VISUAL — Conveyor belt + 2 synchronised robotic arms
   Arm 1 (welder) processes parts as they pass; belt carries them
   to Arm 2 (gripper) which sorts them into the output bin.
   All positions are explicit keyframe arrays on motion.line so
   there are no nested SVG transform gotchas.
   ═══════════════════════════════════════════════════════════════ */

// Shared 6-second cycle, repeat: Infinity
// Arm 1 — Assembler, shoulder at (100, 165)
const A1_T = [0, 0.15, 0.25, 0.35, 0.50, 0.65, 1.0];
const A1_EX = [85, 95, 115, 115, 95, 85, 85];
const A1_EY = [120, 110, 110, 110, 110, 120, 120];
const A1_TX = [35, 35, 75, 114, 75, 35, 35];   // Tip reaches left stack (35) then belt (114)
const A1_TY = [140, 140, 100, 126, 100, 140, 140]; // Dips to pick, arcs up, dips to place

// Arm 2 — Gripper, shoulder at (280, 165)
const A2_T = [0, 0.55, 0.65, 0.75, 0.85, 0.95, 1.0];
const A2_EX = [280, 280, 270, 260, 280, 290, 280];
const A2_EY = [130, 130, 120, 110, 100, 100, 130];
const A2_TX = [250, 250, 260, 260, 300, 340, 250]; // Idle at 250, grabs at 260, swings to 340 (bin)
const A2_TY = [110, 110, 126, 126, 100, 165, 110]; // Dips to grab, swings up, drops to bin

const CYCLE = 8; // Slower 8s cycle for realism
const TR = { duration: CYCLE, repeat: Infinity, ease: 'linear' as const }; // LINEAR easing is crucial so arms and parts don't desyncmid-frame!

function ConveyorVisual() {
    return (
        <div
            className="w-full h-full overflow-hidden absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(to bottom, #05080c, #0d141e)' }}
        >
            <svg viewBox="0 0 380 190" className="w-full" aria-hidden style={{ display: 'block' }}>
                <defs>
                    <clipPath id="belt-clip-cv">
                        <rect x="70" y="137" width="240" height="18" rx="0" />
                    </clipPath>

                    {/* Glowing Spark Filters */}
                    <filter id="spark-f" x="-80%" y="-80%" width="260%" height="260%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>

                    {/* Realistic Drop Shadows */}
                    <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.6" />
                    </filter>
                    <filter id="part-shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.8" />
                    </filter>

                    <linearGradient id="robot-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff7b00" />
                        <stop offset="100%" stopColor="#cc4400" />
                    </linearGradient>
                    <linearGradient id="robot-white" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f0f4f8" />
                        <stop offset="100%" stopColor="#aab4be" />
                    </linearGradient>
                    <linearGradient id="robot-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#303b47" />
                        <stop offset="100%" stopColor="#1a2128" />
                    </linearGradient>
                    <linearGradient id="metal-joint" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#55606b" />
                        <stop offset="50%" stopColor="#8795a3" />
                        <stop offset="100%" stopColor="#303b47" />
                    </linearGradient>
                    <linearGradient id="belt-surface" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#141a22" />
                        <stop offset="50%" stopColor="#222b36" />
                        <stop offset="100%" stopColor="#0c1015" />
                    </linearGradient>

                    <radialGradient id="bin-glow">
                        <stop offset="0%" stopColor="#3F618C" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#3F618C" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* ── Background Elements ── */}
                <rect x="0" y="100" width="380" height="90" fill="url(#belt-surface)" opacity="0.4" />
                <rect x="0" y="100" width="380" height="1" fill="#2a3f52" opacity="0.5" />
                {Array.from({ length: 3 }).map((_, r) =>
                    Array.from({ length: 14 }).map((_, c) => (
                        <rect key={`${r}-${c}`} x={c * 30 + 10} y={r * 25 + 110} width="2" height="2" fill="#8899aa" fillOpacity="0.06" />
                    ))
                )}

                {/* ── Input stack (raw base plates on the left that A1 picks from) ── */}
                {/* Drawn BEHIND the conveyor mechanism */}
                <g filter="url(#drop-shadow)">
                    {/* Hopper Background */}
                    <path d="M22 135 L48 135 L42 180 L28 180 Z" fill="#0f1620" stroke="#1e2c3a" strokeWidth="1" />
                    {[0, 1, 2, 3].map(i => (
                        <rect key={i} x="24" y={170 - i * 8} width="22" height="7" rx="1.5"
                            fill="url(#metal-joint)" stroke="#1a2128" strokeWidth="0.5" />
                    ))}
                </g>

                {/* ── Realistic Conveyor Belt ── */}
                <g className="conveyor-group" filter="url(#drop-shadow)">
                    {/* Conveyor supports (T-slotted aluminum extrusion look) */}
                    <rect x="90" y="156" width="6" height="34" fill="url(#metal-joint)" stroke="#1a2128" strokeWidth="0.5" />
                    <rect x="92" y="156" width="2" height="34" fill="#111" opacity="0.4" />
                    <rect x="250" y="156" width="6" height="34" fill="url(#metal-joint)" stroke="#1a2128" strokeWidth="0.5" />
                    <rect x="252" y="156" width="2" height="34" fill="#111" opacity="0.4" />

                    {/* Side Rail (Thick anodized black aluminum) */}
                    <rect x="64" y="150" width="252" height="6" rx="1" fill="#111822" stroke="#253545" strokeWidth="0.8" />
                    {/* Blue LED Strip on rail */}
                    <rect x="68" y="152" width="244" height="1" fill="#3F618C" opacity="0.8" filter="url(#spark-f)" />

                    {/* Belt Core */}
                    <rect x="70" y="137" width="240" height="18" rx="2" fill="url(#belt-surface)" stroke="#06080b" strokeWidth="1.5" />

                    {/* End drive rollers */}
                    <circle cx="76" cy="146" r="7" fill="url(#metal-joint)" stroke="#111" strokeWidth="1" />
                    <circle cx="304" cy="146" r="7" fill="url(#metal-joint)" stroke="#111" strokeWidth="1" />
                    <circle cx="76" cy="146" r="2" fill="#111" />
                    <circle cx="304" cy="146" r="2" fill="#111" />

                    {/* Animated belt tread texture */}
                    {/* Stops animation once bin is "full" at t=4 cycles (32s), here just repeating forever for simplicity */}
                    <motion.g clipPath="url(#belt-clip-cv)"
                        animate={{ x: [0, -24] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    >
                        {Array.from({ length: 15 }).map((_, i) => (
                            <line key={i} x1={70 + i * 24} y1="137" x2={70 + i * 24} y2="155"
                                stroke="#111" strokeWidth="1.5" strokeOpacity="0.8" />
                        ))}
                    </motion.g>
                    {/* Glossy belt highlight */}
                    <rect x="70" y="138" width="240" height="2" fill="#fff" fillOpacity="0.08" />
                </g>

                {/* ── Output bin (Ground level on right) ── */}
                <g filter="url(#drop-shadow)">
                    <rect x="312" y="150" width="54" height="40" rx="3" fill="#0f1620" stroke="#2a3f52" strokeWidth="1.5" />
                    <rect x="312" y="150" width="54" height="40" fill="url(#bin-glow)" />

                    {/* Pre-existing parts in bin (Bin fills up) */}
                    <rect x="328" y="178" width="22" height="7" rx="1.5" fill="url(#metal-joint)" stroke="#1a2128" strokeWidth="0.5" />
                    <rect x="334" y="174" width="10" height="4" rx="1" fill="#3F618C" />
                    <circle cx="339" cy="176" r="1.2" fill="#22c55e" />

                    <rect x="328" y="170" width="22" height="7" rx="1.5" fill="url(#metal-joint)" stroke="#1a2128" strokeWidth="0.5" />
                    <rect x="334" y="166" width="10" height="4" rx="1" fill="#3F618C" />
                    <circle cx="339" cy="168" r="1.2" fill="#22c55e" />

                    {/* Front lip of the bin */}
                    <path d="M312 165 L366 165 L366 190 L312 190 Z" fill="#0f1620" opacity="0.6" />
                    <rect x="312" y="186" width="54" height="4" fill="#1a2128" />
                </g>

                {/* ── High-Fidelity Moving Workpiece on Belt ── */}
                {/* 1. Arm 1 places it at x=114, t=0.35 */}
                {/* 2. Moves along belt from 114 to 260 from t=0.35 to t=0.65 */}
                {/* 3. Arm 2 picks it up at x=260, t=0.65 */}
                <motion.g
                    animate={{
                        x: [114, 114, 260, 260, 260],
                        y: [126, 126, 126, 126, 126],
                        opacity: [0, 1, 1, 0, 0]
                    }}
                    transition={{ ...TR, times: [0, 0.35, 0.65, 0.66, 1.0] }}
                >
                    {/* Base Plate Component (Dark Metal) */}
                    <rect x="-11" y="-7" width="22" height="7" rx="1.5" filter="url(#part-shadow)"
                        fill="url(#metal-joint)" stroke="#1a2128" strokeWidth="0.5"
                    />
                    <rect x="-5" y="-11" width="10" height="4" rx="1" fill="#3F618C" />
                    <circle cx="0" cy="-9" r="1.2" fill="#22c55e" filter="url(#spark-f)" />
                </motion.g>

                {/* ══════════════ ARM 1 — KUKA-STYLE FLOOR ASSEMBLER (LEFT) ══════════════ */}
                <g className="arm1-group" filter="url(#drop-shadow)">
                    {/* Pedestal Base */}
                    <rect x="85" y="180" width="30" height="10" rx="2" fill="url(#robot-dark)" />
                    <path d="M90 180 L110 180 L106 165 L94 165 Z" fill="url(#robot-orange)" stroke="#cc4400" strokeWidth="1" />

                    {/* Upper Arm Segment */}
                    <motion.line x1={100} y1={165} animate={{ x2: A1_EX, y2: A1_EY }} transition={{ ...TR, times: A1_T }}
                        stroke="#000" strokeOpacity="0.4" strokeWidth="14" strokeLinecap="round" />
                    <motion.line x1={100} y1={165} animate={{ x2: A1_EX, y2: A1_EY }} transition={{ ...TR, times: A1_T }}
                        stroke="url(#robot-orange)" strokeWidth="12" strokeLinecap="round" />
                    <motion.line x1={100} y1={165} animate={{ x2: A1_EX, y2: A1_EY }} transition={{ ...TR, times: A1_T }}
                        stroke="#fff" strokeOpacity="0.15" strokeWidth="4" strokeLinecap="round" />

                    {/* Lower Arm Segment */}
                    <motion.line animate={{ x1: A1_EX, y1: A1_EY, x2: A1_TX, y2: A1_TY }} transition={{ ...TR, times: A1_T }}
                        stroke="#000" strokeOpacity="0.4" strokeWidth="10" strokeLinecap="round" />
                    <motion.line animate={{ x1: A1_EX, y1: A1_EY, x2: A1_TX, y2: A1_TY }} transition={{ ...TR, times: A1_T }}
                        stroke="url(#robot-white)" strokeWidth="8" strokeLinecap="round" />

                    {/* Shoulder Joint */}
                    <circle cx="100" cy="165" r="10" fill="url(#robot-dark)" />
                    <circle cx="100" cy="165" r="5" fill="url(#metal-joint)" />
                    <circle cx="100" cy="165" r="2" fill="#111" />

                    {/* Elbow Joint */}
                    <motion.circle animate={{ cx: A1_EX, cy: A1_EY }} transition={{ ...TR, times: A1_T }}
                        r="8" fill="url(#robot-dark)" />
                    <motion.circle animate={{ cx: A1_EX, cy: A1_EY }} transition={{ ...TR, times: A1_T }}
                        r="4" fill="url(#metal-joint)" />

                    {/* Assembly Toolhead with Part */}
                    <motion.g animate={{ x: A1_TX, y: A1_TY }} transition={{ ...TR, times: A1_T }}>
                        {/* Part held in claw (from t=0.15 stack pick to t=0.35 belt place) */}
                        <motion.g
                            animate={{ opacity: [0, 1, 1, 0, 0] }}
                            transition={{ ...TR, times: [0, 0.15, 0.34, 0.35, 1] }}
                        >
                            <rect x="-11" y="-7" width="22" height="7" rx="1.5"
                                fill="url(#metal-joint)" stroke="#1a2128" strokeWidth="0.5" filter="url(#part-shadow)" />
                            {/* Blue cap is "assembled" mid-air or just visually present */}
                            <rect x="-5" y="-11" width="10" height="4" rx="1" fill="#3F618C" />
                            <circle cx="0" cy="-9" r="1.2" fill="#22c55e" filter="url(#spark-f)" />
                        </motion.g>

                        {/* Wrist block */}
                        <rect x="-8" y="-14" width="16" height="10" rx="2" fill="url(#robot-dark)" />
                        <line x1="-5" y1="-14" x2="-5" y2="-2" stroke="url(#metal-joint)" strokeWidth="2" strokeLinecap="round" />
                        <line x1="5" y1="-14" x2="5" y2="-2" stroke="url(#metal-joint)" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>
                </g>

                {/* ══════════════ ARM 2 — FLOOR GRIPPER (RIGHT) ══════════════ */}
                <g className="arm2-group" filter="url(#drop-shadow)">
                    {/* Pedestal Base */}
                    <rect x="265" y="180" width="30" height="10" rx="2" fill="url(#robot-dark)" />
                    <path d="M270 180 L290 180 L286 165 L274 165 Z" fill="url(#robot-white)" stroke="#aab4be" strokeWidth="1" />

                    {/* Upper Arm Segment */}
                    <motion.line x1={280} y1={165} animate={{ x2: A2_EX, y2: A2_EY }} transition={{ ...TR, times: A2_T }}
                        stroke="#000" strokeOpacity="0.4" strokeWidth="14" strokeLinecap="round" />
                    <motion.line x1={280} y1={165} animate={{ x2: A2_EX, y2: A2_EY }} transition={{ ...TR, times: A2_T }}
                        stroke="url(#robot-white)" strokeWidth="12" strokeLinecap="round" />

                    {/* Lower Arm Segment */}
                    <motion.line animate={{ x1: A2_EX, y1: A2_EY, x2: A2_TX, y2: A2_TY }} transition={{ ...TR, times: A2_T }}
                        stroke="#000" strokeOpacity="0.4" strokeWidth="10" strokeLinecap="round" />
                    <motion.line animate={{ x1: A2_EX, y1: A2_EY, x2: A2_TX, y2: A2_TY }} transition={{ ...TR, times: A2_T }}
                        stroke="url(#robot-dark)" strokeWidth="8" strokeLinecap="round" />

                    {/* Shoulder Joint */}
                    <circle cx="280" cy="165" r="10" fill="url(#robot-dark)" />
                    <circle cx="280" cy="165" r="5" fill="url(#metal-joint)" />

                    {/* Elbow Joint */}
                    <motion.circle animate={{ cx: A2_EX, cy: A2_EY }} transition={{ ...TR, times: A2_T }}
                        r="8" fill="url(#robot-dark)" />
                    <motion.circle animate={{ cx: A2_EX, cy: A2_EY }} transition={{ ...TR, times: A2_T }}
                        r="4" fill="url(#metal-joint)" />

                    {/* Gripper Toolhead with Part */}
                    <motion.g animate={{ x: A2_TX, y: A2_TY }} transition={{ ...TR, times: A2_T }}>
                        {/* Part held by gripper (from t=0.65 belt pickup to t=0.95 drop in bin) */}
                        <motion.g
                            animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
                            transition={{ ...TR, times: [0, 0.64, 0.65, 0.94, 0.95, 1.0] }}
                        >
                            <rect x="-11" y="-7" width="22" height="7" rx="1.5"
                                fill="url(#metal-joint)" stroke="#1a2128" strokeWidth="0.5" filter="url(#part-shadow)" />
                            <rect x="-5" y="-11" width="10" height="4" rx="1" fill="#3F618C" />
                            <circle cx="0" cy="-9" r="1.2" fill="#22c55e" filter="url(#spark-f)" />
                        </motion.g>

                        {/* Wrist block */}
                        <rect x="-7" y="-14" width="14" height="10" rx="2" fill="url(#metal-joint)" />
                        <line x1="-5" y1="-14" x2="-5" y2="-2" stroke="url(#metal-joint)" strokeWidth="2" strokeLinecap="round" />
                        <line x1="5" y1="-14" x2="5" y2="-2" stroke="url(#metal-joint)" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>
                </g>

                {/* ── Floor / Base line ── */}
                <rect x="0" y="188" width="380" height="2" fill="#1e2c3a" />
            </svg>
        </div>
    );
}


/* ─── Data ──────────────────────────────────────────────────── */
const disciplines = [
    {
        icon: Cpu,
        domain: 'Software Engineering',
        tagline: 'Systems that think.',
        description: (
            <>
                Full-stack product development, cloud infrastructure, AI integration, and industrial automation software — built and shipped inside demanding engineering organisations, including SDE2 engineer at{' '}
                <img loading="lazy" decoding="async"
                    src="/logos/google.svg"
                    alt="Google"
                    className="inline-block h-[14px] mx-[2px] mb-[2px]"
                />{' '}
                and open-source work at{' '}
                <img loading="lazy" decoding="async"
                    src="/logos/mozilla-lockup.svg"
                    alt="Mozilla"
                    className="inline-block h-[14px] mx-[2px] mb-[2px] dark:invert opacity-80 dark:opacity-100"
                />{' '}
                scale.
            </>
        ),
        tags: ['Cloud & Infra', 'AI/ML', 'Industrial Automation', 'Enterprise Software'],
        Visual: SoftwareJourneyVisual,
    },
    {
        icon: Wrench,
        domain: 'Mechanical Engineering',
        tagline: 'Hardware that performs.',
        description: (
            <>
                Deep expertise in manufacturing processes, precision parts, and mechanical system design. Hands-on across Rajkot&apos;s leading manufacturers and tier-1 suppliers — including design programmes at{' '}
                <img loading="lazy" decoding="async"
                    src="/logos/tata-ev-positive-tight.png"
                    alt="Tata Electric Mobility"
                    className="inline-block h-[14px] mx-[2px] mb-[3px] dark:hidden"
                />
                <img loading="lazy" decoding="async"
                    src="/logos/tata-ev-negative-tight.png"
                    alt="Tata Electric Mobility"
                    className="hidden dark:inline-block h-[14px] mx-[2px] mb-[3px]"
                />
                .
            </>
        ),
        tags: ['Parts & Assembly', 'Manufacturing', 'Supply Chain', 'Shop Floor'],
        Visual: ConveyorVisual,
    },
];

const credStats = [
    {
        id: 'Google',
        value: (
            <img loading="lazy" decoding="async"
                src="/logos/google.svg"
                alt="Google"
                className="h-[26px] w-auto object-contain"
            />
        ),
        label: 'SDE2 engineer',
        accent: true
    },
    {
        id: 'Mozilla',
        value: (
            <img loading="lazy" decoding="async"
                src="/logos/mozilla-lockup.svg"
                alt="Mozilla"
                className="h-[22px] w-auto object-contain dark:invert opacity-80 dark:opacity-100"
            />
        ),
        label: 'Open-source engineering',
        accent: true
    },
    {
        id: 'TataElectricMobility',
        value: (
            <span className="flex items-center">
                <img loading="lazy" decoding="async"
                    src="/logos/tata-ev-positive-tight.png"
                    alt="Tata Electric Mobility"
                    className="h-[34px] w-auto object-contain dark:hidden"
                />
                <img loading="lazy" decoding="async"
                    src="/logos/tata-ev-negative-tight.png"
                    alt="Tata Electric Mobility"
                    className="hidden h-[34px] w-auto object-contain dark:block"
                />
            </span>
        ),
        label: 'Tier-1 manufacturing',
        accent: false
    },
    {
        id: 'RajkotMfg',
        value: (
            <img loading="lazy" decoding="async"
                src="/logos/mtma-rajkot.jpg"
                alt="Rajkot MFG"
                className="h-[22px] w-auto object-contain"
            />
        ),
        label: 'Precision parts & production',
        accent: false
    },
    {
        id: 'I4.0',
        value: (
            <img loading="lazy" decoding="async"
                src="/logos/industry-4-0-badge.svg"
                alt="Industry 4.0"
                className="h-[28px] w-auto object-contain"
            />
        ),
        label: 'Industrial automation & IoT',
        accent: true
    },
];

/* ─── Section ───────────────────────────────────────────────── */
export default function About() {
    return (
        <section
            id="about"
            aria-label="About i.e tech"
            className="relative pt-24 pb-12 md:pt-32 md:pb-16 bg-transparent transition-colors duration-300"
        >
            <div className="container mx-auto max-w-7xl px-4">

                {/* ── Intro Text ── */}
                <motion.div {...fadeUp(0)} className="mb-14 md:mb-20 max-w-3xl mx-auto flex flex-col items-center text-center">
                    <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
                        <div className="h-[1px] w-12 md:w-20 bg-neutral-300 dark:bg-neutral-800" />
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#274060] dark:text-[#3F618C]">
                            Who we are
                        </span>
                        <div className="h-[1px] w-12 md:w-20 bg-neutral-300 dark:bg-neutral-800" />
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black dark:text-white leading-[1.1] mb-6 md:mb-8">
                        Two engineers.<br />
                        <span className="text-neutral-400 dark:text-neutral-500">One obsession.</span>
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl leading-relaxed text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl">
                        A software engineer and a mechanical engineer — both shaped by
                        demanding corporate environments — who decided the industrial tools
                        that manufacturers actually need don't exist yet. So we're building them.
                        We work directly with manufacturers and engineering firms to design,
                        deploy, and hand over solutions that fit how their operation actually runs.
                    </p>
                </motion.div>

                {/* ── Discipline Cards ── */}
                <div className="flex flex-col gap-16 md:gap-20 mb-14 md:mb-16">
                    {disciplines.map((disc, i) => {
                        const Icon = disc.icon;
                        const Visual = disc.Visual;
                        const isEven = i % 2 === 0;
                        return (
                            <div key={disc.domain} className="flex flex-col">
                                {/* Heading and Subheading on top - Alternating Left/Right aligned */}
                                <motion.div {...fadeUp(i * 0.1)} className={`mb-8 md:mb-10 flex flex-col ${isEven ? 'items-start text-left' : 'items-end text-right'} pb-6 relative`}>
                                    <div className={`flex items-center gap-3 mb-3 ${isEven ? '' : 'flex-row-reverse'}`}>
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#274060]/10 dark:bg-[#3F618C]/10 rounded-none">
                                            <Icon className="h-4 w-4 text-[#274060] dark:text-[#3F618C]" />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-black dark:text-white uppercase">
                                            {disc.domain}
                                        </h3>
                                    </div>
                                    <p className={`${isEven ? 'ml-11' : 'mr-11'} text-base md:text-lg font-medium text-neutral-500 dark:text-neutral-400 tracking-wide md:tracking-widest`}>
                                        {disc.tagline}
                                    </p>
                                    

                                </motion.div>
                                
                                {/* Animation and Text Layout */}
                                <motion.div
                                    {...fadeUp(i * 0.1 + 0.1)}
                                    className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-stretch gap-8 md:gap-12`}
                                >
                                    {/* Screen side - Sharp edges, no frame */}
                                    <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-[320px] rounded-none overflow-hidden border border-black/[0.07] dark:border-white/[0.07]">
                                        {Visual && <Visual />}
                                    </div>
                                    
                                    {/* Text side */}
                                    <div className="w-full md:w-1/2 flex flex-col justify-center py-2 md:py-4">
                                        <p className="text-[14px] md:text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400 mb-8">
                                            {disc.description}
                                        </p>
                                        
                                        {/* Tags like nav bar with | */}
                                        <div className="flex flex-wrap items-center gap-3 mt-auto text-[12px] md:text-[13px] font-medium tracking-wide uppercase text-neutral-500 dark:text-neutral-500">
                                            {disc.tags.map((tag, idx) => (
                                                <div key={tag} className="flex items-center gap-3">
                                                    <span>{tag}</span>
                                                    {idx < disc.tags.length - 1 && (
                                                        <span className="text-neutral-300 dark:text-neutral-700 select-none">|</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>


                {/* ── Credibility strip ── */}
                <motion.div {...fadeUp(0.1)} className="w-full mt-24 mb-10">
                    <h3 className="text-lg text-gray-700 dark:text-neutral-300 text-center font-medium">
                        Where we have worked
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-12 mt-14 max-md:px-2 text-black dark:text-white opacity-60 hover:opacity-100 transition-opacity duration-500">
                        {credStats.map((item, i) => (
                            <motion.div
                                key={item.id}
                                {...fadeUp(0.12 + i * 0.06)}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="h-[34px] flex items-center justify-center mb-3">
                                    {item.value}
                                </div>
                                <div className="text-xs font-medium tracking-wide text-neutral-500 dark:text-neutral-400 max-w-[140px] leading-relaxed">
                                    {item.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
