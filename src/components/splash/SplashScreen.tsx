import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import splashHero1 from "@/assets/splash-hero.jpeg";
import splashHero6 from "@/assets/splash-hero-6.jpeg";
import splashHero7 from "@/assets/splash-hero-7.jpeg";

const heroImages = [splashHero6, splashHero7, splashHero1];
const ROTATION_INTERVAL = 8000;
const DISSOLVE_DURATION = 2.5;
const INITIAL_REVEAL_DURATION = 1.2;

interface SplashScreenProps {
  onComplete: () => void;
}

const ImageLayer = ({ src }: { src: string }) => (
  <img
    src={src}
    alt=""
    decoding="async"
    className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
    style={{ filter: "grayscale(100%) contrast(1.08) brightness(0.55)" }}
  />
);

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideCounter = useRef(0);

  const handleEnter = useCallback(() => {
    setIsExiting(true);
    sessionStorage.setItem("monark-splash-seen-v9", "true");
    window.setTimeout(onComplete, 800);
  }, [onComplete]);

  useEffect(() => {
    if (sessionStorage.getItem("monark-splash-seen-v9")) {
      onComplete();
      return;
    }
    const readyTimer = window.setTimeout(() => setIsReady(true), 2400);
    return () => window.clearTimeout(readyTimer);
  }, [onComplete]);

  // Preload images
  useEffect(() => {
    let resolved = false;
    const markReady = () => {
      if (!resolved) { resolved = true; setImagesReady(true); }
    };
    heroImages.forEach((src) => {
      const img = new Image();
      img.onload = markReady;
      img.onerror = markReady;
      img.src = src;
    });
    const fallback = window.setTimeout(markReady, 800);
    return () => { resolved = true; window.clearTimeout(fallback); };
  }, []);

  // Rotate slides
  useEffect(() => {
    if (!imagesReady) return;
    const interval = window.setInterval(() => {
      slideCounter.current += 1;
      setCurrentIndex(slideCounter.current % heroImages.length);
    }, ROTATION_INTERVAL);
    return () => window.clearInterval(interval);
  }, [imagesReady]);

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden cursor-pointer bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onClick={isReady ? handleEnter : undefined}
        >
          {/* Image slideshow with true crossfade */}
          {imagesReady && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: INITIAL_REVEAL_DURATION, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentIndex}
                  className="absolute inset-0"
                  style={{ willChange: "opacity" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DISSOLVE_DURATION, ease: "easeInOut" }}
                >
                  <ImageLayer src={heroImages[currentIndex]} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Scrim overlays */}
          <div className="absolute inset-0 pointer-events-none bg-black/50" style={{ zIndex: 3 }} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 4,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)",
            }}
          />

          {/* Bottom CTA */}
          <div
            className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-16 md:pb-20 pointer-events-none"
            style={{ zIndex: 5 }}
          >
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
                    style={{ color: "rgba(255,255,255,0.95)", fontWeight: 400 }}
                  >
                    The art of intentional dating
                  </p>
                  <p
                    className="font-body text-sm tracking-[0.22em] uppercase"
                    style={{ color: "rgba(255,255,255,0.55)", fontWeight: 300 }}
                  >
                    Limited early access. Join the waitlist.
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
