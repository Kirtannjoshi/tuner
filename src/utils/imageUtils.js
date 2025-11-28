/**
 * Utility functions for handling images with CORS proxy support
 */

/**
 * Converts an external image URL to use our proxy to avoid CORS issues
 * @param {string} url - Original image URL
 * @returns {string} - Proxied URL
 */
export const getProxiedImageUrl = (url) => {
  if (!url) return '';
  
  // Return as-is if it's a data URL or relative URL
  if (url.startsWith('data:') || url.startsWith('/')) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    
    // Handle different domains
    if (urlObj.hostname === 'static.mytuner.mobi') {
      return `/api/images${urlObj.pathname}`;
    } else if (urlObj.hostname.includes('pinimg.com')) {
      return `/api/pinimg${urlObj.pathname}`;
    } else if (urlObj.hostname.includes('seeklogo.com')) {
      return `/api/seeklogo${urlObj.pathname}`;
    } else if (urlObj.hostname.includes('imgur.com')) {
      return `/api/imgur${urlObj.pathname}`;
    } else if (urlObj.hostname.includes('flaticon.com')) {
      return `/api/flaticon${urlObj.pathname}`;
    }
    
    // Return original URL for domains we don't proxy
    return url;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return url;
  }
};

/**
 * Creates a fallback image URL for when the original fails to load
 * @param {string} stationName - Name of the radio station
 * @returns {string} - URL to a placeholder image
 */
export const getFallbackImageUrl = (stationName = '') => {
  return '/placeholder-radio.svg';
};