import axios from 'axios';

const API_MIRRORS = [
  "https://de1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info"
];

// Country metadata with flags and regions
export const COUNTRIES = {
  'United Kingdom': { flag: '🇬🇧', code: 'GB', region: 'Europe' },
  'United States': { flag: '🇺🇸', code: 'US', region: 'North America' },
  'India': { flag: '🇮🇳', code: 'IN', region: 'Asia' },
  'Pakistan': { flag: '🇵🇰', code: 'PK', region: 'Asia' },
  'International': { flag: '🌍', code: 'INT', region: 'Global' }
};

/**
 * HELPER: API Client with Failover
 */
const fetchFromRadioApi = async (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();

  for (const mirror of API_MIRRORS) {
    try {
      const response = await axios.get(`${mirror}/json/${endpoint}?${queryString}`, {
        timeout: 5000 // 5 second timeout
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (e) {
      console.warn(`Mirror ${mirror} failed, trying next...`);
      continue;
    }
  }
  throw new Error("All radio API mirrors are currently unreachable.");
};

/**
 * Normalize station data to match app requirements
 */
const normalizeStation = (station) => ({
  id: station.stationuuid,
  name: station.name,
  genre: station.tags,
  country: station.country,
  countryFlag: COUNTRIES[station.country]?.flag || '🌍',
  language: station.language,
  logo: station.favicon || 'https://lucide.dev/icons/radio', // Default icon
  streamUrl: station.url_resolved || station.url,
  clickcount: station.clickcount,
  codec: station.codec,
  bitrate: station.bitrate
});

/**
 * Get top voted stations (Trending)
 */
export const getTopStations = async (limit = 40) => {
  try {
    const data = await fetchFromRadioApi('stations/topvote', {
      limit: limit,
      hidebroken: true
    });
    return data.map(normalizeStation);
  } catch (error) {
    console.error("Failed to fetch top stations:", error);
    return [];
  }
};

/**
 * Search stations
 */
export const searchStations = async (query, limit = 60) => {
  try {
    const data = await fetchFromRadioApi('stations/search', {
      name: query,
      limit: limit,
      hidebroken: true,
      order: 'clickcount',
      reverse: true
    });
    return data.map(normalizeStation);
  } catch (error) {
    console.error("Failed to search stations:", error);
    return [];
  }
};

/**
 * Get available countries (Legacy support)
 */
export const getAvailableCountries = () => {
  return COUNTRIES;
};

// Legacy function for compatibility, redirects to getTopStations or specific country fetch if needed
export const getRadioStations = async () => {
  return await getTopStations();
};

/**
 * Clear radio cache from localStorage
 */
export const clearRadioCache = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('radio_') || key === 'radioStations')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing radio cache:', error);
    return false;
  }
};