import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const { user } = useAuth();

  const handleGoogleSignIn = async () => {
    setGoogleError('');
    setIsGoogleLoading(true);
    try {
      const { auth } = await import('../lib/firebase');
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setGoogleError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-32 md:pt-40 pb-12 transition-colors duration-300">

      {/* Background subtle effect */}

      <div className="container relative z-10 mx-auto px-4 text-center flex-1 flex flex-col justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-6xl lg:text-[4rem] font-medium tracking-tight text-white/95 max-w-4xl mx-auto leading-[1.1] text-balance transition-colors"
        >
          Manage your business operations with
          <span className="block mt-2 font-semibold bg-gradient-to-br from-[#4A72A4] to-[#2C4566] bg-clip-text text-transparent">
            our ERP & CAD.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-base md:text-lg lg:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed transition-colors text-balance"
        >
          We build and manage fully customized ERP and CAD ecosystems. Get the exact workflows and 3D engineering tools you need as a seamless service.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 md:mt-16 flex flex-col items-center justify-center gap-5 w-full max-w-4xl mx-auto"
        >
          <span className="text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-[0.2em]">
            Trusted by leading companies
          </span>
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 sm:gap-x-10 opacity-60 hover:opacity-100 transition-opacity duration-500">
            <img src="/logos/clients/tirupatiforge.png" alt="Tirupati Forge" className="h-[40px] md:h-[52px] w-auto object-contain mix-blend-screen invert grayscale" />
            <img src="/logos/clients/gautamcasting.png" alt="Gautam Casting" className="h-[46px] md:h-[60px] w-auto object-contain mix-blend-screen invert grayscale" />
            <div className="bg-white text-black font-bold tracking-widest px-2 py-0.5 rounded-sm text-[10px] md:text-xs uppercase">SANSIDHI CASTING</div>
            <span className="text-sm md:text-base font-bold tracking-[0.2em] text-white uppercase mt-1">INVESTCO CASTING</span>
            <span className="text-xl md:text-2xl font-serif italic font-bold text-white tracking-tight mt-1">PARV METALS</span>
          </div>
        </motion.div>

        {/* Action Section (CTA & Connect) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 md:mt-16 flex flex-col items-center justify-center"
        >
          {/* Google Sign-In CTA */}
          {!user ? (
            <div className="flex flex-col items-center gap-2 relative">
              <span className="pointer-events-none absolute inset-0 -z-10 rounded-none bg-white/10 blur-xl" />
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-none bg-white px-7 py-3.5 text-black font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-200 hover:shadow-[0_14px_36px_rgba(250,250,250,0.2)] disabled:pointer-events-none disabled:opacity-60"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" />
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="relative">Connect Instantly with Google</span>
                  </>
                )}
              </button>
              {googleError && (
                <p className="text-xs text-red-400 mt-1">{googleError}</p>
              )}
              <p className="text-xs text-neutral-500 mt-3 font-medium">
                Share your email and we'll reach out within 24 hours
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="inline-flex items-center justify-center gap-3 rounded-none border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-neutral-200 backdrop-blur-sm transition-all cursor-default"
              >
                <CheckCircle className="h-4 w-4 text-white" />
                Inquiry received. We will contact soon.
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
