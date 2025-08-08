// Centralized motion presets to keep animations consistent across the app
// Import and spread these presets into motion components

export const cardEntrance = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: 'easeOut' }
};

export const pageEntrance = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 }
};

export const buttonInteractive = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};

export const listItem = (index = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, delay: index * 0.05, ease: 'easeOut' }
});

export const subtlePop = {
  initial: { scale: 0.96, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.18 }
};


