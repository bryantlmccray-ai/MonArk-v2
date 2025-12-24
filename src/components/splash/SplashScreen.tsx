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
    // Show the enter prompt after animations complete
    const readyTimer = setTimeout(() => setIsReady(true), 2000);
    return () => clearTimeout(readyTimer);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(onComplete, 800);
  };

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onClick={isReady ? handleEnter : undefined}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"
              animate={{
                x: [0, -40, 0],
                y: [0, -20, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </motion.div>

          {/* Subtle floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary/30"
                style={{
                  left: `${20 + i * 12}%`,
                  top: `${30 + (i % 3) * 20}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative flex flex-col items-center">
            {/* Logo mark */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Outer ring */}
              <motion.div
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-primary/30"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              />
              
              {/* Inner ring with glow */}
              <motion.div
                className="absolute inset-4 rounded-full border border-primary/50"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/5"
                  animate={{ 
                    boxShadow: [
                      "0 0 20px hsl(var(--primary) / 0.1)",
                      "0 0 40px hsl(var(--primary) / 0.2)",
                      "0 0 20px hsl(var(--primary) / 0.1)",
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
                <span className="font-serif text-4xl md:text-5xl tracking-widest text-foreground">
                  M
                </span>
              </motion.div>
            </motion.div>

            {/* Brand name */}
            <motion.div
              className="overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.h1
                className="font-serif text-3xl md:text-4xl tracking-[0.3em] text-foreground uppercase"
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                Mon<span className="text-primary">A</span>rk
              </motion.h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="mt-6 font-body text-sm md:text-base tracking-[0.2em] text-muted-foreground uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
            >
              The Art of Intentional Dating
            </motion.p>

            {/* Subtle line accent */}
            <motion.div
              className="mt-8 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 120, opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.4, ease: "easeOut" }}
            />
          </div>

          {/* Enter section */}
          <AnimatePresence>
            {isReady && (
              <motion.div
                className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* Enter button */}
                <motion.button
                  onClick={handleEnter}
                  className="group flex items-center gap-3 px-8 py-3 border border-primary/30 rounded-full bg-transparent hover:bg-primary/5 transition-all duration-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-body text-sm tracking-[0.2em] text-foreground uppercase">
                    Enter
                  </span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </motion.div>
                </motion.button>

                {/* Click anywhere hint */}
                <motion.p
                  className="font-body text-xs tracking-[0.15em] text-foreground uppercase"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  click anywhere to continue
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
