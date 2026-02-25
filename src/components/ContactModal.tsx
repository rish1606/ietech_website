import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Mail, Phone, Loader2, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [googleAuthed, setGoogleAuthed] = useState(false);
    const hasFirebaseConfig = Boolean(
        import.meta.env.VITE_FIREBASE_API_KEY &&
        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
        import.meta.env.VITE_FIREBASE_PROJECT_ID &&
        import.meta.env.VITE_FIREBASE_APP_ID,
    );

    const handleClose = () => {
        setEmail('');
        setPhone('');
        setError('');
        setSubmitted(false);
        setIsLoading(false);
        setIsGoogleLoading(false);
        setGoogleAuthed(false);
        onClose();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);
        try {
            const [{ collection, addDoc, serverTimestamp }, { db }] = await Promise.all([
                import('firebase/firestore'),
                import('../firebase/config'),
            ]);
            await addDoc(collection(db, 'contacts'), {
                email,
                phone: phone || null,
                source: googleAuthed ? 'google' : 'manual',
                createdAt: serverTimestamp(),
            });
            setSubmitted(true);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        setIsGoogleLoading(true);
        try {
            if (!hasFirebaseConfig) {
                setError('Google sign-in is not configured for this environment yet.');
                return;
            }

            const [{ GoogleAuthProvider, signInWithPopup }, { auth }] = await Promise.all([
                import('firebase/auth'),
                import('../firebase/config'),
            ]);
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            if (result.user.email) setEmail(result.user.email);
            if (result.user.phoneNumber) setPhone(result.user.phoneNumber);
            setGoogleAuthed(true);
        } catch (err) {
            const code = typeof err === 'object' && err !== null && 'code' in err
                ? String((err as { code?: string }).code ?? '')
                : '';
            if (code === 'auth/popup-blocked') {
                setError('Google popup was blocked by your browser. Please allow popups and try again.');
            } else if (code === 'auth/popup-closed-by-user') {
                setError('Google sign-in was closed before completion.');
            } else if (code === 'auth/unauthorized-domain') {
                setError('This domain is not authorized for Google sign-in in Firebase.');
            } else {
                setError('Google sign-in failed. Please try again.');
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen ? (
                <motion.div
                    key="contact-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
                    onClick={handleClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70" />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 8 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-neutral-950 dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={handleClose}
                            className="absolute right-4 top-4 z-20 grid h-8 w-8 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="px-7 pb-8 pt-10 sm:px-9 sm:pt-12">
                            {!submitted ? (
                                <>
                                    {/* Header */}
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold tracking-tight text-black dark:text-white sm:text-2xl">
                                            Get in Touch
                                        </h2>
                                        <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                                            Tell us how to reach you and we'll take it from there.
                                        </p>
                                    </div>

                                    <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                                            Direct Contact
                                        </p>
                                        <div className="mt-2 space-y-1.5 text-xs">
                                            <a href="mailto:ceojayraj@ietech.ai" className="block text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white">
                                                Jayraj (CEO): ceojayraj@ietech.ai · 9558525296
                                            </a>
                                            <a href="mailto:ctoaditya@ietech.ai" className="block text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white">
                                                Aditya (CTO): ctoaditya@ietech.ai · 9313523728
                                            </a>
                                        </div>
                                    </div>

                                    {/* Google button */}
                                    <button
                                        type="button"
                                        onClick={handleGoogle}
                                        disabled={isLoading || isGoogleLoading}
                                        className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10"
                                    >
                                        {isGoogleLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Signing in with Google…
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                                                    <path
                                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                                        fill="#4285F4"
                                                    />
                                                    <path
                                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                        fill="#34A853"
                                                    />
                                                    <path
                                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                        fill="#FBBC05"
                                                    />
                                                    <path
                                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                        fill="#EA4335"
                                                    />
                                                </svg>
                                                Continue with Google
                                            </>
                                        )}
                                    </button>

                                    {/* Divider */}
                                    <div className="my-6 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
                                        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                                            or
                                        </span>
                                        <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Email */}
                                        <div>
                                            <label
                                                htmlFor="contact-email"
                                                className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400"
                                            >
                                                Email address <span className="text-red-400">*</span>
                                                {googleAuthed && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                        <ShieldCheck className="h-3 w-3" /> Verified via Google
                                                    </span>
                                                )}
                                            </label>
                                            <div className="relative">
                                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                                                <input
                                                    id="contact-email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="you@company.com"
                                                    disabled={isLoading || isGoogleLoading}
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-[#103651] focus:ring-2 focus:ring-[#103651]/20 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-[#58a6ff] dark:focus:ring-[#58a6ff]/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone (optional) */}
                                        <div>
                                            <label
                                                htmlFor="contact-phone"
                                                className="mb-1.5 block text-xs font-semibold text-neutral-600 dark:text-neutral-400"
                                            >
                                                Phone number{' '}
                                                <span className="font-normal text-neutral-400 dark:text-neutral-500">(optional)</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                                                <input
                                                    id="contact-phone"
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="+91 98765 43210"
                                                    disabled={isLoading || isGoogleLoading}
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-[#103651] focus:ring-2 focus:ring-[#103651]/20 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-[#58a6ff] dark:focus:ring-[#58a6ff]/20"
                                                />
                                            </div>
                                        </div>

                                        {error ? (
                                            <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600 dark:bg-red-500/10 dark:text-red-400">
                                                {error}
                                            </p>
                                        ) : null}

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={isLoading || isGoogleLoading}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg disabled:pointer-events-none disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Submitting…
                                                </>
                                            ) : (
                                                <>
                                                    Get in Touch
                                                    <ArrowRight className="h-4 w-4" />
                                                </>
                                            )}
                                        </button>

                                        {/* 48-hour note */}
                                        <p className="pt-1 text-center text-[11px] leading-relaxed text-neutral-400 dark:text-neutral-500">
                                            We'll reach out to you within 48 hours of you registering here.
                                        </p>
                                    </form>
                                </>
                            ) : (
                                /* Success state */
                                <div className="flex flex-col items-center py-6 text-center">
                                    <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                                        <CheckCircle className="h-7 w-7 text-emerald-500" />
                                    </div>
                                    <h2 className="mt-5 text-xl font-bold text-black dark:text-white">
                                        We've got your details!
                                    </h2>
                                    <p className="mt-2 max-w-[280px] text-sm text-neutral-500 dark:text-neutral-400">
                                        Our team will reach out to you within 48 hours. Keep an eye on your inbox.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="mt-7 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
