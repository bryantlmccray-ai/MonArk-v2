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

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [slide, setSlide] = useState({ current: 0, previous: 0 });
  const isFirst = useRef(true);

  const handleEnter = () => {
    setIsExiting(true);
    sessionStorage.setItem("monark-splash-seen-v9", "true");
    window.setTimeout(onComplete, 800);
  };

  // Skip if seen
  useEffect(() => {
    if (sessionStorage.getItem("monark-splash-seen-v9")) {
      onComplete();
      return;
    }
    const t = window.setTimeout(() => setIsReady(true), 2400);
    return () => window.clearTimeout(t);
  }, [onComplete]);

  // Preload
  useEffect(() => {
    let done = false;
    const mark = () => { if (!done) { done = true; setImagesReady(true); } };
    heroImages.forEach((src) => {
      const img = new Image();
      img.onload = mark;
      img.onerror = mark;
      img.src = src;
    });
    const fb = window.setTimeout(mark, 800);
    return () => { done = true; window.clearTimeout(fb); };
  }, []);

  // Rotate — single setInterval, no stale closures
  useEffect(() => {
    if (!imagesReady) return;
    const iv = window.setInterval(() => {
      setSlide((prev) => ({
        previous: prev.current,
        current: (prev.current + 1) % heroImages.length,
      }));
      isFirst.current = false;
    }, ROTATION_INTERVAL);
    return () => window.clearInterval(iv);
  }, [imagesReady]);

  const renderImage = (src: string) => (
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
          {/* ── Image layers ── */}
          {imagesReady && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Back layer: previous image at full opacity — prevents black flash */}
              <div className="absolute inset-0" style={{ zIndex: 1 }}>
                {renderImage(heroImages[slide.previous])}
              </div>

              {/* Front layer: current image fades in over the back layer
                  First frame uses a more dramatic zoom + pan for a cinematic
                  opening that feels alive from the very first moment */}
              <motion.div
                key={slide.current}
                className="absolute inset-0"
                style={{ zIndex: 2, willChange: "opacity, transform" }}
                initial={
                  isFirst.current
                    ? { opacity: 1, scale: 1.14, x: "3%" }
                    : { opacity: 0, scale: 1.06, x: "1.5%" }
                }
                animate={{ opacity: 1, scale: 1, x: "0%" }}
                transition={
                  isFirst.current
                    ? {
                        opacity: { duration: 0.01 },
                        scale: { duration: 8, ease: [0.25, 0.1, 0.25, 1] },
                        x: { duration: 8, ease: [0.25, 0.1, 0.25, 1] },
                      }
                    : {
                        opacity: { duration: 2, ease: [0.22, 1, 0.36, 1] },
                        scale: { duration: 6, ease: [0.33, 1, 0.68, 1] },
                        x: { duration: 6, ease: [0.33, 1, 0.68, 1] },
                      }
                }
              >
                {renderImage(heroImages[slide.current])}
              </motion.div>
            </motion.div>
          )}

          {/* Scrim */}
          <div className="absolute inset-0 pointer-events-none bg-black/50" style={{ zIndex: 3 }} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 4,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)",
            }}
          />

          {/* Bottom text */}
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
