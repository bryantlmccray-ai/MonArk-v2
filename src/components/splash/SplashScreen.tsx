import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import monarkLogoHorizontal from '@/assets/monark-logo-horizontal-fixed.png';
import splashHero from '@/assets/splash-hero.jpeg';
interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('monark-splash-seen-v3')) {
      onComplete();
      return;
    }
    const readyTimer = setTimeout(() => setIsReady(true), 2800);
    return () => clearTimeout(readyTimer);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    sessionStorage.setItem('monark-splash-seen-v3', 'true');
    setTimeout(onComplete, 800);
  };

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onClick={isReady ? handleEnter : undefined}
        >
          {/* Animated hero image filling the screen with cinematic zoom */}
          <motion.div
            className="absolute inset-0 w-full h-full overflow-hidden"
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 3.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={splashHero}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(100%) contrast(1.1)' }}
            />
          </motion.div>
          {/* Dark gradient overlay for text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%)",
            }}
          />

          {/* Film grain texture overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
            }}
            animate={{ opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Enter section — bottom-aligned */}
          <div className="relative z-10 flex flex-col items-center justify-end h-full w-full pb-14 md:pb-20">

            {/* Enter section */}
            <AnimatePresence>
              {isReady && (
                <motion.div
                  className="mt-10 flex flex-col items-center gap-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <motion.button
                    onClick={handleEnter}
                    className="group flex items-center gap-3 px-10 py-4 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      backdropFilter: "blur(8px)",
                    }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 30px rgba(255,255,255,0.1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-body text-sm tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.9)" }}>
                      Enter
                    </span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.7)" }} />
                    </motion.div>
                  </motion.button>

                  <motion.p
                    className="font-body text-xs tracking-[0.15em] uppercase"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    tap anywhere to continue
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
