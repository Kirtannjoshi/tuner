/**
 * Service to manage user's favorite radio stations and TV channels
 * Currently uses localStorage, but could be extended to use a backend API
 */

const RADIO_FAVORITES_KEY = 'tuner_radio_favorites';
const TV_FAVORITES_KEY = 'tuner_tv_favorites';

/**
 * Get favorite radio stations
 * @returns {Array} Array of favorite radio stations
 */
export const getFavoriteStations = () => {
  try {
    const favorites = localStorage.getItem(RADIO_FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorite stations:', error);
    return [];
  }
};

/**
 * Add a radio station to favorites
 * @param {Object} station Station to add to favorites
 * @returns {boolean} Success status
 */
export const addFavoriteStation = (station) => {
  try {
    const favorites = getFavoriteStations();
    // Check if already in favorites
    if (!favorites.some(fav => fav.id === station.id)) {
      const updatedFavorites = [...favorites, station];
      localStorage.setItem(RADIO_FAVORITES_KEY, JSON.stringify(updatedFavorites));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding favorite station:', error);
    return false;
  }
};

/**
 * Remove a radio station from favorites
 * @param {string} stationId ID of station to remove
 * @returns {boolean} Success status
 */
export const removeFavoriteStation = (stationId) => {
  try {
    const favorites = getFavoriteStations();
    const updatedFavorites = favorites.filter(station => station.id !== stationId);
    localStorage.setItem(RADIO_FAVORITES_KEY, JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Error removing favorite station:', error);
    return false;
  }
};

/**
 * Check if a radio station is in favorites
 * @param {string} stationId Station ID to check
 * @returns {boolean} True if station is in favorites
 */
export const isStationFavorite = (stationId) => {
  try {
    const favorites = getFavoriteStations();
    return favorites.some(station => station.id === stationId);
  } catch (error) {
    console.error('Error checking favorite station:', error);
    return false;
  }
};

/**
 * Get favorite TV channels
 * @returns {Array} Array of favorite TV channels
 */
export const getFavoriteChannels = () => {
  try {
    const favorites = localStorage.getItem(TV_FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorite channels:', error);
    return [];
  }
};

/**
 * Add a TV channel to favorites
 * @param {Object} channel Channel to add to favorites
 * @returns {boolean} Success status
 */
export const addFavoriteChannel = (channel) => {
  try {
    const favorites = getFavoriteChannels();
    // Check if already in favorites
    if (!favorites.some(fav => fav.id === channel.id)) {
      const updatedFavorites = [...favorites, channel];
      localStorage.setItem(TV_FAVORITES_KEY, JSON.stringify(updatedFavorites));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding favorite channel:', error);
    return false;
  }
};

/**
 * Remove a TV channel from favorites
 * @param {string} channelId ID of channel to remove
 * @returns {boolean} Success status
 */
export const removeFavoriteChannel = (channelId) => {
  try {
    const favorites = getFavoriteChannels();
    const updatedFavorites = favorites.filter(channel => channel.id !== channelId);
    localStorage.setItem(TV_FAVORITES_KEY, JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Error removing favorite channel:', error);
    return false;
  }
};

/**
 * Check if a TV channel is in favorites
 * @param {string} channelId Channel ID to check
 * @returns {boolean} True if channel is in favorites
 */
export const isChannelFavorite = (channelId) => {
  try {
    const favorites = getFavoriteChannels();
    return favorites.some(channel => channel.id === channelId);
  } catch (error) {
    console.error('Error checking favorite channel:', error);
    return false;
  }
}; 