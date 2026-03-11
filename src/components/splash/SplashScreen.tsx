import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('monark-splash-seen')) {
      onComplete();
      return;
    }
    const readyTimer = setTimeout(() => setIsReady(true), 2800);
    return () => clearTimeout(readyTimer);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    sessionStorage.setItem('monark-splash-seen', 'true');
    setTimeout(onComplete, 800);
  };

  /* Palette mapped to site tokens (index.css):
     Background  --background   28 30% 87%  (warm linen)
     Card        --card         28 38% 94%  (parchment)
     Foreground  --foreground   80 18% 24%  (deep forest)
     Primary     --primary      80 20% 36%  (sage olive)
     Accent      --accent       22 38% 36%  (sienna/taupe)
     Muted       --muted-fg     36 18% 42%  (dusty taupe)
     Goldenrod   --color-goldenrod 36 25% 52%
     Rosegold    --color-rosegold  22 34% 50%
  */

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onClick={isReady ? handleEnter : undefined}
          style={{ background: "linear-gradient(160deg, hsl(28, 30%, 87%) 0%, hsl(28, 38%, 91%) 40%, hsl(28, 28%, 84%) 100%)" }}
        >
          {/* Warm ambient light */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5 }}
          >
            {/* Sienna warm orb — top center */}
            <motion.div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
              style={{ background: "radial-gradient(circle, hsla(22, 38%, 36%, 0.18) 0%, transparent 70%)" }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Sandy gold accent — bottom */}
            <motion.div
              className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full"
              style={{ background: "radial-gradient(circle, hsla(36, 25%, 52%, 0.12) 0%, transparent 70%)" }}
              animate={{
                x: [0, -30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            {/* Olive primary accent — top right, subtle */}
            <motion.div
              className="absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full"
              style={{ background: "radial-gradient(circle, hsla(80, 20%, 36%, 0.08) 0%, transparent 70%)" }}
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </motion.div>

          {/* Soft vignette bars (warm, not black) */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[hsl(28,22%,78%)]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[hsl(28,22%,78%)]/30 to-transparent" />

          {/* Floating warm particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${15 + i * 10}%`,
                  top: `${25 + (i % 4) * 15}%`,
                  background: i % 3 === 0 
                    ? "hsla(80, 20%, 36%, 0.45)"   /* olive */
                    : i % 3 === 1
                    ? "hsla(22, 38%, 36%, 0.4)"     /* sienna */
                    : "hsla(36, 25%, 52%, 0.35)",   /* goldenrod */
                }}
                animate={{
                  y: [-15, 25, -15],
                  x: [-5, 5, -5],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 5 + i * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative flex flex-col items-center">
            {/* Logo mark with warm glow */}
            <motion.div
              className="relative mb-10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Warm glow behind logo */}
              <motion.div
                className="absolute -inset-8 rounded-full"
                style={{ background: "radial-gradient(circle, hsla(22, 38%, 36%, 0.12) 0%, transparent 70%)" }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Outer ring — olive sage */}
              <motion.div
                className="w-36 h-36 md:w-44 md:h-44 rounded-full"
                style={{ border: "1.5px solid hsla(80, 20%, 36%, 0.4)" }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              />
              
              {/* Inner ring with sienna accent */}
              <motion.div
                className="absolute inset-4 rounded-full"
                style={{ border: "1px solid hsla(22, 38%, 36%, 0.4)" }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "hsla(22, 38%, 36%, 0.04)" }}
                  animate={{ 
                    boxShadow: [
                      "0 0 25px hsla(22, 38%, 36%, 0.08)",
                      "0 0 50px hsla(22, 38%, 36%, 0.18)",
                      "0 0 25px hsla(22, 38%, 36%, 0.08)",
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>

              {/* Center monogram */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <span className="font-serif text-5xl md:text-6xl tracking-widest" style={{ color: "hsl(80, 18%, 24%)" }}>
                  M
                </span>
              </motion.div>
            </motion.div>

            {/* "Welcome to" letter reveal */}
            <motion.div
              className="overflow-hidden mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <motion.div className="flex justify-center">
                {"Welcome to".split("").map((letter, index) => (
                  <motion.span
                    key={index}
                    className="font-serif text-sm md:text-base tracking-[0.3em] italic"
                    style={{ color: "hsla(36, 18%, 42%, 0.85)" }}
                    initial={{ opacity: 0, y: 20, rotateX: 90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.8 + index * 0.05,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            {/* Brand name */}
            <motion.div
              className="overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.h1
                className="font-serif text-4xl md:text-5xl tracking-[0.25em] uppercase"
                style={{ color: "hsl(80, 18%, 24%)" }}
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
              >
                Mon<span style={{ color: "hsl(22, 38%, 36%)" }}>A</span>rk
              </motion.h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="mt-8 font-body text-base md:text-lg tracking-[0.2em] uppercase"
              style={{ color: "hsla(36, 18%, 42%, 0.75)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6, ease: "easeOut" }}
            >
              The Art of Intentional Dating
            </motion.p>

            {/* Gradient line — olive to sienna */}
            <motion.div
              className="mt-10 h-px"
              style={{ background: "linear-gradient(to right, transparent, hsla(80, 20%, 36%, 0.4), hsla(22, 38%, 36%, 0.3), transparent)" }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 160, opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.8, ease: "easeOut" }}
            />
          </div>

          {/* Enter section */}
          <AnimatePresence>
            {isReady && (
              <motion.div
                className="absolute bottom-14 md:bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* Olive glass CTA button */}
                <motion.button
                  onClick={handleEnter}
                  className="group flex items-center gap-3 px-10 py-4 rounded-full transition-all duration-500"
                  style={{
                    background: "hsla(80, 20%, 36%, 0.1)",
                    border: "1px solid hsla(80, 20%, 36%, 0.35)",
                    backdropFilter: "blur(12px)",
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 0 30px hsla(80, 20%, 36%, 0.15)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-body text-sm tracking-[0.2em] uppercase" style={{ color: "hsl(80, 18%, 24%)" }}>
                    Enter
                  </span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-4 h-4" style={{ color: "hsl(22, 38%, 36%)" }} />
                  </motion.div>
                </motion.button>

                <motion.p
                  className="font-body text-xs tracking-[0.15em] uppercase"
                  style={{ color: "hsla(36, 18%, 42%, 0.55)" }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  tap anywhere to continue
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};