import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import splashHero1 from "@/assets/splash-hero.jpeg";
import splashHero2 from "@/assets/splash-hero-2.jpeg";
import splashHero4 from "@/assets/splash-hero-4.jpeg";
import splashHero5 from "@/assets/splash-hero-5.jpeg";
import splashHero6 from "@/assets/splash-hero-6.jpeg";
import splashHero7 from "@/assets/splash-hero-7.jpeg";
import splashHero8 from "@/assets/splash-hero-8.jpeg";

const heroImages = [splashHero6, splashHero7, splashHero1, splashHero2, splashHero4, splashHero5, splashHero8];
const ROTATION_INTERVAL = 4500;

interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * Two-layer crossfade: the "back" layer holds the previous image at full
 * opacity while the "front" layer fades the new image in on top.
 * This guarantees zero black-flash between transitions.
 */
export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [slideState, setSlideState] = useState({ current: 0, previous: 0 });
  const [imagesReady, setImagesReady] = useState(false);
  const isFirstRender = useRef(true);

  const handleEnter = () => {
    setIsExiting(true);
    sessionStorage.setItem("monark-splash-seen-v9", "true");
    window.setTimeout(onComplete, 800);
  };

  // Skip if already seen
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
    let cancelled = false;
    let resolved = false;

    const markReady = () => {
      if (!cancelled && !resolved) {
        resolved = true;
        setImagesReady(true);
      }
    };

    heroImages.forEach((src) => {
      const img = new Image();
      img.onload = markReady;
      img.onerror = markReady;
      img.src = src;
    });

    const fallback = window.setTimeout(markReady, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  // Rotate
  useEffect(() => {
    if (!imagesReady) return;

    const interval = window.setInterval(() => {
      setSlideState((prev) => ({
        previous: prev.current,
        current: (prev.current + 1) % heroImages.length,
      }));
      isFirstRender.current = false;
    }, ROTATION_INTERVAL);

    return () => window.clearInterval(interval);
  }, [imagesReady]);

  const renderImageLayer = (src: string) => (
    <>
      <img
        src={src}
        alt=""
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[center_20%] md:scale-110 md:blur-2xl"
        style={{ filter: "grayscale(100%) contrast(1.08) brightness(0.52)" }}
      />
      <img
        src={src}
        alt=""
        decoding="async"
        className="absolute inset-0 hidden h-full w-full object-contain px-8 py-8 md:block lg:px-14 lg:py-12"
        style={{ filter: "grayscale(100%) contrast(1.08) brightness(0.7)" }}
      />
    </>
  );

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
          {imagesReady && (
            <>
              {/* BACK LAYER — previous image, always fully opaque, provides
                  seamless coverage while the front layer fades in */}
              <div className="absolute inset-0" style={{ zIndex: 1 }}>
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: 1, x: "0%" }}
                  transition={{ duration: 0.01 }}
                >
                  {renderImageLayer(heroImages[slideState.previous])}
                </motion.div>
              </div>

              {/* FRONT LAYER — current image fades in on top with a slow
                  Ken Burns drift for cinematic life */}
              <div className="absolute inset-0" style={{ zIndex: 2 }}>
                <motion.div
                  key={slideState.current}
                  className="absolute inset-0"
                  initial={
                    isFirstRender.current
                      ? { opacity: 1, scale: 1.06, x: "1.5%" }
                      : { opacity: 0, scale: 1.06, x: "1.5%" }
                  }
                  animate={{ opacity: 1, scale: 1, x: "0%" }}
                  transition={{
                    opacity: { duration: 1.8, ease: [0.22, 1, 0.36, 1] },
                    scale: { duration: 5, ease: [0.33, 1, 0.68, 1] },
                    x: { duration: 5, ease: [0.33, 1, 0.68, 1] },
                  }}
                  style={{ willChange: "opacity, transform" }}
                >
                  {renderImageLayer(heroImages[slideState.current])}
                </motion.div>
              </div>
            </>
          )}

          {/* Dark scrim */}
          <div className="absolute inset-0 pointer-events-none bg-black/50" style={{ zIndex: 3 }} />

          {/* Bottom gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 4,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)",
            }}
          />

          {/* Bottom text */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-16 md:pb-20 pointer-events-none" style={{ zIndex: 5 }}>
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
