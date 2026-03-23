import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import splashHero6 from "@/assets/splash-hero-6.jpeg";
import splashHero1 from "@/assets/splash-hero.jpeg";
import splashHero2 from "@/assets/splash-hero-2.jpeg";
import splashHero4 from "@/assets/splash-hero-4.jpeg";
import splashHero5 from "@/assets/splash-hero-5.jpeg";

const heroImages = [splashHero6, splashHero2, splashHero1, splashHero4, splashHero5];

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const handleEnter = () => {
    setIsExiting(true);
    sessionStorage.setItem("monark-splash-seen-v8", "true");
    window.setTimeout(onComplete, 800);
  };

  useEffect(() => {
    if (sessionStorage.getItem("monark-splash-seen-v8")) {
      onComplete();
      return;
    }

    const readyTimer = window.setTimeout(() => setIsReady(true), 2400);
    return () => {
      window.clearTimeout(readyTimer);
    };
  }, [onComplete]);

  // Rotate images every 5 seconds
  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  // Play the logo video when it becomes visible
  useEffect(() => {
    if (showLogo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [showLogo]);

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onClick={isReady ? handleEnter : undefined}
        >
          {/* Rotating hero images with crossfade */}
          {heroImages.map((src, index) => (
            <motion.img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, x: '8%', scale: 1.08 }}
              animate={{
                opacity: currentImage === index ? 1 : 0,
                x: currentImage === index ? '0%' : '-8%',
                scale: currentImage === index ? 1 : 1.08,
              }}
              transition={{ duration: 2.5, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ filter: "grayscale(100%) contrast(1.08)" }}
            />
          ))}

          {/* Bottom gradient for text legibility */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%, transparent 100%)",
            }}
          />

          {/* Bottom text */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center pb-16 md:pb-20 pointer-events-none">
            <AnimatePresence>
              {isReady && (
                <motion.div
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  <p
                    className="font-body text-sm tracking-[0.22em] uppercase"
                    style={{ color: "rgba(255,255,255,0.85)", fontWeight: 300 }}
                  >
                    The art of intentional dating
                  </p>

                  <motion.p
                    className="font-body text-xs tracking-[0.15em] uppercase"
                    style={{ color: "rgba(255,255,255,0.4)", fontWeight: 300 }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    tap anywhere to enter
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
