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
    if (localStorage.getItem('monark-splash-seen')) {
      onComplete();
      return;
    }
    const readyTimer = setTimeout(() => setIsReady(true), 2800);
    return () => clearTimeout(readyTimer);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    localStorage.setItem('monark-splash-seen', 'true');
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
          style={{ background: "linear-gradient(160deg, hsl(220, 20%, 12%) 0%, hsl(220, 18%, 18%) 40%, hsl(15, 15%, 20%) 100%)" }}
        >
          {/* Warm ambient light */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5 }}
          >
            {/* Rosegold warm orb — top center */}
            <motion.div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
              style={{ background: "radial-gradient(circle, hsla(15, 50%, 65%, 0.2) 0%, transparent 70%)" }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Gold accent — bottom */}
            <motion.div
              className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full"
              style={{ background: "radial-gradient(circle, hsla(35, 55%, 52%, 0.12) 0%, transparent 70%)" }}
              animate={{
                x: [0, -30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </motion.div>

          {/* Cinematic letterbox bars */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Floating warm particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${15 + i * 10}%`,
                  top: `${25 + (i % 4) * 15}%`,
                  background: i % 2 === 0 
                    ? "hsla(15, 50%, 65%, 0.5)" 
                    : "hsla(35, 55%, 52%, 0.4)",
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
                style={{ background: "radial-gradient(circle, hsla(15, 50%, 65%, 0.15) 0%, transparent 70%)" }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Outer ring — rosegold */}
              <motion.div
                className="w-36 h-36 md:w-44 md:h-44 rounded-full"
                style={{ border: "1px solid hsla(15, 50%, 65%, 0.3)" }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              />
              
              {/* Inner ring with warm glow */}
              <motion.div
                className="absolute inset-4 rounded-full"
                style={{ border: "1px solid hsla(15, 50%, 65%, 0.5)" }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "hsla(15, 50%, 65%, 0.05)" }}
                  animate={{ 
                    boxShadow: [
                      "0 0 25px hsla(15, 50%, 65%, 0.1)",
                      "0 0 50px hsla(15, 50%, 65%, 0.25)",
                      "0 0 25px hsla(15, 50%, 65%, 0.1)",
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
                <span className="font-serif text-5xl md:text-6xl tracking-widest" style={{ color: "hsl(30, 25%, 92%)" }}>
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
                    style={{ color: "hsla(15, 50%, 65%, 0.8)" }}
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

            {/* Brand name — larger, warmer */}
            <motion.div
              className="overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.h1
                className="font-serif text-4xl md:text-5xl tracking-[0.25em] uppercase"
                style={{ color: "hsl(30, 25%, 92%)" }}
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
              >
                Mon<span style={{ color: "hsl(15, 50%, 65%)" }}>A</span>rk
              </motion.h1>
            </motion.div>

            {/* Tagline — larger and warmer */}
            <motion.p
              className="mt-8 font-body text-base md:text-lg tracking-[0.2em] uppercase"
              style={{ color: "hsla(30, 15%, 75%, 0.8)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6, ease: "easeOut" }}
            >
              The Art of Intentional Dating
            </motion.p>

            {/* Warm gradient line */}
            <motion.div
              className="mt-10 h-px"
              style={{ background: "linear-gradient(to right, transparent, hsla(15, 50%, 65%, 0.5), hsla(35, 55%, 52%, 0.3), transparent)" }}
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
                {/* Warm glass CTA button */}
                <motion.button
                  onClick={handleEnter}
                  className="group flex items-center gap-3 px-10 py-4 rounded-full transition-all duration-500"
                  style={{
                    background: "hsla(15, 50%, 65%, 0.1)",
                    border: "1px solid hsla(15, 50%, 65%, 0.3)",
                    backdropFilter: "blur(12px)",
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 0 30px hsla(15, 50%, 65%, 0.2)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-body text-sm tracking-[0.2em] uppercase" style={{ color: "hsl(30, 25%, 92%)" }}>
                    Enter
                  </span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-4 h-4" style={{ color: "hsl(15, 50%, 65%)" }} />
                  </motion.div>
                </motion.button>

                <motion.p
                  className="font-body text-xs tracking-[0.15em] uppercase"
                  style={{ color: "hsla(30, 15%, 70%, 0.6)" }}
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
