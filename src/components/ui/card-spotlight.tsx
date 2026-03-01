import { useRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface CardSpotlightProps {
    children: React.ReactNode;
    className?: string;
    radius?: number;
    color?: string;
}

export function CardSpotlight({
    children,
    className,
    radius = 350,
    color = 'rgba(16, 54, 81, 0.12)',
}: CardSpotlightProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    return (
        <div
            ref={divRef}
            onMouseMove={onMouseMove}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            className={cn(
                'group relative rounded-2xl border border-black/[0.07] bg-neutral-50 overflow-hidden dark:border-white/[0.07] dark:bg-white/[0.03]',
                className,
            )}
        >
            {/* Light mode spotlight */}
            <div
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 dark:hidden"
                style={{
                    opacity: visible ? 1 : 0,
                    background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${color}, transparent 80%)`,
                }}
            />
            {/* Dark mode spotlight */}
            <div
                className="pointer-events-none absolute inset-0 z-0 hidden dark:block transition-opacity duration-300"
                style={{
                    opacity: visible ? 1 : 0,
                    background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, rgba(143,198,242,0.10), transparent 80%)`,
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
}
