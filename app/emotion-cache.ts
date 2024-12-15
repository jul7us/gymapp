import createCache from '@emotion/cache';

const isBrowser = typeof document !== 'undefined';

// Create an Emotion cache instance
const createEmotionCache = () => {
  return createCache({ key: 'css', prepend: true });
};

const cache = isBrowser ? createEmotionCache() : null;

export default cache;
