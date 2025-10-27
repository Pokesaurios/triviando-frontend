import type { Variants } from 'framer-motion';

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export const scaleIn: Variants = {
  initial: { scale: 0 },
  animate: { scale: 1 ,
  transition: { delay: 0.2, type: 'spring', stiffness: 200 ,},
  },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { delay: 0.5 },
};

export const floatingAnimation = {
  animate: {
    y: [0, -20, 0],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const rotateAnimation = {
  animate: {
    rotate: [0, 360],
  },
  transition: {
    duration: 20,
    repeat: Infinity,
    ease: 'linear',
  },
};

export const logoWiggle = {
  animate: {
    rotate: [0, -10, 10, -10, 0],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatDelay: 3,
  },
};

export const hoverScale = {
  whileHover: { scale: 1.02 },
  transition: { type: 'spring' as const, stiffness: 300 },
};

export const tapScale = {
  whileTap: { scale: 0.95 },
};