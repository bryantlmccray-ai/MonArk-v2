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
  const [currentImage, setCurrentImage] = useState(0);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const handleEnter = () => {
    setIsExiting(true);
    sessionStorage.setItem("monark-splash-seen-v9", "true");
    window.setTimeout(onComplete, 800);
  };

  // Skip splash if already seen
  useEffect(() => {
    if (sessionStorage.getItem("monark-splash-seen-v9")) {
      onComplete();
      return;
    }
    const readyTimer = window.setTimeout(() => setIsReady(true), 2400);
    return () => window.clearTimeout(readyTimer);
  }, [onComplete]);

  // Preload all images
  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;

    heroImages.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount >= 1 && !cancelled) {
          setImagesPreloaded(true);
        }
      };
      img.src = src;
    });

    // Safety fallback — show after 800ms regardless
    const fallback = window.setTimeout(() => {
      if (!cancelled) setImagesPreloaded(true);
    }, 800);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  // Rotate images
  useEffect(() => {
    if (!imagesPreloaded) return;

    intervalRef.current = window.setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, ROTATION_INTERVAL);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [imagesPreloaded]);

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
          {/* All images stacked — CSS transitions handle crossfade */}
          {imagesPreloaded &&
            heroImages.map((src, index) => {
              const isActive = currentImage === index;
              return (
                <div
                  key={src}
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive
                      ? "translateX(0%) scale(1)"
                      : "translateX(-3%) scale(1.03)",
                    transition: "opacity 1.8s cubic-bezier(0.22, 1, 0.36, 1), transform 1.8s cubic-bezier(0.22, 1, 0.36, 1)",
                    willChange: "opacity, transform",
                  }}
                >
                  {/* Mobile: full-bleed cover */}
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-[center_20%] md:scale-110 md:blur-2xl"
                    style={{ filter: "grayscale(100%) contrast(1.08) brightness(0.52)" }}
                  />
                  {/* Desktop: contained with blurred background */}
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 hidden h-full w-full object-contain px-8 py-8 md:block lg:px-14 lg:py-12"
                    style={{ filter: "grayscale(100%) contrast(1.08) brightness(0.7)" }}
                  />
                </div>
              );
            })}

          {/* Dark scrim for text legibility */}
          <div className="absolute inset-0 pointer-events-none bg-black/50" />

          {/* Bottom gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)",
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
