import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PhotoLightboxProps {
  photos: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  name?: string;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 260, damping: 30 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.92,
    transition: {
      x: { type: 'spring', stiffness: 260, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.3 },
    },
  }),
};

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  name,
}) => {
  const [[page, direction], setPage] = useState([initialIndex, 0]);

  useEffect(() => {
    if (isOpen) setPage([initialIndex, 0]);
  }, [isOpen, initialIndex]);

  const imageIndex = ((page % photos.length) + photos.length) % photos.length;

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prev]) => [prev + newDirection, newDirection]);
    },
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') paginate(1);
      else if (e.key === 'ArrowLeft') paginate(-1);
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, paginate, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Close button */}
          <motion.button
            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Counter */}
          <motion.div
            className="absolute top-6 left-6 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-white/90 text-sm font-medium tracking-wide">
              {imageIndex + 1} / {photos.length}
            </span>
          </motion.div>

          {/* Image container */}
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.img
                key={page}
                src={photos[imageIndex]}
                alt={name ? `${name}'s photo ${imageIndex + 1}` : `Photo ${imageIndex + 1}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute max-w-[85vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl select-none"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) paginate(1);
                  else if (swipe > swipeConfidenceThreshold) paginate(-1);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <motion.button
                className="absolute left-4 md:left-8 z-10 p-3 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                className="absolute right-4 md:right-8 z-10 p-3 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); paginate(1); }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </>
          )}

          {/* Dot indicators */}
          {photos.length > 1 && (
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.25 }}
            >
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    const dir = idx > imageIndex ? 1 : -1;
                    setPage([idx, dir]);
                  }}
                  className="group p-1"
                >
                  <motion.div
                    className="rounded-full bg-white"
                    animate={{
                      width: idx === imageIndex ? 24 : 8,
                      height: 8,
                      opacity: idx === imageIndex ? 1 : 0.4,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                </button>
              ))}
            </motion.div>
          )}

          {/* Name label */}
          {name && (
            <motion.div
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-white/60 text-sm font-light tracking-widest uppercase">
                {name}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
