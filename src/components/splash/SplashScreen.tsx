import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import splashHero from "@/assets/splash-hero.jpeg";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    sessionStorage.setItem("monark-splash-seen-v7", "true");
    window.setTimeout(onComplete, 800);
  };

  useEffect(() => {
    if (sessionStorage.getItem("monark-splash-seen-v7")) {
      onComplete();
      return;
    }

    const autoExitTimer = window.setTimeout(handleEnter, 3200);
    return () => window.clearTimeout(autoExitTimer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onClick={handleEnter}
        >
          <motion.img
            src={splashHero}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 3.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: "grayscale(100%) contrast(1.08)" }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};