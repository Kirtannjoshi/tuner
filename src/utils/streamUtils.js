import { retryWithBackoff, isRetryableError } from './retryUtils';

// Fallback streams for different genres
const FALLBACK_STREAMS = {
  jazz: [
    'https://jazz-wr04.ice.infomaniak.ch/jazz-wr04-128.mp3',
    'https://strm112.1.fm/ajazz_mobile_mp3'
  ],
  classical: [
    'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_three',
    'https://live.musopen.org:8085/streamvbr0'
  ],
  rock: [
    'https://stream.rockantenne.de/rockantenne/stream/mp3',
    'https://streams.radiobob.de/bob-rocks/mp3-192/streams.radiobob.de/'
  ],
  pop: [
    'https://stream.antenne1.de/a1stg/livestream2.mp3',
    'https://streams.radiobob.de/bob-90s/mp3-192/streams.radiobob.de/'
  ]
};

/**
 * Check stream health by attempting to load it
 * @param {string} url - Stream URL to check
 * @returns {Promise<boolean>} - Whether the stream is accessible
 */
export const checkStreamHealth = async (url) => {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, { 
        method: 'HEAD', 
        timeout: 5000,
        headers: {
          'Range': 'bytes=0-0' // Request only the first byte to check availability
        }
      });
      return response.ok;
    },
    {
      maxRetries: 2,
      initialDelay: 500,
      onRetry: ({ attempt, delay }) => {
        console.log(`Retrying stream health check (${attempt}), waiting ${delay}ms...`);
      }
    }
  ).catch(() => false);
};

/**
 * Get a working fallback stream for a given genre
 * @param {string} genre - Music genre
 * @returns {Promise<string|null>} - Working fallback stream URL or null
 */
export const getFallbackStream = async (genre) => {
  const fallbacks = FALLBACK_STREAMS[genre.toLowerCase()] || [];
  
  for (const url of fallbacks) {
    const isHealthy = await checkStreamHealth(url);
    if (isHealthy) {
      console.log(`Found working fallback stream: ${url}`);
      return url;
    }
  }
  
  console.warn(`No working fallback streams found for genre: ${genre}`);
  return null;
};

/**
 * Initialize a stream with health check and fallback support
 * @param {string} streamUrl - Primary stream URL
 * @param {string} genre - Stream genre for fallback selection
 * @returns {Promise<string>} - Working stream URL
 */
export const initializeStream = async (streamUrl, genre) => {
  return retryWithBackoff(
    async () => {
      const isHealthy = await checkStreamHealth(streamUrl);
      if (isHealthy) {
        return streamUrl;
      }
      
      const fallbackUrl = await getFallbackStream(genre);
      if (fallbackUrl) {
        return fallbackUrl;
      }
      
      throw new Error('No available streams found');
    },
    {
      maxRetries: 3,
      onRetry: ({ attempt, remainingAttempts }) => {
        console.log(
          `Stream initialization attempt ${attempt}, ${remainingAttempts} remaining...`
        );
      }
    }
  );
};

/**
 * Handle stream errors with automatic retry and fallback
 * @param {Error} error - Stream error
 * @param {string} currentUrl - Current stream URL
 * @param {string} genre - Stream genre
 * @returns {Promise<string|null>} - New stream URL or null
 */
export const handleStreamError = async (error, currentUrl, genre) => {
  if (!isRetryableError(error)) {
    console.warn('Non-retryable error encountered:', error);
    return null;
  }

  return retryWithBackoff(
    async () => {
      // Try the current URL again first
      const isCurrentHealthy = await checkStreamHealth(currentUrl);
      if (isCurrentHealthy) {
        return currentUrl;
      }
      
      // Try fallback streams
      const fallbackUrl = await getFallbackStream(genre);
      if (fallbackUrl) {
        return fallbackUrl;
      }
      
      throw new Error('No working streams available');
    },
    {
      maxRetries: 2,
      initialDelay: 1000,
      onRetry: ({ attempt, error }) => {
        console.log(
          `Retry attempt ${attempt} after stream error: ${error?.message}`
        );
      }
    }
  ).catch((err) => {
    console.error('All stream recovery attempts failed:', err);
    return null;
  });
};