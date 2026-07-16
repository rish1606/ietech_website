import { motion } from 'framer-motion';
import { useId, useState } from 'react';

interface LogoProps {
    className?: string;
    animated?: boolean;
}

const CYCLE_DURATION = 3.8;
const LETTER_BASE_DELAY = 0.26;
const LETTER_STEP = 0.11;
const LETTER_FADE_IN = 0.04;

function progress(seconds: number) {
    return seconds / CYCLE_DURATION;
}

export default function Logo({ className, animated = false }: LogoProps) {
    const rawId = useId().replace(/:/g, '');
    const boxClipId = `logo-box-clip-${rawId}`;

    const [playKey, setPlayKey] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const handleMouseEnter = () => {
        if (!isPlaying && animated) {
            setIsPlaying(true);
            setPlayKey((p) => p + 1);
        }
    };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 470 150"
            className={className}
            fill="none"
            role="img"
            aria-label="i.e. TECH"
            onMouseEnter={handleMouseEnter}
        >
            <defs>
                <clipPath id={boxClipId}>
                    <rect x="0" y="0" width="150" height="150" />
                </clipPath>
            </defs>

            {/* The Box */}
            <rect
                x="0"
                y="0"
                width="150"
                height="150"
                className="fill-black dark:fill-white transition-colors duration-300"
            />

            {/* "i.e." text */}
            <text
                x="75"
                y="103"
                fontFamily="'Montserrat', sans-serif"
                fontWeight="700"
                fontSize="88"
                letterSpacing="-1"
                className="fill-white dark:fill-black transition-colors duration-300"
                textAnchor="middle"
            >
                i.e.
            </text>

            {/* Dot particles dropping from the "i" dot, clipped inside the black box */}
            {animated ? (
                <g clipPath={`url(#${boxClipId})`}>
                    {[
                        { startX: 33, startY: 26, dx: -2, dy: 46, phaseStart: 0.08, scale: 0.95 },
                        { startX: 37, startY: 24, dx: 1, dy: 44, phaseStart: 0.16, scale: 0.78 },
                        { startX: 41, startY: 27, dx: 2, dy: 42, phaseStart: 0.24, scale: 0.62 },
                    ].map((particle, index) => (
                        <motion.circle
                            key={`${playKey}-particle-${index}`}
                            cx={particle.startX}
                            cy={particle.startY}
                            r={3.2 * particle.scale}
                            className="fill-white dark:fill-black"
                            initial={{ opacity: 0 }}
                            animate={{
                                cx: [
                                    particle.startX,
                                    particle.startX,
                                    particle.startX + particle.dx * 0.5,
                                    particle.startX + particle.dx * 0.5,
                                    particle.startX + particle.dx,
                                    particle.startX + particle.dx,
                                ],
                                cy: [
                                    particle.startY,
                                    particle.startY,
                                    particle.startY + particle.dy * 0.55,
                                    particle.startY + particle.dy * 0.55,
                                    particle.startY + particle.dy,
                                    particle.startY + particle.dy,
                                ],
                                opacity: [0, 0, 1, 1, 0, 0],
                                scale: [0.65, 0.65, 1, 1, 0.72, 0.72],
                            }}
                            transition={{
                                duration: CYCLE_DURATION,
                                ease: 'linear',
                                times: [
                                    0,
                                    progress(particle.phaseStart),
                                    progress(particle.phaseStart + 0.1),
                                    progress(particle.phaseStart + 0.34),
                                    progress(particle.phaseStart + 0.46),
                                    1,
                                ],
                            }}
                        />
                    ))}
                </g>
            ) : null}

            {/* "TECH" text */}
            {animated ? (
                <g>
                    {[
                        { letter: 'T', x: 173 },
                        { letter: 'E', x: 229 },
                        { letter: 'C', x: 286 },
                        { letter: 'H', x: 348 },
                    ].map((item, index) => (
                        <motion.text
                            key={`${playKey}-${item.letter}`}
                            x={item.x}
                            y="104"
                            fontFamily="'Montserrat', sans-serif"
                            fontWeight="700"
                            fontSize="90"
                            className="fill-[#274060] dark:fill-[#3F618C] transition-colors duration-300"
                            textAnchor="start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0, 1, 1] }}
                            transition={{
                                duration: CYCLE_DURATION,
                                ease: 'linear',
                                times: [
                                    0,
                                    progress(LETTER_BASE_DELAY + index * LETTER_STEP),
                                    progress(LETTER_BASE_DELAY + index * LETTER_STEP + LETTER_FADE_IN),
                                    1,
                                ],
                            }}
                            onAnimationComplete={() => {
                                if (item.letter === 'H') setIsPlaying(false);
                            }}
                        >
                            {item.letter}
                        </motion.text>
                    ))}
                </g>
            ) : (
                <text
                    x="173"
                    y="104"
                    fontFamily="'Montserrat', sans-serif"
                    fontWeight="700"
                    fontSize="90"
                    letterSpacing="-1.5"
                    className="fill-[#274060] dark:fill-[#3F618C] transition-colors duration-300"
                    textAnchor="start"
                >
                    TECH
                </text>
            )}
        </svg>
    );
}
