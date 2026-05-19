import { Variants, type Easing } from "framer-motion";

export const MOTION_CONFIG = {
  duration: {
    fast: 0.2,
    normal: 0.35,
    slow: 0.5,
  },
  ease: [0.25, 0.1, 0.25, 1] as Easing,
};

export const REVEAL_UP: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_CONFIG.duration.normal,
      ease: MOTION_CONFIG.ease,
    },
  },
};

export const REVEAL_DOWN: Variants = {
  hidden: {
    opacity: 0,
    y: -24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_CONFIG.duration.normal,
      ease: MOTION_CONFIG.ease,
    },
  },
};

export const REVEAL_LEFT: Variants = {
  hidden: {
    opacity: 0,
    x: 24,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION_CONFIG.duration.normal,
      ease: MOTION_CONFIG.ease,
    },
  },
};

export const REVEAL_RIGHT: Variants = {
  hidden: {
    opacity: 0,
    x: -24,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION_CONFIG.duration.normal,
      ease: MOTION_CONFIG.ease,
    },
  },
};

export const REVEAL_FADE: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: MOTION_CONFIG.duration.fast,
    },
  },
};

export const REVEAL_SCALE: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: MOTION_CONFIG.duration.fast,
      ease: MOTION_CONFIG.ease,
    },
  },
};

export const STAGGER_CONTAINER: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const FAST_STAGGER_CONTAINER: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export const HOVER_LIFT = {
  whileHover: {
    y: -4,
    transition: {
      duration: 0.2,
    },
  },
};

export const HOVER_CARD = {
  whileHover: {
    y: -6,
    scale: 1.01,
    transition: {
      duration: 0.2,
    },
  },
  whileTap: {
    scale: 0.98,
  },
};

export const BUTTON_ANIMATION = {
  whileHover: {
    scale: 1.03,
  },
  whileTap: {
    scale: 0.97,
  },
  transition: {
    duration: 0.15,
  },
};

export const VIEWPORT = {
  once: true,
  amount: 0.15,
};

