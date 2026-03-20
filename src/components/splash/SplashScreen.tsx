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
    sessionStorage.setItem("monark-splash-seen-v6", "true");
    window.setTimeout(onComplete, 800);
  };

  useEffect(() => {
    if (sessionStorage.getItem("monark-splash-seen-v6")) {
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
          <motion.div
            className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 3.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              backgroundImage: `url(${splashHero})`,
              filter: "grayscale(100%) contrast(1.1)",
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};