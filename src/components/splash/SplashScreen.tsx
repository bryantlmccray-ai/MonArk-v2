import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import splashHero1 from "@/assets/splash-hero.jpeg";
import splashHero6 from "@/assets/splash-hero-6.jpeg";
import splashHero7 from "@/assets/splash-hero-7.jpeg";

const heroImages = [splashHero6, splashHero7, splashHero1];
const ROTATION_INTERVAL = 5600;
const DISSOLVE_DURATION = 2;
const INITIAL_REVEAL_DURATION = 1.2;
const DRIFT_DURATION = 6;

interface SplashScreenProps {
  onComplete: () => void;
}

interface SlideState {
  current: number;
  previous: number;
  isTransitioning: boolean;
  transitionKey: number;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [slide, setSlide] = useState<SlideState>({
    current: 0,
    previous: 0,
    isTransitioning: false,
    transitionKey: 0,
  });
  const isFirstFrame = useRef(true);

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
    return () => window.clearTimeout(readyTimer);
  }, [onComplete]);

  useEffect(() => {
    let resolved = false;

    const markReady = () => {
      if (!resolved) {
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

    const fallback = window.setTimeout(markReady, 800);
    return () => {
      resolved = true;
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!imagesReady) return;

    const interval = window.setInterval(() => {
      setSlide((prev) => ({
        previous: prev.current,
        current: (prev.current + 1) % heroImages.length,
        isTransitioning: true,
        transitionKey: prev.transitionKey + 1,
      }));
      isFirstFrame.current = false;
    }, ROTATION_INTERVAL);

    return () => window.clearInterval(interval);
  }, [imagesReady]);

  useEffect(() => {
    if (!slide.isTransitioning) return;

    const timeout = window.setTimeout(() => {
      setSlide((prev) => ({ ...prev, isTransitioning: false }));
    }, DISSOLVE_DURATION * 1000);

    return () => window.clearTimeout(timeout);
  }, [slide.isTransitioning, slide.transitionKey]);

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
          {imagesReady && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: INITIAL_REVEAL_DURATION, ease: [0.22, 1, 0.36, 1] }}
            >
              {slide.isTransitioning && (
                <motion.div
                  key={`out-${slide.transitionKey}-${slide.previous}`}
                  className="absolute inset-0"
                  style={{ zIndex: 1, willChange: "opacity, transform" }}
                  initial={{ opacity: 1, scale: 1, x: "0%" }}
                  animate={{ opacity: 0, scale: 1.02, x: "-1%" }}
                  transition={{
                    opacity: { duration: DISSOLVE_DURATION, ease: [0.22, 1, 0.36, 1] },
                    scale: { duration: DRIFT_DURATION, ease: [0.33, 1, 0.68, 1] },
                    x: { duration: DRIFT_DURATION, ease: [0.33, 1, 0.68, 1] },
                  }}
                >
                  {renderImage(heroImages[slide.previous])}
                </motion.div>
              )}

              <motion.div
                key={`in-${slide.transitionKey}-${slide.current}`}
                className="absolute inset-0"
                style={{ zIndex: 2, willChange: "opacity, transform" }}
                initial={
                  isFirstFrame.current
                    ? { opacity: 1, scale: 1.14, x: "3%" }
                    : { opacity: 0, scale: 1.08, x: "2%" }
                }
                animate={{ opacity: 1, scale: 1, x: "0%" }}
                transition={
                  isFirstFrame.current
                    ? {
                        opacity: { duration: 0.01 },
                        scale: { duration: 8, ease: [0.25, 0.1, 0.25, 1] },
                        x: { duration: 8, ease: [0.25, 0.1, 0.25, 1] },
                      }
                    : {
                        opacity: { duration: DISSOLVE_DURATION, ease: [0.22, 1, 0.36, 1] },
                        scale: { duration: DRIFT_DURATION, ease: [0.33, 1, 0.68, 1] },
                        x: { duration: DRIFT_DURATION, ease: [0.33, 1, 0.68, 1] },
                      }
                }
              >
                {renderImage(heroImages[slide.current])}
              </motion.div>
            </motion.div>
          )}

          <div className="absolute inset-0 pointer-events-none bg-black/50" style={{ zIndex: 3 }} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 4,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)",
            }}
          />

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
