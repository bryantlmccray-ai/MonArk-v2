import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import splashHero1 from "@/assets/splash-hero.jpeg";
import splashHero2 from "@/assets/splash-hero-2.jpeg";
import splashHero4 from "@/assets/splash-hero-4.jpeg";
import splashHero5 from "@/assets/splash-hero-5.jpeg";
import splashHero6 from "@/assets/splash-hero-6.jpeg";
import splashHero7 from "@/assets/splash-hero-7.jpeg";
import splashHero8 from "@/assets/splash-hero-8.jpeg";

const heroImages = [splashHero6, splashHero7, splashHero1, splashHero2, splashHero4, splashHero5, splashHero8];
const INITIAL_TRANSITION_DELAY = 2800;
const ROTATION_INTERVAL = 4200;

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [hasLoadedInitialFrame, setHasLoadedInitialFrame] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    sessionStorage.setItem("monark-splash-seen-v9", "true");
    window.setTimeout(onComplete, 800);
  };

  useEffect(() => {
    if (sessionStorage.getItem("monark-splash-seen-v9")) {
      onComplete();
      return;
    }

    const readyTimer = window.setTimeout(() => setIsReady(true), 2400);

    return () => {
      window.clearTimeout(readyTimer);
    };
  }, [onComplete]);

  useEffect(() => {
    let isCancelled = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!isCancelled) {
        setHasLoadedInitialFrame(true);
      }
    }, 1200);

    heroImages.forEach((src, index) => {
      const image = new Image();
      image.decoding = "async";
      image.loading = index === 0 ? "eager" : "lazy";
      image.onload = () => {
        if (!isCancelled && index === 0) {
          window.clearTimeout(fallbackTimer);
          setHasLoadedInitialFrame(true);
        }
      };
      image.onerror = () => {
        if (!isCancelled && index === 0) {
          window.clearTimeout(fallbackTimer);
          setHasLoadedInitialFrame(true);
        }
      };
      image.src = src;
    });

    return () => {
      isCancelled = true;
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedInitialFrame) return;

    const delay = currentImage === 0 ? INITIAL_TRANSITION_DELAY : ROTATION_INTERVAL;
    const timeout = window.setTimeout(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [currentImage, hasLoadedInitialFrame]);

  const currentSrc = heroImages[currentImage];

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
          {hasLoadedInitialFrame ? (
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={currentSrc}
                aria-hidden="true"
                className="absolute inset-0"
                initial={
                  currentImage === 0
                    ? { opacity: 1, x: "0%", scale: 1 }
                    : { opacity: 0, x: "2%", scale: 1.03 }
                }
                animate={{ opacity: 1, x: "0%", scale: 1 }}
                exit={{ opacity: 0, x: "-2%", scale: 1.01 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: "opacity, transform" }}
              >
                <img
                  src={currentSrc}
                  alt=""
                  loading={currentImage === 0 ? "eager" : "lazy"}
                  fetchPriority={currentImage === 0 ? "high" : "auto"}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-[center_20%] md:scale-110 md:blur-2xl"
                  style={{ filter: "grayscale(100%) contrast(1.08) brightness(0.52)" }}
                />

                <img
                  src={currentSrc}
                  alt=""
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 hidden h-full w-full object-contain px-8 py-8 md:block lg:px-14 lg:py-12"
                  style={{ filter: "grayscale(100%) contrast(1.08) brightness(0.7)" }}
                />
              </motion.div>
            </AnimatePresence>
          ) : null}

          <div className="absolute inset-0 pointer-events-none bg-black/50" />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)",
            }}
          />

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
